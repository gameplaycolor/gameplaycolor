import os.path

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(SCRIPTS_DIR)
SOURCE_DIR = os.path.join(ROOT_DIR, "src")
ANSIBLE_DIR = os.path.join(ROOT_DIR, "ansible")
BUILD_DIR = os.path.join(ROOT_DIR, "build")

VERSION_FILE = os.path.join(SOURCE_DIR, "version.txt")