<template>
  <div>
    <el-dialog title="新增存储账户" :visible.sync="addData.dialog" width="40%">
      <el-row>
        <el-form label-width="150px" :model="addData.data" ref="data">
          <vendor :add-data="addData.data" @vendorId="getResource"></vendor>
          <el-col :span="24">
            <basic-form-item label="资源组：" prop="resourceGroupId" validate="required" required-message="该字段为必选字段">
              <el-select v-model="addData.data.resourceGroupId">
                <el-option v-for="item in resourceData" :label="item.name" :value="item.id" :key="item.id"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="20">
            <basic-form-item label="名称：" prop="name" validate="required,account" required-message="请输入名称">
              <el-input v-model="addData.data.name" @blur="resetCheck"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="4">
            <el-button class="m-l" type="primary" @click="checkName">校验</el-button>
          </el-col>
          <el-col :span="24">
            <el-form-item label="性能：">
              <el-radio-group v-model="radio" @change="setKind">
                <el-radio label="standard">标准</el-radio>
                <!-- <el-radio label="Premium">高级</el-radio> -->
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="账户类型：" prop="kind" validate="required" required-message="该字段为必选字段">
              <el-select v-model="addData.data.kind" @change="addData.data.sku = skuList[radio].find(row => row.value == addData.data.kind).list[0]">
                <el-option v-for="(item, index) in skuList[radio]" :label="item.name" :value="item.value" :key="index"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="访问层：" prop="accessTier" validate="required">
              <el-select v-model="addData.data.accessTier" @change="getPirce">
                <el-option label="冷" value="Cool"></el-option>
                <el-option label="热" value="Hot"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="冗余：" prop="sku" validate="required" required-message="该字段为必选字段">
              <el-select v-model="addData.data.sku" @change="getPirce">
                <el-option v-for="(item, index) in skuList[radio].find(row => row.value == addData.data.kind).list" :label="kindFliter[item]" :value="item" :key="index"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <!-- <el-col :span="24" v-if="radio == 'standard'">
            <el-form-item>
              <span slot="label">
                存储费用：
                <el-tooltip class="item" effect="dark" placement="top-start">
                  <div slot="content">采用按量付费（流量月结）的计费方式，5GB以下流出流量免费<br/>最终费用以实际使用量为准</div>
                  <i class="el-icon-question"></i>
                </el-tooltip>
              </span>
              <price2 :price-data="priceData" v-if="priceData"><span slot="unit"> 元/1GB/月</span></price2>
            </el-form-item>
          </el-col> -->
          <!-- <el-col :span="24">
            <el-form-item>
              <span slot="label">
                Put类写入操作：
              </span>
              <price2 :price-data="putpriceData" v-if="putpriceData"><span slot="unit"> 元/万次</span></price2>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item>
              <span slot="label">
                List&Create类操作：
              </span>
              <price2 :price-data="listpriceData" v-if="listpriceData"><span slot="unit"> 元/万次</span></price2>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item>
              <span slot="label">
                Get类读取操作：
              </span>
              <price2 :price-data="getpriceData" v-if="getpriceData"><span slot="unit"> 元/万次</span></price2>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item>
              <span slot="label">
                所有其他操作：
              </span>
              <price2 :price-data="otherpriceData" v-if="otherpriceData"><span slot="unit"> 元/万次</span></price2>
            </el-form-item>
          </el-col> -->
        </el-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok" :loading="loading" :disabled="!nameCheck">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { getResource, createAccount, chcekStorageName, getAccountPirce } from 'services/platform/azure'
