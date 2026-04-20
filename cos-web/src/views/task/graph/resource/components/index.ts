import { upperFirst } from 'lodash-es'
import { getModules } from 'utils/autoImport'

const codeMap = new Map()
// const vueFiles = require.context('./', true, /\.vue$/);
const vueFiles = (import.meta as any).globEager('./*/*.vue')
export const components = getModules(vueFiles)

// 优先在map里取值， 组件命名规范 task.software.nginx => NginxItem task.software.iscsi.client=>IscsiClient
export function getCurrentComponent(code: string) {
  const [f, s = 'Item'] = code.split('task.resource.')[1].split('.')
  return codeMap.get(code) || `${upperFirst(f)}${upperFirst(s)}`
}
