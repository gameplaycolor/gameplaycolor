#!/bin/bash

configuration=$1

if [[ ! -f "$configuration" ]]; then
    echo "Unable to find configuration file '$1'."
    exit 1
fi

remote=$( cat "$configuration" | python -c "import json; import sys; print json.load(sys.stdin)['remote']" )

echo "Uploading to '$remote'..."

export ROOT=../src

rsync -avPe ssh $ROOT/*.html     "$remote"
rsync -avPe ssh $ROOT/*.manifest "$remote"
rsync -avPe ssh $ROOT/js         "$remote"
rsync -avPe ssh $ROOT/jsgb       "$remote"
rsync -avPe ssh $ROOT/css        "$remote"
rsync -avPe ssh $ROOT/gbo        "$remote"
rsync -avPe ssh $ROOT/images     "$remote"

rsync -avPe ssh "$configuration" "$remote/settings.json"
