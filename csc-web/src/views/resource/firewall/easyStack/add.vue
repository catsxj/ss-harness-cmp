<template>
  <div>
    <el-dialog title="新增安全组" :visible.sync="addData.dialog" width="40%">
      <basic-form label-width="120px" :model="addData.data" ref="data">
        <vendor :add-data="addData.data" vendorType="EASYSTACK" @vendorId="getList"></vendor>
        <basic-form-item label="名称" prop="name" validate="required">
          <el-input v-model="addData.data.name"></el-input>
        </basic-form-item>
        <basic-form-item label="策略" prop="policyId" validate="required">
          <el-select v-model="addData.data.policyId">
            <el-option v-for="(item, index) in policyData" :key="index" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </basic-form-item>
        <el-form-item label="路由" prop="routerIds">
          <el-select v-model="addData.data.routerIds" multiple placeholder="请选择">
            <el-option v-for="(item, index) in routeData" :key="index" :label="item.name" :value="item.id"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="remark">
          <el-input v-model="addData.data.remark"></el-input>
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
import { getFirewallRouter, createFirewall, getFirewallPolicy } from 'services/platform/index'
import vendor from '@/components/privatePool/index.vue'
export default {
  components: { vendor },
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
      routeData: [],
      policyData: []
    }
  },
  methods: {
    getList() {
      getFirewallRouter({
        id: 0,
        vendorId: this.addData.data.vendorId
      }).then(data => {
        this.routeData = data.data.routers
      })
      const params = {
          simple: true
        },
        searchParam = [{ param: { vendorId: this.addData.data.vendorId }, sign: 'EQ' }]
      params.params = JSON.stringify(searchParam)
      getFirewallPolicy(params).then(data => {
        this.policyData = data.data.rows
      })
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          createFirewall(this.addData.data).then(data => {
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
