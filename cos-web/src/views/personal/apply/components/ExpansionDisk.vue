<template>
  <basic-form label-width="120px" :model="diskData" v-bind="$attrs">
    <basic-form-item label="实例名称：">{{ diskData.instanceName }}</basic-form-item>
    <basic-form-item label="原磁盘：">{{ diskData.preview.specName }}</basic-form-item>
    <basic-form-item label="磁盘类型：" required>
      <el-radio-group v-model="diskData.preview.categoryId" @change="getSkuList()">
        <el-radio-button :label="item.id" v-for="(item, index) in categoryList" :key="index">{{ item.name }}</el-radio-button>
      </el-radio-group>
    </basic-form-item>
    <basic-form-item label="扩容至：" validate="required" class="m-b-lg">
      <el-select v-model="diskData.preview.skuId" class="w">
        <el-option :label="generateSpec(cell.spec)" v-for="cell in specList" :key="cell.id" :value="cell.id" :disabled="judgeDisabled(cell.spec)"></el-option>
      </el-select>
    </basic-form-item>
  </basic-form>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import { cloneDeep } from 'lodash-es'
import { handleSearchParam } from 'cmp-element/utils'
import { getSkus, getCategoriesByCode } from 'services/services/product'
import { generateSpec, getSpec } from '@/views/resource-apply/utils/index'

const SERVICE_CODE = 'vmware.storage.disk'
type IProps = {
  itemData: any
}
export default defineComponent({
  props: {
    itemData: {
      type: Object
    }
  },
  setup(props: IProps, context) {
    const specList = ref([])
    const diskData = ref(cloneDeep(props.itemData))
    // 代码兼容处理
    if (typeof props.itemData.preview === 'string') {
      diskData.value.preview = JSON.parse(props.itemData.preview)
    }
    const categoryList = ref([])
    async function getCategoryList() {
      const { categoryId } = diskData.value.preview
      const data = await getCategoriesByCode(SERVICE_CODE)
      if (data.success) {
        categoryList.value = data.data
        if (!categoryId) {
          context.root.$set(diskData.value.preview, 'categoryId', (categoryList.value[0] as any).id)
        }
        getSkuList()
      }
    }
    getCategoryList()
    async function getSkuList() {
      const { categoryId } = diskData.value.preview
      const data = await getSkus({
        page: 1,
        rows: 9999,
        params: handleSearchParam({ categoryId, serviceCode: SERVICE_CODE })
      })
      if (data.success) {
        specList.value = data.data.map((item: any) => {
          return {
            ...item,
            spec: JSON.parse(item.spec)
          }
        })
      }
    }
    const judgeDisabled = (spec: any[]) => {
      const [{ specValue: disk }] = spec
      const {
        preview: { specName }
      } = diskData.value
      return disk / 1 <= specName.split('GB')[0] / 1
    }
    function getApplyData() {
      const {
        service,
        instance,
        instanceName,
        expiredTime,
        preview: { skuId },
        preview
      } = diskData.value
      const obj = {
        service,
        instance,
        instanceName,
        operation: 'Upgrade',
        expiredTime,
        preview: {
          ...preview,
          skuId,
          operation: 'ExpansionDisk'
        },
        upgrade: [
          {
            serviceCode: 'vmware.storage.disk',
            skuId,
            spec: getSpec(skuId, specList.value)
          }
        ]
      }
      return obj
    }
    return {
      generateSpec,
      judgeDisabled,
      categoryList,
      specList,
      diskData,
      getSkuList,
      getApplyData
    }
  }
})
</script>

<style></style>
