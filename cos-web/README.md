# 博云 CMP Web 前端项目

## 环境准备

- Node.js 16+
- pnpm 7+

## 快速开始

1. 配置私有 NPM 源

```bash
# 设置 registry
npm config set registry http://58.210.154.140:13011/repository/bocloud-npm/
npm config set _auth Ym9jbG91ZDpjbXBAdjU4Nw==

# npm 相关配置
npm config set auto-install-peers=true
npm config set strict-peer-dependencies=false
npm config set shamefully-hoist=true
npm config set always-auth true
```

2. 安装依赖

```bash
pnpm install
```

3. 本地开发

```bash
pnpm run serve  # 推荐：使用 vue-cli-service
```

4. 项目构建

```bash
pnpm run build
```

## 注意事项

- 不推荐使用 vite 进行开发，存在兼容性问题
- 建议使用 vue-cli-service serve 进行本地开发
