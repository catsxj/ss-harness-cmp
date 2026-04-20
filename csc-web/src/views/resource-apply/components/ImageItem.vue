<template>
  <div>
    <basic-form-item label="镜像：">
      <el-select class="w fix-select" v-model="addData.configs.osCategory" placeholder="请选择" @change="getVersionList(true)">
        <el-option v-for="(item, index) in osList" :key="index" :label="item" :value="item"> </el-option>
      </el-select>
      <el-select class="w m-l-md" v-model="addData.configs.osVersion" placeholder="请选择" @change="getImage(true)">
        <el-option v-for="(item, index) in versionList" :key="index" :label="item" :value="item"> </el-option>
      </el-select>
    </basic-form-item>
  </div>
</template>
<script>
import { getDictionaries, conditionImage } from 'services/platform/index'

export default {
  props: {
    addData: {
      type: Object
    },
    type: {
      type: String
    }
  },
  data() {
    return {
      osList: [],
      versionList: [],
      imageData: {}
    }
  },
  created() {
    this.getOsList(true)
  },
  watch: {
    'addData.location.vendorId'() {
      this.getOsList(false)
    }
  },
  methods: {
    getOsList(flag) {
      const {
        location: { vendorId }
      } = this.addData
      conditionImage({
        condition: 'listsoftImages',
        vendorId,
        service: this.type
      }).then(data => {
        if (data.success) {
          this.imageData = data.data
          this.osList = Object.keys(this.imageData)
          if (!this.addData.configs.osCategory || !flag) {
            this.addData.configs.osCategory = this.osList[0]
            this.addData.configs.osVersion = ''
          }
          this.versionList = []
          this.getVersionList(!this.addData.configs.osVersion)
        }
      })
    },
    getVersionList(flag) {
      this.versionList = this.imageData[this.addData.configs.osCategory]
      if (flag) {
        this.addData.configs.osVersion = this.versionList.length ? this.versionList[0] : ''
        this.getImage(true)
      } else {
        this.getImage(false)
      }
    },
    getImage(flag) {
      const {
        location: { vendorId },
        configs: { osCategory, osVersion }
      } = this.addData
      if (!vendorId || !osCategory || !osVersion) return
      conditionImage({
        condition: 'listByService',
        vendorId,
        osCategory,
        osVersion,
        serviceType: this.type
      }).then(data => {
        this.addData.configs.imageId = ''
        if (data.success) {
          this.addData.configs.imageId = data.data.id
          this.addData.configs.templateDisk = data.data.templateDisk || data.data.size || 50
          if (flag && this.addData.location.vendorType == 'VMWARE' && (this.addData.configs.networkCardConfigs.length == 0 || this.addData.configs.networkCardConfigs[0].networkCardId != data.data.networkCards[0].id)) {
            this.$set(
              this.addData.configs,
              'networkCardConfigs',
              data.data.networkCards.map(item => {
                return {
                  networkCardId: item.id,
                  ipPolicy: 'Auto',
                  ipPoolId: '',
                  address: [],
                  portGroupId: '',
                  loading: false
                }
              })
            )
          }
        } else {
          this.$set(this.addData.configs, 'networkCardConfigs', [])
        }
      })
    }
  }
}
</script>
