#!/bin/bash

# 该脚本路径必须在 build 的上下文路径下
# for ubuntu
cd $(dirname $(readlink -f $0))

# for macos,mac 中 readlink 与 ubuntu 中语法不相同
# cd $(dirname $(greadlink -f $0))

WORKSPACE_FOLDER=`pwd`

yarn install

bash $WORKSPACE_FOLDER/build.sh

cd $WORKSPACE_FOLDER/dist

yarn run cust_install

cd $WORKSPACE_FOLDER

docker image build --tag "starcode/guid-generator:1.0.3" --tag "starcode/guid-generator:latest" --force-rm ./
