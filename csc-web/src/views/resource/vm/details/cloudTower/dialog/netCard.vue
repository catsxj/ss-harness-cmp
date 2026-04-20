<template>
  <el-dialog append-to-body :title="addData.title" :visible.sync="addData.dialog" v-if="addData.dialog" width="40%">
    <basic-form ref="data" :model="addData.data" :status-icon="true" label-width="120px">
      <el-row>
        <el-col :span="24">
          <basic-form-item label="网络：" prop="networkId" validate="required">
            <el-select filterable v-model="addData.data.networkId" clearable>
              <el-option v-for="(item, index) in networkData" :key="index" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col :span="24">
          <basic-form-item label="MAC地址：" prop="mac" validate="mac">
            <el-input v-model="addData.data.mac" placeholder="留空则自动分配"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="24">
          <basic-form-item label="模式：" prop="model" validate="required">
            <el-select filterable v-model="addData.data.model" clearable>
              <el-option label="VIRTIO" value="VIRTIO"></el-option>
              <el-option label="E1000" value="E1000"></el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col :span="24">
          <basic-form-item label="启用：" prop="link" validate="required">
            <el-switch v-model="addData.data.link" active-color="#13ce66" inactive-color="#ff4949" active-value="up" inactive-value="down"> </el-switch>
          </basic-form-item>
        </el-col>
      </el-row>
    </basic-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
      <el-button type="primary" @click="ok">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getAllNetworkForTower, modifyVm } from 'services/platform/index'

export default {
  props: {
    addData: {
      type: Object
    }
  },
  data() {
    return {
      networkData: []
    }
  },
  methods: {
    getNetworkData() {
      getAllNetworkForTower({
        vendorId: this.addData.vendorId,
        type: 'VM',
        vmId: this.addData.id
      }).then(data => {
        if (data.success) {
          this.networkData = data.data
        }
      })
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          const data = {
            id: this.addData.id,
            operations: [this.addData.data]
          }
          modifyVm(data).then(data => {
            if (data.success) {
              this.$message.success(data.message)
              this.addData.dialog = false
            }
          })
        }
      })
    }
  },
  created() {
    this.getNetworkData()
  }
}
</script>

<style></style>
