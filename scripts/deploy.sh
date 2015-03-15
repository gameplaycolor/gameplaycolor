#!/bin/bash

configuration=$1

if [[ ! -f "$configuration" ]]; then
    echo "Unable to find configuration file '$1'."
    exit 1
fi

remote=$( cat "$configuration" | python -c "import json; import sys; print json.load(sys.stdin)['remote']" )

echo "Uploading to '$remote'..."

export root=".."
export build="$root/build"

python "$root/scripts/build" --debug "$root" "$configuration"

rsync -avPe ssh \
    $build/*.html \
    $build/*.manifest \
    $build/*.json \
    $build/images \
    $build/defaults \
    "$remote"
