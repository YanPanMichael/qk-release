### 安装

```bash
npm i -D qk-release # OR yarn add -D qk-release
```

### 使用

**第一步**：package.json 中新增 scripts：

```js
  "scripts": {
    "release": "qkrelease <--skipBuild | --skipLog | --skipPublish | --skipGitPush>"
  },
```

- skipBuild 跳过build构建过程
- skipLog 跳过changelog日志过程
- skipPublish 跳过npm publish过程
- skipGitPush 跳过git push过程


**第二步**：命令行进入项目目录，运行：

```bash
npm run release # OR yarn release
```
