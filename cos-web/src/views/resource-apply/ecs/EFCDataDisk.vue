<template>
  <el-dialog title="磁盘配置" :visible.sync="dialog.visible" width="600px" append-to-body>
    <basic-form :model="configs" label-suffix="：" label-width="140px" :disabled="disabled">
      <basic-form-item label="系统盘（GB）">
        <el-select class="w m-r" v-model="configs.sysDisk.cloudCategory" :disabled="disabled" v-if="dialog.row.subLocation.isPublic && publicSysDiskTypeList.length" @change="resetSysDisk">
          <el-option v-for="item in publicSysDiskTypeList" :label="item.name" :value="item.value" :key="item.value"></el-option>
        </el-select>
        <el-input-number v-model="configs.sysDisk.disk" :min="getSysMinSize" :max="getSysMaxSize" :step="10" :disabled="disabled || ['H3C', 'CLOUDTOWER'].includes(dialog.row.subLocation.vendorType)"> </el-input-number>
      </basic-form-item>
      <basic-form-item label="数据盘（GB）" v-if="showDataDisk">
        <div v-for="(item, index) in configs.addDiskList" :key="index" class="m-b">
          <el-select class="w m-r" v-model="item.cloudCategory" v-if="dialog.row.subLocation.isPublic && publicDataDiskTypeList.length" @change="resetDataDisk(item)">
            <el-option v-for="i in publicDataDiskTypeList" :label="i.name" :value="i.value" :key="i.value"></el-option>
          </el-select>
          <el-input-number v-model="item.disk" :min="getDataDiskMinSize(item)" :max="getDataDiskMaxSize(item)" :step="10" class="m-r"> </el-input-number>
          <span class="tip" v-if="!!item.templateDisk">镜像中包含的磁盘，最小{{ item.templateDisk }}GB，不可删除</span>
          <el-button v-else type="text" @click="handleSub(index)">删除</el-button>
        </div>
        <el-button type="text" @click="handleAdd">增加</el-button>
      </basic-form-item>
    </basic-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click.native="dialog.visible = false">取消</el-button>
      <el-button type="primary" @click.native="handleSubmit">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export const PUBLIC_DISK_TYPE_MAP = {
  HUAWEI: [
    { name: '通用型SSD', value: 'GPSSD' },
    { name: '高IO', value: 'SAS' },
    { name: '超高IO', value: 'SSD' }
  ]
}
export default {
  name: 'EFCDataDisk',
  props: {
    dialog: {
      type: Object,
      default: () => ({
        visible: false,
        index: '',
        row: {}
      })
    },
    disabled: {
      type: Boolean
    }
  },
  computed: {
    configs() {
      return this.dialog.row.configs
    },
    showDataDisk() {
      return !['MANAGEONE'].includes(this.dialog.row.subLocation.vendorType)
    },
    publicSysDiskTypeList() {
      return this.dialog.row.publicSysDiskTypeList
    },
    publicDataDiskTypeList() {
      return this.dialog.row.publicDataDiskTypeList
    },
    getSysMinSize() {
      // 公有云
      if (this.dialog.row.subLocation.isPublic && this.dialog.row.publicSysDiskTypeList.length) {
        const find = this.dialog.row.publicSysDiskTypeList.find((item) => item.value === this.configs.sysDisk.cloudCategory)
        return find?.min || 10
      }
      // 私有云
      return this.configs.templateDisk
    },
    getSysMaxSize() {
      // 公有云
      if (this.dialog.row.subLocation.isPublic && this.dialog.row.publicSysDiskTypeList.length) {
        const find = this.dialog.row.publicSysDiskTypeList.find((item) => item.value === this.configs.sysDisk.cloudCategory)
        return find?.max || 1024
      }
      // 私有云
      return 1024
    }
  },
  data() {
    return {}
  },
  methods: {
    // 获取数据盘最小值
    getDataDiskMinSize(item) {
      // 公有云
      if (this.dialog.row.subLocation.isPublic && this.dialog.row.publicDataDiskTypeList.length) {
        const find = this.dialog.row.publicDataDiskTypeList.find((i) => i.value === item.cloudCategory)
        return find?.min || 10
      }
      // 私有云
      return item.templateDisk || 10
    },
    // 获取数据盘最大值
    getDataDiskMaxSize(item) {
      // 公有云
      if (this.dialog.row.subLocation.isPublic && this.dialog.row.publicDataDiskTypeList.length) {
        const find = this.dialog.row.publicDataDiskTypeList.find((i) => i.value === item.cloudCategory)
        return find?.max || 1024
      }
      // 私有云
      return 1024
    },
    // 切换时重置系统盘最大值最小值
    resetSysDisk() {
      if (this.configs.sysDisk.disk < this.getSysMinSize) {
        this.configs.sysDisk.disk = this.getSysMinSize
      }
      if (this.configs.sysDisk.disk > this.getSysMaxSize) {
        this.configs.sysDisk.disk = this.getSysMaxSize
      }
    },
    // 切换时重置数据盘最大值最小值
    resetDataDisk(item) {
      if (item.disk < this.getDataDiskMinSize(item)) {
        item.disk = this.getDataDiskMinSize(item)
      }
      if (item.disk > this.getDataDiskMaxSize(item)) {
        item.disk = this.getDataDiskMaxSize(item)
      }
    },
    handleAdd() {
      const item = {
        cloudCategory: '',
        disk: 50
      }
      if (this.dialog.row.subLocation.isPublic && this.dialog.row.publicDataDiskTypeList.length) {
        // 第一块磁盘 || 系统盘 || 默认第一个类型
        item.cloudCategory = this.configs.addDiskList[0]?.cloudCategory || this.dialog.row.publicDataDiskTypeList[0].value
      }
      this.configs.addDiskList.push(item)
    },
    handleSub(index) {
      this.configs.addDiskList.splice(index, 1)
    },
    handleSubmit() {
      this.$emit('success', this.dialog.index)
      this.dialog.visible = false
    }
  }
}
</script>
