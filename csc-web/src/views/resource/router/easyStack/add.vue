<template>
  <div>
    <el-dialog title="新增路由" :visible.sync="addData.dialog" width="40%">
      <basic-form label-width="100px" :model="addData.data" ref="data">
        <vendor :add-data="addData.data" vendorType="EASYSTACK" @vendorId="getNetwork"></vendor>
        <basic-form-item label="名称：" prop="name" validate="required,hicNoChinese" required-message="请输入名称">
          <el-input v-model="addData.data.name"></el-input>
        </basic-form-item>
        <basic-form-item label="管理状态：" prop="adminStateup" required>
          <el-select v-model="addData.data.adminStateup">
            <el-option label="开启" :value="true"></el-option>
            <el-option label="关闭" :value="false"></el-option>
          </el-select>
        </basic-form-item>
        <el-form-item label="外部网络：" prop="networkId">
          <el-select v-model="addData.data.networkId">
            <el-option v-for="item in networkList" :label="item.name" :value="item.id" :key="item.id"></el-option>
          </el-select>
        </el-form-item>
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
import vendor from '@/components/privatePool/index.vue'

import { createRouter, conditionNetwork } from 'services/platform/index'
export default {
  components: {
    vendor
  },
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
  watch: {},
  data() {
    return {
      vendorList: [],
      networkList: []
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          createRouter(this.addData.data).then(data => {
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
    },
    getNetwork() {
      conditionNetwork({
        condition: 'externals',
        vendorId: this.addData.data.vendorId
      }).then(data => {
        if (data.success) {
          this.networkList = data.data
        }
      })
    }
  },
  created() {}
}
</script>

<style></style>
