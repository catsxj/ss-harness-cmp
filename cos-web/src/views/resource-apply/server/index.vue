<template>
  <div class="card-wrapper" :class="itemData && 'no-order'">
    <div class="fix-header">
      <div @click="$router.back()">
        <el-icon class="el-icon-back"></el-icon>
      </div>
      <p>{{ $route.meta.title }}</p>
    </div>
    <div class="fix-height">
      <div class="item-block">
        <h5>基本信息</h5>
        <basic-form :model="addData" ref="addForms" label-position="left" label-suffix="：" :disabled="!!itemData && !this.$route.query.id">
          <el-row :gutter="20">
            <el-col :span="12">
              <basic-form-item label="申请单名称">
                <el-input class="w-lg" disabled v-model="addData.location.name"> </el-input>
              </basic-form-item>
            </el-col>
            <el-col :span="12">
              <basic-form-item label="申请人">
                <el-input class="w-lg" disabled v-model="addData.location.creatorName"> </el-input>
              </basic-form-item>
            </el-col>
            <el-col :span="18">
              <basic-form-item label="申请原因">
                <el-input v-model="addData.location.remark" type="textarea"> </el-input>
              </basic-form-item>
            </el-col>
          </el-row>
        </basic-form>
      </div>
      <div class="item-block">
        <h5>业务信息</h5>
        <CardLayout :title="$store.getters.systemConfig.projectConfigLabel">
          <basic-form :model="addData" ref="UserForm" label-position="left" :disabled="!!itemData && !this.$route.query.id">
            <basic-form-item :label="$store.getters.systemConfig.projectConfigLabel + '：'" validate="required" prop="location.projectId">
              <el-select class="w-lg" v-if="!itemData" v-model="addData.location.projectId" @change="changeProject">
                <el-option v-for="(item, index) in allProjectList" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
              <el-input v-else v-model="addData.location.projectName"></el-input>
            </basic-form-item>
          </basic-form>
        </CardLayout>
        <h5>资源信息</h5>
        <EFCServerList @handleUpdateParamList="handleUpdateParamList" ref="EFCServerList" :showParamList="showParamList" :addData="addData" :itemData="itemData" :disabled="disabled"></EFCServerList>
      </div>
      <div class="item-block">
        <h5>其他说明</h5>
        <el-input v-model="addData.location.remark" type="textarea" class="m-b-lg"> </el-input>
      </div>
    </div>
    <div class="fixed_box">
      <div class="pull-right right-footer" v-if="!itemData || this.$route.query.id">
        <PriceItem :add-data="addData" :showParamList="showParamList" />
        <el-button @click="$router.back(-1)" style="width: 90px" type="ghost">返 回</el-button>
        <el-button type="primary" @click="createOrder()" style="width: 90px">订 购</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import EFCServerList from './EFCServerList.vue'
import PriceItem from '../components/EFCPriceItemServer.vue'
import { addServerData, GEN_UUID } from '../data/EFCInit.js'
import { cloneDeep } from 'lodash-es'
import { applyResourceEFC } from 'services/services/product'
import { conditionProject } from 'services/system/project'

