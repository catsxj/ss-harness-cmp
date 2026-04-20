/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <common-wrapper :add-data="addData" @vendorId="getList" ref="common" :elements="elements" :get-params="getParams" vendorType="ZSTACK" :item-data="retention" v-bind="$attrs" :is-task="isTask">
    <!-- <el-divider></el-divider> -->
    <div class="item-block">
      <h5>配置信息</h5>
      <el-col :span="13">
        <!-- TODO 类型 -->
        <basic-form-item label="产品类型：">
          <el-radio-group v-model="currentElement.categoryId" @change="getSku(currentElement)">
            <el-radio-button :label="item.id" v-for="(item, index) in currentElement.categoryList" :key="index">{{ item.name }}</el-radio-button>
          </el-radio-group>
        </basic-form-item>
      </el-col>
      <el-col :span="24">
        <!-- TODO 规格 v-if="addData.location.vendorId"-->
        <basic-form-item label="规格：" validate="required">
          <sku-table :skus="currentElement.skuList" style="max-width: 800px" :mode="addData.emption.duration.mode" :show-price="true">
            <el-table-column show-overflow-tooltip label="规格代码" prop="code">
              <template v-slot="scope">
                <el-radio v-model="currentElement.skuId" :label="scope.row.id">{{ scope.row.code }}</el-radio>
              </template>
            </el-table-column>
          </sku-table>
        </basic-form-item>
      </el-col>
      <el-col :span="24">
        <ImageItem :add-data="addData"></ImageItem>
      </el-col>
      <el-col :span="13">
        <basic-form-item label="网络：" class="w" prop="configs.networkId" validate="required" required-message="请选择网络">
          <el-select v-model="addData.configs.networkId" @change="getGroupData">
            <el-option v-for="item in vpcList" :label="item.name" :value="item.id" :key="item.id"></el-option>
          </el-select>
        </basic-form-item>
      </el-col>
      <el-col :span="13">
        <basic-form-item label="所属安全组：" class="w" prop="groups" required-message="请选择安全组">
          <el-select v-model="addData.configs.groups" clearable multiple filterable>
            <el-option v-for="item in groupList" :label="item.name" :value="item.groupUuid" :key="item.id"></el-option>
          </el-select>
        </basic-form-item>
      </el-col>
      <el-col :span="24">
        <basic-form-item label="系统盘：">
          <el-select v-model="systemElement.categoryId" class="w" @change="getSku(systemElement)">
            <el-option :label="item.name" v-for="(item, index) in systemElement.categoryList" :key="index" :value="item.id"></el-option>
          </el-select>
          <el-select v-model="systemElement.skuId" class="w m-l-md">
            <el-option :label="generateSpec(item.spec)" v-for="item in systemElement.skuList" :key="item.id" :value="item.id"></el-option>
          </el-select>
        </basic-form-item>
      </el-col>
      <el-col :span="24">
        <DataDisk :add-data="addData" :item="elements[2]" ref="diskRef" :diskType="addData.configs.diskType"></DataDisk>
      </el-col>
    </div>
    <div class="item-block">
      <h5>云主机信息</h5>
      <basic-form-item prop="configs.name" label="云主机名称：" validate="required">
        <el-input v-model="addData.configs.name" class="basic-cmp"></el-input>
      </basic-form-item>
      <basic-form-item prop="name" label="密码：">
        <el-input v-model="addData.configs.password" type="password" class="basic-cmp" show-password></el-input>
        <span class="tip m-l-xs">*该项为空则表示维持现有密码不变</span>
      </basic-form-item>
      <basic-form-item prop="endPassword" label="确认密码：">
        <el-input v-model="addData.configs.endPassword" type="password" class="basic-cmp" show-password></el-input>
      </basic-form-item>
    </div>
    <div slot="preview-card">
      <basic-form-item label="规格：">{{ specArray.map((item) => `${item.specValue}${item.unit}`).join('/') }}</basic-form-item>
      <category-display label="系统盘类型" :item="elements[1]"></category-display>
      <!-- <category-display label="数据盘类型" :item="elements[2]"></category-display> -->
    </div>
  </common-wrapper>
</template>

