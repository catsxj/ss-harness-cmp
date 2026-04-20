<template>
  <div>
    <basic-form label-width="0px" ref="data" :disabled="disabled">
      <PreviewItem :item-data="itemData"></PreviewItem>
      <basic-form-item>
        <el-row>
          <el-col :span="24" v-for="(cell, index) in disks" :key="index" class="m-t">
            <el-col :span="2" v-if="!disabled">
              <el-button :disabled="disks.length == 1" class="m-l-sm" type="danger" icon="el-icon-delete" @click="removeItem(index)"></el-button>
            </el-col>
            <el-col :span="18"> <el-input-number :min="1" v-model="cell.disk" class="w m-r"> </el-input-number> GB </el-col>
          </el-col>
          <!-- <basic-form-item label="名称：" prop="name" validate="required">
            <el-input v-model="cell.name"></el-input>
          </basic-form-item>
          <basic-form-item label="容量：" prop="size" validate="required">
            <el-input v-model="cell.size"></el-input>
          </basic-form-item>
          <basic-form-item label="总线：" prop="bus" validate="required">
            <el-select filterable v-model="cell.bus" clearable>
              <el-option v-for="(item, index) in busData" :key="index" :label="item.name" :value="item.value"></el-option>
            </el-select>
          </basic-form-item>
          <basic-form-item label="存储策略：" prop="volumeTemplateId" validate="required">
            <el-select filterable v-model="cell.volumeTemplateId" clearable>
              <el-option v-for="(item, index) in templateData" :key="index" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </basic-form-item> -->
          <el-col v-if="!disabled" :span="4" class="add-border m-t-md" @click.native="addItem()">
            <i class="el-icon-plus"></i>
          </el-col>
        </el-row>
      </basic-form-item>
    </basic-form>
  </div>
</template>

<script>
import { getCategoriesByCode } from 'services/services/product'
import { getDictChildren } from 'services/platform/index'
import PreviewItem from './PreviewItem.vue'
import { getVolumeTpl } from 'services/platform/smart'
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
      loading: false,
      categoryList: [],
      disks: [],
      templateData: [],
      busData: [
        { name: 'VIRTIO', value: 'VIRTIO' },
        { name: 'SCSI', value: 'SCSI' },
        { name: 'IDE', value: 'IDE' }
      ]
    }
  },
  computed: {
    categoryMap() {
      const map = {}
      this.categoryList.forEach((item) => {
        map[item.id] = item
      })
      return map
    }
  },
  created() {
    this.getTemplateData()
    this.getCategoryList()
    if (this.itemData.upgrade) {
      this.itemData.addDataDisks.forEach((item, index) => {
        this.disks.push({
          ...item,
          ...this.itemData.upgrade[index]
        })
      })
    }
  },
  methods: {
    getTemplateData() {
      getVolumeTpl({
        simple: true,
        params: this.$tools.handleSearchParam({
          vendorId: this.itemData.vendorId
        })
      }).then((data) => {
        if (data.success) {
          this.templateData = data.data.rows
        }
      })
    },
    // 获取服务类型
    getCategoryList() {
      getCategoriesByCode('cloudtower.standard.volume').then((data) => {
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
        serviceCode: 'cloudtower.standard.volume',
        categoryId,
        disk: 1
      }
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

      this.disks.forEach((item) => {
        const { categoryId, serviceCode, disk } = item
        const category = this.categoryMap[categoryId]?.remark
        obj.upgrade.push({
          serviceCode,
          categoryId,
          category,
          specs: [
            {
              disk
            }
          ]
        })
        obj.addDataDisks.push({
          category,
          disk,
          type: 'newDisk',
          bus: this.busData[0].value,
          volumeTemplateId: this.templateData[0].id, // 存储策略
          volumeTemplateName: this.templateData[0].name
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
      this.disks.forEach((item) => {
        const { categoryId, serviceCode, disk } = item
        const category = this.categoryMap[categoryId]?.remark
        obj.upgrade.push({
          serviceCode,
          categoryId,
          category,
          specs: [
            {
              disk
            }
          ]
        })
        obj.addDataDisks.push({
          category,
          disk,
          type: 'newDisk',
          bus: this.busData[0].value,
          volumeTemplateId: this.templateData[0].id, // 存储策略
          volumeTemplateName: this.templateData[0].name
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
