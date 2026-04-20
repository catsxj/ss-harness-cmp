<template>
  <div>
    <el-dialog title="挂载CD-ROM" append-to-body :visible.sync="addData.isodialog" width="40%">
      <basic-form :model="addData.data" ref="data">
        <basic-form-item label="映像：" prop="id" validate="required">
          <el-select v-model="addData.data.id" clearable>
            <el-option v-for="(item, index) in imageData" :key="index" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </basic-form-item>
        <basic-form-item label="启用：">
          <el-switch v-model="addData.data.disabled" active-color="#13ce66" inactive-color="#ff4949" :active-value="false" :inactive-value="true"> </el-switch>
        </basic-form-item>
      </basic-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.isodialog = false">取 消</el-button>
        <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getImage, patchDisk } from 'services/platform/index'
export default {
  props: {
    addData: {
      type: Object
    }
  },
  data() {
    return {
      loading: false,
      imageData: []
    }
  },
  created() {
    this.getImageData()
  },
  methods: {
    getImageData() {
      getImage({
        simple: true,
        params: this.$tools.handleSearchParam({
          vendorId: this.addData.vendorId,
          applyList: true,
          catalog: 'ISO'
        })
      }).then(data => {
        if (data.success) {
          this.imageData = data.data.rows
        }
      })
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          const { type, id, disabled } = this.addData.data
          const obj = {
            action: 'create',
            serverId: this.addData.serverId,
            addDataDisks: [
              {
                type: type,
                id: id,
                disabled: disabled
              }
            ]
          }
          this.loading = true
          patchDisk(obj)
            .then(data => {
              if (data.success) {
                this.$message.success(data.message)
                this.addData.isodialog = false
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
