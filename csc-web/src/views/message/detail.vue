<template>
  <common-detail-right v-if="dialog.visible" :title="detailData.name" @goBack="goBack">
    <div slot="custom_content">
      <div class="message-card">
        <pre class="site-message-detail">{{ detailData.content }}</pre>
        <el-divider></el-divider>
        <div class="text-right m-b-sm">发送人：{{ detailData.senderName }}</div>
        <div class="text-right">创建时间：{{ detailData.gmtCreate }}</div>
      </div>
    </div>
  </common-detail-right>
</template>
<script>
import { getMessageDetail } from 'services/system/message'

export default {
  props: {
    dialog: {
      type: Object
    }
  },
  data() {
    return {
      detailData: {} // 详情数据
    }
  },
  created() {
    this.getDetail()
  },
  methods: {
    goBack() {
      this.dialog.visible = false
    },
    // 获取详情
    async getDetail() {
      const data = await getMessageDetail(this.dialog.id)
      if (data.success) {
        this.detailData = data.data
      }
    }
  }
}
</script>
<style scoped lang="scss">
.message-card {
  padding: 20px;
  font-size: 14px;
  line-height: 20px;
}

.site-message-detail {
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
