<template>
  <basic-form :model="itemData" ref="form" :disabled="isPreview">
    <el-form-item label="数据来源：">
      <el-radio-group class="simple" v-model="itemData.origin">
        <el-radio-button label="create">新增</el-radio-button>
        <el-radio-button label="reuse">已有</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <div v-if="!isTemplate">
      <RegionItem :add-data="itemData" @changeVendorId="changeVendor" vendorType="OPENSTACK"></RegionItem>
      <h5>配置信息</h5>
      <div v-if="itemData.origin === 'create'">
        <OpProject :add-data="itemData" :vendor-id="itemData.location.vendorId" v-if="!isConsole"></OpProject>
        <basic-form-item label="路由名称：" prop="name" validate="required" required-message="请输入名称">
          <el-input v-model="itemData.name" :disabled="isPreview"></el-input>
        </basic-form-item>
        <basic-form-item label="管理状态：" prop="adminStateup" validate="required" required-message="请选择管理状态">
          <el-select v-model="itemData.adminStateup" :disabled="isPreview">
            <el-option label="开启" :value="true"></el-option>
            <el-option label="关闭" :value="false"></el-option>
          </el-select>
        </basic-form-item>
        <el-form-item label="外部网络：" prop="networkId" v-if="!isTemplate">
          <el-select v-model="itemData.networkId" :disabled="isPreview">
            <el-option v-for="item in networkList" :label="item.name" :value="item.id" :key="item.id"></el-option>
          </el-select>
        </el-form-item>
      </div>
      <el-form-item v-else label="路由列表：" prop="id" :rules="{ required: true, message: '请选择列表' }">
        <el-select v-model="itemData.id" placeholder="请选择" :disabled="isPreview" filterable>
          <el-option v-for="item in listData" :key="item.id" :label="item.name" :value="item.id"> </el-option>
        </el-select>
      </el-form-item>
    </div>
  </basic-form>
</template>
<script>
import node from '../../../mixins/index'
import show from '../../../mixins/show'
import RegionItem from 'views/resource-apply/components/RegionItem.vue'
import { initOpProps } from '../../data/init'
import OpProject from './components/OpProject.vue'
import { getNetwork, getRouter } from 'services/platform/index'
export default {
  mixins: [node, show],
  components: { OpProject, RegionItem },
  props: {
    ...initOpProps
  },
  data() {
    return {
      networkList: [],
      listData: []
    }
  },
  created() {},
  methods: {
    changeVendor(vendorId, clear) {
      this.getData(vendorId, clear)
      this.getNetworks(vendorId, clear)
    },
    getNetworks(vendorId, clear) {
      getNetwork({
        simple: true,
        params: this.$tools.handleSearchParam({
          vendorId,
          isRouterExternal: 1
        })
      }).then(data => {
        if (data.success) {
          this.networkList = data.data.rows
          if (clear) {
            this.itemData.networkId = ''
          }
        }
      })
    },
    getData(vendorId, clear) {
      getRouter({
        simple: true,
        params: this.$tools.handleSearchParam({
          vendorId
        })
      }).then(data => {
        if (data.success) {
          this.listData = data.data.rows
          if (clear) {
            this.itemData.id = ''
          }
        }
      })
    }
  }
}
</script>
<style></style>
