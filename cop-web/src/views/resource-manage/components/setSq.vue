<!-- 配置网段 -->
<template>
  <el-dialog title="网段配置" :visible.sync="setData.dialog">
    <basic-form :model="setData.data" ref="data" :visible.sync="setData.dialog">
      <basic-form-item label="IP: " prop="ips">
        <el-input v-model="setData.data.ips" disabled></el-input>
      </basic-form-item>
      <basic-form-item label="网段: " prop="segmentId" validate="required" filterable>
        <el-select v-model="setData.data.segmentId">
          <el-option v-for="(item, index) in list" :key="'segment-' + index" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </basic-form-item>
    </basic-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click.native="setData.dialog = false">取消</el-button>
      <el-button type="primary" @click.native="ok">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getBsmHostNetwork, setBsmHostSegment } from '@/services/task/resource'
export default {
  props: {
    setData: Object
  },
  data() {
    return {
      list: []
    }
  },
  created() {
    this.getSegments()
  },
  methods: {
    getSegments() {
      getBsmHostNetwork({ page: 1, rows: 999999, params: '[]' }).then((res) => {
        if (res.success) {
          this.list = res.data.rows
        }
      })
    },
    ok() {
      this.$refs.data.validate((valid) => {
        if (valid) {
          const { id: hostId, segmentId } = this.setData.data
          setBsmHostSegment({ hostId, segmentId }).then((res) => {
            const type = res.success ? 'success' : 'error'
            this.$message[type](res.message)
            if (res.success) {
              this.$emit('setOk')
              this.setData.dialog = false
            }
          })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped></style>
