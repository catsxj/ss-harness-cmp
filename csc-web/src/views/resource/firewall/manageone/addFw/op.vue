<template>
  <div>
    <basic-form-item label="名称" prop="name" validate="required">
      <el-input v-model="addData.name"></el-input>
    </basic-form-item>
    <basic-form-item label="策略" prop="policyId" validate="required">
      <el-select v-model="addData.policyId">
        <el-option v-for="(item, index) in policyData" :key="index" :label="item.name" :value="item.id"></el-option>
      </el-select>
    </basic-form-item>
    <el-form-item label="路由" prop="routerIds">
      <el-select v-model="addData.routerIds" multiple placeholder="请选择">
        <el-option v-for="(item, index) in routeData" :key="index" :label="item.name" :value="item.id"> </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="描述" prop="remark">
      <el-input v-model="addData.remark"></el-input>
    </el-form-item>
  </div>
</template>

<script>
import { getFirewallRouter, getFirewallPolicy } from 'services/platform/index'

export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          name: ''
        }
      }
    },
    vendorId: {
      type: [String, Number]
    }
  },
  data() {
    return {
      policyData: [],
      routeData: []
    }
  },
  methods: {
    getList() {
      getFirewallRouter({
        id: 0,
        vendorId: this.addData.vendorId
      }).then(data => {
        this.routeData = data.data.routers
      })
      const params = {
          simple: true
        },
        searchParam = [{ param: { vendorId: this.addData.vendorId }, sign: 'EQ' }]
      params.params = JSON.stringify(searchParam)
      getFirewallPolicy(params).then(data => {
        this.policyData = data.data.rows
      })
    }
  },
  created() {
    this.getList()
  },
  watch: {
    vendorId() {
      this.getList()
    }
  }
}
</script>

<style scoped></style>
