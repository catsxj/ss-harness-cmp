<template>
  <span>
    <el-button type="text" :disabled="disabled" @click="handleUnsubscribe()"> 退订</el-button>
    <phone :add-data="addObj" v-if="addObj.dialog" @back="ok"></phone>
  </span>
</template>
<script>
import { unsubscribeService } from 'services/services/index'
import phone from './phone'
export default {
  components: { phone },
  props: {
    data: {
      type: Object
    },
    resourceCategory: {
      type: String
    },
    disabled: {
      type: Boolean
    },
    step: {
      type: [Boolean, String]
    },
    msg: {
      type: String
    },
    type: {
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
  methods: {
    ok() {
      const obj = { id: this.data.id, sn: this.data.uuid, resourceCategory: this.resourceCategory, messageCode: this.addObj.data.messageCode, bootVolumeUuid: this.addObj.data.bootVolumeUuid }
      if (this.type) obj.type = this.type
      unsubscribeService(obj).then(data => {
        if (data.success) {
          this.$message.success(data.message)
          this.addObj.dialog = false
          this.$emit('getData')
        }
      })
    },
    handleUnsubscribe() {
      if (this.resourceCategory === 'ResourceComputerApply') {
        this.$http({
          url: '/vm/check/security/reference',
          method: 'GET',
          data: {
            id: this.data.id
          }
        }).then(data => {
          if (data.success) {
            this.addObj = {
              dialog: true,
              data: {
                id: this.data.id,
                sn: this.data.uuid,
                resourceCategory: this.resourceCategory,
                bootVolumeUuid: this.data.bootVolumeUuid
              }
            }
          } else {
            this.$alert(data.message, '提示', {
              confirmButtonText: '确定',
              dangerouslyUseHTMLString: true
            })
          }
        })
      } else if (this.resourceCategory === 'WebAppProtectionApply') {
        this.$confirm('当您成功退订选择的Web应用防护时，请删除被防护应用中配置并重启该应用，否则影响系统正常运行?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.addObj = {
            dialog: true,
            data: {
              id: this.data.id,
              sn: this.data.uuid,
              resourceCategory: this.resourceCategory,
              bootVolumeUuid: this.data.bootVolumeUuid
            }
          }
        })
      } else if (this.resourceCategory === 'ObjectStorageApply') {
        this.$confirm('您好，当前您订购的对象存储中可能存在您上传的资源，请确认是否继续退订操作?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.addObj = {
            dialog: true,
            data: {
              id: this.data.id,
              sn: this.data.uuid,
              resourceCategory: this.resourceCategory,
              bootVolumeUuid: this.data.bootVolumeUuid
            }
          }
        })
      } else {
        if (this.step) {
          this.$alert(this.msg, '提示', {
            confirmButtonText: '确定',
            dangerouslyUseHTMLString: true
          })
        } else {
          this.addObj = {
            dialog: true,
            data: {
              id: this.data.id,
              sn: this.data.uuid,
              resourceCategory: this.resourceCategory,
              bootVolumeUuid: this.data.bootVolumeUuid
            }
          }
        }
      }
    }
  }
}
</script>
