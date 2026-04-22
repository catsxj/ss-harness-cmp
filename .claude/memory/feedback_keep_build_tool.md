---
name: 保持原有构建工具
description: 迁移时不要把 Vue CLI 换成 Vite，保持原有的构建方式。完整规则已迁至 docs/rules/build-tool.md
type: feedback
originSessionId: 6e5c9226-b555-4494-a1c0-f8f45eaff248
---
迁移 Vue 2 → Vue 3 时，不改变构建工具。保持 vue-cli-service（webpack），不切换到 Vite。

**Why:** 用户明确要求"根据原有的构建方式启动构建即可，不用改为 vite 启动构建"。减少迁移变量，降低风险。

**How to apply:** 完整规则和细节见 [docs/rules/build-tool.md](../../docs/rules/build-tool.md)。本文件仅作为 Claude 私有记忆保留，规则原文落在 docs 下统一维护。
