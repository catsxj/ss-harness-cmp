<template>
  <basic-form :model="itemData" ref="formRef" :disabled="isPreview">
    <el-form-item label="数据来源：">
      <el-radio-group class="simple" v-model="itemData.origin">
        <el-radio-button label="create">新增</el-radio-button>
        <el-radio-button label="reuse">已有</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <div v-if="!isTemplate">
      <div v-if="itemData.origin === 'create'">
        <op-network class="task-node" v-if="itemData.origin === 'create'" ref="nodeRef" :item-data="applyData" type="OPENSTACK" :template="isTemplate" :disabled="isPreview"></op-network>
      </div>
      <el-col :span="24" v-else>
        <RegionItem :addData="itemData" :item-data="itemData" @changeVendorId="getData"></RegionItem>
        <h5>配置信息</h5>
        <el-form-item label="网络列表：" prop="id" :rules="{ required: true, message: '请选择列表' }" v-if="!isTemplate">
          <el-select v-model="itemData.id" placeholder="请选择" :disabled="isPreview" filterable>
            <el-option v-for="(item, index) in listData" :key="index" :label="item.name" :value="item.id"> </el-option>
          </el-select>
        </el-form-item>
      </el-col>
    </div>
  </basic-form>
</template>
<script>
import show from '../../../mixins/show'
import { initOpProps } from '../../data/init'
import OpNetwork from '@/views/resource-apply/vpc/op.vue'
import RegionItem from 'views/resource-apply/components/RegionItem.vue'
import { getNetwork } from 'services/platform/index'
import useApplication from '../../hooks/useApplication'
import { ref } from '@vue/composition-api'
import { handleSearchParam } from 'cmp-element/utils/index'
export default {
  mixins: [show],
  components: { OpNetwork, RegionItem },
  props: {
    ...initOpProps
  },
  setup(props) {
    const listData = ref([])
    async function getData(vendorId, clear) {
      const data = await getNetwork({
        simple: true,
        params: handleSearchParam({ vendorId })
      })
      if (data.success) {
        listData.value = data.data.rows;
        if (clear && props.itemData.id) {
          props.itemData.id = ''
        }
      }
    }
    const { applyData, getPostData, formRef, nodeRef } = useApplication(props.itemData, getData)
    return {
      listData,
      applyData,
      getPostData,
      formRef,
      nodeRef,
      getData
    }
  }
}
</script>
<style></style>
