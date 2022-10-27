<!-- <img src="icon.png" align="right" /> -->
# qk-release

> A beautiful cli tool for intergrated process of quick release

## ✨ Feature

- One common and quick tool for release
- CLI interacion UI
- Combine with version update, tag commit, building(optional), change log(optional), pushing to git, publishing(optional) etc.

## 🚀 Start

### Install

```bash
npm i -D qk-release # OR yarn add -D qk-release
```

```js
  "scripts": {
    "release": "qkrelease <--skipBuild | --skipLog | --skipPublish | --skipGitPush>"
  },
```

- skipBuild 跳过build构建过程
- skipLog 跳过changelog日志过程
- skipPublish 跳过npm publish过程
- skipGitPush 跳过git push过程

```bash
npm run release # OR yarn release
```

<br>
<br>
😉😘 If it is helpful to you, please add <b>⭐️<a href="https://github.com/YanPanMichael/qk-release">Star</a></b> Thanks~


## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2022-present, YanPan