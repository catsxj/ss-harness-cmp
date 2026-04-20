/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <common-wrapper :add-data="addData" ref="common" :pay-list="payList" :need-region="false" :elements="elements" :showCount="false" :item-data="itemData">
    <el-divider></el-divider>
    <div class="item-block">
      <h5>服务选择</h5>
      <el-col :span="24">
        <el-row :gutter="20" class="service-list" :diabled="false">
          <el-col v-for="(row, index) in serviceList" :key="index" class="m-b card-container">
            <el-card class="card">
              <el-row class="card-content">
                <el-checkbox v-model="row.checked" class="cell-check" @change="handleCheck(row.code)" :disabled="!!itemData"></el-checkbox>
                <el-col :span="4" class="icon-content">
                  <img :src="row.icon" alt="" />
                </el-col>
                <el-col :span="16" class="cell-content">
                  <p class="cell-title">{{ row.name }}</p>
                  <el-tooltip :content="row.remark" placement="bottom-start">
                    <p class="cell-remark">{{ row.remark }}</p>
                  </el-tooltip>
                </el-col>
              </el-row>
              <div class="card-footer">
                <div class="pull-right footer-operate">
                  <el-button type="text" @click="getTemplateDetail(row)">查看服务模板详情</el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-col>
    </div>
    <el-dialog title="作业预览" :visible.sync="dialogVisible" width="80%" v-if="dialogVisible" append-to-body>
      <GraphItem :template-id="templateId"></GraphItem>
    </el-dialog>
  </common-wrapper>
</template>

<script>
import { cloneDeep } from 'lodash-es'
import CommonWrapper from '../components/CommonWrapper.vue'
import { add, element } from '../data/init'
import { getServiceByCode } from 'services/services/spec'
import GraphItem from '@/views/task/graph/graph.vue'
import { getShoppingCartDetail } from 'services/system/shop_cart'
export default {
  components: { CommonWrapper, GraphItem },
  props: {
    itemData: {
      type: [Object, Boolean]
    },
    disabled: {
      type: Boolean
    }
  },
  data() {
    return {
      payList: [{ name: '包年包月', value: 'Month' }],
      elements: [
        {
          ...element,
          name: '实例',
          serviceCode: this.$route.query.code,
          main: true,
          ignore: true
        }
      ],
      addData: {
        ...cloneDeep(add),
        emption: {
          duration: {
            mode: 'Month',
            amount: 1
          },
          count: 1
        },
        service: '',
        configs: {
          templateId: '',
          serviceName: ''
        }
      },
      serviceList: [],
      dialogVisible: false,
      templateId: '',
      catalogCode: '',
      retention: false
    }
  },
  computed: {
    currentElement() {
      return this.elements[0]
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
    } else {
      this.catalogCode = this.$route.path === '/resource_order/ops' ? 'operations' : 'fabric'
    }
    this.getServices()
  },
  methods: {
    handleShowData() {
      this.addData = cloneDeep(this.retention)
      this.catalogCode = this.addData.service.split('.')[0]
    },
    selectService(templateId) {
      const item = this.serviceList.find(item => item.templateId === templateId)
      this.addData.service = item.code
      this.addData.configs = {
        templateId,
        serviceName: item.name
      }
    },
    getTemplateDetail(record) {
      this.templateId = record.templateId
      this.dialogVisible = true
    },
    handleCheck(code) {
      this.serviceList.forEach(item => {
        if (code === item.code) {
          item.checked = true
          const { code, templateId, name } = item
          this.addData.service = code
          this.addData.serviceItem = item
          this.addData.configs = {
            templateId,
            serviceName: name
          }
        } else item.checked = false
      })
    },
    async getServices() {
      const res = await getServiceByCode(this.catalogCode, this.addData.location.tenantId)
      this.serviceList = res.data.map(item => {
        return {
          ...item,
          checked: false
        }
      })
      if (this.itemData) {
        this.handleCheck(this.itemData.service)
      } else {
        this.handleCheck(this.serviceList[0].code)
      }
    },
    getApplyData() {
      let data = false
      data = this.$refs.common.handlePostData()
      return data
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../index.scss';
.service-list {
  @import '@/views/task/scene/card';
  .cell-check {
    position: absolute;
    top: -15px;
    left: -15px;
  }
}
</style>
