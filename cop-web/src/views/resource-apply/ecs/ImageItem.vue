<template>
  <div>
    <basic-form-item label="镜像：">
      <el-select class="w"  v-model="addData.configs.osCategory" placeholder="请选择" @change="getVersionList(true)">
        <el-option v-for="(item, index) in osList" :key="index" :label="item" :value="item">
        </el-option>
      </el-select>
      <el-select class="w m-l-md"  v-model="addData.configs.osVersion" placeholder="请选择" @change="getImage(true)">
        <el-option v-for="(item, index) in versionList" :key="index" :label="item" :value="item">
        </el-option>
      </el-select>
    </basic-form-item>
  </div>
</template>
<script>
import { conditionImage } from 'services/platform/index'

export default {
  props: {
    addData: {
      type: Object
    }
  },
  data () {
    return {
      imageData: {},
      osList: [],
      versionList: []
    }
  },
  created () {
    this.getOsList()
  },
  watch: {
    'addData.location.vendorId' () {
      this.addData.configs.osCategory = ''
      this.addData.configs.osVersion = ''
      this.addData.configs.imageId = ''
      this.getOsList()
    }
  },
  methods: {
    getOsList () {
      conditionImage({
        condition: 'listTenantImages',
        vendorId: this.addData.location.vendorId
      }).then(data => {
        if (data.success) {
          this.imageData = data.data
          this.osList = Object.keys(this.imageData)
          if (!this.addData.configs.osCategory) {
            this.addData.configs.osCategory = this.osList[0];
            this.addData.configs.osVersion = ''
          }
          this.versionList = [];
          this.getVersionList(!this.addData.configs.osVersion)
        }
      })
    },
    getVersionList (flag) {
      this.versionList = Object.keys(this.imageData[this.addData.configs.osCategory])
      if (flag) {
        this.addData.configs.osVersion = this.versionList[0]
        this.getImage(true)
      } else {
        this.getImage(false)
      }
    },
    getImage (flag) {
      const obj = this.imageData[this.addData.configs.osCategory][this.addData.configs.osVersion][0]
      this.addData.configs.imageId = obj.id
      if (flag && this.addData.location.vendorType == 'VMWARE' && (this.addData.configs.networkCardConfigs.length == 0 || this.addData.configs.networkCardConfigs[0].networkCardId != obj.networkCards[0].id)) {
        this.$set(this.addData.configs, 'networkCardConfigs', obj.networkCards.map(item => {
          return {
            networkCardId: item.id,
            ipPolicy: 'Auto',
            ipPoolId: '',
            address: [],
            portGroupId: '',
            checkIpv6: false,
            ipv6PoolId: '',
            ipv6Policy: 'Auto',
            ipv6Address: []
          }
        }))
      }
    }
  }
}
</script>