import vendor from '@/components/setVendor/index.vue'
export default {
  components: { vendor },
  props: {
    addData: {
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
      regionList: [],
      resourceData: [],
      loading: false,
      radio: 'standard',
      skuList: {
        standard: [
          // { name: 'Storage（通用版v1）', value: 'Storage', list: ['Standard_LRS', 'Standard_GRS', 'Standard_RAGRS'] },
          // { name: 'StorageV2（通用版v2）', value: 'StorageV2', list: ['Standard_LRS', 'Standard_ZRS', 'Standard_GRS', 'Standard_RAGRS'] }
          // { name: 'BlobStorage', value: 'BlobStorage', list: ['Standard_LRS', 'Standard_GRS', 'Standard_RAGRS'] }
          { name: 'StorageV2（通用版v2）', value: 'StorageV2', list: ['Standard_LRS'] }
        ],
        Premium: [
          // { name: 'Storage（通用版v1）', value: 'Storage', list: ['Premium_LRS'] },
          { name: 'StorageV2（通用版v2）', value: 'StorageV2', list: ['Premium_LRS'] }
        ]
      },
      kindFliter: {
        Standard_LRS: '本地冗余存储(LRS)',
        Standard_GRS: '异地冗余存储(GRS)',
        Standard_ZRS: '区域冗余存储(ZRS)',
        Standard_RAGRS: '读取访问异地冗余存储(RA-GRS)',
        Premium_LRS: '本地冗余存储(LRS)'
      },
      nameCheck: false,
      priceData: {},
      putpriceData: {},
      listpriceData: {},
      getpriceData: {},
      otherpriceData: {}
    }
  },
  methods: {
    getPirce() {
      this.getAccountPrice()
      // this.getPutPrice()
      // this.getListPrice()
      // this.getGetPrice()
      // this.getOtherPrice()
    },
    getAccountPrice() {
      const params = {
        regionId: this.addData.data.regionId,
        sku: this.addData.data.sku,
        accessTier: this.addData.data.accessTier,
        type: 'Data'
      }
      if (this.addData.data.accessTier !== 'Cool') {
        params.tierMinimumUnits = '51200'
      } else {
        params.tierMinimumUnits = '0'
      }
      getAccountPirce(params).then(data => {
        if (data.success) {
          this.priceData = data.data.find(item => item.unitPrice)
        }
      })
    },
    getPutPrice() {
      getAccountPirce({
        regionId: this.addData.data.regionId,
        sku: this.addData.data.sku,
        type: 'Write',
        tierMinimumUnits: '0'
      }).then(data => {
        if (data.success) {
          this.putpriceData = data.data.find(item => item.unitPrice)
        }
      })
    },
    getListPrice() {
      getAccountPirce({
        regionId: this.addData.data.regionId,
        sku: this.addData.data.sku,
        type: 'ListAndCreate',
        tierMinimumUnits: '0'
      }).then(data => {
        if (data.success) {
          this.listpriceData = data.data.find(item => item.unitPrice)
        }
      })
    },
    getGetPrice() {
      getAccountPirce({
        regionId: this.addData.data.regionId,
        sku: this.addData.data.sku,
        type: 'Read',
        tierMinimumUnits: '0'
      }).then(data => {
        if (data.success) {
          this.getpriceData = data.data.find(item => item.unitPrice)
        }
      })
    },
    getOtherPrice() {
      getAccountPirce({
        regionId: this.addData.data.regionId,
        sku: this.addData.data.sku,
        type: 'AllOther',
        tierMinimumUnits: '0'
      }).then(data => {
        if (data.success) {
          this.otherpriceData = data.data.find(item => item.unitPrice)
        }
      })
    },
    resetCheck() {
      this.nameCheck = false
    },
    checkName() {
      if (this.addData.data.resourceGroupId && this.addData.data.name) {
        this.loading = true
        chcekStorageName({
          vendorId: this.addData.data.vendorId,
          name: this.addData.data.name,
          resourceGroupId: this.addData.data.resourceGroupId,
          regionId: this.addData.data.regionId
        }).then(data => {
          if (data.success) {
            if (!data.data.available) {
              this.$message.error('名称不可用，请重新输入')
              this.addData.data.name = ''
            } else {
              this.nameCheck = true
            }
          }
          this.loading = false
        })
      }
    },
    setKind() {
      this.addData.data.kind = this.skuList[this.radio][0].value
      this.addData.data.sku = this.skuList[this.radio].find(row => row.value == this.addData.data.kind).list[0]
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          this.loading = true
          if (this.radio == 'standard') {
            this.addData.data.skuTier = 'Standard'
          } else {
            this.addData.data.skuTier = 'Premium'
          }
          createAccount({ storageAccount: this.addData.data }).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$emit('back')
            }
            this.loading = false
          })
        }
      })
    },
    getResource() {
      this.getPirce()
      if (this.addData.data.resourceGroupId) this.addData.data.resourceGroupId = ''
      const params = {
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.data.vendorId }, sign: 'EQ' }])
      }
      getResource(params).then(data => {
        if (data.success) {
          this.resourceData = data.data.rows
        }
      })
    }
  },
  created() {}
}
</script>

<style></style>
