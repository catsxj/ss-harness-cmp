<template>
  <div>
    <el-dialog title="新增磁盘" :visible.sync="dialog.dialog" width="60%">
      <el-form label-width="100px" :model="addData.configs" ref="data">
        <el-row :gutter="20">
          <el-col :span="24">
            <cmp-form-item label="名称：" validate="required" prop="name">
              <el-input v-model="addData.configs.name" placeholder="请输入名称"></el-input>
            </cmp-form-item>
          </el-col>
        </el-row>
        <el-row>
          <cmp-form-item label="创建方式：">
            <el-radio-group v-model="type" size="medium">
              <el-radio-button label="new">新盘</el-radio-button>
              <el-radio-button label="snapshot">快照</el-radio-button>
            </el-radio-group>
          </cmp-form-item>
        </el-row>
        <el-row v-if="type == 'snapshot'" key="snapshot1">
          <el-col :span="24">
            <cmp-form-item label="快照：" prop="snapshotId" validate="required">
              <el-select v-model="addData.configs.snapshotId" @change="getSnapshotPrice">
                <el-option v-for="item in snapshotList" :label="item.name" :value="item.id" :key="item.value"></el-option>
              </el-select>
            </cmp-form-item>
          </el-col>
        </el-row>
        <el-row v-if="type == 'new'" key="category">
          <el-col :span="24">
            <cmp-form-item label="磁盘类别：" prop="azurecategory" validate="required">
              <el-select v-model="addData.configs.azurecategory" placeholder="请先选择磁盘类别" @change="getPirce">
                <el-option v-for="item in categoryData" :label="item.name" :value="item.value" :key="item.value"></el-option>
              </el-select>
            </cmp-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="type == 'new'" key="size">
          <el-col :span="24">
            <cmp-form-item label="容量(GB)：">
              <el-select v-model="currentElement.insAmount" @change="price = setPrice(sizeList.find((item) => item.size == currentElement.insAmount))">
                <el-option v-for="(item, index) in sizeList" :label="`${item.size}GB`" :value="item.size" :key="index"></el-option>
              </el-select>
            </cmp-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="type == 'new'" key="diskEncryptionUuid">
          <el-col :span="24">
            <cmp-form-item label="加密方式：" prop="diskEncryptionUuid" v-show="false">
              <el-select v-model="addData.configs.diskEncryptionUuid" clearable>
                <el-option v-for="item in encryptions" :label="item.name" :value="item.id" :key="item.id"></el-option>
              </el-select>
            </cmp-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <cmp-form-item label="描述：" prop="remark">
              <el-input type="textarea" v-model="addData.configs.remark" placeholder="请输入描述"></el-input>
            </cmp-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="dialog.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getRegion, getSnapshot, getDict, getDiskEncryptions } from 'services/platform/index'
