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

| 指标 | Vue 2 | Vue 3 | 变化 |
|------|-------|-------|------|
| 构建总体积 | 待记录 | 待记录 | |
| 最大 chunk | 待记录 | 待记录 | |
| DOMContentLoaded | 待记录 | 待记录 | |
| Load | 待记录 | 待记录 | |
| JS Heap 峰值 | 待记录 | 待记录 | |

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
