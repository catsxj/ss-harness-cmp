# 回滚方案

> 迁移后的子应用上线出现严重问题时，如何快速回滚到 Vue 2 版本

---

## 回滚机制

### Git 级回滚

每个子应用迁移前的 Vue 2 代码保留在 `main` 分支的初始 commit 中。

```bash
# 查看迁移前的代码
git show main:sms-web/src/main.ts

# 恢复某个子应用到迁移前状态
git checkout main -- sms-web/
```

### Qiankun 运行时切换

基座 main-web 通过 `/config/app.json` 动态注册子应用。可以通过修改配置切换新旧版本入口：

```json
// 正常：指向 Vue 3 新版本
{ "name": "sms-web", "entry": "//localhost:3006/" }

// 回滚：指向 Vue 2 旧版本（需提前部署旧版本到备用端口/路径）
{ "name": "sms-web", "entry": "//localhost:3016/" }
```

### 建议的回滚流程

```
1. 迁移前：旧版本打 tag（如 v2-sms-web）并保留构建产物
2. 迁移后：新旧版本同时部署到不同路径
3. 出问题时：修改 app.json 的 entry 指向旧版本
4. 无需重启基座，Qiankun 会自动加载新的 entry
```

---

## 各子应用回滚准备清单

迁移每个子应用前，确保完成：

```
[ ] 旧版本已打 git tag：git tag v2-{app-name}
[ ] 旧版本构建产物已备份（或可随时从 tag 重新构建）
[ ] 基座 app.json 支持切换 entry
[ ] 回滚操作已在测试环境验证过
```

---

## sms-web 回滚确认（更新：2026-04-22，合并入 develop @ b057cff）

- [x] **Vue 2 tag 已打**：`v2-sms-web`
- [x] **旧版可从 tag 复建**：`git checkout v2-sms-web -- sms-web/` 可恢复到 5.6.0 版本
- [x] **feature 分支提交可追溯**：7 个 commit 在 `feature/migrate-sms-web` 上（8e33414 / 81a7a1a / 06155c3 / 450dc9e / a47f42b / d55055a / 17d9833）
- [x] **已合入 develop**：merge commit `b057cff`（--no-ff），可整体 revert
- [x] **基座 app.json 切换可用**：main-web `public/config/app.json` 的 sms-web 条目支持覆盖 `entry`
- [ ] **构建产物双版本部署**（需运维配合）
- [ ] **测试环境回滚演练**（上线前）

### 快速回滚命令

```bash
# 方案 1: 整体 revert merge commit（develop 已合并情况下首选）
git revert -m 1 b057cff
git push origin develop

# 方案 2: feature 分支弃用，回到 main 基线（破坏性，仅限未发布场景）
git checkout main -- sms-web/
git commit -m "revert(sms-web): rollback to Vue 2 baseline"

# 方案 3: 单独 revert feature 分支每个 commit（粒度细，顺序从新到旧）
git revert 17d9833 d55055a a47f42b 450dc9e 06155c3 81a7a1a 8e33414 --no-edit

# 方案 4: Qiankun 运行时切换（需旧版已部署到备用端口）
# 编辑 main-web/public/config/app.json：
# { "name": "sms-web", "entry": "//{host}:旧版端口/sms-web/" }
# 无需重启 main-web，Qiankun 会在子应用下次 mount 时拉新 entry
```
