<template>
  <div class="inline">
    <div class="inline" @click="handleDelay()" v-if="data.expiredTime && data.expiredTime.indexOf('2099') === -1">
      <slot>
        <el-button type="text" class="w-full" :disabled="disabled || data.status == 'BUILDING'"> 延期 </el-button>
      </slot>
    </div>
    <el-dialog title="延期" :close-on-click-modal="false" :visible.sync="dialogDelayVisible" v-if="dialogDelayVisible" width="600px" append-to-body>
      <DelayService :item-data="this.addData" ref="delayRef"></DelayService>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="dialogDelayVisible = false">取消</el-button>
        <el-button type="primary" @click.native="delaySubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { delayServiceEFC } from 'services/services/product'
import DelayService from '@/views/personal/apply/components/DelayService.vue'

export default {
  components: { DelayService },
  props: {
    data: {
      type: Object
    },
    disabled: {
      type: Boolean
    }
  },
  data() {
    return {
      dialogDelayVisible: false,
      addData: {
        extension: 1,
        instance: ''
      }
    }
  },
  methods: {
    handleDelay() {
      this.dialogDelayVisible = true
      this.addData = {
        extension: 1,
        instance: this.data.uuid,
        instanceName: this.data.name,
        workOrderTypeCode: 'CloudServerExtension'
      }
    },
    delaySubmit() {
      const params = this.$refs.delayRef.getApplyData()
      delayServiceEFC(params).then(data => {
        if (data.success) {
          this.$message.success(data.message)
          this.$emit('getList')
          this.dialogDelayVisible = false
          // if (data.data) this.$router.push({ path: `/order/${data.data}` })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.inline {
  display: inline-block;
  // width: 100%;
}
</style>
