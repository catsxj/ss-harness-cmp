<template>
  <el-dialog title="新增磁盘" append-to-body :visible.sync="config.visible" width="750px">
    <AddDisk ref="disk" :item-data="itemData"> </AddDisk>
    <span slot="footer" class="dialog-footer">
      <el-button type="ghost" @click="config.visible = false">取 消</el-button>
      <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import AddDisk from '@/views/personal/apply/components/addDisk/index.vue'
import { modifyResourceEFC } from 'services/services/product'

export default {
  components: { AddDisk },
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
      const { service, uuid: instance, name: instanceName, preview, expiredTime, params = {} } = this.config.data
      return {
        preview,
        params,
        service,
        instance,
        instanceName,
        expiredTime
      }
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
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>
