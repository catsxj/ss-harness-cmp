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
import { element } from '../data/init'
export function transformNetworkConfig(netConfig) {
  // 创建一个空数组来存放转换后的结果
  const result = []

  // 遍历对象的每个键值对
  for (const key in netConfig) {
    // 解析每个属性的值
    const configParts = netConfig[key].split(',')
    const configObj = {}
    // 遍历每个配置部分，将其转换为对象的键值对
    configParts.forEach((part) => {
      const [key, value] = part.split('=')
      configObj[key.trim()] = value ? value.trim() : '' // 确保即使没有值，也添加键
    })
    // 将转换后的对象添加到结果数组中
    result.push(configObj)
  }

  return result
}
export default {
  props: {
    addData: {
      type: Object
    },
    elements: {
      type: Object
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
    this.getOsList()
  },
  watch: {
    'addData.location.vendorId'() {
      this.addData.configs.osCategory = ''
      this.addData.configs.osVersion = ''
      this.addData.configs.imageId = ''
      this.getOsList()
    }
  },
  methods: {
    getOsList() {
      if (!this.addData.location.vendorId) return
      const params = {
        condition: 'listTenantImages',
        vendorId: this.addData.location.vendorId
      }
      if (this.addData.location.vendorType === 'SANGFOR') {
        if (!this.addData.location.azUuid) return
        params.azUuid = this.addData.location.azUuid
      }
      conditionImage(params).then((data) => {
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
        this.getImage(true)
      } else {
        this.getImage(false)
      }
    },
    getImage(flag) {
      const obj = this.imageData[this.addData.configs.osCategory][this.addData.configs.osVersion][0]
      this.addData.configs.imageId = obj.id
      this.addData.configs.templateDisk = obj.templateDisk || 50 // cloudtower 镜像中可能没系统盘大小
      if (this.addData.location.vendorType == 'SANGFOR') {
        this.addData.configs.vmUuid = obj.imageUuid
        if (flag && this.addData.configs.networkCardConfigs.length == 0) {
          const hardware_status = JSON.parse(obj.detail || '{}')?.hardware_status
          if (!hardware_status) return this.$message.error('镜像缺少网卡，请检查镜像是否正确')
          const configs = transformNetworkConfig(hardware_status).map((item) => ({
            ipPolicy: 'Auto',
            ipPoolId: '',
            address: [],
            loading: false
          }))
          this.$set(this.addData.configs, 'networkCardConfigs', configs)
        }
        return
      }
      if (this.addData.location.vendorType == 'VMWARE') {
        if (flag && (this.addData.configs.networkCardConfigs.length == 0 || this.addData.configs.networkCardConfigs[0].networkCardId != obj.networkCards?.[0]?.id)) {
          if (!obj.networkCards?.length) this.$message.error('镜像缺少网卡，请检查镜像是否正确')
          this.$set(
            this.addData.configs,
            'networkCardConfigs',
            obj.networkCards.map((item) => {
              return {
                networkCardId: item.id,
                ipPolicy: 'Auto',
                ipPoolId: '',
                address: [],
                portGroupId: '',
                checkIpv6: false,
                ipv6PoolId: '',
                ipv6Policy: 'Auto',
                ipv6Address: [],
                loading: false
              }
            })
          )
        }
      } else if (this.addData.location.vendorType == 'INSPURRAIL') {
        if (flag && (this.addData.configs.networkCardConfigs.length == 0 || this.addData.configs.networkCardConfigs[0].networkCardId != obj.networkCards?.[0]?.id)) {
          if (!obj.networkCards?.length) this.$message.error('镜像缺少网卡，请检查镜像是否正确')
          this.$set(
            this.addData.configs,
            'networkCardConfigs',
            obj.networkCards.map((item) => {
              return {
                networkCardId: item.id,
                ipPolicy: 'Auto',
                ipPoolId: '',
                address: [],
                portGroupId: '',
                checkIpv6: false,
                ipv6PoolId: '',
                ipv6Policy: 'Auto',
                ipv6Address: [],
                loading: false
              }
            })
          )
        }
      } else if (this.addData.location.vendorType == 'CLOUDTOWER') {
        // 系统盘大小
        this.$set(this.elements, 'insAmount', this.addData.configs.templateDisk)
        if (flag) {
          this.addData.configs.networkCardConfigs.map((item) => {
            item.networkId = obj.networkId
          })
        }
      } else if (this.addData.location.vendorType === 'CNWARE') {
        const res = JSON.parse(obj.configuration).devices.map((d) => {
          if (d.capacity) {
            const size = Number(d.capacity) / 1024 / 1024 / 1024
            // 系统盘大小
            this.addData.configs.templateDisk = size
            this.$set(this.elements, 'insAmount', size)
          }
          return {
            ...d
          }
        })
        if (flag) {
          this.addData.configs.sysDiskList = res.flat()
        }
      } else if (flag && this.addData.location.vendorType == 'SMARTX' && (this.addData.configs.networkCardConfigs.length == 0 || this.addData.configs.networkCardConfigs[0].networkCardId != obj.networkCards[0]?.id)) {
        const [{ id: categoryId }] = this.elements.categoryList
        this.elements.elements = obj.volumes.map((volume) => {
          return {
            ...element,
            name: '系统盘',
            categoryId,
            categoryMap: this.elements.categoryMap,
            serviceCode: 'smartx.standard.volume',
            insAmount: volume.size,
            skuList: this.elements.skuList
          }
        })
        this.$set(
          this.addData.configs,
          'networkCardConfigs',
          obj.networkCards.map((item) => {
            return {
              networkCardId: item.id,
              ipPolicy: 'Auto',
              ipPoolId: '',
              address: [],
              netmask: [],
              portGroupId: ''
            }
          })
        )
      }
    }
  }
}
</script>
