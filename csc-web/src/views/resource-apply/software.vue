/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <software-install ref="softRef" :service="service" :version-key="versionMap[service]" :configs="configs" :item-data="itemData" v-bind="$attrs"></software-install>
</template>

<script>
import { computed, ref } from '@vue/composition-api'
import SoftwareInstall from './components/SoftwareInstall.vue'
import { versionMap, configsMap } from './data/software'

export default {
  components: { SoftwareInstall },
  props: {
    itemData: {
      type: Object
    }
  },
  setup(props, context) {
    const service = computed(() => {
      if (props.itemData) return props.itemData.service
      return context.root.$route.params.code
    })
    const softRef = ref()
    function getApplyData() {
      return softRef.value.getPostData()
    }
    return {
      service,
      versionMap,
      configs: {
        software_config: configsMap[service.value]
      },
      softRef,
      getApplyData
    }
  }
}
</script>
