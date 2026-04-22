<template>
  <basic-form :model="itemData" ref="formRef" :disabled="isPreview">
    <el-form-item label="数据来源：">
      <el-radio-group class="simple" v-model="itemData.origin">
        <el-radio-button label="create">新增</el-radio-button>
        <el-radio-button label="reuse">已有</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <div v-if="!isTemplate">
      <op-disk class="task-node" v-if="itemData.origin === 'create'" ref="nodeRef" :item-data="applyData" type="OPENSTACK" :template="isTemplate" :disabled="isPreview"></op-disk>
      <div v-else>
        <RegionItem :addData="itemData" @changeVendorId="getData"></RegionItem>
        <h5>配置信息</h5>
        <basic-form-item label="硬盘列表：" prop="id" validate="required" :disabledValidate="isTemplate">
          <el-select v-model="itemData.id" placeholder="请选择" :disabled="isPreview" filterable>
            <el-option v-for="item in listData" :key="item.id" :label="item.name" :value="item.id"> </el-option>
          </el-select>
        </basic-form-item>
      </div>
    </div>
  </basic-form>
</template>
<script>
import show from '../../../mixins/show'
import OpDisk from '@/views/resource-apply/disk/op.vue'
import RegionItem from 'views/resource-apply/components/RegionItem.vue'
import { initOpProps } from '../../data/init'
import { getVolume } from 'services/platform/index'
import useApplication from '../../hooks/useApplication'
import { ref } from '@vue/composition-api'
import { handleSearchParam } from 'cmp-element/utils/index'
export default {
  components: { OpDisk, RegionItem },
  mixins: [show],
  props: {
    ...initOpProps
  },
  setup(props) {
    const listData = ref([])
    async function getData(vendorId, clear) {
      const data = await getVolume({
        simple: true,
        params: handleSearchParam({ vendorId, 'serverId:NUL': 0 })
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
