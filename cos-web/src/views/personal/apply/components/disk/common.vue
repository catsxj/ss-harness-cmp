<template>
  <basic-form label-width="120px" v-bind="$attrs">
    <PreviewItem :item-data="itemData"></PreviewItem>
    <div v-for="item in diskList" :key="item.uuid">
      <el-divider content-position="left">{{ item.name }}</el-divider>
      <basic-form-item label="原有大小：">{{ item.size || item.oldSize }} GB</basic-form-item>
      <basic-form-item label="扩容至："> <el-input-number :min="1" v-model="item.disk" class="w"> </el-input-number> GB </basic-form-item>
      <template v-if="lvm">
        <basic-form-item label="创建lvm：">
          <el-checkbox class="m-l-xs" v-model="item.createLvm"></el-checkbox>
        </basic-form-item>
        <el-form-item label="  ">
          <el-select v-if="item.createLvm" v-model="item.fileSystem" placeholder="文件系统" style="width: 200px">
            <el-option v-for="(item1, index) in fileList" :key="index" :label="item1.name" :value="item1.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="  ">
          <el-input v-if="item.createLvm" v-model="item.device" style="width: 200px" placeholder="挂载目录"></el-input>
          <el-checkbox v-model="item.forceMount" v-if="item.createLvm" class="m-l-md">强制挂载</el-checkbox>
        </el-form-item>
      </template>
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
      diskList: [],
      fileList: [],
      lvm: false
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
    this.getDict()
    if (this.itemData.params.osCategory !== 'WINDOWS' && this.itemData.params.type === 'VMWARE') this.lvm = true
  },
  methods: {
    getDict() {
      getDictChildren({ value: 'FS_TYPE' }).then((data) => {
        if (data.success) {
          this.fileList = data.data
        }
      })
    },
    async getDisk() {
      const data = await conditionVoleme({ condition: 'vmDisks', serverId: this.itemData.id })
      if (data.success) {
        const ary = []
        data.data.forEach((item) => {
          if (item.id == this.itemData.volumeId) {
            const { uuid, name, size, category, categoryId, fileSystem, lvmMntp, forceMount } = item
            const result = {
              uuid,
              name,
              size,
              category,
              disk: size,
              categoryId,
              max: 1024,
              sliderMarks: {},
              fileSystem,
              device: lvmMntp,
              forceMount,
              createLvm: lvmMntp ? lvmMntp != '' : false
            }
            if (lvmMntp ? lvmMntp != '' : false) this.lvm = false
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
      let deviceValidate = true
      this.diskList.forEach((item) => {
        const { uuid, name, createLvm, forceMount, fileSystem, device, disk } = item
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
          createLvm,
          forceMount,
          fileSystem,
          device,
          oldSize: item.size
        })
        if (createLvm && device == '') deviceValidate = false
      })
      if (deviceValidate) {
        return obj
      } else {
        return false
      }
    },
    // 审批
    getApplyData() {
      const obj = {
        ...this.itemData,
        upgrade: [],
        editDataDisks: []
      }
      let deviceValidate = true
      this.diskList.forEach((item) => {
        const { uuid, name, createLvm, forceMount, fileSystem, device, disk } = item
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
          createLvm,
          forceMount,
          fileSystem,
          device,
          oldSize: item.oldSize
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
