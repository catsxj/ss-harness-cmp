<template>
  <span>
    <div class="action-divider" v-if="data.spec && timeComparison && showDivider"></div>
    <el-button type="text" :disabled="disabled || data.status == 'BUILDING'" @click="handleUnsubscribe()" v-if="(data.expiredTime || '').indexOf('2099') > -1 || timeComparison"> 退订 </el-button>
    <!-- <MobileCheck :add-data="addObj" v-if="addObj.dialog" @back="ok"></MobileCheck> -->
  </span>
</template>
<script>
import { unsubscribeService } from 'services/services/product'
// import MobileCheck from './MobileCheck'
export default {
  // components: { MobileCheck },
  props: {
    data: {
      type: Object
    },
    disabled: {
      type: Boolean
    },
    // 自定义提醒
    message: {
      type: String
    },
    type: {
      type: String
    },
    showDivider: {
      type: Boolean,
      default() {
        return true
      }
    }
  },
  data() {
    return {
      addObj: {
        dialog: false,
        data: {}
      }
    }
  },
  computed: {
    timeComparison() {
      const a = new Date().getTime()
      const b = new Date(this.data.expiredTime).getTime()
      return a > b
    }
  },
  methods: {
    handleUnsubscribe() {
      const { uuid, name, floatingIpAddress, publicIp, vendorType } = this.data
      this.$confirm('', '提示', {
        confirmButtonClass: 'el-button--danger',
        dangerouslyUseHTMLString: !!this.message,
        message: this.message || `您确定要退订【${name || floatingIpAddress || publicIp}】吗？`,
        type: 'warning'
      }).then(() => {
        let preview = []
        switch (this.type) {
          case 'disk':
            preview = [
              { label: '名称', value: name },
              { label: '大小', value: `${this.data.size}GB` }
            ]
            break
          case 'vpc':
            switch (vendorType) {
              case 'AWS':
                preview = [
                  { label: '名称', value: name },
                  { label: 'CIDR', value: this.data.cidr ? JSON.parse(this.data.cidr).join(',') : '' }
                ]
                break
              default:
                preview = [
                  { label: '名称', value: name },
                  { label: 'CIDR', value: this.data.cidr }
                ]
            }
            break
          case 'fip':
            switch (vendorType) {
              case 'ALIYUN':
                preview = [{ label: 'IP', value: this.data.publicIp }]
                break
              default:
                preview = [{ label: 'IP', value: this.data.floatingIpAddress }]
            }
            break
        }
        unsubscribeService({ instance: uuid, instanceName: name || floatingIpAddress, preview: preview }).then(data => {
          if (data.success) {
            this.$message.success({
              message: data.message,
              type: 'success'
            })
            this.$emit('getList')
          }
        })
      })
    }
  }
}
</script>
