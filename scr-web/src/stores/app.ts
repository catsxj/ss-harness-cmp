import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getSystemConfigs, getDictChildren } from 'services/system'

export const useAppStore = defineStore('app', () => {
  const cmcUrl = ref<string | null>(null)
  const screenConfigs = ref<Record<string, string>>({})

  const desktopUrl = computed(() => cmcUrl.value)

  async function getCmcUrl() {
    const data = await getSystemConfigs({ codes: 'CmcAddress' })
    if (data.success) {
      cmcUrl.value = data.data.CmcAddress
    }
  }

  async function getScreenConfigs() {
    const data = await getDictChildren({ value: 'SYSTEM_SCREEN' })
    if (data.success) {
      const obj: Record<string, string> = {}
      data.data.forEach((item: { name: string; value: string }) => {
        obj[item.value] = item.name
      })
      screenConfigs.value = obj
    }
  }

  return {
    cmcUrl,
    screenConfigs,
    desktopUrl,
    getCmcUrl,
    getScreenConfigs
  }
})
