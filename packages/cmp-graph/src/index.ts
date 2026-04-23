import type { App } from 'vue'
// @ts-expect-error - @antv/g6-editor 无 .d.ts
import { Flow } from '@antv/g6-editor'

import Editor from './Editor.vue'
import ContextMenu from './ContextMenu.vue'
import MiniMap from './MiniMap.vue'
import Toolbar from './Toolbar.vue'
import ToolbarSimple from './ToolbarSimple.vue'

// Vue 3 升级版 cmp-graph（A 档 port of original/cmp-graph/src/components）
// 保留 `@antv/g6-editor@^1.2.0`（不升级图库），行为与 Vue 2 原版一致
export { Editor, ContextMenu, MiniMap, Toolbar, ToolbarSimple, Flow }

const COMPONENTS = {
  Editor,
  ContextMenu,
  MiniMap,
  Toolbar,
  ToolbarSimple
} as const

function toKebab(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/^([A-Z])/, (_, c: string) => c.toLowerCase())
    .toLowerCase()
}

export function registerCmpGraph(app: App): void {
  for (const [name, comp] of Object.entries(COMPONENTS)) {
    app.component(name, comp)
    app.component(toKebab(name), comp)
  }
}
