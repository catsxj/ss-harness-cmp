<template>
  <div>
    <el-dialog title="磁盘扩容" append-to-body :visible.sync="config.visible" width="50%">
      <disk ref="disk" :item-data="itemData" :config="config"></disk>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="config.visible = false">取 消</el-button>
        <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { modifyResourceEFC } from 'services/services/product'
import disk from './diskUpdate.vue'

export default {
  components: { disk },
  props: {
    config: {
      type: Object
    }
  },
  filters: {},
  data() {
    return {
      loading: false,
      diskList: [],
      skuId: ''
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
      modifyResourceEFC(obj).then(data => {
        if (data.success) {
          this.$message.success(data.message)
          this.config.visible = false
          // if (data.data) this.$router.push({ path: `/order/${data.data}` })
        }
      })
    }
  }
}
</script>

<style></style>
