#!/usr/bin/env python3

import argparse
import datetime
import hashlib
import http.server
import json
import os
import os.path
import shutil
import socketserver
import subprocess
import tempfile
import urllib.parse

import lxml.etree
import lxml.html

import paths


HTMLCOMPRESSOR_URL = "https://storage.googleapis.com/google-code-archive-downloads/v2/code.google.com/htmlcompressor/htmlcompressor-1.5.3.jar"
YUICOMPRESSOR_URL = "https://github.com/yui/yuicompressor/releases/download/v2.4.8/yuicompressor-2.4.8.jar"


SCRIPTS_DIRECTORY = os.path.dirname(os.path.abspath(__file__))


class Chdir():

  def __init__(self, path):
    self._path = os.path.abspath(path)

  def __enter__(self):
    self._previous = os.getcwd()
    os.chdir(self._path)

  def __exit__(self, exc_type, exc_val, exc_tb):
    os.chdir(self._previous)


def checksum(root):
  paths = find_files(root)
  sha = hashlib.sha1()
  for path in paths:
    sha.update(path.encode('utf-8'))
    with open(os.path.join(root, path), 'rb') as fh:
      sha.update(fh.read())
  return sha.hexdigest()


def extract_javascript(html, root):
  scripts = ""
  transactions = html.xpath("//script[@type='text/javascript']")
  for transaction in transactions:
    src = os.path.join(root, transaction.get("src"))
    with open(src) as script:
      scripts = scripts + "\n" + script.read()
    transaction.drop_tree()

  filtered = ""
  for line in scripts.split("\n"):
    if line.find('"use strict";') != 0:
      filtered = filtered + "\n" + line

  return filtered


def extract_tags(html, tag, key, root):
  scripts = ""
  transactions = html.xpath(tag)
  for transaction in transactions:
    src = os.path.join(root, transaction.get(key))
    with open(src) as script:
      scripts = scripts + "\n" + script.read()
    transaction.drop_tree()
  return scripts


def append_javascript(html, script):
  body = html.find('body')
  source = "<script type='text/javascript' type='text/css'>" + script + "</script>"
  link = lxml.html.fromstring(source).find('.//script')
  body.append(link)


def append_style(html, style):
  head = html.find('head')
  tag = "<style>" + style + "</style>"
  style = lxml.html.fromstring(tag).find('.//style')
  head.append(style)


def env(filename):
  for path in os.environ["PATH"].split(":"):
    try:
      if filename in os.listdir(path):
        return os.path.join(path, filename)
    except FileNotFoundError:
      pass
  raise KeyError("Unable to find '%s' in path." % filename)


def first_command(commands):
  for command in commands:
    try:
      return env(command)
    except KeyError:
      pass
  quoted_commands = ["'%s'" % command for command in commands]
  summary = quoted_commands[0]
  if len(quoted_commands) > 1:
    summary = "%s or %s" % (", ".join(quoted_commands[:-1]), quoted_commands[-1])
  raise KeyError("Unable to find %s in path." % summary)


def yuicompressor(contents, suffix):
  temp = tempfile.mktemp(suffix=suffix)
  with open(temp, 'w') as f:
    f.write(contents)
  yuicompressor_path = None
  command = []
  try:
    yuicompressor_path = first_command(["yuicompressor", "yui-compressor"])
    command = [yuicompressor_path]
  except KeyError as e:
    yuicompressor_path = download(YUICOMPRESSOR_URL, SCRIPTS_DIRECTORY)
    command = ["java", "-jar", yuicompressor_path]
  output = subprocess.check_output(command + [temp]).decode('utf-8')
  os.unlink(temp)
  return output


def download(url, directory):
  basename = os.path.basename(urllib.parse.urlparse(url).path)
  path = os.path.join(directory, basename)
  if not os.path.exists(path):
    print("Downloading '%s'..." % basename)
    subprocess.check_call(["curl", "-L", "-o", path, url])
  return path


