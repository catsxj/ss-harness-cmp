<template>
  <div>
    <!-- TODO: i18n -->
    <basic-form-item label="云平台：">
      <el-select v-model="itemData.defaultValue" filterable @change="getVendorList">
        <el-option :value="item.value" v-for="item in vendorTypeList" :key="item.value" :label="item.name"></el-option>
      </el-select>
    </basic-form-item>
    <!-- TODO: i18n -->
    <basic-form-item label="平台列表：">
      <el-select filterable v-model="vendorConfig.defaultValue" clearable @change="setTitle">
        <el-option v-for="item in vendorList" :key="item.id" :value="item.id" :label="item.name"></el-option>
      </el-select>
    </basic-form-item>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { getDictChildrenTree } from 'services/system/dictionary'
import { getCloudVendor } from 'services/platform'
import { handleSearchParam } from 'utils'

interface VendorTypeItem {
  value: string
  name: string
  children?: VendorTypeItem[]
}

interface VendorListItem {
  id: number | string
  name: string
  type: string
}

interface ConfigItem {
  code?: string
  type?: string
  defaultValue?: any
  config?: any
  name?: string
}

const props = withDefaults(
  defineProps<{
    itemData: { defaultValue?: string; config?: any; vendorType?: string }
    configData?: ConfigItem[]
  }>(),
  {
    configData: () => []
  }
)

const vendorTypeList = ref<VendorTypeItem[]>([])
;(async function () {
  const res = await getDictChildrenTree({ value: 'RESOURCE_TYPE' })
  const [{ children: privateList = [] }, { children: publicList = [] }] = res.data
  vendorTypeList.value = [...privateList, ...publicList]
})()

const vendorConfig = computed<ConfigItem>(() => {
  return props.configData.find((item) => item.type === 'VENDOR') || ({ defaultValue: '' } as ConfigItem)
})

// 云平台列表
const vendorList = ref<VendorListItem[]>([])
async function getVendorList(type?: string) {
  if (type) {
    vendorConfig.value.defaultValue = ''
    setTitle()
  }
  const res = await getCloudVendor({
    page: 1,
    rows: 9999,
    params: handleSearchParam({
      type: props.itemData.defaultValue
    })
  })
  vendorList.value = res.data.rows
}
getVendorList()

// 设置标题
function setTitle() {
  let title = ''
  const vendorId = vendorConfig.value.defaultValue
  if (vendorId) {
    const res = vendorList.value.find((item) => item.id === vendorId)
    title = res?.name || ''
  } else {
    const res = vendorTypeList.value.find((item) => item.value === props.itemData.defaultValue)
    title = res?.name || ''
  }
  const titleConfig = props.configData[0]
  if (titleConfig) {
    titleConfig.defaultValue = `${title}${titleConfig.config?.suffix || ''}`
  }
}
</script>
<style lang="scss" scoped></style>
