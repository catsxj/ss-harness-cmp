<template>
  <basic-form label-width="120px" :model="upgradeData" v-bind="$attrs">
    <basic-form-item label="名称：">{{ upgradeData.instanceName }}</basic-form-item>
    <basic-form-item label="原规格：">{{ upgradeData.preview.specName }}</basic-form-item>
    <basic-form-item label="实例规格：" validate="required">
      <sku-table :skus="specList" :column-props="columnProps" style="max-width: 600px">
        <el-table-column show-overflow-tooltip label="规格代码" prop="name">
          <template v-slot="scope">
            <el-radio v-model="upgradeData.preview.skuId" :label="scope.row.id" :disabled="judgeDisabled(scope.row.spec)">{{ scope.row.code }}</el-radio>
          </template>
        </el-table-column>
      </sku-table>
    </basic-form-item>
  </basic-form>
</template>

<script lang="ts">
// 原本的UpgradeSpec文件用作 vc 的配置变更,不走规格,db 的还是保持原来走规则的逻辑
import { computed, defineComponent, ref } from '@vue/composition-api'
import { cloneDeep } from 'lodash-es'
import { handleSearchParam } from 'cmp-element/utils'
import { getSkus } from 'services/services/product'
import { getSpec } from '@/views/resource-apply/utils/index'
type IProps = {
  itemData: any
}
export default defineComponent({
  props: {
    itemData: {
      type: Object
    }
  },
  setup(props: IProps) {
    const specList = ref([])
    const upgradeData = ref(cloneDeep(props.itemData))
    // 代码兼容处理
    if (typeof props.itemData.preview === 'string') {
      upgradeData.value.preview = JSON.parse(props.itemData.preview)
    }
    async function getSkuList() {
      const {
        preview: { categoryId },
        service: serviceCode
      } = upgradeData.value
      const data = await getSkus({
        page: 1,
        rows: 9999,
        params: handleSearchParam({ categoryId, serviceCode })
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
    getSkuList()
    // 是否为数据库中间件
    const isDb = computed(() => {
      return ['rds', 'cms', 'cvs'].includes(upgradeData.value.service.split('.')[0])
    })
    // sku表格列
    const columnProps = computed(() => {
      if (isDb.value) {
        return [
          {
            label: 'CPU（核）',
            value: 'cpu'
          },
          {
            label: '内存（GB）',
            value: 'memory'
          },
          {
            label: '磁盘（GB）',
            value: 'disk'
          }
        ]
      }
    })
    const judgeDisabled = (spec: any[]) => {
      if (isDb.value) {
        const [{ specValue: cpu }, { specValue: mem }, { specValue: disk }] = spec
        const { specName } = upgradeData.value.preview
        // 1核/2GB/50GB => [1,2,50]
        const [cpu1, mem1, disk1] = specName.match(/(\d*)/g).filter((item: string) => item)
        return cpu / 1 < cpu1 || mem / 1 < mem1 || disk / 1 < disk1 || (cpu / 1 === cpu1 && mem / 1 === mem1 && disk / 1 === disk1)
      }
      return false
    }
    function getApplyData() {
      const {
        service,
        instance,
        instanceName,
        expiredTime,
        preview: { skuId },
        preview
      } = upgradeData.value
      const obj = {
        service,
        instance,
        instanceName,
        operation: 'Upgrade',
        preview: {
          ...preview,
          skuId
        },
        expiredTime,
        upgrade: [
          {
            serviceCode: service,
            skuId,
            spec: getSpec(skuId, specList.value)
          }
        ]
      }
      return obj
    }
    return {
      judgeDisabled,
      columnProps,
      specList,
      upgradeData,
      getApplyData
    }
  }
})
</script>

<style></style>
