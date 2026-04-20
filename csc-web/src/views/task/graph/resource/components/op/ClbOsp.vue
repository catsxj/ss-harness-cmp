<template>
  <basic-form :model="itemData" ref="form" :disabled="isPreview">
    <el-form-item label="数据来源：">
      <el-radio-group class="simple" v-model="itemData.origin">
        <el-radio-button label="create">新增</el-radio-button>
        <el-radio-button label="reuse">已有</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <div v-if="!isTemplate">
      <RegionItem :addData="itemData" @changeVendorId="getData"></RegionItem>
      <h5>配置信息</h5>
      <div v-if="itemData.origin === 'create'">
        <OpProject :add-data="itemData" :vendor-id="itemData.location.vendorId" v-if="!isConsole"></OpProject>
        <basic-form-item label="名称：" prop="name" validate="required" required-message="请输入名称">
          <el-input v-model="itemData.name" :disabled="isPreview"></el-input>
        </basic-form-item>
      </div>
      <div v-else>
        <el-form-item v-if="!isTemplate" label="负载列表：" prop="id" :rules="{ required: true, message: '请选择列表' }">
          <el-select v-model="itemData.id" placeholder="请选择" :disabled="isPreview" filterable>
            <el-option v-for="item in listData" :key="item.id" :label="item.name" :value="item.id"> </el-option>
          </el-select>
        </el-form-item>
      </div>
    </div>
  </basic-form>
</template>
<script>
import node from '../../../mixins/index'
import show from '../../../mixins/show'
import { initOpProps } from '../../data/init'
import OpProject from './components/OpProject.vue'
import RegionItem from 'views/resource-apply/components/RegionItem.vue'
import { getLb } from 'services/platform/index'
export default {
  mixins: [node, show],
  components: { OpProject, RegionItem },
  props: {
    ...initOpProps
  },
  data() {
    return {
      listData: []
    }
  },
  methods: {
    getData(vendorId, clear) {
      getLb({
        simple: true,
        params: this.$tools.handleSearchParam({ vendorId })
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
