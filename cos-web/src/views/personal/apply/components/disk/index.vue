<template>
  <div>
    <!-- 公有云以阿里云为模板开始做的,后续请参考阿里云 -->
    <public-disk v-bind="$attrs" :item-data="itemData" v-if="isPublic" ref="disk"></public-disk>
    <!-- 私有云以 VC 为模板开始做的,后续请参考 VC -->
    <common v-bind="$attrs" :item-data="itemData" v-else ref="disk"></common>
  </div>
</template>

<script>
import common from './common.vue'
import publicDisk from './public.vue'
export default {
  components: { common, publicDisk },
  props: {
    itemData: {
      type: Object
    }
  },
  data() {
    return {}
  },
  computed: {
    isPublic() {
      return ['JDCLOUD', 'ALIYUN', 'TENCENT', 'KINGCLOUD', 'HUAWEI', 'AZURE', 'AWS', 'TIANYI', 'QCLOUD', 'VOLCENGINE', 'MANAGEONE'].includes(this.itemData.params.type)
    }
  },
  methods: {
    ok() {
      const data = this.$refs.disk.ok()
      return data
    },
    getApplyData() {
      return this.$refs.disk.getApplyData()
    }
  }
}
</script>
