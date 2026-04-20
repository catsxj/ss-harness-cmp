<template>
  <div>
    <Old v-if="!addData.workOrderTypeCode || (!itemData && $route.query.EFC === 'false')" :disabled="disabled" :itemData="itemData"></Old>
    <div v-else class="card-wrapper" :class="itemData && 'no-order'">
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
              <User :add-data="addData" :item-data="itemData" @durationModeChange="durationModeChange"></User>
            </basic-form>
          </CardLayout>
          <h5>云主机列表</h5>
          <CardLayout>
            <el-button v-if="!disabled && !Retry" slot="operate" type="text" class="right-auto" @click="() => $refs.VmList.handleClone()">新增</el-button>
            <VmList @handleUpdateParamList="handleUpdateParamList" ref="VmList" :showParamList="showParamList" :addData="addData" :itemData="itemData" :disabled="disabled"></VmList>
          </CardLayout>
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
  </div>
</template>

<script>
import Old from './indexOld.vue'
import VmList from './EFCVmList.vue'
import PriceItem from '../components/EFCPriceItem.vue'
import { addNew, GEN_UUID } from '../data/EFCInit.js'
import User from '../components/EFCUser.vue'
import { cloneDeep, isArray, isString } from 'lodash-es'
import { applyResourceEFC } from 'services/services/product'
import crypto from 'utils/crypto'

