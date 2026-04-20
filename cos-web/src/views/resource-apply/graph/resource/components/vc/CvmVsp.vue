<template>
  <basic-form :model="itemData" ref="formRef" :disabled="isPreview">
    <el-form-item label="数据来源：">
      <el-radio-group class="simple" v-model="itemData.origin">
        <el-radio-button label="create">新增</el-radio-button>
        <el-radio-button label="reuse">已有</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <div v-if="!isTemplate">
      <vm-server class="task-node" v-if="itemData.origin === 'create'" ref="nodeRef" :item-data="applyData" type="VMWARE" :template="isTemplate" :disabled="isPreview"></vm-server>
      <div v-else>
        <RegionItem :addData="itemData" @changeVendorId="getData" vendorType="VMWARE"></RegionItem>
        <h5>配置信息</h5>
        <basic-form-item label="虚机列表：" prop="id" validate="required" :disabledValidate="isTemplate">
          <el-select v-model="itemData.id" placeholder="请选择" filterable>
            <el-option v-for="item in listData" :key="item.id" :label="item.name" :value="item.id"> </el-option>
          </el-select>
        </basic-form-item>
      </div>
    </div>
  </basic-form>
</template>
<script>
import show from '../../../mixins/show'
import vmServer from '@/views/resource-apply/ecs/vc/index.vue'
import RegionItem from 'views/resource-apply/components/RegionItem.vue'
import { getVm } from 'services/platform/index'
import useApplication from '../../hooks/useApplication'
import { ref } from '@vue/composition-api'
import { handleSearchParam } from 'cmp-element/utils/index'
export default {
  mixins: [show],
  components: {
    vmServer,
    RegionItem
  },
  props: {
    itemData: {
      type: Object,
      default: function () {
        return {
          origin: 'create',
          id: '',
          location: {
            region: '',
            az: '',
            vendorId: '',
            poolGroupId: ''
          }
        }
      }
    }
  },
  setup(props) {
    const listData = ref([])
    async function getData(vendorId, clear) {
      const data = await getVm({
        simple: true,
        params: handleSearchParam({ vendorId, isTemplate: false })
      })
      if (data.success) {
        listData.value = data.data.rows
        if (clear && props.itemData.id) {
          props.itemData.id = ''
        }
      }
    }
    const { applyData, getPostData, formRef, nodeRef } = useApplication(props.itemData)
    return {
      listData,
      applyData,
      getPostData,
      getData,
      formRef,
      nodeRef
    }
  }
}
</script>
<style></style>
