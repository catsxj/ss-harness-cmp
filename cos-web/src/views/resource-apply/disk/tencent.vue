/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <common-wrapper code="storage" :add-data="addData" ref="common" :elements="elements" :get-params="getParams" :item-data="retention" :disabled="disabled" v-if="isLoadData">
    <basic-form :model="addData.configs" ref="addForm" label-position="left">
      <!-- <el-divider></el-divider> -->
      <div class="item-block">
        <h5>配置信息</h5>
        <el-row :gutter="20">
          <!-- <el-col :span="10">
          <basic-form-item label="暂不挂载：">
            <el-radio-group v-model="addData.configs.hasServer" @change="getServer">
              <el-radio-button :label="false">暂不挂载</el-radio-button>
              <el-radio-button :label="true" :disabled="!addData.location.vendorId">挂载到云主机</el-radio-button>
            </el-radio-group>
          </basic-form-item>
        </el-col> -->
          <el-col :span="10" v-if="addData.configs.hasServer" key="server">
            <basic-form-item label="云主机：" prop="serverId" validate="required">
              <el-select v-model="addData.configs.serverId" placeholder="请选择云主机" class="basic-cmp">
                <el-option v-for="(item, index) in serverList" :label="item.name" :value="item.id" :key="index"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="10">
            <basic-form-item label="磁盘类别：" prop="diskType" validate="required">
              <el-select v-model="addData.configs.diskType" placeholder="请先选择磁盘类别" class="basic-cmp">
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
        </el-row>
        <!-- <el-divider></el-divider> -->
      </div>
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
import { getVm } from 'services/platform/index'
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
          serviceCode: 'tencent.standard.volume',
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
        service: 'tencent.standard.volume',
        configs: {
          resourceLabel: [],
          hasServer: false,
          diskType: ''
        }
      },
      categoryData: [
        { name: '普通云盘', value: 'CLOUD_BASIC', size: 20 },
        { name: '高效云盘', value: 'CLOUD_PREMIUM', size: 10 },
        { name: 'SSD云盘', value: 'CLOUD_SSD', size: 100 }
      ],
      minSize: 20,
      maxSize: 10000,
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
      if (this.addData.configs.hasServer) this.getServer()
      this.handleShowData()
    } else if (this.$route.query.id) {
      getShoppingCartDetail(this.$route.query.id).then((data) => {
        if (data.success) {
          this.retention = JSON.parse(data.data.inventory)
          this.addData = cloneDeep(this.retention)
          if (this.addData.configs.hasServer) this.getServer()
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
        service: 'tencent.standard.volume',
        configs: {
          resourceLabel: [],
          hasServer: false,
          diskType: ''
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
    getServer() {
      if (!this.addData.configs.hasServer) return
      getVm({
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.location.vendorId }, sign: 'EQ' }])
      }).then((data) => {
        if (data.success) {
          this.serverList = data.data.rows
        }
      })
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
