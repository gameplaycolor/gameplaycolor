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

# HTML.
cat index.html | grep -B1000000 "<\!-- MINIFY JS START -->" > index.min.html
echo "<script>" >> index.min.html

for var in js/spin.min.js js/utilities.js js/app.js js/logging.js js/control.js js/console.js js/library.js js/games.js js/pad.js js/button.js js/gameboy.js js/grid.js js/store.js js/touchlistener.js js/gesturerecognizer.js js/device.js js/tracker.js js/drive.js
do
    cat "$var" | jsmin >> index.min.html
done
echo "$javascript" >> index.min.html
echo "</script>" >> index.min.html
cat index.html | grep -A1000000 "<\!-- MINIFY JS END -->" >> index.min.html

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