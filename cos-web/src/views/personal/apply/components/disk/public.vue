<template>
  <basic-form label-width="120px" v-bind="$attrs">
    <PreviewItem :item-data="itemData"></PreviewItem>
    <div v-for="item in diskList" :key="item.uuid">
      <el-divider content-position="left">{{ item.name }}</el-divider>
      <basic-form-item label="原有大小：">{{ item.oldSize }} GB</basic-form-item>
      <basic-form-item label="扩容至："> <el-input-number :min="item.oldSize + 1" v-model="item.disk" class="w"> </el-input-number> GB </basic-form-item>
    </div>
    <div v-if="!diskList.length">暂无可扩容磁盘</div>
  </basic-form>
</template>

<script>
import PreviewItem from '../PreviewItem.vue'
import { conditionVoleme, getDictChildren } from 'services/platform/index'
export default {
  components: { PreviewItem },
  props: {
    itemData: {
      type: Object
    }
  },
  data() {
    return {
      diskList: []
    }
  },
  created() {
    if (this.itemData.editDataDisks) {
      this.diskList = []
      this.itemData.editDataDisks.forEach((item, index) => {
        const result = {
          ...item,
          ...this.itemData.upgrade[index]
        }
        this.diskList.push(result)
      })
    } else {
      this.getDisk()
    }
  },
  methods: {
    async getDisk() {
      const data = await conditionVoleme({ condition: 'vmDisks', serverId: this.itemData.id })
      if (data.success) {
        const ary = []
        data.data.forEach((item) => {
          if (item.id == this.itemData.params.itemParam.volumeId) {
            const { uuid, name, size, category, categoryId } = item
            const result = {
              uuid,
              name,
              oldSize: size,
              category,
              disk: size,
              categoryId,
              max: 1024
            }
            ary.push(result)
          }
        })
        this.diskList = ary
      }
    },
    // 申请
    ok() {
      const { service, expiredTime, params, preview } = this.itemData
      const obj = {
        preview,
        params,
        service,
        instance: this.itemData.uuid,
        instanceName: this.itemData.name,
        operation: 'EditDisk',
        upgrade: [],
        editDataDisks: [],
        expiredTime
      }
      this.diskList.forEach((item) => {
        const { uuid, name, disk, oldSize } = item
        obj.upgrade.push({
          serviceCode: this.itemData.params.serviceCode,
          uuid,
          specs: [
            {
              disk
            }
          ]
        })
        obj.editDataDisks.push({
          name,
          disk,
          oldSize,
          ...(this.itemData.params.itemParam || {})
        })
      })
      return obj
    },
    // 审批
    getApplyData() {
      const obj = {
        ...this.itemData,
        upgrade: [],
        editDataDisks: []
      }
      this.diskList.forEach((item) => {
        const { uuid, name, disk, oldSize } = item
        obj.upgrade.push({
          serviceCode: this.itemData.params.serviceCode,
          uuid,
          specs: [
            {
              disk
            }
          ]
        })
        obj.editDataDisks.push({
          name,
          disk,
          oldSize,
          ...(this.itemData.params.itemParam || {})
        })
      })
      return obj
    }
  }
}
</script>
