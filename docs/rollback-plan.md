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