def htmlcompressor(contents):  
  htmlcompressor_path = download(HTMLCOMPRESSOR_URL, SCRIPTS_DIRECTORY)
  command = ['java', '-jar', htmlcompressor_path]
  p = subprocess.Popen(command, stdout=subprocess.PIPE, stdin=subprocess.PIPE, stderr=subprocess.STDOUT)
  output = p.communicate(input=contents.encode('utf-8'))[0].decode('utf-8')
  return output


def find_files(directory):
  result = []
  for root, subdirs, files in os.walk(directory):
    for file in files:
      if file.find('.') != 0:
        result.append(os.path.relpath(os.path.join(root, file), directory))
  return result


def copy_diretory(source_dir, output_dir, task=shutil.copy):
  name = os.path.basename(os.path.abspath(source_dir))
  destination_dir = os.path.join(output_dir, name)
  os.mkdir(destination_dir)
  files = find_files(source_dir)
  for file in files:
    image_name = os.path.basename(os.path.abspath(file))
    destination_file = os.path.join(destination_dir, image_name)
    task(os.path.join(source_dir, file), destination_file)


def copy_files(source, destination, files):
  for file in files:
    source_file = os.path.join(source, file)
    destination_file = os.path.join(destination, file)
    shutil.copy(source_file, destination_file)


def load_settings(path):
  version = None
  with open(paths.VERSION_FILE, 'r') as f:
    version = f.read().strip()
  settings = None
  with open(path, 'r') as f:
    settings = json.load(f)
  settings["version"] = version
  return settings


def build(options):
  paths.BUILD_DIR = os.path.join(paths.ROOT_DIR, "build")
  archives_dir = os.path.join(paths.ROOT_DIR, "archives")
  input_file = os.path.join(paths.SOURCE_DIR, "index.html")
  output_file = os.path.join(paths.BUILD_DIR, "index.html")
  images_dir = os.path.join(paths.SOURCE_DIR, "images")
  assets_dir = os.path.join(paths.SOURCE_DIR, "assets")
  defaults_dir = os.path.join(paths.SOURCE_DIR, "defaults")
  manifest_file = os.path.join(paths.BUILD_DIR, "cache.manifest")

  settings = load_settings(path=os.path.abspath(options.settings))

  # Create/empty the build directory.
  # We do not simply delete the directory so as not to break the development server which might be serving from here.
  if os.path.exists(paths.BUILD_DIR):
    for path in os.listdir(paths.BUILD_DIR):
      path = os.path.join(paths.BUILD_DIR, path)
      if os.path.isfile(path):
        os.unlink(path)
      else:
        shutil.rmtree(path)
  else:
    os.mkdir(paths.BUILD_DIR)

  # index.html
  contents = None
  with open(input_file) as f:
    contents = f.read()
  html = lxml.html.fromstring(contents)

  print("Extracting JavaScript...")
  script = "window.config = %s;\n" % json.dumps(settings, sort_keys=True)
  script += extract_tags(html, "//script[@type='text/javascript']", "src", paths.SOURCE_DIR)
  if not settings["debug"]:
    print("Minifying JavaScript...")
    script = yuicompressor(script, '.js')
  append_javascript(html, script)

  print("Exctracting CSS...")
  style = extract_tags(html, "//link[@type='text/css']", "href", paths.SOURCE_DIR)
  if not settings["debug"]:
    print("Minifying CSS...")
    style = yuicompressor(style, '.css')
  append_style(html, style)

  contents = lxml.html.tostring(html).decode('utf-8')
  if not settings["debug"]:
    print("Compressing HTML...")
    contents = htmlcompressor(contents)

  print("Writing HTML...")
  with open(output_file, 'w') as f:
    f.write("<!DOCTYPE html>\n")
    f.write(contents)

  # images
  print("Copying images...")
  copy_diretory(images_dir, paths.BUILD_DIR)

  # images
  print("Copying assets...")
  copy_diretory(assets_dir, paths.BUILD_DIR)

  # defaults
  print("Copying defaults...")
  copy_diretory(defaults_dir, paths.BUILD_DIR)

  # icon
  icon_file = os.path.join(paths.ROOT_DIR, settings['icon'])
  shutil.copy(icon_file, os.path.join(paths.BUILD_DIR, "images", "icon.png"))

  # Generate a sha for the build.
  print("Generating a checksum...")
  build_checksum = checksum(paths.BUILD_DIR)

  # Write the manifest.
  print("Writing the manifest...")
  build_files = find_files(paths.BUILD_DIR)
  with open(manifest_file, 'w') as f:
    f.write("CACHE MANIFEST\n")
    f.write("# %s\n" % build_checksum)
    f.write("CACHE:\n")
    f.write("\n".join(map(lambda x: x, build_files)))
    f.write("\n")
    f.write("NETWORK:\n")
    f.write("*\n")

  # We don't want the following files to be added to the manifest.
  copy_files(paths.SOURCE_DIR, paths.BUILD_DIR, ["version.txt", "release.txt", "sizes.html"])

  # Archive the build.
  if not os.path.exists(archives_dir):
    os.makedirs(archives_dir)
  settings_name = os.path.splitext(os.path.basename(options.settings))[0]
  with Chdir(paths.ROOT_DIR):
    archive_path = os.path.join(archives_dir, "build-%s-%s.tar.gz" % (build_checksum, settings_name))
    latest_archive_path = os.path.join(archives_dir, "build-latest-%s.tar.gz" % settings_name)
    subprocess.check_call(["tar", "-zcf", archive_path, "build"])
    if os.path.exists(latest_archive_path):
      os.remove(latest_archive_path)
    os.symlink(archive_path, latest_archive_path)


