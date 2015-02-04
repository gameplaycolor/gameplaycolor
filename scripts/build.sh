#!/bin/bash

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

version=$(date +%s)
append "CACHE MANIFEST"
append "# Version: $version"
append "CACHE:"
append *.html
append "# Styles" **/*.css
append "# Application" js/*.js
append "# JavaScript GameBoy Color Emulator" gbo/*.js gbo/**/*.js
append "# Images" images/*.png

append "NETWORK:"
append "*"

popd > /dev/null