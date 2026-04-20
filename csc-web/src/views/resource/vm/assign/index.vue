<template>
  <div style="display: inline-block">
    <el-button :type="buttonType" @click="assign" :disabled="disabled || detail.status == 'BUILDING'"> 分配 </el-button>
    <assign :add-data="assignData" v-if="assignData.dialog" @back="$emit('back')" :showType="type != 'Vpc' && type != 'SecurityGroup'"></assign>
  </div>
</template>

<script>
import { removeVmUsers } from 'services/platform/index'
import assign from './assign.vue'
export default {
  components: { assign },
  props: {
    detail: {
      type: Object
    },
    type: {
      type: String
    },
    disabled: {
      type: Boolean,
      default: false
    },
    buttonType: {
      type: String,
      default: 'text'
    }
  },
  data() {
    return {
      assignData: {
        dialog: false,
        data: {}
      }
    }
  },
  methods: {
    assign() {
      this.assignData = {
        dialog: true,
        data: {
          type: 'tenant',
          tenantId: this.$store.state.app.userData.tenantId || this.$store.state.app.userData.id,
          ids: [this.detail.id],
          resourceCategory: this.type,
          vendorType: this.detail.vendorType
        }
      }
    },
    recycle() {
      this.$confirm('确认回收该资源嘛？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeVmUsers({ ids: [this.detail.id], resourceCategory: this.type, vendorType: this.detail.vendorType }).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.$emit('back')
          }
        })
      })
    }
  }
}
</script>

<style></style>
