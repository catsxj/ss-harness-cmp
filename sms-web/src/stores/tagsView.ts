import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface TagView {
  path: string
  name?: string
  title?: string
  meta: {
    noTag?: boolean
    title?: string
    fix?: boolean
    noCache?: boolean
    [key: string]: unknown
  }
  [key: string]: unknown
}

export const useTagsViewStore = defineStore('tagsView', () => {
  const visitedViews = ref<TagView[]>([])
  const cachedViews = ref<string[]>([])

  function addVisitedView(view: TagView) {
    const { noTag, title } = view.meta
    if (noTag || !title) return
    if (visitedViews.value.some((v) => v.path === view.path)) return
    visitedViews.value.push({ ...view, title })
  }

  function addCachedView(view: TagView) {
    if (!view.name || cachedViews.value.includes(view.name)) return
    if (!view.meta.noCache) cachedViews.value.push(view.name)
  }

  function delVisitedView(view: TagView) {
    const idx = visitedViews.value.findIndex((v) => v.path === view.path)
    if (idx > -1) visitedViews.value.splice(idx, 1)
  }

  function delCachedView(view: TagView) {
    if (!view.name) return
    const idx = cachedViews.value.indexOf(view.name)
    if (idx > -1) cachedViews.value.splice(idx, 1)
  }

  function delOthersVisitedViews(view: TagView) {
    visitedViews.value = visitedViews.value.filter((v) => v.meta.fix || v.path === view.path)
  }

  function delOthersCachedViews(view: TagView) {
    if (!view.name) {
      cachedViews.value = []
      return
    }
    cachedViews.value = cachedViews.value.includes(view.name) ? [view.name] : []
  }

  function delLeftVisitedViews(index: number) {
    const left = visitedViews.value.slice(0, index).filter((v) => v.meta.fix)
    const right = visitedViews.value.slice(index)
    visitedViews.value = [...left, ...right]
  }

  function delRightVisitedViews(index: number) {
    const left = visitedViews.value.slice(0, index + 1)
    const right = visitedViews.value.slice(index + 1).filter((v) => v.meta.fix)
    visitedViews.value = [...left, ...right]
  }

  function updateCacheViews() {
    cachedViews.value = visitedViews.value
      .filter((v) => !v.meta.noCache && v.name)
      .map((v) => v.name as string)
  }

  function delAllVisitedViews() {
    visitedViews.value = visitedViews.value.filter((v) => v.meta.fix)
  }

  function delAllCachedViews() {
    cachedViews.value = []
  }

  function addView(view: TagView) {
    addVisitedView(view)
    addCachedView(view)
  }

  async function delView(view: TagView) {
    delVisitedView(view)
    delCachedView(view)
    return { visitedViews: [...visitedViews.value], cachedViews: [...cachedViews.value] }
  }

  async function delOthersViews(view: TagView) {
    delOthersVisitedViews(view)
    delOthersCachedViews(view)
    return { visitedViews: [...visitedViews.value], cachedViews: [...cachedViews.value] }
  }

  async function delLeftViews(payload: { view: TagView; index: number }) {
    delLeftVisitedViews(payload.index)
    updateCacheViews()
    return { visitedViews: [...visitedViews.value], cachedViews: [...cachedViews.value] }
  }

  async function delRightViews(payload: { view: TagView; index: number }) {
    delRightVisitedViews(payload.index)
    updateCacheViews()
    return { visitedViews: [...visitedViews.value], cachedViews: [...cachedViews.value] }
  }

  async function delAllViews() {
    delAllVisitedViews()
    delAllCachedViews()
    return { visitedViews: [...visitedViews.value], cachedViews: [...cachedViews.value] }
  }

  return {
    visitedViews,
    cachedViews,
    addView,
    delView,
    delOthersViews,
    delLeftViews,
    delRightViews,
    delAllViews
  }
})
