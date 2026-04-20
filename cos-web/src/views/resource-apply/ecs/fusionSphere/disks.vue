<template>
  <div>
    <basic-form-item label="系统盘：">
      <el-select disabled v-model="addData.configs.diskType" class="w">
        <el-option label="普通延迟置零" value="1"></el-option>
        <el-option label="普通" value="0"></el-option>
        <el-option label="精简" value="2"></el-option>
      </el-select>
      <el-select disabled v-model="systemElement.categoryId" class="w m-l-md" @change="getSku(systemElement)">
        <el-option :label="item.name" v-for="(item, index) in systemElement.categoryList" :key="index" :value="item.id"></el-option>
      </el-select>
      <el-select disabled v-model="systemElement.skuId" class="w m-l-md">
        <el-option :label="generateSpec(item.spec)" v-for="item in systemElement.skuList" :key="item.id" :value="item.id"></el-option>
      </el-select>
    </basic-form-item>
    <basic-form-item label="数据盘：" class="m-b-lg" v-if="disks.length">
      <el-row>
        <el-col :span="21" v-for="(cell, index) in disks" :key="index" class="m-b">
          <!-- <el-col :span="2">
            <el-button class="m-r-sm" type="danger" icon="el-icon-minus" @click="removeItem(index)"></el-button>
          </el-col> -->
          <el-col :span="22">
            <el-col :span="24">
              <el-select disabled v-model="cell.categoryId" @change="getSku(cell)" class="w m-r-xs">
                <el-option :label="item.name" v-for="(item, index) in categoryList" :key="index" :value="item.id"></el-option>
              </el-select>
              <el-select disabled v-model="cell.skuId" class="w m-l-md m-r">
                <el-option :label="generateSpec(item.spec)" v-for="item in cell.skuList" :key="item.id" :value="item.id"></el-option>
              </el-select>
              <!-- <basic-form-item label="总线类型:" style="display:inline-block;width: 300px" label-width="90px">
                <el-select v-model="cell.pciType" placeholder="总线类型">
                  <el-option label="VIRTIO" value="VIRTIO"></el-option>
                  <el-option label="SCSI" value="SCSI"></el-option>
                </el-select>
              </basic-form-item> -->
            </el-col>
          </el-col>
        </el-col>
        <!-- <el-col :span="4" class="add-border" :class="{'m-t-md': disks.length}" @click.native="addItem()">
          <i class="el-icon-plus"></i>
        </el-col> -->
      </el-row>
    </basic-form-item>
  </div>
</template>
<script>
import { element } from '../../data/init'
import { getCategoriesByCode, getSkus } from 'services/services/product'
import { formatEqParams } from 'utils'
import { getDictionaries, conditionVoleme } from 'services/platform/index'
import { getNics } from 'services/platform/fc'
import { generateSpec } from 'views/resource-apply/utils/index'

export default {
  props: {
    addData: {
      type: Object
    },
    systemElement: {
      type: Object
    },
    item: {
      type: Object
    },
    diskType: {
      type: String,
      default: 'sameAsSource'
    }
  },
  data() {
    return {
      categoryList: [],
      volumeList: [],
      // diskType: 'sameAsSource',
      fileList: [],
      serverId: this.addData.configs.serverId
    }
  },
  computed: {
    disks() {
      return this.item.elements
    }
  },
  created() {
    this.getVolumeList()
    this.getCategoryList()
    this.getDictionaries()
  },
  watch: {
    diskType() {
      this.disks.forEach((item) => {
        item.diskType = this.diskType
      })
    },
    volumeList() {
      if (this.volumeList.length && this.categoryList.length) {
        this.formatVolume()
      }
    },
    categoryList() {
      if (this.volumeList.length && this.categoryList.length) {
        this.formatVolume()
      }
    }
  },
  methods: {
    getVolumeList() {
      conditionVoleme({
        condition: 'listByVmId',
        serverId: this.serverId
      }).then((data) => {
        if (data.success) {
          this.volumeList = data.data
        }
      })
    },
    formatVolume() {
      this.item.elements = []
      this.volumeList.forEach((item) => {
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
              this.$set(this.systemElement, 'categoryId', element.id)
              this.getSku(this.systemElement, item.size)
            } else {
              const result = {
                ...element,
                ...obj,
                serviceCode: 'fusionsphere.standard.volume',
                categoryId: element.id,
                categoryMap: this.item.categoryMap,
                device: '',
                forceMount: false,
                pciType: 'VIRTIO'
              }
              this.item.elements.push(result)
              this.getSku(result, obj.disk)
            }
          }
          break
        }
      })
    },
    generateSpec,
    loadSku() {
      if (this.disks.length) {
        this.handleShowData()
      }
    },
    handleShowData() {
      this.disks.forEach((item) => {
        this.getSku(item)
      })
    },
    getDictionaries() {
      getDictionaries({ value: 'FS_TYPE' }).then((data) => {
        if (data.success) {
          this.fileList = data.data
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
    // 获取服务类型
    getCategoryList() {
      getCategoriesByCode('fusionsphere.standard.volume').then((data) => {
        if (data.success) {
          if (!data.data.length) return this.$message.error('该服务不存在产品类型请检查')
          this.categoryList = data.data
          this.item.categoryMap = this.getCategoryMap(data.data)
        }
      })
    },
    // 获取商品的sku
    getSku(item, size) {
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
            if (size) {
              const index = specArr.indexOf(size)
              item.skuId = data.data[index].id
            }
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
    // 生成服务类型map
    getCategoryMap(data) {
      const map = {}
      data.forEach((item) => {
        const { id, name, remark, props, code } = item
        map[id] = { name, remark, props, code }
      })
      return map
    },
    removeItem(index) {
      this.disks.splice(index, 1)
    },
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
    addItem() {
      if (this.addData.configs.createMode == 'Template') return this.$message.error('模板不可更改磁盘')
      if (this.disks.length === 4) return this.$message.error('数据盘最多可增加四个')
      const [{ id: categoryId }] = this.categoryList
      const ary = []
      this.disks.forEach((item) => {
        if (!this.setDevice(item.device) && item.device != '') ary.push({ name: item.device, value: item.device })
      })
      const result = {
        ...element,
        serviceCode: 'fusionsphere.standard.volume',
        categoryId,
        categoryMap: this.item.categoryMap,
        list: ary,
        device: '',
        forceMount: false,
        diskType: this.diskType,
        pciType: 'VIRTIO'
      }
      this.getSku(result)
      this.disks.push(result)
    }
  }
}
</script>
<style lang="scss" scoped>
.w {
  width: 100px !important;
}
.add-border {
  padding: 2px;
  cursor: pointer;
  border: 1px dashed black;
  text-align: center;
}
</style>
