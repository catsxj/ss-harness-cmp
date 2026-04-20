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
            <el-input-number :min="1" v-model="cell.disk" class="w m-r"> </el-input-number> GB
            <!-- <el-checkbox class="m-l-md" v-model="cell.createLvm" v-if="itemData.params.osCategory != 'WINDOWS' && itemData.params.type === 'VMWARE'">创建LVM</el-checkbox> -->
          </el-col>
          <el-col :span="18" :offset="2" class="m-t-xs">
            <el-select v-if="cell.createLvm" v-model="cell.fileSystem" placeholder="文件系统" style="width: 200px">
              <el-option v-for="(item, index) in fileList" :key="index" :label="item.name" :value="item.value"></el-option>
            </el-select>
            <el-autocomplete class="m-l-md" v-if="cell.createLvm" v-model="cell.device" :fetch-suggestions="querySearch" placeholder="挂载路径"></el-autocomplete>
            <el-checkbox v-model="cell.forceMount" v-if="cell.createLvm" class="m-l-md">强制挂载</el-checkbox>
          </el-col>
        </el-col>
        <!-- H3C 只能添加一个硬盘 -->
        <el-col v-if="!disabled && !['H3C', 'CNWARE'].includes(itemData.params.type)" :span="4" class="add-border m-t-md" @click.native="addItem()">
          <i class="el-icon-plus"></i>
        </el-col>
      </el-row>
      <el-row></el-row>
    </basic-form-item>
  </basic-form>
</template>

<script>
import { getCategoriesByCode } from 'services/services/product'
import { getDictChildren } from 'services/platform/index'
import PreviewItem from '../PreviewItem.vue'
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
      categoryList: [],
      disks: [],
      fileList: []
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
    this.getCategoryList()
    this.getDict()
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
    querySearch(queryString, cb) {
      var ary = []
      this.disks.forEach((item) => {
        if (item.device != '') ary.push({ name: item.device, value: item.device })
      })
      const restaurants = []
      const value = []
      ary.forEach((item) => {
        if (!value.includes(item.value)) {
          restaurants.push(item)
          value.push(item.value)
        }
      })
      var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    createFilter(queryString) {
      return (restaurant) => {
        return restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
      }
    },
    getDict() {
      getDictChildren({ value: 'FS_TYPE' }).then((data) => {
        if (data.success) {
          this.fileList = data.data
        }
      })
    },
    // 获取服务类型
    getCategoryList() {
      getCategoriesByCode(this.itemData.params.serviceCode).then((data) => {
        if (data.success) {
          if (!data.data.length) return this.$message.error('该服务不存在产品类型请检查')
          this.categoryList = data.data
          if (!this.itemData.upgrade) this.addItem()
        }
      })
    },
    setDevice(value) {
      let flag = false
      // 数字不能开头
      // 不能是纯/ 也不能以/dev或者/boot开头
      const reg = /^[/a-zA-Z][a-zA-Z0-9_-]*$/
      if ((value == '/' || new RegExp('^/dev').test(value) || new RegExp('^/boot').test(value) || !reg.test(value)) && value) {
        flag = true
      }
      return flag
    },
    removeItem(index) {
      this.disks.splice(index, 1)
    },
    addItem() {
      const [{ id: categoryId }] = this.categoryList
      const result = {
        serviceCode: this.itemData.params.serviceCode,
        categoryId,
        createLvm: false,
        disk: 1,
        device: '',
        forceMount: false,
        diskType: this.diskType,
        fileSystem: this.fileList.length ? this.fileList[0].value : ''
      }
      this.disks.push(result)
    },
    ok() {
      let data = false
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
      let deviceValidate = true
      this.disks.forEach((item) => {
        const { categoryId, serviceCode, createLvm, device, forceMount, fileSystem, disk } = item
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
          createLvm,
          device,
          forceMount,
          fileSystem,
          ...(this.itemData.params.itemParam || {})
        })
        if (createLvm && device == '') deviceValidate = false
      })
      if (deviceValidate) data = obj
      return data
    },
    getApplyData() {
      const obj = {
        ...this.itemData,
        upgrade: [],
        addDataDisks: []
      }
      let deviceValidate = true
      this.disks.forEach((item) => {
        const { categoryId, serviceCode, createLvm, device, forceMount, fileSystem, disk } = item
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
          createLvm,
          device,
          forceMount,
          fileSystem,
          ...(this.itemData.params.itemParam || {})
        })
        if (createLvm && device == '') deviceValidate = false
      })
      if (deviceValidate) {
        return obj
      } else {
        return false
      }
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
