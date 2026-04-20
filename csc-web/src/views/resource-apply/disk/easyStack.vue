/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <common-wrapper :add-data="addData" @vendorId="getList" ref="common" vendorType="EASYSTACK" :elements="elements" :loading="loading" :get-params="getParams" :item-data="retention" :disabled="disabled" v-bind="$attrs">
    <el-divider></el-divider>
    <h5>配置信息</h5>
    <el-form-item label="可用区域：" required>
      <el-radio-group v-model="addData.configs.region">
        <el-radio-button :label="item.regionId" :key="index" v-for="(item, index) in regionData" border> {{ item.regionId }}</el-radio-button>
      </el-radio-group>
    </el-form-item>
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
            <el-input v-model="addData.configs.name" placeholder="请输入名称"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <basic-form-item label="卷来源：" required>
            <el-radio-group v-model="addData.configs.disktype" size="small" @change="chooseOrginWay">
              <el-radio :label="item.name" border v-for="(item, index) in typeList" :key="index">{{ item.name }}</el-radio>
            </el-radio-group>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20" v-if="addData.configs.disktype == '镜像'" key="1">
        <el-col :span="10">
          <basic-form-item label="系统镜像：" prop="sourceImgId" validate="required">
            <el-select filterable v-model="addData.configs.sourceImgId">
              <el-option v-for="(item, index) in imageList" :key="index" :label="item.name + '(最小磁盘：' + item.minDisk + 'GB)'" :value="item.id"></el-option>
            </el-select>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20" v-else-if="addData.configs.disktype == '卷'" key="2">
        <el-col :span="10">
          <basic-form-item label="选择卷：" prop="sourceValidId" validate="required">
            <el-select v-model="addData.configs.sourceValidId">
              <el-option v-for="(item, index) in volumeList" :key="index" :label="`${item.name}(${item.size}GB)`" :value="item.id"></el-option>
            </el-select>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20" v-else-if="addData.configs.disktype == '快照'" key="3">
        <el-col :span="10">
          <basic-form-item label="选择快照：" prop="sourceSnapId" validate="required">
            <el-select v-model="addData.configs.sourceSnapId">
              <el-option v-for="(item, index) in snapshotList" :key="index" :label="`${item.name}(${item.size}GB)`" :value="item.id"></el-option>
            </el-select>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row v-else></el-row>
      <el-row :gutter="20">
        <el-col :span="10">
          <basic-form-item label="描述：" prop="remark">
            <el-input type="textarea" v-model="addData.configs.remark" placeholder="请输入描述"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
    </basic-form>
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
import { getRegionCondition, getSnapshot, getVolume, conditionImage } from 'services/platform/index'
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
          serviceCode: 'easystack.standard.volume',
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
        service: 'easystack.standard.volume',
        configs: {
          diskCategoryId: 0,
          sourceImgId: '',
          sourceValidId: '',
          sourceSnapId: '',
          size: 10,
          disktype: '空白卷'
        }
      },
      regionData: [],
      typeList: [{ name: '空白卷' }, { name: '卷' }, { name: '快照' }],
      snapshotList: [],
      volumeList: [],
      imageList: [],
      retention: false
    }
  },
  computed: {
    currentElement() {
      return this.elements[0]
    }
  },
  methods: {
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
          let size = 0
          if (this.addData.configs.disktype == '卷') size = this.volumeList.find(item => item.id == this.addData.configs.sourceValidId).size
          if (this.addData.configs.disktype == '快照') size = this.snapshotList.find(item => item.id == this.addData.configs.sourceSnapId).size
          if (this.addData.configs.size < size) {
            this.$message.error('所选规格不可小于所选卷或快照的规格')
            data = false
          } else {
            data = true
          }
        }
      })
      return data
    },
    getList() {
      this.getRegion()
      this.getSnapshotData()
      this.getVolumeData()
      // this.getImageData()
    },
    getRegion() {
      getRegionCondition({ poolGroupId: this.addData.location.poolGroupId, condition: 'listregionbygroup' }).then(data => {
        if (data.success) {
          this.regionData = data.data
          if (this.regionData.length && !this.addData.configs.region) this.$set(this.addData.configs, 'region', data.data[0].regionId)
        }
      })
    },
    chooseOrginWay(item) {
      if (this.addData.configs.disktype == '镜像') {
        delete this.addData.configs.sourceValidId
        delete this.addData.configs.sourceSnapId
      } else if (this.addData.configs.disktype == '卷') {
        delete this.addData.configs.sourceImgId
        delete this.addData.configs.sourceSnapId
      } else if (this.addData.configs.disktype == '空白卷') {
        delete this.addData.configs.sourceValidId
        delete this.addData.configs.sourceImgId
        delete this.addData.configs.sourceSnapId
      } else {
        delete this.addData.configs.sourceImgId
        delete this.addData.configs.sourceValidId
      }
    },
    // 请求快照
    getSnapshotData() {
      const params = {
        page: 1,
        rows: 10000
      }
      const searchParam = [{ param: { vendorId: this.addData.location.vendorId, status: 'AVAILABLE' }, sign: 'EQ' }]
      params.params = JSON.stringify(searchParam)
      getSnapshot(params).then(data => {
        if (data.success) {
          this.snapshotList = data.data.rows
        }
      })
    },
    // 请求云硬盘
    getVolumeData() {
      const params = {
        page: 1,
        rows: 9999
      }
      const searchParam = [{ param: { vendorId: this.addData.location.vendorId, status: 'AVAILABLE', tenantUuid: this.addData.tenantUuid }, sign: 'EQ' }]
      params.params = JSON.stringify(searchParam)
      getVolume(params).then(data => {
        if (data.success) {
          this.volumeList = data.data.rows
        }
      })
    },
    // 请求镜像
    getImageData() {
      conditionImage({
        condition: 'listPublicImage',
        vendorId: this.addData.location.vendorId
      }).then(data => {
        if (data.success) {
          this.imageList = data.data
        }
      })
    }
  }
}
</script>

<style scoped lang="scss"></style>
