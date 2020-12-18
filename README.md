# 用途

用于全局唯一 ID（guid），snowflake 方案

## 2. 运行

```bash
WORKDIR=/home/tang/Documents/github/GuidGenerator

docker run -d -p 21075:21075 \
  --restart=always \
  --name guid_generator \
  --volume $WORKDIR/dist/config.js:/www/server/config.js:ro \
  starcode/guid-generator:latest
```

# 可能用到的命令

```bash
docker container stop guid_generator && docker container rm guid_generator
```
