<template>
  <div>
    <el-dialog title="挂载虚拟卷" append-to-body :visible.sync="addData.diskdialog" width="40%">
      <basic-form :model="addData.data" ref="data">
        <basic-form-item label="虚拟卷：" prop="id" validate="required">
          <el-select v-model="addData.data.id" clearable>
            <el-option v-for="(item, index) in volumeData" :key="index" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </basic-form-item>
      </basic-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.diskdialog = false">取 消</el-button>
        <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getVolume, patchDisk } from 'services/platform/index'
export default {
  props: {
    addData: {
      type: Object
    }
  },
  data() {
    return {
      loading: false,
      volumeData: []
    }
  },
  created() {
    this.getVolumeData()
  },
  methods: {
    getVolumeData() {
      getVolume({
        simple: true,
        params: this.$tools.handleSearchParam({
          vendorId: this.addData.vendorId
        })
      }).then(data => {
        if (data.success) {
          this.volumeData = data.data.rows.filter(item => item.multiattach || (!item.multiattach && item.status === 'AVAILABLE'))
          if (this.volumeData.length) {
            this.addData.data.id = this.volumeData[0].id
          }
        }
      })
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          const { type, id } = this.addData.data
          const obj = {
            action: 'create',
            serverId: this.addData.serverId,
            addDataDisks: [
              {
                type: type,
                id: id,
                bus: 'VIRTIO'
              }
            ]
          }
          this.loading = true
          patchDisk(obj)
            .then(data => {
              if (data.success) {
                this.$message.success(data.message)
                this.addData.diskdialog = false
                this.$emit('back')
              }
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.w {
  width: 100px !important;
}
.add-border {
  padding: 2px;
  cursor: pointer;
  border: 1px dashed black;
  text-align: center;
}
</style>
