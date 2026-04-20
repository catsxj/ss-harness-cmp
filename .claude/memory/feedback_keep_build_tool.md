---
name: 保持原有构建工具
description: 迁移时不要把 Vue CLI 换成 Vite，保持原有的构建方式
type: feedback
originSessionId: 6e5c9226-b555-4494-a1c0-f8f45eaff248
---
迁移 Vue 2 → Vue 3 时，不改变构建工具。保持 vue-cli-service（webpack）作为构建方式，不切换到 Vite。

**Why:** 用户明确要求"根据原有的构建方式启动构建即可，不用改为vite启动构建"。减少迁移变量，降低风险。

**How to apply:** 
- 升级 @vue/cli-service 到 v5（支持 Vue 3）
- 保留 vue.config.js，不创建 vite.config.ts
- 保留 public/index.html，不创建根 index.html
- scripts 保持 vue-cli-service serve / build
- scr-web 已用 Vite 完成迁移（特例），后续子应用不再这样做
