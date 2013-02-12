#!/bin/bash

export TARGET="zyloid:~/sites/jbmorley/gameboy"
export ROOT=../src

rsync -avPe ssh $ROOT/*.html     $TARGET
rsync -avPe ssh $ROOT/*.manifest $TARGET
rsync -avPe ssh $ROOT/js         $TARGET
rsync -avPe ssh $ROOT/jsgb       $TARGET
rsync -avPe ssh $ROOT/css        $TARGET
rsync -avPe ssh $ROOT/gbo        $TARGET
rsync -avPe ssh $ROOT/images     $TARGET

rsync -avPe ssh settings-jbmorley.json $TARGET/settings.json