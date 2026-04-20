<template>
  <basic-form :model="itemData" ref="form" :disabled="isPreview">
    <el-form-item label="数据来源：">
      <el-radio-group class="simple" v-model="itemData.origin">
        <el-radio-button label="create">新增</el-radio-button>
        <el-radio-button label="reuse">已有</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <div v-if="!isTemplate">
      <RegionItem :addData="itemData" @changeVendorId="getListData" vendorType="OPENSTACK"></RegionItem>
      <h5>配置信息</h5>
      <div v-if="itemData.origin === 'create'">
        <OpProject :add-data="itemData" :vendor-id="itemData.location.vendorId" v-if="!isConsole"></OpProject>
        <basic-form-item label="名称：" prop="name" validate="required" required-message="请输入名称">
          <el-input v-model="itemData.name"></el-input>
        </basic-form-item>
        <basic-form-item label="描述：" prop="remark">
          <el-input v-model="itemData.remark"></el-input>
        </basic-form-item>
      </div>
      <el-form-item v-else label="列表：" prop="id" :rules="{ required: true, message: '请选择列表' }">
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
import { initOpProps } from '../../data/init'
import OpProject from './components/OpProject.vue'
import RegionItem from 'views/resource-apply/components/RegionItem.vue'
import { getGroup } from 'services/platform/index'
export default {
  components: { OpProject, RegionItem },
  mixins: [node, show],
  props: {
    ...initOpProps
  },
  data() {
    return {
      listData: []
    }
  },
  created() {},
  methods: {
    getListData(vendorId, clear) {
      getGroup({
        params: this.$tools.handleSearchParam({ vendorId }),
        simple: true
      }).then((data) => {
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
