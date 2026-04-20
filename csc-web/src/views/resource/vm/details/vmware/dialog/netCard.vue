<template>
  <div>
    <el-dialog append-to-body :title="addData.title" :visible.sync="addData.dialog" width="60%" v-if="addData.dialog">
      <div>
        <el-form ref="data" :model="addData.data" :status-icon="true" label-width="120px">
          <el-row>
            <el-col :span="24" v-if="addData.title == '新增'">
              <el-form-item label="网络类型：" prop="type">
                <el-select v-model="addData.data.type">
                  <el-option v-for="(item, index) in typeData" :label="item" :value="item" :key="index"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <basic-form-item label="网络标签：" prop="name" validate="required">
                <el-select v-model="addData.data.name">
                  <el-option v-for="(item, index) in networkListData" :label="item.portGroupName" :value="item.portGroupName" :key="index"></el-option>
                </el-select>
              </basic-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { getVmNetowrk, conditionNetwork, modifyVm } from 'services/platform/index'
import { getPoolDetail } from 'services/platform/pool'

export default {
  props: {
    addData: {
      type: Object
    },
    parentData: {
      type: Object
    }
  },
  data() {
    return {
      typeData: ['E1000', 'E1000E', 'VMXNET2', 'VMXNET3'],
      networkListData: []
    }
  },
  methods: {
    getVmNetowrk() {
      if (!this.addData.poolGroupId) {
        this.networkListData = []
        return
      }
      getPoolDetail(this.addData.poolGroupId).then(data => {
        if (data.success) {
          this.networkListData = []
          data.data.networkRelations.forEach(item => {
            if (!this.networkListData.find(item1 => item1.portGroupName == item.portGroupName)) {
              this.networkListData.push(item)
            }
          })
        }
      })
    },
    formatNetworks() {
      const toObjFormat = function (obj) {
        for (const a in obj) {
          if (obj[a] === '') delete obj[a]
        }
        return obj
      }
      const arr = []
      const obj = toObjFormat({
        name: this.addData.data.name,
        type: this.addData.data.type,
        portType: this.addData.data.portType,
        mac: this.addData.data.mac,
        label: this.addData.data.label,
        operation: this.addData.data.operation,
        ipId: this.addData.data.ipId,
        address: this.addData.data.address,
        ciscoSubnetId: this.addData.data.ciscoSubnetId,
        disLabel: this.addData.data.disLabel
      })
      if (this.addData.data.type == undefined) {
        delete this.addData.data.type
      }
      arr.push(obj)
      return arr
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          // this.$emit('back', this.addData.data)
          const data = {
            id: this.addData.id,
            operations: this.formatNetworks()
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
    this.getVmNetowrk()
  }
}
</script>

<style></style>
