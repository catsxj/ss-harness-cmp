# @ss-cmp/utils

跨应用共享工具函数。主要是纯 TS，带少量 DOM/WebSocket 交互（uploadFile）。

## 覆盖清单

- [x] `auth.ts` — cookie token 封装（`configureAuth({tokenKey})` + `getToken/setToken/removeToken`）
- [x] `crypto.ts` — crypto-js AES / Base64 封装
- [x] `day.ts` — dayjs 本地化为 zh-cn，默认导出 dayjs
- [x] `request.ts` — axios 封装 + NProgress + 401/509 回调（`configureRequest({onUnauthorized})`）
- [x] `resolvePath.ts` — 路径解析 / 外链检测
- [x] `uploadFile.ts` — WebSocket 分片上传

## sub-app 耦合点（需在 main.ts 注入配置）

`auth.ts` 和 `request.ts` 原来直接 `import '@/config'` 和 `import('@/stores/permission'), import('@/router')`，跨包后改为配置化：

```ts
// sms-web/src/main.ts
import { configureAuth, configureRequest } from '@ss-cmp/utils'
import { tokenKey } from '@/config'

configureAuth({ tokenKey })
configureRequest({
  onUnauthorized: () => {
    Promise.all([import('@/stores/permission'), import('@/router')]).then(
      ([{ usePermissionStore }, { default: router, resetRouter }]) => {
        usePermissionStore().resetRoutes(router, resetRouter)
      }
    )
  }
})
```

## 已知残留耦合（Phase 4 再处理）

- `uploadFile.ts` 硬编码 WebSocket 路径 `/api/sms/uploadService`（含子应用名 `sms`）。cmp-web/cms-web/cos-web 迁移时需要参数化。
