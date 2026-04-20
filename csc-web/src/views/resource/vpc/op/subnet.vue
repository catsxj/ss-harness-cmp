<template>
  <div>
    <el-button type="primary" @click="handleCreate()" class="m-b"> 新增 </el-button>
    <basic-table :data="subnetList">
      <el-table-column prop="name" label="名称" show-overflow-tooltip> </el-table-column>
      <el-table-column prop="gateway" label="网关" show-overflow-tooltip></el-table-column>
      <el-table-column prop="cidr" label="网络地址" show-overflow-tooltip></el-table-column>
      <el-table-column prop="ipVersion" label="IP版本" show-overflow-tooltip></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="text" :disabled="detailData.isRouterExternal" @click="removeSubnet(scope.row)"><i class="el-icon-delete"></i> 删除 </el-button>
        </template>
      </el-table-column>
      <div slot="pagination"></div>
    </basic-table>
    <el-dialog title="添加子网" :close-on-click-modal="false" v-if="dialogVisible" :visible.sync="dialogVisible" width="600px" append-to-body="">
      <basic-form :model="addData" ref="addForm">
        <el-row :gutter="20">
          <el-col :span="24">
            <basic-form-item label="子网名称：" prop="subnetName" validate="required">
              <el-input v-model="addData.subnetName" auto-complete="off"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="子网地址：">
              <el-radio-group v-model="addData.subRadio">
                <el-radio :label="0">
                  <el-input-number v-model="addData.subNetwork[0][0]" class="w-xxs" disabled :controls="false"></el-input-number>. <el-input-number v-model="addData.subNetwork[0][1]" class="w-xxs" disabled :controls="false"></el-input-number>.
                  <el-input-number v-model="addData.subNetwork[0][2]" :min="0" :max="255" class="w-xxs" :controls="false"></el-input-number>. <el-input-number v-model="addData.subNetwork[0][3]" :min="1" :max="255" class="w-xxs" :controls="false"></el-input-number>/
                  <el-input-number v-model="addData.subNetwork[0][4]" :min="0" :max="32" class="w-xxs" :controls="false"></el-input-number>
                </el-radio>
                <br />
                <el-radio :label="1" class="m-t">
                  <el-input-number v-model="addData.subNetwork[1][0]" class="w-xxs" disabled :controls="false"></el-input-number>. <el-input-number v-model="addData.subNetwork[1][1]" class="w-xxs" :min="16" :max="255" :controls="false"></el-input-number>.
                  <el-input-number v-model="addData.subNetwork[1][2]" class="w-xxs" :min="0" :max="255" :controls="false"></el-input-number>. <el-input-number v-model="addData.subNetwork[1][3]" :min="1" :max="255" class="w-xxs" :controls="false"></el-input-number>/
                  <el-input-number v-model="addData.subNetwork[1][4]" class="w-xxs" :min="12" :max="32" :controls="false"></el-input-number>
                </el-radio>
              </el-radio-group>
            </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit" :loading="loading">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getLogicalSwitch, removeLogicalSwitch, createSwitchSubnet } from 'services/platform/nsx'

export default {
  props: {
    detailData: {
      type: Object
    }
  },
  data() {
    return {
      subnetList: [],
      dialogVisible: false,
      addData: {},
      loading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 获取子网列表
    getList(page) {
      getLogicalSwitch({ condition: JSON.stringify({ condition: 'listByVpcId', vpcId: this.detailData.id }) }).then(data => {
        if (data.success) {
          this.subnetList = data.data
        }
      })
    },
    handleCreate(data) {
      this.addData = {
        vpcId: this.detailData.id,
        subNetwork: [
          [192, 168, 0, 0, 24],
          [172, 16, 1, 1, 16]
        ],
        subRadio: 0
      }
      this.dialogVisible = true
    },
    // 删除子网
    removeSubnet(data) {
      this.$confirm(`您确定要删除子网【${data.name}】吗？`, '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        removeLogicalSwitch(data.id).then(data => {
          if (data.success) {
            this.$message.success({
              message: data.message,
              type: 'success'
            })
            this.getList()
          }
        })
      })
    },
    addSubmit() {
      this.$refs.addForm.validate(valid => {
        if (valid) {
          const { subRadio, subNetwork, vpcId, subnetName } = this.addData
          const cidrArr = [...subNetwork[subRadio]]
          this.loading = true
          createSwitchSubnet({
            vpcId,
            prefixLength: cidrArr.pop(),
            ipAddress: cidrArr.join('.'),
            subnetName
          })
            .then(data => {
              if (data.success) {
                this.$message.success(data.message)
                this.dialogVisible = false
                this.getList()
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

<style></style>
