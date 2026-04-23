# Phase 4：基座优化 + 清理收尾

**目标：基座 main-web 已经是 Vue 3，只做依赖升级和清理**
**预计周期：1-2 周**

## 执行状态

⬜ **待开始**（所有子应用迁完后）

---

## 4.1 基座优化（main-web 已是 Vue 3）

```
[ ] 升级 Element Plus 从 1.1.0-beta.9 → 最新稳定版 2.7+
[ ] 升级 Vite 从 2.8 → 5.x
[ ] 升级 vue-router 从 4.0 → 4.3+
[ ] 评估 Vuex 4 → Pinia 的必要性（基座较轻，可选）
[ ] 移除 Qiankun 中对 Vue2 子应用的兼容配置（所有子应用已迁完）
[ ] 确认 Ant Design Vue 与最新 Element Plus 无冲突
[ ] 全量回归测试（所有 6 个子应用联调）
```

## 4.2 全局清理

```
[ ] 删除旧子应用代码（Vue2 版本归档到 git tag）
[ ] 删除 ElementUI 依赖
[ ] 删除 Vuex 3 依赖
[ ] 删除 vue-router 3 依赖
[ ] 删除 @vue/composition-api
[ ] 删除 vue-class-component / vue-property-decorator
[ ] 删除 vue-cli-service 相关配置和依赖（迁完所有子应用后）
[ ] 删除 vite-plugin-vue2（子应用旧的 Vue2 Vite 配置）
[ ] 废弃 cmp-element 原包（改用 @ss-cmp/cmp-element）
[ ] 统一所有子应用 tsconfig 为 strict: true
[ ] ESLint 切换到纯 Vue3 + TS 规则集
[ ] .npmrc 尝试移除 shamefully-hoist=true
[ ] 清理 sms-web/src/common/utils/ 下的 stub 层（6 个 re-export 文件）
[ ] 更新项目 README
[ ] 更新部署文档
[ ] CLAUDE.md 更新为维护阶段版本
```

## 4.3 Phase 4 验收标准

```
[ ] 基座 + 5 个子应用 Vue 3 + Element Plus + TS（csc-web 保持 Vue 2）
[ ] 所有路由切换正常
[ ] 全局状态通信正常
[ ] 登录/权限/菜单正常
[ ] 无 Vue 2 相关依赖残留
[ ] CI 全量通过
[ ] 所有 @ss-cmp/* 包有 runtime smoke test（CodeMirror / FullScreen / JsonView 的 cmp-element A 档 port + 5 个 cmp-graph A 档 port）
```
