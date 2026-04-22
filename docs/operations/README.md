# operations — 运维 / 上线 / 回滚

> 涉及生产环境或上线前验证的一切。需要运维或测试配合的步骤集中在这里。

---

## 文件清单

| 文件 | 说明 | 何时读 |
|------|------|--------|
| [deploy.md](deploy.md) | 生产构建与部署验证清单 | 上线前 |
| [rollback.md](rollback.md) | Git 级回滚 + Qiankun 运行时 entry 切换方案 | 迁移上线前 / 出问题时 |
| [coexistence-testing.md](coexistence-testing.md) | Vue 2 + Vue 3 新旧子应用共存联调测试 | 每个子应用迁完后 |
| [performance-baseline.md](performance-baseline.md) | 各子应用迁移前后性能数据（包体积 / DCL / Load / JS Heap） | 迁移前后各记一次 |
| [browser-compatibility.md](browser-compatibility.md) | 浏览器兼容性（Vue 3 不支持 IE11 等） | 迁移前确认目标浏览器 |

---

## 按运维阶段分组

- **迁移前**：performance-baseline（记基线）+ browser-compatibility（确认兼容）+ rollback（确认回滚方案就绪）
- **迁移后上线前**：coexistence-testing（共存联调）+ deploy（部署验证）
- **出问题时**：rollback

---

**状态说明**：本区 5 个文件将在 Step 2 从 docs/ 根目录原位搬入。
