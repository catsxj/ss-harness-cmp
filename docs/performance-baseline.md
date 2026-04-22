# 性能基线对比

> 迁移前后的性能数据记录，确保迁移不引入性能退化

---

## 采集方法

### 包体积

```bash
# Vue 2 版本
cd {app-name} && vue-cli-service build --report
# 查看 dist/report.html 中各模块体积

# Vue 3 版本
cd {app-name} && vue-cli-service build
# 对比 dist/ 目录总大小和各 chunk 大小
```

### 首屏加载时间

```
1. Chrome DevTools → Network → 清缓存刷新
2. 记录 DOMContentLoaded 和 Load 时间
3. 记录最大的 JS chunk 体积和加载耗时
```

### 运行时内存

```
1. Chrome DevTools → Performance → Record
2. 操作 5 个主要页面
3. 记录 JS Heap 峰值
```

---

## 基线记录表

### scr-web

| 指标 | Vue 2 | Vue 3 | 变化 |
|------|-------|-------|------|
| 构建总体积 | 待记录 | 待记录 | |
| 最大 chunk | 待记录 | 待记录 | |
| DOMContentLoaded | 待记录 | 待记录 | |
| Load | 待记录 | 待记录 | |
| JS Heap 峰值 | 待记录 | 待记录 | |

### sms-web

> Vue 3 数据：基于 HEAD @ 17d9833 committed build（sms-web/sms-web/static/）
> Vue 2 数据：TODO — 需 `git worktree add + checkout main + pnpm install + build` 才能采
> 浏览器指标：TODO — 需 DevTools 手测（见下方操作指南）

| 指标 | Vue 2 | Vue 3 | 变化 |
|------|-------|-------|------|
| 构建总体积（static/） | 待从 main 构建 | **7061 KiB**（81 文件） | |
| 最大 JS chunk（raw） | 待记录 | chunk-vendors `2508 KiB`（gzip `786 KiB`） | |
| 次大 JS chunk（raw） | 待记录 | 739 号 `1566 KiB`（gzip `431 KiB`） — 含 wangeditor/echarts | |
| 最大 CSS chunk | 待记录 | chunk-vendors `343 KiB`（gzip `46 KiB`） | |
| entrypoint（首屏 JS+CSS） | 待记录 | **2.97 MiB** | |
| DOMContentLoaded（基座就绪） | 待手测 | **677 ms**（localhost dev） | |
| Load（基座就绪） | 待手测 | **683 ms**（localhost dev） | |
| 首屏 transferred | 待手测 | **8612 KiB**（resources 14266 KiB） | |
| 最大 JS 请求耗时（localhost） | 待手测 | Vite vendor chunk 2186 KB `50 ms` | |
| JS Heap 峰值 | 待手测 | **230 MB** (230477 KB) | |

**Vue 3 构建耗时**：97.9s（2026-04-22 本地验证）

> **测量注释**：
> - DOMContentLoaded/Load 测的是 main-web 基座就绪时间；sms-web 作为 Qiankun 子应用在 Load 之后异步 mount，其 bundle（chunk-vendors.245c9079.js 2508 KB）在后续请求加载。
> - localhost dev 无网络延迟，生产环境耗时会显著高于本次测量。
> - 最大 JS chunk `chunk-75LZR7SH.js?v=cb3599eb` 是 Vite 预打包依赖（main-web vendor），不是 sms-web 的 webpack 产物。
> - Vue 2 对比数据待从 main 分支构建后补录（需单独 `git worktree` + `pnpm install` + `vue-cli-service build`，约 10-15 min）。

### cmp-web

| 指标 | Vue 2 | Vue 3 | 变化 |
|------|-------|-------|------|
| 构建总体积 | 待记录 | 待记录 | |
| 最大 chunk | 待记录 | 待记录 | |
| DOMContentLoaded | 待记录 | 待记录 | |
| Load | 待记录 | 待记录 | |
| JS Heap 峰值 | 待记录 | 待记录 | |

### cms-web

| 指标 | Vue 2 | Vue 3 | 变化 |
|------|-------|-------|------|
| 构建总体积 | 待记录 | 待记录 | |
| 最大 chunk | 待记录 | 待记录 | |
| DOMContentLoaded | 待记录 | 待记录 | |
| Load | 待记录 | 待记录 | |
| JS Heap 峰值 | 待记录 | 待记录 | |

### cos-web

| 指标 | Vue 2 | Vue 3 | 变化 |
|------|-------|-------|------|
| 构建总体积 | 待记录 | 待记录 | |
| 最大 chunk | 待记录 | 待记录 | |
| DOMContentLoaded | 待记录 | 待记录 | |
| Load | 待记录 | 待记录 | |
| JS Heap 峰值 | 待记录 | 待记录 | |

---

## 异常阈值

- 包体积增长 > 30%：需分析原因（通常是 Element Plus 按需导入未配置）
- 首屏加载增加 > 2s：需做代码分割或懒加载优化
- JS Heap 持续增长不回落：存在内存泄漏
