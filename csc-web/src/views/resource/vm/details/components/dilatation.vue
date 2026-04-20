<template>
  <el-dialog title="磁盘扩容" append-to-body :visible.sync="config.visible" width="50%">
    <disk ref="disk" :item-data="itemData" :config="config"></disk>
    <span slot="footer" class="dialog-footer">
      <el-button type="ghost" @click="config.visible = false">取 消</el-button>
      <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { modifyResourceEFC } from 'services/services/product'
import disk from '@/views/personal/apply/components/disk/index.vue'

export default {
  components: { disk },
  props: {
    config: {
      type: Object
    }
  },
  data() {
    return {
      loading: false
    }
  },
  computed: {
    itemData() {
      return this.config.data
    }
  },
  methods: {
    ok() {
      const obj = this.$refs.disk.ok()
      if (!obj) return this.$message.error('磁盘信息填写不完整')
      this.loading = true
      modifyResourceEFC(obj)
        .then(data => {
          if (data.success) {
            this.$message.success(data.message)
            this.config.visible = false
          }
        })
        .finally(() => (this.loading = false))
    }
  }
}
</script>