export default {
  components: { PriceItem, EFCServerList },
  props: {
    itemData: {
      type: [Object, Boolean]
    },
    disabled: {
      type: Boolean
    },
    ReSubmit: {
      type: Boolean,
      default: false
    },
    Retry: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    userData() {
      return this.$store.getters.userData
    }
  },
  data() {
    return {
      addData: cloneDeep(addServerData),
      allProjectList: [],
      showParamList: []
    }
  },
  created() {
    if (this.itemData) console.log('审批回显:', JSON.parse(JSON.stringify({ ...this.itemData })))
    if (this.itemData && !this.itemData.workOrderTypeCode) return
    if (!this.itemData) {
      // 申请
      this.getProject()
      this.addData.location.creatorName = this.userData.name
      this.addData.location.creatorId = this.userData.id
      if (!this.addData.location.tenantId && this.userData.accountCategory !== 'Manager') this.addData.location.tenantId = this.userData.tenantId ? this.userData.tenantId : this.userData.id
    } else {
      if (this.ReSubmit) {
        // 重新发起 重置参数
        this.itemData.subApplicationParams.map((item) => {})
      }
      this.addData = cloneDeep(this.itemData)
    }
    this.handleShowParamList()
  },
  methods: {
    getProject() {
      conditionProject({
        condition: JSON.stringify({
          condition: 'listApplyProjects'
        })
      }).then((data) => {
        if (data.success) {
          this.allProjectList = data.data
          if (!this.itemData && this.addData.location.projectId) this.addData.location.projectId = ''
        }
      })
    },
    changeProject() {
      const projectName = this.allProjectList.find((item) => item.id === this.addData.location.projectId)?.name || ''
      this.addData.location.projectName = projectName
      this.addData.location.name = projectName + '物理机申请'
    },
    // 合成组 用来展示
    handleShowParamList() {
      const res = []
      this.addData.subApplicationParams.forEach((param) => {
        const find = res.find((item) => item.taskGroupUuid === param.taskGroupUuid)
        if (find) {
          find.emption.count++
        } else {
          res.push(param)
        }
      })
      this.showParamList = res
    },
    // 拆开组 用来传参
    handleUpdateParamList() {
      const res = []
      this.showParamList.map((showParamItem) => {
        // 已经拆开过的组
        const lastParamsByGroup = cloneDeep(this.addData.subApplicationParams.filter((param) => param.taskGroupUuid === showParamItem.taskGroupUuid))
        lastParamsByGroup.length = showParamItem.emption.count
        for (let i = 0; i < showParamItem.emption.count; i++) {
          const newItem = cloneDeep({ ...showParamItem, emption: { ...showParamItem.emption, count: 1 } })
          if (lastParamsByGroup[i] && lastParamsByGroup[i].taskTargetUuid) {
            // 修改
            newItem.taskTargetUuid = lastParamsByGroup[i].taskTargetUuid
          } else {
            // 新增
            const taskTargetUuid = GEN_UUID()
            newItem.taskTargetUuid = taskTargetUuid
          }
          res.push(newItem)
        }
      })
      this.addData.subApplicationParams = res
    },

    // 订购
    handleValidate() {
      let flag = true
      this.$refs.addForms.validate((valid) => {
        if (!valid) {
          this.$message.error('基本信息未填写完整')
          return (flag = false)
        }
      })
      this.$refs.UserForm.validate((valid) => {
        if (!valid) {
          this.$message.error('业务信息未填写完整')
          return (flag = false)
        }
      })
      if (!flag) return flag
      // 云主机列表校验
      const getParams = this.$refs.EFCServerList.getParams
      if (getParams) {
        const paramConfigs = getParams()
        // 校验不通过
        if (!paramConfigs) {
          return (flag = false)
        }
        this.showParamList = this.showParamList.map((param, index) => {
          param.configs = {
            ...param.configs,
            ...paramConfigs[index]
          }
          return param
        })
      }
      return flag
    },
    // 对elements进行处理
    getSkuParams(data) {
      if (!data) return []
      const params = []
      data.forEach((item) => {
        // 忽略此elements
        if (!item.ignore) {
          const { serviceCode, skuId, insAmount, elements, categoryId, categoryMap = {}, specs, cloudCategory } = item
          // 如果存在子节点对子节点进行处理
          if (elements) {
            const returnData = this.getSkuParams(
              elements.map((item1) => {
                return {
                  ...item1,
                  categoryMap
                }
              })
            )
            params.push(...returnData)
            return
          }
          const result = {
            cloudCategory,
            serviceCode,
            skuId,
            categoryId,
            category: categoryMap[categoryId]?.code,
            specs
          }
          params.push(result)
        }
      })
      return params
    },
    // 审批时获取参数
    getApplyData() {
      return this.handlePostData()
    },
    handlePostData() {
      if (!this.handleValidate()) return false
      this.handleUpdateParamList()
      const { workOrderTypeCode, location, subApplicationParams } = cloneDeep(this.addData)
      subApplicationParams.forEach((param) => {
        param.elements = this.getSkuParams(param.elements)
        console.log(param.elements)
        delete param.flavorList
        delete param.groupList
        delete param.groupList
        delete param.imageData
        delete param.osList
        delete param.versionList
        delete param.subnetList
        delete param.vpcList
        delete param.rackList
        delete param.cpuHzList
        delete param.cpuNumList
        delete param.memSizeList
      })
      return {
        ...this.addData,
        workOrderTypeCode,
        location,
        subApplicationParams
      }
    },
    createOrder() {
      const postData = this.handlePostData()
      if (!postData) return
      console.log('---提交参数---', postData)
      this.loading = true
      applyResourceEFC(postData)
        .then((data) => {
          if (data.success) {
            this.$message.success(data.message)
            this.$router.back(-1)
          }
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style scoped lang="scss">
@import '../index.scss';
.right-footer {
  display: flex;
  align-items: center;
}
.right-auto {
  margin-right: auto;
}
.no-order {
  .fix-header {
    display: none;
  }
}
</style>