def command_build(parser):
  parser.add_argument("settings", help="settings file")
  return build;


def command_serve(parser):
    parser.add_argument("--port", default=8000, type=int, help="Listening port.")

    def inner(options):
      httpd = SocketServer.TCPServer(("", options.port), SimpleHTTPServer.SimpleHTTPRequestHandler)
      print("Serving on http://127.0.0.1:%d..." % options.port)
      os.chdir(paths.BUILD_DIR)
      httpd.serve_forever()

    return inner


def command_deploy(parser):
  parser.add_argument("settings", help="settings file")

  def inner(options):
    build(options)
    settings = load_settings(path=os.path.abspath(options.settings))

    if (settings["deploy"]["confirm"]):
      print("Deploy to '%s'? [y/N]" % settings["deploy"]["domain"])
      choice = raw_input().lower()
      if choice != "y":
        exit("Abort.")

    with Chdir(paths.ANSIBLE_DIR):
      subprocess.check_call(["ansible-playbook", "gameplay.yml",
                             "--extra-vars", json.dumps(settings["deploy"])])

  return inner


def command_check_git_status(parser):

  def inner(options):
    with Chdir(paths.BUILD_DIR):
      result = subprocess.check_output(["git", "status", "--porcelain"]).decode('utf-8').strip()
      if result:
        print(result)
        subprocess.run(["git", "diff"])
        exit("Git repository has local modifications. Did you run a build locally and commit the changes? 🤔")
    print("Repository is clean. THank you for building locally. 🎉")

  return inner


def add_command(subparsers, name, command, help=""):
  parser = subparsers.add_parser(name, help=help)
  fn = command(parser)
  parser.set_defaults(fn=fn)


def main():
  parser = argparse.ArgumentParser(description="Build script for Game Play.")
  subparsers = parser.add_subparsers(help="Command to run.")
  add_command(subparsers, name="build", command=command_build, help="Build the project.")
  add_command(subparsers, name="serve", command=command_serve, help="Run a local server.")
  add_command(subparsers, name="deploy", command=command_deploy, help="Deploy the project.")
  add_command(subparsers, name="check-git-status", command=command_check_git_status, help="Check the git repository is clean.")
  options = parser.parse_args()
  options.fn(options)

if __name__ == '__main__':
  main()
