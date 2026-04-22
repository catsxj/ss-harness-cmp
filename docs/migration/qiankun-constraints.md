# Qiankun 约束

> 子应用必须满足的 Qiankun 集成约束。改 main.ts / router 时对照。

---

## 硬约束

```
- 子应用必须导出 bootstrap / mount / unmount
- 路由 base 前缀与基座 activeRule 一致
- 静态资源配置 publicPath
- 不操作 document.body 样式
- 全局通信用 initGlobalState
- 卸载时清理所有副作用
```

## 基座 app.json 机制（重要）

`main-web/src/core/config.ts` 的 `getMicroApp()` 在 main-web 启动时一次性读 `/config/app.json` 并 `registerMicroApps`。

**结论**：修改 `main-web/public/config/app.json`（如回滚切旧版端口）后必须在浏览器 F5 强刷才能生效。文档里"无需重启"是理论值，实际需要 F5。详见 [`.claude/memory/project_cmp_pitfalls.md`](../../.claude/memory/project_cmp_pitfalls.md) 第 37 条。

## 基座 activeRule 与子应用 router base

- 子应用 router history base 必须匹配主应用 activeRule
- `createWebHistory(window.__POWERED_BY_QIANKUN__ ? '/sms-web' : '/')`
- 否则主应用跳 `/sms-web/xxx` 时子应用 router 只认 `/xxx`，报 "No match"

## 相关

- [../operations/rollback.md](../operations/rollback.md) — Qiankun 运行时 entry 切换回滚
- [../operations/coexistence-testing.md](../operations/coexistence-testing.md) — Vue 2 + Vue 3 共存联调
- [compat-layer.md](compat-layer.md) — 自研包在 Qiankun 沙箱下的处理
