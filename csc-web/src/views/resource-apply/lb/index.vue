/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <div>
    <ali :type="type" v-if="type == 'ALIYUN'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></ali>
    <aws :type="type" v-else-if="type == 'AWS'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></aws>
  </div>
</template>

<script>
import ali from './ali.vue'
import aws from './aws.vue'
export default {
  props: {
    itemData: {
      type: [Object, Boolean]
    },
    disabled: {
      type: Boolean
    }
  },
  components: { ali, aws },
  data() {
    return {
      type: ''
    }
  },
  created() {
    if (!this.itemData) {
      this.type = this.$route.params.type
    } else {
      this.type = this.itemData.location.vendorType
    }
  },
  methods: {
    setType(data) {
      this.type = data
    },
    getApplyData() {
      return this.$refs.node.getPostData()
    }
  }
}
</script>

<style scoped lang="scss"></style>
