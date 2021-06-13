#!/bin/bash

# Copyright (c) 2012-2021 InSeven Limited
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of
# this software and associated documentation files (the "Software"), to deal in
# the Software without restriction, including without limitation the rights to
# use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
# the Software, and to permit persons to whom the Software is furnished to do so,
# subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
# FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
# COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
# IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
# CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

set -e
set -o pipefail
set -x
set -u

SCRIPTS_DIRECTORY="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ROOT_DIRECTORY="${SCRIPTS_DIRECTORY}/.."
CHANGES_DIRECTORY="${SCRIPTS_DIRECTORY}/changes"

PATH=$PATH:$CHANGES_DIRECTORY

# Process the command line arguments.
POSITIONAL=()
PREVIEW=false
PRUNE_TAGS=false
RELEASE=${TRY_RELEASE:-false}
INSTALL_DEPENDENCIES=false
while [[ $# -gt 0 ]]
do
    key="$1"
    case $key in
        --preview)
        PREVIEW=true
        shift
        ;;
        --prune-tags)
        PRUNE_TAGS=true
        shift
        ;;
        --install-dependencies)
        INSTALL_DEPENDENCIES=true
        shift
        ;;
        -r|--release)
        RELEASE=true
        shift
        ;;
        *)
        POSITIONAL+=("$1")
        shift
        ;;
    esac
done

cd "$ROOT_DIRECTORY"

# Since Netlify doesn't configure any remotes by default, reuses checkouts, and doesn't correctly prune tags, we have
# to do some unpleasant things to 1) ensure there's a remote, and 2) prune the local tags to ensure changes always
# reports the correct version number when the tags have changed.
if $PRUNE_TAGS ; then
    git config --get remote.origin.url || git remote add origin https://github.com/gameplaycolor/gameplaycolor.git
    git fetch --prune --prune-tags
fi

# Install dependencies.
if $INSTALL_DEPENDENCIES ; then
    git submodule update --init --recursive
    pip install pipenv
    export PIPENV_IGNORE_VIRTUALENVS=1
    scripts/install-dependencies.sh
fi

# Build.
if $PREVIEW ; then
    scripts/gameplay build settings/preview.json
else
    scripts/gameplay build settings/release.json
fi

# Attempt to create a version tag and publish a GitHub release.
# This fails quietly if there's no release to be made.
if $RELEASE ; then
    changes \
        release \
        --skip-if-empty \
        --push \
        --command 'scripts/release.sh'
fi