<script>
import CommonWrapper from '../../components/CommonWrapper.vue'
import sku from '../../mixins/sku'
import { add, element } from '../../data/init'
import { getVpc, getGroup } from 'services/platform/index'
import crypto from 'utils/crypto.js'
import { cloneDeep } from 'lodash-es'
import { getShoppingCartDetail } from 'services/system/shop_cart'
import DataDisk from './DataDisk.vue'
import ImageItem from './ImageItem.vue'
import { generateSpec, getSpecValue } from '../../utils/index'
import CategoryDisplay from '../../components/CategoryDisplay.vue'
export default {
  components: { CommonWrapper, DataDisk, ImageItem, CategoryDisplay },
  props: {
    type: {
      type: String
    },
    itemData: {
      type: [Object, Boolean]
    },
    disabled: {
      type: Boolean
    },
    isTask: {
      type: Boolean,
      default: false
    }
  },
  mixins: [sku],
  watch: {
    'addData.location.vendorType'() {
      this.$emit('type', this.addData.configs.location.vendorType)
    }
  },
  data() {
    return {
      elements: [
        {
          ...element,
          name: '云主机',
          serviceCode: 'zstack.standard.server',
          main: true
        },
        {
          ...element,
          name: '系统盘',
          serviceCode: 'zstack.standard.volume'
        },
        {
          ...element,
          name: '数据盘',
          serviceCode: 'zstack.standard.volume',
          isLoadData: false,
          elements: []
        }
      ],
      addData: {
        ...cloneDeep(add),
        location: {
          ...add.location,
          vendorType: this.type
        },
        service: 'zstack.standard.server',
        configs: {
          osCategory: '',
          osVersion: '',
          intfs: [],
          groups: []
        }
      },
      vpcList: [],
      retention: false,
      groupList: []
    }
  },
  computed: {
    currentElement() {
      return this.elements[0]
    },
    systemElement() {
      return this.elements[1]
    },
    specArray() {
      const { skuList, skuId } = this.currentElement
      const item = skuList.find((item) => item.id === skuId)
      if (!item) return []
      const result = item.spec
      return result
    }
  },
  async created() {
    if (this.itemData) {
      this.retention = this.itemData
      this.handleShowData()
    } else if (this.$route.query.id) {
      const res = await getShoppingCartDetail(this.$route.query.id)
      if (res.success) {
        this.retention = JSON.parse(res.data.inventory)
        this.handleShowData()
      }
    }
  },
  methods: {
    // 获取安全组
    getGroupData() {
      getGroup({
        condition: JSON.stringify({ condition: 'listByVpc', vpcId: this.addData.configs.networkId })
      }).then((data) => {
        if (data.success) {
          this.groupList = data.data
        }
      })
    },
    generateSpec,
    getPostData() {
      let data = false
      data = this.$refs.common.handlePostData()
      return data
    },
    handleShowData() {
      this.addData = {
        ...cloneDeep(this.retention)
      }
      const { elements, configs } = this.retention
      const { diskCategoryId, volumes } = configs
      const [first, second, ...others] = elements
      this.elements = [
        {
          ...element,
          ...first
        },
        {
          ...element,
          name: '系统盘',
          categoryId: diskCategoryId,
          ...second
        },
        {
          serviceCode: 'zstack.standard.volume',
          isLoadData: false,
          elements: volumes.map((item, index) => {
            return {
              ...item,
              ...others[index]
            }
          })
        }
      ]
      this.addData.configs.password = crypto.decrypt(this.addData.configs.password)
      setTimeout(() => {
        this.initLoad()
        this.$refs.diskRef.loadSku()
      })
    },
    getParams() {
      let data = false
      // let flag = false
      const { templateDisk } = this.addData
      const { password, endPassword, ...addDataConfig } = this.addData.configs
      // console.log(this.systemElement, 'this.systemElement====')
      const params = {
        ...addDataConfig,
        diskCategoryId: this.elements[1].categoryId,
        // 系统盘
        ...getSpecValue(this.systemElement)
      }
      if (password && password !== endPassword) {
        this.$message.error('确认密码要与密码保持一致')
        return false
      }
      if (templateDisk > params.disk) {
        this.$message.error(`当前镜像要求系统盘最小为${templateDisk}GB，请重选选择系统盘规格  `)
        return false
      }
      const { elements } = this.elements[2]
      params.volumes = elements.map((item, index) => {
        const { categoryId, volumeType, skuId } = item
        const { disk: volumeSize } = getSpecValue(item)
        return {
          skuId,
          categoryId,
          volumeType,
          type: 'VOLUME',
          volumeSize
        }
      })
      this.specArray.forEach((item) => {
        params[item.specName] = item.specValue
      })
      data = params
      return data
    },
    getVpc() {
      getVpc({
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.location.vendorId }, sign: 'EQ' }])
      }).then((data) => {
        if (data.success) {
          this.vpcList = data.data.rows
        }
      })
    },
    getList() {
      this.getVpc()
    }
    // modifyElement() {
    //   this.currentElement.cpu = this.addData.configs.cpu
    //   this.currentElement.memory = this.addData.configs.memory
    //   this.systemElement.insAmount = this.systemElement.skuList.find(item => item.id == this.systemElement.skuId).spec
    // }
  }
}
</script>

<style scoped lang="scss">
@import '../../index.scss';
</style>
