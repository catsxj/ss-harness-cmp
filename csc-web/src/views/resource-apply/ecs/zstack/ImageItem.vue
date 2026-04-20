<template>
  <div>
    <basic-form-item label="镜像：" prop="configs.osCategory" validate="required">
      <el-select class="w fix-select" v-model="addData.configs.osCategory" placeholder="请选择" @change="getVersionList(true)">
        <el-option v-for="(item, index) in osList" :key="index" :label="item" :value="item"> </el-option>
      </el-select>
      <el-select class="w m-l-md" v-model="addData.configs.osVersion" placeholder="请选择" @change="getImage(true)">
        <el-option v-for="(item, index) in versionList" :key="index" :label="item" :value="item"> </el-option>
      </el-select>
      <span class="tip m-l-xs">*当前镜像要求系统盘最小为{{ addData.templateDisk }}GB</span>
    </basic-form-item>
  </div>
</template>
<script>
import request from 'utils/request'

export default {
  props: {
    addData: {
      type: Object
    },
    elements: {
      type: Object
    },
    vendorType: {
      type: String,
      default: 'zstack'
    }
  },
  data() {
    return {
      imageData: {},
      osList: [],
      versionList: []
    }
  },
  created() {
    this.addData.location.vendorId && this.getOsList()
  },
  watch: {
    'addData.location.vendorId': function () {
      this.getOsList()
    }
  },
  methods: {
    getOsList() {
      request(`/cmp/plugins/${this.vendorType}/v1/images/condition`, {
        params: {
          condition: JSON.stringify({
            condition: 'listTenantImages',
            vendorId: this.addData.location.vendorId
          })
        }
      }).then(data => {
        if (data.success) {
          this.imageData = data.data
          this.osList = Object.keys(this.imageData)
          if (!this.addData.configs.osCategory) {
            this.addData.configs.osCategory = this.osList[0]
            this.addData.configs.osVersion = ''
          }
          this.versionList = []
          this.getVersionList(!this.addData.configs.osVersion)
        }
      })
    },
    getVersionList(flag) {
      this.versionList = Object.keys(this.imageData[this.addData.configs.osCategory])
      if (flag) {
        this.addData.configs.osVersion = this.versionList[0]
        this.getImage()
      } else {
        this.getImage()
      }
    },
    getImage() {
      const { osCategory, osVersion } = this.addData.configs
      const obj = this.imageData[osCategory][osVersion][0]
      this.addData.configs.imageId = obj.id
      this.addData.templateDisk = obj.size
    }
  }
}
</script>
