/// <reference types="vite/client" />

// Vue 单文件组件通配声明
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

declare module '@kjgl77/datav-vue3' {
  import type { Plugin } from 'vue'
  const plugin: Plugin
  export default plugin
}

declare module 'echarts-liquidfill' {
  const content: unknown
  export default content
}

declare module 'three-orbitcontrols' {
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
  export default OrbitControls
}

declare module 'three-js-csg' {
  const CSG: unknown
  export default CSG
}

declare module 'heatmapjs' {
  const h337: { create: (config: Record<string, unknown>) => unknown }
  export default h337
}

declare module 'stats.js' {
  class Stats {
    dom: HTMLElement
    showPanel(panel: number): void
    begin(): void
    end(): void
  }
  export default Stats
}

declare module 'vue-seamless-scroll' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
}

declare module 'vue3-seamless-scroll' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
}

declare module 'proj4leaflet' {
  const proj4leaflet: unknown
  export default proj4leaflet
}

declare module 'crypto-js' {
  const CryptoJS: any
  export default CryptoJS
  export const enc: any
  export const AES: any
  export const mode: any
  export const pad: any
}

declare module 'vue-count-to' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
}

declare module 'ol-echarts' {
  const OlEcharts: unknown
  export default OlEcharts
}

interface ImportMetaEnv {
  readonly BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