export default {
  components: { PriceItem, User, VmList, Old },
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
      addData: cloneDeep(addNew),
      showParamList: []
    }
  },
  watch: {
    '$store.state.app.paymentMode': {
      handler(newVal) {
        if (!this.itemData) {
          // 监听 paymentMode 的值进行更新 (为什么不直接赋值? 在申请页面 F5 刷新时可能接口还没返回数据,这时渲染的是默认数据,并不准确)
          this.addData.preview.paymentMode = newVal
          this.addData.preview.isInstallSoftware = this.$store.state.app.isInstallSoftware
          // 初始化时根据接口返回的值重新设置
          if (!newVal.includes(this.addData.emption.duration.mode)) {
            this.addData.emption.duration.mode = newVal[0] || ''
          }
        }
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    if (this.itemData) console.log('审批回显:', JSON.parse(JSON.stringify({ ...this.itemData })))
    if ((this.itemData && !this.itemData.workOrderTypeCode) || (!this.itemData && !this.$route.query.EFC)) return
    if (!this.itemData) {
      // 申请
      this.addData.location.creatorName = this.userData.name
      this.addData.location.creatorId = this.userData.id
      if (!this.addData.location.tenantId && this.userData.accountCategory !== 'Manager') this.addData.location.tenantId = this.userData.tenantId ? this.userData.tenantId : this.userData.id
    } else {
      // 审批或者重新发起或者其他情况
      if (!this.itemData.preview) {
        // 旧数据兼容处理
        this.itemData.preview = {
          isInstallSoftware: this.$store.state.app.isInstallSoftware || false,
          paymentMode: this.$store.state.app.paymentMode || ['Hour', 'Month']
        }
      } else if (isString(this.itemData.preview)) {
        // 兼容旧数据
        this.itemData.preview = JSON.parse(this.itemData.preview)
      }
      if (this.ReSubmit) {
        // 重新发起
        this.itemData.subApplicationParams.map(item => {
          item.configs.networkCardConfigs.map(i => {
            if (i.ipPolicy === 'Manual') {
              i.address = []
              i.ipPolicy = 'Auto'
            }
          })
          item.preview.hosts = []
        })
      }
      this.addData = cloneDeep(this.itemData)
    }
    this.handleShowParamList()
  },
  methods: {
    // 付费模式变更
    durationModeChange() {
      this.$refs.VmList && this.$refs.VmList.durationModeChange()
    },
    // 合成组 用来展示
    handleShowParamList() {
      const res = []
      this.addData.subApplicationParams.forEach(param => {
        // count 存在丢失的情况, 后端问题
        param.emption.count = param.emption.count || 1
        const find = res.find(item => item.taskGroupUuid === param.taskGroupUuid)
        if (find) {
          find.emption.count++
          if (param.configs.networkCardConfigs?.length) {
            find.configs.networkCardConfigs.map((cardConfig, index) => {
              this.$set(cardConfig, 'loading', false)
              if (cardConfig.ipPolicy === 'Manual') {
                cardConfig.address.push(...param.configs.networkCardConfigs[index].address)
                if (isArray(cardConfig.oldAddress)) cardConfig.oldAddress.push(...param.configs.networkCardConfigs[index].oldAddress)
              }
            })
          }
          if (param.preview.hosts?.length) {
            find.preview.hosts.push(...param.preview.hosts)
          }
        } else {
          // 解密密码
          const decryptPassword = crypto.decrypt(param.configs.password)
          param.configs.password = decryptPassword
          this.$set(param.configs, 'confirm_password', decryptPassword)
          res.push(param)
        }
      })
      this.showParamList = res
    },
    // 拆开组 用来传参
    handleUpdateParamList() {
      const res = []
      this.showParamList.map(showParamItem => {
        // 已经拆开过的组
        const lastParamsByGroup = cloneDeep(this.addData.subApplicationParams.filter(param => param.taskGroupUuid === showParamItem.taskGroupUuid))
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
          // 如果是手动分配 ip, 则需要拆分 ip
          const networkCardConfigs = cloneDeep(showParamItem.configs.networkCardConfigs)
          if (networkCardConfigs && networkCardConfigs.length) {
            newItem.configs.networkCardConfigs = networkCardConfigs.map(cardConfig => {
              if (cardConfig.ipPolicy === 'Manual' && cardConfig.address && cardConfig.address.length) {
                return {
                  ...cardConfig,
                  address: [cardConfig.address[i]],
                  oldAddress: cardConfig.oldAddress ? [cardConfig.oldAddress[i]] : []
                }
              }
              return cardConfig
            })
          }
          // 拆分宿主机调度
          const previewHosts = cloneDeep(showParamItem.preview.hosts)
          if (previewHosts?.length) {
            const targetHost = previewHosts[i]
            newItem.configs.hostId = targetHost.hostId
            newItem.configs.storeId = targetHost.storeId
            newItem.configs.sysDisk.storeId = targetHost.storeId
            newItem.configs.addDiskList.map(disk => {
              disk.storeId = targetHost.storeId
            })
            newItem.preview.hosts = [targetHost]
          }
          newItem.configs.password = crypto.encrypt(newItem.configs.password)
          res.push(newItem)
        }
      })
      this.addData.subApplicationParams = res
    },

    // 订购
    handleValidate() {
      let flag = true
      this.$refs.addForms.validate(valid => {
        if (!valid) {
          this.$message.error('基本信息未填写完整')
          return (flag = false)
        }
      })
      this.$refs.UserForm.validate(valid => {
        if (!valid) {
          this.$message.error('业务信息未填写完整')
          return (flag = false)
        }
      })
      if (this.addData.tasks?.length && this.addData.tasks[0].templateId && !this.addData.tasks[0].taskGraph) {
        this.$message.error('作业模板缺少配置')
        return (flag = false)
      }
      if (!flag) return flag
      // 云主机列表校验
      const getParams = this.$refs.VmList.getParams
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
      const params = []
      data.forEach(item => {
        // 忽略此elements
        if (!item.ignore) {
          const { serviceCode, skuId, insAmount, elements, categoryId, categoryMap = {}, specs, cloudCategory } = item
          // 如果存在子节点对子节点进行处理
          if (elements) {
            const returnData = this.getSkuParams(
              elements.map(item1 => {
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
      subApplicationParams.forEach(param => {
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
        delete param.publicDataDiskTypeList
        delete param.publicSysDiskTypeList
        delete param.networkRelations
        ;(param.preview.hosts || []).map(item => {
          delete item.storeList
        })
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
        .then(data => {
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