import { getResource, getVolumePirce } from 'services/platform/azure'
import { getSysconfCode, login } from 'services/system/index'
import { applyResource, getSlaDetail } from 'services/services/product'
import { add, element } from '../../data/publicInit'
/* global $ */
export default {
  props: {
    dialog: {
      type: Object,
      default: function () {
        return {
          data: {
            labelIds: []
          },
          dialog: false
        }
      }
    }
  },
  data() {
    return {
      loading: false,
      elements: [
        {
          ...element,
          name: '云硬盘',
          serviceCode: 'azure.standard.volume',
          insAmount: '',
          main: true
        }
      ],
      addData: {
        ...this._.cloneDeep(add),
        service: 'azure.standard.volume',
        configs: {
          size: 1
        }
      },
      categoryData: [
        { name: '标准 HDD', value: 'Standard_LRS' },
        { name: '标准 SSD', value: 'StandardSSD_LRS' },
        { name: '高级 SSD', value: 'Premium_LRS' }
        // { name: '超级 SSD', value: 'UltraSSD_LRS' }
      ],
      minSize: 1,
      resourceData: [],
      maxSize: 0,
      type: 'new',
      snapshotList: [],
      diskPrice: 0,
      snapshotPrice: 0,
      disCount: {
        name: 1
      },
      sizeList: [],
      price: 0,
      encryptions: []
    }
  },
  computed: {
    currentElement() {
      return this.elements[0]
    }
  },
  created() {
    this.getDisCount()
    this.getSnapshot()
    this.getDiskEncryptions()
    getSysconfCode({ code: 'DefaultDiskSize' }).then((data) => {
      if (data.success) {
        this.maxSize = Number(data.data)
      }
    })
  },
  watch: {
    // 后端特殊要求
    'elements.0.insAmount'() {
      this.addData.configs.size = this.currentElement.insAmount
    },
    'dialog.data.location.az'() {
      this.addData.configs.regionId = this.addData.configs.region
      this.addData.configs.zoneId = this.addData.configs.az
    }
  },
  methods: {
    getDiskEncryptions() {
      getDiskEncryptions({
        vendorId: this.dialog.data.location.vendorId,
        regionId: this.dialog.data.location.region
      }).then((data) => {
        if (data.success) {
          this.encryptions = data.data
        }
      })
    },
    setPrice(obj) {
      return obj.unitPrice * this.disCount.name
    },
    getPirce() {
      this.sizeList = []
      this.currentElement.insAmount = ''
      getVolumePirce({
        category: this.addData.configs.azurecategory,
        regionId: this.dialog.data.location.region
      }).then((data) => {
        if (data.success) {
          this.sizeList = data.data
          const obj = { size: '', unitPrice: 0, ...this.sizeList.find((item) => item.size) }
          this.currentElement.insAmount = obj.size
          this.price = this.setPrice(obj)
        }
      })
    },
    getSnapshotPrice() {
      const obj = this.snapshotList.find((item) => item.id == this.addData.configs.snapshotId)
      getVolumePirce({
        category: obj.category,
        regionId: this.dialog.data.location.region
      }).then((data) => {
        if (data.success) {
          this.price = this.setPrice({ unitPrice: 0, ...this.sizeList.find((item) => item.size) })
        }
      })
    },
    getResource() {
      const params = {
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.dialog.data.location.vendorId }, sign: 'EQ' }])
      }
      getResource(params).then((data) => {
        if (data.success) {
          this.resourceData = data.data.rows
          if (this.addData.configs.azureResourceGroupName) this.addData.configs.azureResourceGroupName = ''
        }
      })
    },
    getSnapshot() {
      getSnapshot({
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.dialog.data.location.vendorId, regionId: this.dialog.data.location.region }, sign: 'EQ' }])
      }).then((data) => {
        if (data.success) {
          this.snapshotList = data.data.rows
          if (this.addData.configs.snapshotId) {
            this.snapshotPrice = 0
            this.addData.configs.snapshotId = ''
          }
        }
      })
    },
    getList() {
      this.getResource()
      if (this.addData.configs.azurecategory) this.getPirce()
    },
    getParams() {
      let data = false
      this.$refs.data.validate((valid) => {
        if (valid) {
          if (!this.currentElement.insAmount && this.type == 'new') return this.$message.error('请选择容量大小')
          data = {
            regionId: this.dialog.data.location.region,
            zoneId: this.dialog.data.location.az
          }
          if (this.type == 'new') {
            this.addData.configs.snapshotId = ''
          } else {
            const obj = this.snapshotList.find((item) => item.id == this.addData.configs.snapshotId)
            this.currentElement.insAmount = obj.size
          }
        }
      })
      return data
    },
    getDisCount() {
      getDict().then((data) => {
        if (data.success) {
          this.disCount = data.data.find((item) => item.value == 'PARITIES')
        }
      })
    },
    ok() {
      this.$refs.data.validate((valid) => {
        if (valid) {
          const postData = this.handlePostData()
          this.loading = true
          applyResource(postData)
            .then((data) => {
              if (data.success) {
                this.$message.success(data.message)
                this.$emit('back')
                this.dialog.dialog = false
              }
              this.loading = false
            })
            .catch(() => {
              this.loading = false
            })
        }
      })
    },
    getSkuParams(data) {
      const params = []
      data.forEach((item) => {
        // 忽略此elements
        if (item.ignore) return
        const { serviceCode, elements } = item
        // 如果存在子节点对子节点进行处理
        if (elements) {
          const returnData = this.getSkuParams(elements)
          params.push(...returnData)
          return
        }
        const result = {
          serviceCode
        }
        params.push(result)
      })
      return params
    },
    handlePostData() {
      const config = this.getParams()
      // 校验不通过
      if (!config) return false
      this.addData.configs = {
        ...this.addData.configs,
        ...config,
        azureResourceGroupName: this.dialog.data.azureResourceGroupName
      }
      const {
        emption,
        configs,
        serviceItem: { sla },
        service
      } = this.addData
      const elements = this.getSkuParams(this.elements)
      const { location } = this.dialog.data
      return {
        location,
        emption,
        configs,
        elements,
        sla,
        service
      }
    }
  }
}
</script>

<style></style>
