import Empty from './empty/Empty.vue'
import SvgIcon from './svg-icon/SvgIcon.vue'

export const components: any = {
  Empty,
  SvgIcon
}
export default function registerComponent(app: any) {
  Object.keys(components).forEach((key) => {
    app.component(key, components[key])
  })
}
