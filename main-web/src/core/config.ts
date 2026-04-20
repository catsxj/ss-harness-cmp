import mainRouter from '@/router/index'
import axios from 'axios'

export type IAppConfig = {
  name: string
  entry?: string
  activeRule?: string | string[]
}

export async function getMicroApp() {
  const { protocol, hostname } = location
  const prefix = `${protocol}//${hostname}:60003/`
  const {
    data: { deployAddress = prefix, configs }
  }: {
    data: {
      configs: IAppConfig[]
      deployAddress: string
    }
  } = await axios.get('/config/app.json')
  // 应用入口默认为60003端口加应用名称，匹配规则为数组时是根路径(cos)
  return configs.map((item: IAppConfig) => {
    const { name, activeRule = `/${name}`, entry = `${deployAddress}${Array.isArray(activeRule) ? '' : `${name}/`}` } = item
    return {
      name,
      entry,
      container: '#subapp-viewport',
      activeRule,
      props: {
        appPath: entry,
        mainRouter
      }
    }
  })
}
