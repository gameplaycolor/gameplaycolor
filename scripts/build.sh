#!/bin/bash

set -e
set -u

function append() {
  for var in "$@"
  do
      echo "$var" >> "$manifest"
  done
  echo "" >> "$manifest"
}



script_directory=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
root_directory="$script_directory/.."
source_directory="$root_directory/src"
manifest="$source_directory/cache.manifest"

# Remove any existing cache manifest file.
if [[ -e "$manifest" ]]; then
  rm "$manifest"
fi

pushd "$source_directory" > /dev/null

# Minify.
python "$script_directory/minify" index.html index.min.html

# Manifest.
version=$(date +%s)
append "CACHE MANIFEST"
append "# Version: $version"
append "CACHE:"
append *.html
append **/*.css
append js/*.js
append gbo/*.js gbo/**/*.js
append images/*.png
append defaults/*.png
append settings.json

append "NETWORK:"
append "*"

popd > /dev/null