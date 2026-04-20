<template>
  <div>
    <el-dialog title="升级配置" :visible.sync="addData.dialog" width="40%">
      <basic-form label-width="120px" :model="addData.data" ref="data">
        <el-row v-if="addData.vendorType == 'OPENSTACK' || addData.vendorType == 'EASYSTACK'">
          <el-alert title="OpenStack如果为通过卷方式创建则不能扩容磁盘" type="warning" :closable="false"> </el-alert>
          <basic-form-item label="CPU(C)：" prop="cpu" validate="required">
            <el-input-number v-model="addData.data.cpu" :min="addData.data.minCpu" style="width: 100%"></el-input-number>
          </basic-form-item>
          <basic-form-item label="内存(GB)：" prop="memory" validate="required">
            <el-input-number v-model="addData.data.memory" :min="addData.data.minMemory" style="width: 100%"></el-input-number>
          </basic-form-item>
          <basic-form-item label="磁盘(GB)：" prop="disk" validate="required">
            <el-input-number v-model="addData.data.disk" :min="addData.data.minDisk" style="width: 100%" :disabled="addData.data.bootFromVolume"></el-input-number>
          </basic-form-item>
        </el-row>
        <el-row v-else>
          <el-alert title="VCenter云主机热扩容cpu和内存需要开启热插拔，扩容磁盘将新增新的磁盘设备" type="warning" :closable="false"> </el-alert>
          <basic-form-item label="CPU(C)：" prop="cpu" validate="required">
            <el-input-number v-model="addData.data.cpu" :precision="0" style="width: 100%" :disabled="addData.data.status == 'RUNNING' && !addData.data.cpuHotEnable"></el-input-number>
          </basic-form-item>
          <basic-form-item label="内存(GB)：" prop="memory" validate="required">
            <el-input-number v-model="addData.data.memory" :precision="0" style="width: 100%" :disabled="addData.data.status == 'RUNNING' && !addData.data.memHotEnable"></el-input-number>
          </basic-form-item>
          <basic-form-item label="磁盘(GB)：" prop="disk" validate="required">
            <el-input-number v-model="addData.data.disk" :min="addData.data.minDisk" style="width: 100%"></el-input-number>
          </basic-form-item>
        </el-row>
      </basic-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { patchVmResize } from 'services/platform/index'

export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          data: {
            labelIds: []
          },
          dialog: false
        }
      }
    }
  },
  data() {
    return {
      regionList: []
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          patchVmResize('upgradeconfig', {
            id: this.addData.data.id,
            cpu: this.addData.data.cpu,
            disk: this.addData.data.disk,
            memory: this.addData.data.memory
          }).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$emit('back')
            }
          })
        }
      })
    }
  },
  created() {}
}
</script>

<style></style>
