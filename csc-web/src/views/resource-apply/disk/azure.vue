/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <common-wrapper @vendorId="getList" :add-data="addData" ref="common" :elements="elements" :get-params="getParams">
    <div class="item-block">
      <h5>配置信息</h5>
      <basic-form :model="addData.configs" ref="addForm" label-position="left">
        <el-row :gutter="20">
          <el-col :span="10">
            <basic-form-item label="名称：" validate="required" prop="name">
              <el-input v-model="addData.configs.name" placeholder="请输入名称" class="basic-cmp"></el-input>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="10">
            <basic-form-item label="资源组：" prop="azureResourceGroupName" validate="required" required-message="该字段为必填字段">
              <el-select v-model="addData.configs.azureResourceGroupName" @change="getSnapshot" class="basic-cmp">
                <el-option v-for="item in resourceData" :label="item.name" :value="item.name" :key="item.id"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row>
          <basic-form-item label="创建方式">
            <el-radio-group v-model="crateType" size="medium">
              <el-radio-button label="new">新盘</el-radio-button>
              <el-radio-button label="snapshot">快照</el-radio-button>
            </el-radio-group>
          </basic-form-item>
        </el-row>
        <el-row v-if="crateType == 'snapshot'" key="snapshot1">
          <el-col :span="10">
            <basic-form-item label="快照：" prop="snapshotId" validate="required">
              <el-select v-model="addData.configs.snapshotId" @change="getSnapshotPrice" class="basic-cmp">
                <el-option v-for="item in snapshotList" :label="item.name" :value="item.id" :key="item.value"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row v-if="crateType == 'new'" key="category">
          <el-col :span="10">
            <basic-form-item label="磁盘类别：" prop="azurecategory" validate="required">
              <el-select v-model="addData.configs.azurecategory" placeholder="请先选择磁盘类别" @change="getPirce" class="basic-cmp">
                <el-option v-for="item in categoryData" :label="item.name" :value="item.value" :key="item.value"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="crateType == 'new'" key="size">
          <el-col :span="10">
            <basic-form-item label="容量(GB)：">
              <el-select v-model="currentElement.insAmount" @change="price = setPrice(sizeList.find(item => item.size == currentElement.insAmount))" class="basic-cmp">
                <el-option v-for="(item, index) in sizeList" :label="`${item.size}GB`" :value="item.size" :key="index"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="crateType == 'new'" key="encryptions">
          <el-col :span="10">
            <basic-form-item label="加密方式" prop="diskEncryptionUuid" v-show="false">
              <el-select v-model="addData.configs.diskEncryptionUuid" clearable class="basic-cmp">
                <el-option v-for="item in encryptions" :label="item.name" :value="item.id" :key="item.id"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="10">
            <basic-form-item label="描述：" prop="remark">
              <el-input type="textarea" v-model="addData.configs.remark" placeholder="请输入描述"></el-input>
            </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
      <div slot="preview-card">
        <basic-form-item label="磁盘价格："> {{ price.toFixed(2) }}元/月 </basic-form-item>
        <basic-form-item label="预估总价："> {{ price.toFixed(2) }}元/月 </basic-form-item>
      </div>
    </div>
  </common-wrapper>
</template>

<script>
import CommonWrapper from '../components/PublicCommonWrapper.vue'
import { add, element } from './../data/publicInit'
import { getRegion, getSnapshot, getDict, getDiskEncryptions } from 'services/platform/index'
import { getResource, getVolumePirce } from 'services/platform/azure'
import { getSysconfCode, login } from 'services/system/index'
import { cloneDeep } from 'lodash-es'

export default {
  components: { CommonWrapper },
  props: {
    type: {
      type: String
    },
    itemData: {
      type: [Object, Boolean]
    },
    disabled: {
      type: Boolean
    }
  },
  data() {
    return {
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
        ...cloneDeep(add),
        location: {
          ...add.location,
          vendorType: this.type
        },
        service: 'azure.standard.volume',
        configs: {
          resourceLabel: [],
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
      crateType: 'new',
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
    getSysconfCode({ code: 'DefaultDiskSize' }).then(data => {
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
    'addData.location.az'() {
      this.addData.configs.regionId = this.addData.configs.region
      this.addData.configs.zoneId = this.addData.configs.az
    }
  },
  methods: {
    setPrice(obj) {
      return obj.unitPrice * this.disCount.name
    },
    getPirce() {
      this.sizeList = []
      this.currentElement.insAmount = ''
      getVolumePirce({
        category: this.addData.configs.azurecategory,
        regionId: this.addData.location.region
      }).then(data => {
        if (data.success) {
          this.sizeList = data.data
          const obj = { size: '', unitPrice: 0, ...this.sizeList.find(item => item.size) }
          this.currentElement.insAmount = obj.size
          this.price = this.setPrice(obj)
        }
      })
    },
    getSnapshotPrice() {
      const obj = this.snapshotList.find(item => item.id == this.addData.configs.snapshotId)
      getVolumePirce({
        category: obj.category,
        regionId: this.addData.location.region
      }).then(data => {
        if (data.success) {
          this.price = this.setPrice({ unitPrice: 0, ...this.sizeList.find(item => item.size) })
        }
      })
    },
    getResource() {
      const params = {
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.location.vendorId }, sign: 'EQ' }])
      }
      getResource(params).then(data => {
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
        params: JSON.stringify([{ param: { vendorId: this.addData.location.vendorId, regionId: this.addData.location.region }, sign: 'EQ' }])
      }).then(data => {
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
      this.getDiskEncryptions()
      if (this.addData.configs.azurecategory) this.getPirce()
    },
    getDiskEncryptions() {
      getDiskEncryptions({
        vendorId: this.addData.location.vendorId,
        regionId: this.addData.location.region
      }).then(data => {
        if (data.success) {
          this.encryptions = data.data
        }
      })
    },
    getParams() {
      let data = false
      this.$refs.addForm.validate(valid => {
        if (valid) {
          if (!this.currentElement.insAmount && this.type == 'new') return this.$message.error('请选择容量大小')
          data = {
            regionId: this.addData.location.region,
            zoneId: this.addData.location.az
          }
          if (this.crateType == 'new') {
            this.addData.configs.snapshotId = ''
          } else {
            const obj = this.snapshotList.find(item => item.id == this.addData.configs.snapshotId)
            this.currentElement.insAmount = obj.size
          }
        }
      })
      return data
    },
    getDisCount() {
      getDict().then(data => {
        if (data.success) {
          this.disCount = data.data.find(item => item.value == 'PARITIES')
        }
      })
    }
  }
}
</script>

<style scoped lang="scss"></style>
