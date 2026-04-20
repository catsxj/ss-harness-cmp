<template>
  <div>
    <basic-form-item label="云平台：">
      <el-select v-model="itemData.defaultValue" filterable="" @change="getVendorList">
        <el-option :value="item.value" v-for="item in vendorTypeList" :key="item.value" :label="item.name"></el-option>
      </el-select>
    </basic-form-item>
    <basic-form-item label="平台列表：">
      <el-select filterable="" v-model="vendorConfig.defaultValue" clearable="" @change="setTitle">
        <el-option v-for="item in vendorList" :key="item.id" :value="item.id" :label="item.name"></el-option>
      </el-select>
    </basic-form-item>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, PropType, reactive, ref, toRefs, Ref, unref } from '@vue/composition-api'
import { getDictChildrenTree } from 'services/system/dictionary'
import { getCloudVendor } from 'services/platform'
import { handleSearchParam } from 'cmp-element/utils'

export default defineComponent({
  props: {
    itemData: {
      type: Object as PropType<{ config: any; vendorType: string }>,
      required: true
    },
    configData: {
      type: Array as PropType<any[]>,
      requored: true,
      default() {
        return []
      }
    }
  },
  setup(props: any) {
    const vendorTypeList: Ref<any[]> = ref([])
    ;(async function () {
      const res = await getDictChildrenTree({ value: 'RESOURCE_TYPE' })
      const [{ children: privateList }, { children: publicList }] = res.data
      vendorTypeList.value = [...privateList, ...publicList]
    })()
    const vendorConfig = computed(() => {
      return props.configData.find((item: any) => item.type === 'VENDOR')
    })
    // 云平台列表
    const vendorList = ref([])
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
        const res: any = unref(vendorList).find((item: any) => item.id === vendorId)
        title = res.name
      } else {
        const res: any = unref(vendorTypeList).find((item: any) => item.value === props.itemData.defaultValue)
        title = res.name
      }
      const titleConfig = props.configData[0]
      titleConfig.defaultValue = `${title}${titleConfig.config.suffix}`
    }
    return {
      setTitle,
      vendorConfig,
      vendorTypeList,
      vendorList,
      getVendorList
    }
  }
})
</script>
<style lang="scss" scoped></style>
