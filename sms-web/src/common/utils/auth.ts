// Stub: re-export from @ss-cmp/utils. 保留 `utils/auth` alias 以避免大规模业务 import 替换。
// 后续 PR 可将业务引用改为 `@ss-cmp/utils` 并删除本 stub。
export { getToken, setToken, removeToken, configureAuth } from '@ss-cmp/utils'
