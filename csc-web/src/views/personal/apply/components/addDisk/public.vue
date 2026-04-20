<template>
  <basic-form label-width="0px" ref="data" :disabled="disabled">
    <PreviewItem :item-data="itemData"></PreviewItem>
    <basic-form-item>
      <el-row>
        <el-col :span="24" v-for="(cell, index) in disks" :key="index" class="m-t">
          <el-col :span="2" v-if="!disabled">
            <el-button :disabled="disks.length == 1" class="m-l-sm" type="danger" icon="el-icon-delete" @click="removeItem(index)"></el-button>
          </el-col>
          <el-col :span="18">
            <el-select v-if="publicDiskTypeList.length" class="w m-r" v-model="cell.cloudCategory" @change="diskTypeChange(cell)">
              <el-option v-for="i in publicDiskTypeList" :label="i.name" :value="i.value" :key="i.value"></el-option>
            </el-select>
            <el-input-number :min="cell.min || 1" :max="cell.max || 1024" :step="10" v-model="cell.disk" class="w m-r"> </el-input-number> GB
          </el-col>
        </el-col>
        <el-col v-if="!disabled" :span="4" class="add-border m-t-md" @click.native="addItem()">
          <i class="el-icon-plus"></i>
        </el-col>
      </el-row>
      <el-row></el-row>
    </basic-form-item>
  </basic-form>
</template>

<script>
import { getCategoriesByCode } from 'services/services/product'
import PreviewItem from '../PreviewItem.vue'
import { PUBLIC_DISK_TYPE_MAP } from '@/views/resource-apply/ecs/EFCDataDisk.vue'
import { conditionVoleme } from 'services/platform/index'
export default {
  components: { PreviewItem },
  props: {
    itemData: {
      type: Object
    },
    disabled: {
      type: Boolean
    }
  },
  data() {
    return {
      disks: [],
      publicDiskTypeList: []
    }
  },
  computed: {
    categoryMap() {
      const map = {}
      this.categoryList.forEach(item => {
        map[item.id] = item
      })
      return map
    }
  },
  async created() {
    await this.getPublicDiskTypeList()
    this.getCategoryList()
    if (this.itemData.upgrade) {
      this.itemData.addDataDisks.forEach((item, index) => {
        const res = {
          ...item,
          ...this.itemData.upgrade[index]
        }
        this.diskTypeChange(res)
        this.disks.push(res)
      })
    }
  },
  methods: {
    diskTypeChange(cell) {
      const find = this.publicDiskTypeList.find(i => i.value === cell.cloudCategory)
      this.$set(cell, 'min', find?.min || 1)
      this.$set(cell, 'max', find?.max || 1024)
      if (cell.disk < find?.min) {
        cell.disk = find?.min
      }
      if (cell.disk > find?.max) {
        cell.disk = find?.max
      }
    },
    async getPublicDiskTypeList() {
      const _publicDiskTypeList = PUBLIC_DISK_TYPE_MAP[this.itemData.params.type] || []
      if (_publicDiskTypeList.length) {
        this.publicDiskTypeList = _publicDiskTypeList
      } else {
        const dataDiskRef = await conditionVoleme({
          condition: 'listAvailable',
          volumeKind: 'DataDisk',
          resourceType: 'disk',
          vendorId: this.itemData.params.vendorId,
          regionId: this.itemData.params.regionId,
          zoneId: this.itemData.params.zoneId,
          instanceChargeType: this.itemData.params.instanceChargeType
        })
        if (!dataDiskRef.success) return
        this.publicDiskTypeList = dataDiskRef.data
      }
    },
    // 获取服务类型
    getCategoryList() {
      getCategoriesByCode(this.itemData.params.serviceCode).then(data => {
        if (data.success) {
          if (!data.data.length) return this.$message.error('该服务不存在产品类型请检查')
          this.categoryList = data.data
          if (!this.itemData.upgrade) this.addItem()
        }
      })
    },
    removeItem(index) {
      this.disks.splice(index, 1)
    },
    addItem() {
      const [{ id: categoryId }] = this.categoryList
      const result = {
        serviceCode: this.itemData.params.serviceCode,
        categoryId,
        disk: 1,
        cloudCategory: this.disks[0]?.cloudCategory || this.publicDiskTypeList[0]?.value || '',
        min: 1,
        max: 1024
      }
      this.diskTypeChange(result)
      this.disks.push(result)
    },
    ok() {
      const { service, instance, instanceName, expiredTime, params, preview } = this.itemData
      const obj = {
        preview,
        params,
        service,
        instance,
        instanceName,
        operation: 'AddDisk',
        upgrade: [],
        expiredTime,
        addDataDisks: []
      }
      this.disks.forEach(item => {
        const { categoryId, serviceCode, disk, cloudCategory } = item
        const category = this.categoryMap[categoryId]?.remark
        obj.upgrade.push({
          serviceCode,
          categoryId,
          category,
          cloudCategory,
          specs: [
            {
              disk
            }
          ]
        })
        obj.addDataDisks.push({
          category,
          disk,
          cloudCategory,
          ...(this.itemData.params.itemParam || {})
        })
      })
      return obj
    },
    getApplyData() {
      const obj = {
        ...this.itemData,
        upgrade: [],
        addDataDisks: []
      }
      this.disks.forEach(item => {
        const { categoryId, serviceCode, disk, cloudCategory } = item
        const category = this.categoryMap[categoryId]?.remark
        obj.upgrade.push({
          serviceCode,
          categoryId,
          category,
          cloudCategory,
          specs: [
            {
              disk
            }
          ]
        })
        obj.addDataDisks.push({
          category,
          disk,
          cloudCategory,
          ...(this.itemData.params.itemParam || {})
        })
      })
      return obj
    }
  }
}
</script>

<style lang="scss" scoped>
.add-border {
  padding: 2px;
  cursor: pointer;
  border: 1px dashed black;
  text-align: center;
}
</style>
