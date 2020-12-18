# 用途

用于全局唯一 ID（guid），snowflake 方案

## 2. 运行

```bash
docker run -d -p 20300:20300 \
  --restart=always \
  --name guid_generator
  -v /etc/docker/config.d/20300-guid-generator-api.js:/www/server/config.js:ro \
  starcode/guid-generator:latest
```

# 可能用到的命令

```bash
docker container stop guid_generator && docker container rm guid_generator
```
