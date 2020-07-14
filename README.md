# 用途

用于全局唯一 ID（guid），snowflake 方案

# 部署

## 1. 编译源代码

```bash
# 安装依赖包
yarn install

# 编译
yarn run build
```

## 2. 直接

```bash
# 1. node 直接运行
node ./dist/src/main.js

# 2. docker 运行
WORKDIR=~/Documents/github/GuidGen
docker run -d -p 21075:21075 \
  --restart=always \
  --name guid_generator_1 \
  --volume $WORKDIR/dist:/www/server \
  --volume $WORKDIR/node_modules:/www/server/node_modules \
  --workdir /www/server \
  node:lts node src/main.js
```

# 可能用到的命令

```bash
docker container ls -a | grep guid_generator
docker container logs guid_generator_1
docker container stop guid_generator_1
docker container rm guid_generator_1
```
