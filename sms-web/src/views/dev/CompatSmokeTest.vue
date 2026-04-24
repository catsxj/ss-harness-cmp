<template>
  <div class="smoke">
    <header class="smoke__head">
      <h1>compat smoke test</h1>
      <p>runtime 验证 cmp-element + cmp-graph 的 8 个 A 档 port 组件。每块默认不挂，点"启用"按钮单独挂载，便于定位崩溃点。</p>
      <p>已渲染到这里表示：顶层 setup + imports 全部成功。</p>
    </header>

    <section class="smoke__global-errors" v-if="globalErrors.length">
      <h3>全局错误（{{ globalErrors.length }}）</h3>
      <ul>
        <li v-for="(err, idx) in globalErrors" :key="idx">{{ err }}</li>
      </ul>
    </section>

    <section class="smoke__sec">
      <header class="smoke__sec-head">
        <h2>1. CodeMirror (cmp-element)</h2>
        <button type="button" @click="toggle('codeMirror')">{{ enabled.codeMirror ? '卸载' : '启用' }}</button>
      </header>
      <div v-if="enabled.codeMirror" class="smoke__box">
        <CodeMirror :value="cmValue" :read-only="false" @changed="onCmChanged" />
        <p class="smoke__hint">当前值长度：{{ cmCurrent.length }}</p>
      </div>
    </section>

    <section class="smoke__sec">
      <header class="smoke__sec-head">
        <h2>2. JsonView (cmp-element)</h2>
        <button type="button" @click="toggle('jsonView')">{{ enabled.jsonView ? '卸载' : '启用' }}</button>
      </header>
      <div v-if="enabled.jsonView" class="smoke__box">
        <JsonView :value="jsonSample" :read-only="true" />
        <button type="button" @click="bumpJson">突变对象（测试 deep watch）</button>
      </div>
    </section>

    <section class="smoke__sec">
      <header class="smoke__sec-head">
        <h2>3. FullScreen (cmp-element) ⚠️</h2>
        <button type="button" @click="toggle('fullScreen')">{{ enabled.fullScreen ? '卸载' : '启用' }}</button>
      </header>
      <div v-if="enabled.fullScreen" class="smoke__box">
        <FullScreen ref="fsRef" fullscreen-class="smoke__fs" @change="onFsChange">
          <div class="smoke__fs-inner">
            <p>全屏内容区（ESC 退出）</p>
            <p>当前状态：{{ fsState ? '全屏中' : '非全屏' }}</p>
          </div>
        </FullScreen>
        <button type="button" @click="toggleFs">toggle()</button>
      </div>
    </section>

    <section class="smoke__sec">
      <header class="smoke__sec-head">
        <h2>4. ToolbarSimple (cmp-graph)</h2>
        <button type="button" @click="toggle('toolbarSimple')">{{ enabled.toolbarSimple ? '卸载' : '启用' }}</button>
      </header>
      <div v-if="enabled.toolbarSimple" class="smoke__box smoke__box--plain">
        <GraphToolbarSimple />
      </div>
    </section>

    <section class="smoke__sec">
      <header class="smoke__sec-head">
        <h2>5. Toolbar (cmp-graph)</h2>
        <button type="button" @click="toggle('toolbar')">{{ enabled.toolbar ? '卸载' : '启用' }}</button>
      </header>
      <div v-if="enabled.toolbar" class="smoke__box smoke__box--plain">
        <GraphToolbar />
      </div>
    </section>

    <section class="smoke__sec">
      <header class="smoke__sec-head">
        <h2>6. MiniMap (cmp-graph)</h2>
        <button type="button" @click="toggle('miniMap')">{{ enabled.miniMap ? '卸载' : '启用' }}</button>
      </header>
      <div v-if="enabled.miniMap" class="smoke__box smoke__box--plain">
        <GraphMiniMap />
      </div>
    </section>

    <section class="smoke__sec">
      <header class="smoke__sec-head">
        <h2>7. ContextMenu (cmp-graph)</h2>
        <button type="button" @click="toggle('contextMenu')">{{ enabled.contextMenu ? '卸载' : '启用' }}</button>
      </header>
      <div v-if="enabled.contextMenu" class="smoke__box smoke__box--plain">
        <GraphContextMenu />
      </div>
    </section>

    <section class="smoke__sec">
      <header class="smoke__sec-head">
        <h2>8. Editor (cmp-graph) ⚠️ 最高风险</h2>
        <button type="button" @click="toggle('editor')">{{ enabled.editor ? '卸载' : '启用' }}</button>
      </header>
      <div v-if="enabled.editor" class="smoke__box smoke__box--plain">
        <div id="page" class="smoke__page">
          <GraphEditor @nodeClick="onNodeClick" @edgeClick="onEdgeClick" />
        </div>
        <p class="smoke__hint">若空白 + 控制台有 @antv/g6-editor 报错，就是 Vue 3 不兼容。</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onErrorCaptured, onMounted, reactive, ref } from 'vue'
