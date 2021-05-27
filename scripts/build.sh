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

# Process the command line arguments.
POSITIONAL=()
PREVIEW=false
while [[ $# -gt 0 ]]
do
    key="$1"
    case $key in
        --preview)
        PREVIEW=true
        shift
        ;;
        *)
        POSITIONAL+=("$1")
        shift
        ;;
    esac
done

# git ls-remote --tags
git tag
git submodule update --init --recursive
pip install pipenv
export PIPENV_IGNORE_VIRTUALENVS=1
scripts/install-dependencies.sh

if $PREVIEW ; then
    scripts/gameplay build settings/preview.json
else
    scripts/gameplay build settings/release.json
fi
