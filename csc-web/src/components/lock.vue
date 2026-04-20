<template>
  <div>
    <div v-if="data.locked">
      <el-button type="text" @click="modify(1)"> 解锁 </el-button>
    </div>
    <div v-else>
      <el-button type="text" @click="modify(2)" :disabled="data.status == 'BUILDING' || data.leaseState == 'BUILDING'"> 锁定 </el-button>
      <slot></slot>
    </div>
  </div>
</template>
<script>
import { lock, release } from 'services/platform/azure'
export default {
  props: {
    data: {
      type: Object
    },
    type: {
      type: String
    },
    // 自定义提醒
    message: {
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
    modify(index) {
      const { id, name } = this.data
      this.$confirm('', '提示', {
        confirmButtonClass: 'el-button--danger',
        dangerouslyUseHTMLString: !!this.message,
        message: this.message || `您确定要${index == 1 ? '解锁' : '锁定'}【${name}】吗？`,
        type: 'warning'
      }).then(() => {
        const http = index == 1 ? release : lock
        http({ id: id, type: this.type }).then(data => {
          if (data.success) {
            this.$message.success({
              message: data.message,
              type: 'success'
            })
            this.$emit('back')
          }
        })
      })
    }
  }
}
</script>
