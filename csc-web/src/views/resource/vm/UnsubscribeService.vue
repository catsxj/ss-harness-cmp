<template>
  <span>
    <el-button type="text" v-if="data.spec || url === 'vms'" :disabled="data.status == 'BUILDING'" @click="handleUnsubscribe()">
      <i class="el-icon-shifang"></i>
      移入回收站
    </el-button>
    <!-- <MobileCheck :add-data="addObj" v-if="addObj.dialog" @back="ok"></MobileCheck> -->
  </span>
</template>
<script>
import { patchVmId } from 'services/platform/index'
import { patchToRecycle, checkUnderway } from 'services/system/recycle'
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
    url: {
      type: String
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
      const { uuid, name, id } = this.data
      this.$confirm('', '提示', {
        confirmButtonClass: 'el-button--danger',
        dangerouslyUseHTMLString: !!this.message,
        message: this.message || `您确定要将【${name}】移入回收站吗？`,
        type: 'warning'
      }).then(async () => {
        const { success } = await checkUnderway({ sn: uuid })
        if (success) {
          if (this.url == 'vms') {
            patchVmId('recycle', { id: this.data.id }).then(data => {
              if (data.success) {
                this.$message.success({
                  message: data.message,
                  type: 'success'
                })
                this.$emit('getList')
              }
            })
          } else {
            patchToRecycle({ url: this.url, id: this.data.id }).then(data => {
              if (data.success) {
                this.$message.success({
                  message: data.message,
                  type: 'success'
                })
                this.$emit('getList')
              }
            })
          }
        }
      })
    }
  }
}
</script>
