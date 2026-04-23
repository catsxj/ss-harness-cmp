# 文档大小约束

> 每个 Markdown 文档 **不超过 200 行**。超过则必须拆分或归档。

---

## 为什么要限制

- **Agent context 开销**：超长文档被 Grep/Read 时占 context 多，其他工作空间被压缩
- **可读性**：200 行正好一屏 scroll，阅读者不用上下跳
- **单一关注点**：超过 200 行通常说明文档承担了多个主题，拆分后各主题独立可索引
- **版本变更友好**：短文档 diff 噪音小，更容易 review

## 适用范围

✅ 适用：
- `docs/` 下所有 `.md`
- `.claude/memory/*.md`
- 根目录的规划类 `.md`（`upgrade-plan.md` 等）
- `CLAUDE.md`

❌ 不适用（豁免）：
- `docs/superpowers/plans/*.md` / `docs/superpowers/specs/*.md` —— executing-plans / writing-plans skill 的 artifact，整体性约定，拆了会破坏 skill；超标就 **归档**到 `docs/history/archived-{plans,specs}/` 而不是拆
- `.claude/skills/*/SKILL.md` —— 外部 plugin authored，不在本仓库控制范围内
- 代码生成的 `components.d.ts / auto-imports.d.ts` 等（虽不是 .md，顺带声明）

## 处理策略（超过 200 行时）

### 1. 按 phase / 时间 / 主题拆分（首选）

例：
- `upgrade-plan.md` (814) → `docs/roadmap/overview.md` + `docs/roadmap/phase-{0..4}.md`
- `project_cmp_pitfalls.md` (215) → 按时代拆：Vue 迁移期 + workspace 期

### 2. 抽出纯参考内容

清单 / 表格 / 详细代码片段等可抽到同目录或 `reference/` 子目录。主文件保留"why + how"，reference 文件承载"what"。

### 3. 归档（对历史 artifact）

已完成的 plan / spec / 过时的设计文档，**整体移动**到 `docs/history/archived-*/` 并在索引加一行。

## 索引要求

拆分或归档后必须：

1. 原位置留**一行索引**指向新位置（避免死链）
2. 更新上一级的 `README.md`（列出新文件清单）
3. 更新 `CLAUDE.md` 的"必读次序"（如涉及）

## 检查方法

```bash
# 列出所有超 200 行的 .md
for f in $(find docs .claude -name "*.md" -type f) CLAUDE.md; do
  [ -f "$f" ] || continue
  lines=$(wc -l < "$f")
  [ "$lines" -gt 200 ] && echo "$lines $f"
done | sort -rn
```

预期：豁免列表之外，输出应为空。

## 相关

- [agent-constraints.md](agent-constraints.md) — Agent 行为约束（本文件属扩展）
