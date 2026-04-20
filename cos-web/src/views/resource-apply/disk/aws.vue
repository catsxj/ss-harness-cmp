/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <common-wrapper code="storage" :add-data="addData" ref="common" :elements="elements" :get-params="getParams" :item-data="retention" :disabled="disabled" v-if="isLoadData">
    <basic-form :model="addData.configs" ref="addForm" label-position="left">
      <!-- <el-divider></el-divider> -->
      <div class="item-block">
        <h5>配置信息</h5>
        <el-row :gutter="20">
          <el-col :span="10">
            <basic-form-item label="磁盘类别：" prop="diskType" validate="required">
              <el-select v-model="addData.configs.diskType" placeholder="请先选择磁盘类别" @change="sizeChange" class="basic-cmp">
                <el-option v-for="item in categoryData" :label="item.name" :value="item.value" :key="item.value"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="10">
            <basic-form-item label="大小：">
              <el-input-number :min="minSize" :max="maxSize" v-model="currentElement.insAmount" placeholder="请输入大小"></el-input-number>
              <span class="m-l-xs">GB</span>
            </basic-form-item>
          </el-col>
          <el-col :span="10" v-if="addData.configs.diskType == 'io1'">
            <basic-form-item label="IOPS：" prop="iops" validate="required">
              <el-input-number size="medium" v-model="addData.configs.iops" :min="100" :max="64000"> </el-input-number>
              <span class="info">IOPS和磁盘最大比率为 50:1</span>
            </basic-form-item>
          </el-col>
        </el-row>
      </div>
      <!-- <el-divider></el-divider> -->
      <div class="item-block">
        <h5>云配置信息</h5>
        <el-row :gutter="20">
          <el-col :span="10">
            <basic-form-item label="名称：" validate="required" prop="name">
              <el-input v-model="addData.configs.name" placeholder="请输入名称" class="basic-cmp"></el-input>
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
      </div>
    </basic-form>
    <div slot="preview-card">
      <basic-form-item label="磁盘容量：">{{ currentElement.insAmount }}GB</basic-form-item>
    </div>
  </common-wrapper>
</template>

<script>
import CommonWrapper from 'views/resource-apply/components/PublicCommonWrapper.vue'
import { add, element } from '../data/publicInit'
import { getSystemConfigs } from 'services/system/index'
import { cloneDeep } from 'lodash-es'
import { getShoppingCartDetail } from 'services/system/shop_cart'
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
          serviceCode: 'aws.standard.volume',
          insAmount: 20,
          main: true
        }
      ],
      addData: {
        ...add,
        location: {
          ...add.location,
          vendorType: this.type,
          diskCategory: ''
        },
        service: 'aws.standard.volume',
        configs: {
          resourceLabel: [],
          diskType: 'gp2',
          iops: 100
        }
      },
      categoryData: [
        { name: '通用型 SSD', value: 'gp2', size: 1 },
        { name: '预配置 IOPS SSD', value: 'io1', size: 4 },
        { name: 'Cold HDD', value: 'sc1', size: 125 },
        { name: '吞吐优化 HDD', value: 'st1', size: 125 },
        { name: '磁介质', value: 'standard', size: 1 }
      ],
      minSize: 20,
      maxSize: 100000,
      serverList: [],
      retention: false,
      isLoadData: false
    }
  },
  computed: {
    currentElement() {
      return this.elements[0]
    }
  },
  created() {
    getSystemConfigs({ codes: 'DefaultDiskSize' }).then((data) => {
      if (data.success) {
        this.maxSize = Number(data.data.DefaultDiskSize)
      }
    })
    if (this.itemData) {
      this.retention = this.itemData
      this.addData = cloneDeep(this.retention)
      this.handleShowData()
    } else if (this.$route.query.id) {
      getShoppingCartDetail(this.$route.query.id).then((data) => {
        if (data.success) {
          this.retention = JSON.parse(data.data.inventory)
          this.addData = cloneDeep(this.retention)
          this.handleShowData()
        }
      })
    } else {
      this.addData = {
        ...add,
        location: {
          ...add.location,
          vendorType: this.type,
          diskCategory: ''
        },
        service: 'aws.standard.volume',
        configs: {
          resourceLabel: [],
          diskType: 'gp2',
          iops: 100
        }
      }
    }
    this.isLoadData = true
  },
  watch: {
    'addData.location.vendorType'() {
      this.$emit('type', this.addData.location.vendorType)
    }
  },
  methods: {
    sizeChange() {
      const obj = this.categoryData.find((item) => item.value == this.addData.configs.diskType)
      this.minSize = obj.size
      this.currentElement.insAmount = obj.size
      if (this.addData.configs.diskType == 'io1') {
        this.addData.configs.iops = 100
      }
    },
    getPostData() {
      let data = false
      data = this.$refs.common.handlePostData()
      return data
    },
    // 数据回现展示
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
    },
    getParams() {
      let data = false
      this.$refs.addForm.validate((valid) => {
        if (valid) {
          this.addData.configs.size = this.currentElement.insAmount
          data = true
        }
      })
      return data
    }
  }
}
</script>

<style scoped lang="scss"></style>