import { CodeMirror, FullScreen, JsonView } from '@ss-cmp/cmp-element'
import {
  Editor as GraphEditor,
  ContextMenu as GraphContextMenu,
  MiniMap as GraphMiniMap,
  Toolbar as GraphToolbar,
  ToolbarSimple as GraphToolbarSimple
} from '@ss-cmp/cmp-graph'

type SecKey =
  | 'codeMirror' | 'jsonView' | 'fullScreen'
  | 'toolbarSimple' | 'toolbar' | 'miniMap' | 'contextMenu' | 'editor'

const enabled = reactive<Record<SecKey, boolean>>({
  codeMirror: false,
  jsonView: false,
  fullScreen: false,
  toolbarSimple: false,
  toolbar: false,
  miniMap: false,
  contextMenu: false,
  editor: false
})

function toggle(key: SecKey): void {
  enabled[key] = !enabled[key]
}

const globalErrors = ref<string[]>([])

onErrorCaptured((err, _inst, info) => {
  globalErrors.value.push(`[${info}] ${(err as Error)?.message ?? String(err)}`)
  return false
})

onMounted(() => {
  window.addEventListener('error', (e: ErrorEvent) => {
    globalErrors.value.push(`[window.onerror] ${e.message} @ ${e.filename}:${e.lineno}`)
  })
  window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
    globalErrors.value.push(`[unhandledrejection] ${(e.reason?.message ?? e.reason) as string}`)
  })
})

const cmValue = '#!/bin/sh\necho "smoke test"\nls -la\n'
const cmCurrent = ref(cmValue)
function onCmChanged(v: string) {
  cmCurrent.value = v
}

const jsonSample = reactive<{ name: string; count: number; items: Array<{ id: number; tag: string }> }>({
  name: 'smoke',
  count: 3,
  items: [
    { id: 1, tag: 'a' },
    { id: 2, tag: 'b' },
    { id: 3, tag: 'c' }
  ]
})
function bumpJson() {
  jsonSample.count++
  jsonSample.items.push({ id: Date.now(), tag: 'new' })
}

const fsRef = ref<{ toggle: () => void; getState: () => boolean } | null>(null)
const fsState = ref(false)
function toggleFs() {
  fsRef.value?.toggle()
}
function onFsChange(v: boolean) {
  fsState.value = v
}

function onNodeClick(item: unknown) {
  // eslint-disable-next-line no-console
  console.log('[editor] nodeClick', item)
}
function onEdgeClick(item: unknown) {
  // eslint-disable-next-line no-console
  console.log('[editor] edgeClick', item)
}
</script>

<style lang="scss" scoped>
.smoke {
  padding: 24px;
  max-width: 1100px;
  margin: 0 auto;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: #333;
}

.smoke__head h1 {
  font-size: 22px;
  margin: 0 0 6px;
}
.smoke__head p {
  margin: 0 0 6px;
  color: #666;
  font-size: 13px;
}

.smoke__global-errors {
  padding: 12px 16px;
  border: 1px solid #f05050;
  background: #fef2f2;
  color: #b91c1c;
  margin: 16px 0 20px;
  font-size: 13px;
  border-radius: 4px;

  h3 { margin: 0 0 8px; font-size: 14px; }
  ul { margin: 0; padding-left: 18px; }
  li { word-break: break-all; }
}

.smoke__sec {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 14px 16px;
  margin: 0 0 14px;
  background: #fff;
}

.smoke__sec-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 10px;

  h2 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    flex: 1;
  }

  button {
    padding: 4px 12px;
    cursor: pointer;
  }
}

.smoke__box {
  display: flex;
  flex-direction: column;
  gap: 10px;

  > button {
    align-self: flex-start;
    padding: 4px 12px;
    cursor: pointer;
  }
}

.smoke__box--plain {
  align-items: stretch;
}

.smoke__hint {
  color: #666;
  font-size: 12px;
  margin: 0;
}

.smoke__fs-inner {
  padding: 40px;
  text-align: center;
  background: #f5f7fa;
  border: 1px dashed #dcdfe6;
}

:deep(.smoke__fs) {
  padding: 40px !important;
  color: #fff;
}

.smoke__page {
  position: relative;
  width: 100%;
  height: 420px;
  border: 1px solid #ddd;
  background: #fafafa;
}
</style>
