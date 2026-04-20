import { upperFirst } from 'lodash-es'
import { getModules } from 'utils/autoImport'

const codeMap = new Map([
  ['task.software.iscsi', 'IscsiServer'],
  ['task.software.memcache', 'MemCache'],
  ['task.software.rocketmq', 'RocketMq'],
  ['task.software.sqlserver', 'SqlServer'],
  ['task.software.postgresql', 'PgSql'],
  ['task.software.rabbitmq', 'RabbitMq'],
  ['task.software.activemq', 'ActiveMq']
])
// const vueFiles = require.context('./', true, /\.vue$/);
const vueFiles = (import.meta as any).globEager('./*.vue')
export const components = getModules(vueFiles)

// 优先在map里取值， 组件命名规范 task.software.nginx => NginxItem task.software.iscsi.client=>IscsiClient
export function getCurrentComponent(code: string) {
  const [f, s = 'Item'] = code.split('task.software.')[1].split('.')
  return codeMap.get(code) || `${upperFirst(f)}${upperFirst(s)}`
}
