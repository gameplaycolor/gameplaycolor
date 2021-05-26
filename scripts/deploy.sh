#!/bin/bash

set -e
set -o pipefail
set -x
set -u

sha=`git rev-parse HEAD`
git checkout pull-request
git reset --hard $sha
git push --force origin pull-request
