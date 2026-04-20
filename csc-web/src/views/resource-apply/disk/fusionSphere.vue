/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <common-wrapper :add-data="addData" @vendorId="getList" ref="common" vendorType="OPENSTACK" :elements="elements" :loading="loading" :get-params="getParams" :item-data="retention" :disabled="disabled" v-bind="$attrs">
    <div class="item-block">
      <h5>配置信息</h5>
      <basic-form-item label="硬盘类型：">
        <el-radio-group v-model="currentElement.categoryId" @change="getSku(currentElement)">
          <el-radio-button :label="item.id" v-for="(item, index) in currentElement.categoryList" :key="index">{{ item.name }}</el-radio-button>
        </el-radio-group>
      </basic-form-item>
      <basic-form-item label="配置：" validate="required">
        <sku-table :skus="currentElement.skuList" style="max-width: 600px" :mode="addData.emption.duration.mode" :show-price="true" :column-props="[{ label: '磁盘（GB）', value: 'disk' }]">
          <el-table-column show-overflow-tooltip label="规格名称" prop="name">
            <template v-slot="scope">
              <el-radio v-model="currentElement.skuId" :label="scope.row.id">{{ scope.row.code }}</el-radio>
            </template>
          </el-table-column>
        </sku-table>
      </basic-form-item>
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
            <basic-form-item label="类型：" prop="type" validate="required">
              <el-select filterable v-model="addData.configs.type" class="basic-cmp">
                <el-option v-for="(item, index) in typeList" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="10">
            <basic-form-item label="配置模式：" prop="diskType" validate="required">
              <el-select v-model="addData.configs.diskType" class="basic-cmp">
                <el-option label="普通延迟置零" value="1"></el-option>
                <el-option label="普通" value="0"></el-option>
                <el-option label="精简" value="2"></el-option>
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
    </div>
    <div slot="preview-card">
      <basic-form-item label="磁盘容量：">{{ addData.configs.size }}GB</basic-form-item>
    </div>
  </common-wrapper>
</template>

<script>
import CommonWrapper from 'views/resource-apply/components/CommonWrapper.vue'
import sku from './../mixins/sku'
import create from '../mixins/create'
import { add, element } from './../data/init'
import { getSnapshot, getVolume, conditionImage } from 'services/platform/index'
import { cloneDeep } from 'lodash-es'
import { getSpecValue } from 'views/resource-apply/utils/index'
import { getShoppingCartDetail } from 'services/system/shop_cart'

export default {
  components: { CommonWrapper },
  mixins: [sku, create],
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
  created() {
    if (this.itemData) {
      this.retention = this.itemData
      this.addData = cloneDeep(this.retention)
      this.handleShowData()
    } else if (this.$route.query.id) {
      getShoppingCartDetail(this.$route.query.id).then(data => {
        if (data.success) {
          this.retention = JSON.parse(data.data.inventory)
          this.addData = cloneDeep(this.retention)
          this.handleShowData()
        }
      })
    }
  },
  data() {
    return {
      elements: [
        {
          ...element,
          name: '云硬盘',
          serviceCode: 'fusionsphere.standard.volume',
          main: true
        }
      ],
      addData: {
        ...cloneDeep(add),
        location: {
          ...add.location,
          vendorType: this.type,
          diskCategory: ''
        },
        service: 'fusionsphere.standard.volume',
        configs: {
          size: 10,
          type: 'normal',
          diskType: '0'
        }
      },
      typeList: [
        {
          name: '普通',
          id: 'normal'
        },
        {
          name: '共享卷',
          id: 'share'
        }
      ],
      retention: false
    }
  },
  computed: {
    currentElement() {
      return this.elements[0]
    }
  },
  methods: {
    formatCategory(code) {
      let obj
      switch (code) {
        case 'PERSISTENT':
          obj = {
            indepDisk: false,
            persistentDisk: true
          }
          break
        case 'INDEPPERSISTENT':
          obj = {
            indepDisk: true,
            persistentDisk: true
          }
          break
        case 'INDEP':
          obj = {
            indepDisk: true,
            persistentDisk: false
          }
          break
      }
      return obj
    },
    handleShowData() {
      const { elements } = this.retention
      const [first, ...others] = elements
      this.elements = [
        {
          ...element,
          ...first,
          insAmount: this.addData.configs.size
        }
      ]
      this.initLoad()
    },
    getPostData() {
      let data = false
      data = this.$refs.common.handlePostData()
      return data
    },
    getParams() {
      let data = false
      this.$refs.addForm.validate(valid => {
        if (valid) {
          this.addData.configs.size = getSpecValue(this.currentElement).disk
          this.currentElement.categoryList.forEach(item => {
            if (item.id == this.currentElement.categoryId) {
              const obj = this.formatCategory(item.code)
              this.$set(this.addData.configs, 'diskCategory', obj)
            }
          })
          data = true
        }
      })
      return data
    },
    getList() {}
  }
}
</script>

<style scoped lang="scss"></style>
