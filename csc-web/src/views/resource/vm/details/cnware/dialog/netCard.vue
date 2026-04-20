<template>
  <el-dialog append-to-body :title="addData.title" :visible.sync="addData.dialog" width="60%" v-if="addData.dialog">
    <el-form ref="data" :model="addData.data" :status-icon="true" label-width="120px">
      <el-row>
        <el-col :span="24" v-if="addData.title == '新增网络适配器'">
          <el-form-item label="网卡类型：" prop="netCardType">
            <el-select v-model="addData.data.netCardType" filterable>
              <el-option v-for="(item, index) in typeData" :label="item" :value="index + 1" :key="index"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <basic-form-item label="网络标签：" prop="id" validate="required">
            <el-select v-model="addData.data.id" filterable>
              <el-option v-for="(item, index) in networkListData" :label="item.name" :value="item.id" :key="index"></el-option>
            </el-select>
          </basic-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
      <el-button type="primary" @click="ok">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getVmNetowrk, modifyVm } from 'services/platform/index'

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
      typeData: ['高速网卡', '普通网卡', 'Intel e1000网卡 (arm 和mips 只有高速网卡)'],
      networkListData: []
    }
  },
  methods: {
    getVmNetowrk() {
      getVmNetowrk({ id: this.addData.hostId }).then(data => {
        if (data.success) {
          this.networkListData = data.data
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
        netCardType: this.addData.data.netCardType,
        portGroupId: this.addData.data.id,
        operation: 'ADD'
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
