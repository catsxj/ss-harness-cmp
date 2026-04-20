# Vue 2 + Vue 3 新旧共存联调测试

> csc-web 保持 Vue 2，其他子应用迁移到 Vue 3
> 必须验证混合环境下 Qiankun 的稳定性

---

## 测试场景

### 1. 沙箱隔离

```
[ ] Vue 3 子应用的 Element Plus 样式不泄漏到 Vue 2 子应用
[ ] Vue 2 子应用的 ElementUI 样式不泄漏到 Vue 3 子应用
[ ] 两种 Vue 实例不互相干扰（全局变量、原型链）
[ ] CSS 变量体系（Element Plus 用 CSS Variables，ElementUI 用 SCSS Variables）不冲突
```

### 2. 全局状态通信

```
[ ] initGlobalState 在 Vue 2 子应用中 setGlobalState 后，Vue 3 子应用能收到
[ ] 反向：Vue 3 → Vue 2 通信正常
[ ] 基座 → Vue 2/Vue 3 子应用通信正常
[ ] props 传递（appPath、mainRouter）在两种子应用中都能正常接收
```

### 3. 路由切换

```
[ ] 从 Vue 3 子应用切换到 csc-web（Vue 2）：无白屏、无报错
[ ] 从 csc-web 切换回 Vue 3 子应用：无白屏、无报错
[ ] 快速反复切换（Vue2 ↔ Vue3）：无内存泄漏
[ ] 浏览器前进/后退跨 Vue2/Vue3 子应用：路由正常
```

### 4. 内存泄漏检查

```
[ ] 打开 Chrome DevTools → Performance → Memory
[ ] 反复切换 Vue 2 ↔ Vue 3 子应用 10 次
[ ] 检查 JS Heap 是否持续增长（正常应回落）
[ ] 检查 DOM Nodes 是否持续增长（子应用卸载后应释放）
```

### 5. 生命周期

```
[ ] Vue 3 子应用 unmount 后，所有定时器/事件监听已清理
[ ] Vue 2 子应用 (csc-web) unmount 后，不影响后续加载的 Vue 3 子应用
[ ] 子应用多次 mount/unmount 循环无累积副作用
```

---

## 测试时机

- 每迁移完一个子应用，都要跑一轮新旧共存测试
- 重点测试：迁移后的子应用 ↔ csc-web（Vue 2）的切换
