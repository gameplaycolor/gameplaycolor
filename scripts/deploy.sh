#!/bin/bash

configuration=$1

if [[ ! -f "$configuration" ]]; then
    echo "Unable to find configuration file '$1'."
    exit 1
fi

./build.sh

remote=$( cat "$configuration" | python -c "import json; import sys; print json.load(sys.stdin)['remote']" )

echo "Uploading to '$remote'..."

export ROOT=../src

rsync -avPe ssh \
    $ROOT/*.html \
    $ROOT/*.manifest \
    $ROOT/js \
    $ROOT/jsgb \
    $ROOT/css \
    $ROOT/gbo \
    $ROOT/images \
    $ROOT/defaults \
    "$remote"

rsync -avPe ssh "$configuration" "$remote/settings.json"
