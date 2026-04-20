<template>
  <div>
    <basic-form-item label="镜像：">
      <el-select class="w" v-model="addData.configs.osCategory" placeholder="请选择" @change="getVersionList(true)">
        <el-option v-for="(item, index) in osList" :key="index" :label="item" :value="item"> </el-option>
      </el-select>
      <el-select class="w m-l-md" v-model="addData.configs.osVersion" placeholder="请选择" @change="getImage(true)">
        <el-option v-for="(item, index) in versionList" :key="index" :label="item" :value="item"> </el-option>
      </el-select>
      <slot name="imageSize"></slot>
    </basic-form-item>
  </div>
</template>
<script>
import { conditionImage } from 'services/platform/index'
import { getCategoriesByCode, getSkus } from 'services/services/product'
import { getPortGroup } from 'services/platform/fc'
import { formatEqParams } from 'utils'

export default {
  props: {
    addData: {
      type: Object
    },
    elements: {
      type: Array
    },
    systemElement: {
      type: Object
    }
  },
  data() {
    return {
      imageData: {},
      osList: [],
      versionList: [],
      categoryList: [],
      portGroupList: []
    }
  },
  created() {
    this.getCategoryList()
  },
  computed: {},
  watch: {
    'addData.location.vendorId'() {
      this.addData.configs.osCategory = ''
      this.addData.configs.osVersion = ''
      this.addData.configs.imageId = ''
      this.getCategoryList()
    }
  },
  methods: {
    getOsList() {
      conditionImage({
        condition: 'listTenantImages',
        vendorId: this.addData.location.vendorId
      }).then((data) => {
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
      this.$emit('getImageSize', obj.volumes[0]?.size)
      this.addData.configs.imageId = obj.id
      this.addData.configs.templateId = obj.templateId
      this.addData.addDiskList = []
      this.$set(this.addData.configs, 'networkCards', obj.networkCards)
      this.$set(this.addData.configs, 'diskType', obj.volumes[0]?.thinlyProvisioned ? '2' : obj.volumes[0]?.volumeType)
      this.$set(
        this.addData.configs,
        'networkCardConfigs',
        obj.networkCards.map((item) => {
          return {
            sequenceNum: item.number,
            vringbuf: item.vringbuf,
            queues: item.queues,
            enableSecurityGroup: item.enableSecurityGroup,
            portGroupId: item.portGroupId,
            portGroupName: item.portGroupName,
            switcherId: item.switcherId,
            type: '1',
            securityGroupUuid: item.securityGroupUuid
          }
        })
      )
      this.elements[2].elements = []
      obj.volumes.forEach((item) => {
        const { size, persistentDisk, indepDisk, volumeType, thinlyProvisioned } = item
        const obj = {
          disk: size,
          diskCategory: {
            persistentDisk,
            indepDisk
          },
          diskType: thinlyProvisioned ? '2' : volumeType
        }

        for (let index = 0; index < this.categoryList.length; index++) {
          const element = this.categoryList[index]
          let code = ''
          if (persistentDisk && indepDisk) {
            code = 'INDEPPERSISTENT'
          } else if (persistentDisk) {
            code = 'PERSISTENT'
          } else {
            code = 'INDEP'
          }
          if (code == element.code) {
            if (item.bootVolume) {
              this.$set(this.elements[1], 'categoryId', element.id)
              this.$set(this.elements[1], 'pciType', 'VIRTIO')
              this.getSku(this.elements[1], item)
            } else {
              const result = {
                ...element,
                ...obj,
                serviceCode: 'fusionsphere.standard.volume',
                categoryId: element.id,
                categoryMap: this.elements[2].categoryMap,
                pciType: 'VIRTIO'
              }
              this.getSku(result, item)
              this.elements[2].elements.push(result)
            }
          }
          break
        }
        //   for (let index = 0; index < this.elements[1].skuList.length; index++) {
        //     const element = this.elements[1].skuList[index];
        //     let spec = element.spec
        //     if (typeof spec == 'string') {
        //       spec = JSON.parse(element.spec)
        //     }
        //     if (spec.specValue == size) {
        //       this.$set(this.elements[1], 'skuId', element.id)
        //     }
        //     break
        //   }
      })
    },
    // 获取商品的sku
    getSku(item, row) {
      const { categoryId, skuId } = item
      this.loading = true
      getSkus(formatEqParams({ categoryId }))
        .then((data) => {
          if (data.success) {
            if (!data.data.length) return this.$message.error('该产品类型下不存在产品，请检查')
            const specArr = data.data.map((item) => {
              const obj = JSON.parse(item.spec)
              return Number(obj[0].specValue)
            })
            if (specArr.indexOf(row.size) == -1) {
              return this.$message.error(`当前镜像的磁盘大小为${row.size}GB，没有对应的云硬盘规格，请在【管理端-服务运营-规格管理-存储-FusionSphere云硬盘】配置对应的云硬盘规格`)
            } else {
              const index = specArr.indexOf(row.size)
              item.skuId = data.data[index].id
            }
            // if (!skuId) {
            //   const cell = data.data[0]
            //   item.skuId = cell.id
            // }
            this.$set(
              item,
              'skuList',
              data.data.map((item) => {
                const spec = JSON.parse(item.spec)
                return {
                  ...item,
                  spec
                }
              })
            )
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 获取服务类型
    getCategoryList() {
      getCategoriesByCode('fusionsphere.standard.volume').then((data) => {
        if (data.success) {
          this.getOsList()
          if (!data.data.length) return this.$message.error('该服务不存在产品类型请检查')
          this.categoryList = data.data
          // this.item.categoryMap = this.getCategoryMap(data.data)
        }
      })
    },
    // 获取网卡名称
    async getPortGroupList(id) {
      const {
        data: { rows }
      } = await getPortGroup({ page: 1, rows: 9999, params: this.$tools.handleSearchParam({ vendorId: this.addData.location.vendorId, switcherId: id }) })
      console.log(rows)
      return rows
    }
  }
}
</script>
<style lang="scss" scoped>
.w {
  width: 280px !important;
}
</style>
