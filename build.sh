#!/bin/bash

DESTINATION=./dist
rm -rf $DESTINATION
mkdir $DESTINATION

cp --parents ./package.json $DESTINATION
cp --parents ./yarn.lock $DESTINATION

./node_modules/.bin/tsc --project ./tsconfig.json
