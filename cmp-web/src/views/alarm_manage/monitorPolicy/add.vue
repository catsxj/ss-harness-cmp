<template>
  <div>
    <div class="common-detail">
      <div class="detail-header">
        <span class="detail-back" @click="cancle"><i class="iconfont icon-left-arrow"></i> 返回</span>
        <span class="line"></span>
        <span class="title">{{ status == 'update' ? '编辑告警规则' : '新增告警规则' }}</span>
      </div>
    </div>
    <el-row class="box">
      <el-col :span="24">
        <div class="title">快速向导</div>
        <div style="font-size: 12px" class="m-b-md">您可以通过本向导轻松{{ status == 'create' ? '新增' : '编辑' }}告警规则进行管理</div>
        <div style="padding-left: 30px; padding-right: 30px">
          <el-steps :active="active" process-status="wait">
            <el-step title="告警规则配置"></el-step>
            <el-step title="告警范围配置"></el-step>
            <el-step title="分发策略配置"></el-step>
          </el-steps>
        </div>
        <div style="clear: both"></div>
      </el-col>
      <el-col :span="24">
        <div class="body_view">
          <div v-show="active == 0">
            <basic-form :model="addData" ref="step1Data" label-width="110px">
              <el-row class="m-t">
                <el-col :span="8">
                  <basic-form-item label="策略名称：" prop="name" validate="required">
                    <el-input v-model="addData.name" auto-complete="off"></el-input>
                  </basic-form-item>
                  <basic-form-item label="资源类型：" prop="resourceType" validate="required">
                    <el-select filterable :disabled="status == 'update'" v-model="addData.resourceType" @change="changeResourceType">
                      <el-option v-for="(item, index) in resourceList" :key="index" :label="item.name" :value="item.value"></el-option>
                    </el-select>
                  </basic-form-item>
                </el-col>
                <el-col :span="24" v-if="addData.resourceType">
                  <basic-form-item label="告警规则：" validate="required">
                    <div class="rule-item m-b" v-for="(rule, index1) in addData.rules" :key="index1">
                      <div :class="addData.rules.length > 1 ? 'rule-right rule-right-1' : 'rule-right'">
                        <div class="m-b" v-if="metricsData.title.length > 1">
                          <el-radio-group v-model="rule.tag" @change="changeValueType(rule, index1)">
                            <el-radio-button :label="item" v-for="(item, key) in metricsData.title" :key="key">{{ item }}</el-radio-button>
                          </el-radio-group>
                        </div>
                        <div>
                          <basic-form-item style="display: inline-block; width: 320px; margin-bottom: 0px" label-width="0px" :prop="'rules.' + index1 + '.metricId'" validate="required" required-message="请选择监控指标">
                            <el-select v-model="rule.metricId" placeholder="监控指标" @change="setUnit(rule, metricsData.content[rule.tag])">
                              <el-option v-for="(item, index) in metricsData.content[rule.tag]" :key="index" :label="item.name" :value="item.id"></el-option>
                            </el-select>
                          </basic-form-item>
                        </div>
                        <div class="m-t" v-for="(row, index2) in rule.data" :key="index2">
                          <span v-if="!rule.isEvent">
                            过去 <el-input-number class="ruleColumnText" v-model="row.intervalTime" :precision="0" controls-position="right" :min="1" placeholder="统计时长"></el-input-number>&nbsp;
                            <el-select class="ruleColumnText" v-model="row.interval_time_unit" placeholder="单位">
                              <el-option v-for="item in timeUnit" :key="item.value" :label="item.name" :value="item.value"></el-option> </el-select
                            >&nbsp;
                            <el-select class="ruleColumnText" v-model="row.fun" placeholder="比较值">
                              <el-option v-for="item in getFuns(rule)" :key="item.value" :label="item.label" :value="item.value"></el-option>
                              <!-- <el-option label="最小值" value="min"></el-option>
                            <el-option label="平均值" value="avg"></el-option> --> </el-select
                            >&nbsp;
                            <el-select class="ruleColumnText" v-model="row.operator" placeholder="比较符">
                              <el-option v-for="(item, index) in relationList" :key="index" :label="item.value" :value="item.value"></el-option> </el-select
                            >&nbsp; <el-input-number class="ruleColumnText" v-model="row.threshold" :precision="0" controls-position="right" placeholder="阈值"></el-input-number>&nbsp;
                            <span>{{ rule.unit || row.unit }},</span>
                          </span>
                          持续 <el-input-number class="ruleColumnText" v-model="row.time" :precision="0" controls-position="right" :min="1" placeholder="持续时长"></el-input-number>&nbsp;
                          <el-select class="ruleColumnText" v-model="row.timeunit" placeholder="单位">
                            <el-option v-for="item in timeUnit" :key="item.value" :label="item.name" :value="item.value"></el-option> </el-select
                          >， 触发
                          <el-select class="ruleColumnText" v-model="row.level" placeholder="告警级别">
                            <el-option v-for="(item, index) in levelData" :key="index" :label="item.name" :value="item.value"></el-option> </el-select
                          >&nbsp;
                          <i class="el-icon-circle-close icon-operate" v-if="rule.data.length > 1" @click="removeItem(index2, rule.data)"></i>
                          <i class="el-icon-circle-plus-outline icon-operate" @click="addItem(rule.data, rule)"></i>
                        </div>
                      </div>
                      <el-button v-if="addData.rules.length > 1" type="danger" class="m-l el-icon-minus" @click="removeItem(index1, addData.rules)"></el-button>
                    </div>
                    <el-button type="primary" class="el-icon-plus" @click="addRule(addData.rules)"></el-button> 添加告警规则
                  </basic-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="策略描述：" prop="remark">
                    <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }" v-model="addData.remark" auto-complete="off"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </basic-form>
          </div>
          <div v-show="active == 1" key="1">
            <basic-form ref="data" :status-icon="true" :model="addData.data">
              <basic-form-item label="作用范围：" validate="required">
                <el-radio-group v-model="addData.isGlobal" @change="changeRange">
                  <el-radio-button :label="false">自定义</el-radio-button>
                  <el-radio-button :label="true">全局</el-radio-button>
                </el-radio-group>
              </basic-form-item>
              <basic-form-item v-if="addData.isGlobal === false" label="资源关联：" validate="required">
                <vm ref="resourceList" :resourceType="addData.resourceType" v-if="addData.resourceType.indexOf('VM') > -1" :status="status" :resourceIds="addData.resourceIds"></vm>
                <data-store ref="resourceList" :resourceType="addData.resourceType" v-if="addData.resourceType == 'MONITOR_VCENTER_DATASTORE'" :status="status" :resourceIds="addData.resourceIds"></data-store>
                <host ref="resourceList" :resourceType="addData.resourceType" v-if="addData.resourceType.indexOf('HOST') > -1" :status="status" :resourceIds="addData.resourceIds"></host>
                <op-service ref="resourceList" :resourceType="addData.resourceType" v-if="addData.resourceType == 'MONITOR_OPENSTACK_SERVICE'" :status="status" :resourceIds="addData.resourceIds"></op-service>
                <easy-service ref="resourceList" :resourceType="addData.resourceType" v-if="addData.resourceType == 'MONITOR_EASYSTACK_SERVICE'" :status="status" :resourceIds="addData.resourceIds"></easy-service>
                <dell-device ref="resourceList" :resourceType="addData.resourceType" v-if="addData.resourceType == 'MONITOR_STORAGE_DELL_STORAGE' || addData.resourceType == 'MONITOR_STORAGE_HUAWEI_STORAGE'" :status="status" :resourceIds="addData.resourceIds"></dell-device>
                <dell-disk ref="resourceList" :resourceType="addData.resourceType" v-if="addData.resourceType == 'MONITOR_STORAGE_DELL_DISK' || addData.resourceType == 'MONITOR_STORAGE_HUAWEI_DISK'" :status="status" :resourceIds="addData.resourceIds"></dell-disk>
                <dell-volume ref="resourceList" :resourceType="addData.resourceType" v-if="addData.resourceType == 'MONITOR_STORAGE_DELL_VOLUME' || addData.resourceType == 'MONITOR_STORAGE_HUAWEI_VOLUME'" :status="status" :resourceIds="addData.resourceIds"></dell-volume>
                <k8s-node ref="resourceList" :resourceType="addData.resourceType" v-if="addData.resourceType == 'MONITOR_KUBERNETES_NODE'" :status="status" :resourceIds="addData.resourceIds"></k8s-node>
                <k8s-pod ref="resourceList" :resourceType="addData.resourceType" v-if="addData.resourceType == 'MONITOR_KUBERNETES_POD'" :status="status" :resourceIds="addData.resourceIds"></k8s-pod>
                <hmc-server ref="resourceList" :resourceType="addData.resourceType" v-if="addData.resourceType == 'MONITOR_HMC_SERVER'" :status="status" :resourceIds="addData.resourceIds"></hmc-server>
                <hmc-lpar ref="resourceList" :resourceType="addData.resourceType" v-if="addData.resourceType == 'MONITOR_HMC_VIOS'" :status="status" :resourceIds="addData.resourceIds" partitionType="Virtual IO Server"></hmc-lpar>
                <hmc-lpar ref="resourceList" :resourceType="addData.resourceType" v-if="addData.resourceType == 'MONITOR_HMC_AIX'" :status="status" :resourceIds="addData.resourceIds" partitionType="AIX/Linux"></hmc-lpar>
                <database
                  ref="resourceList"
                  :resourceType="addData.resourceType"
                  v-if="addData.resourceType.indexOf('MONITOR_RDS') > -1 || addData.resourceType.indexOf('MONITOR_KVS') > -1 || addData.resourceType.indexOf('MONITOR_CMS') > -1 || addData.resourceType.indexOf('MONITOR_CCS') > -1"
                  :status="status"
                  :resourceIds="addData.resourceIds"
                  :key="addData.resourceType"
                ></database>
                <xsky-user ref="resourceList" :resourceType="addData.resourceType" v-if="addData.resourceType == 'MONITOR_XSKY_OBJECT_USER'" :status="status" :resourceIds="addData.resourceIds"></xsky-user>
                <xsky-router ref="resourceList" :resourceType="addData.resourceType" v-if="addData.resourceType == 'MONITOR_XSKY_OBJECT_ROUTER'" :status="status" :resourceIds="addData.resourceIds"></xsky-router>
                <xsky-bucket ref="resourceList" :resourceType="addData.resourceType" v-if="addData.resourceType == 'MONITOR_XSKY_OBJECT_BUCKET'" :status="status" :resourceIds="addData.resourceIds"></xsky-bucket>
                <xsky-volume ref="resourceList" :resourceType="addData.resourceType" v-if="addData.resourceType == 'MONITOR_XSKY_VOLUME'" :status="status" :resourceIds="addData.resourceIds"></xsky-volume>
                <xsky-pool ref="resourceList" :resourceType="addData.resourceType" v-if="addData.resourceType == 'MONITOR_XSKY_VOLUME_POOL'" :status="status" :resourceIds="addData.resourceIds"></xsky-pool>
                <xsky-osd ref="resourceList" :resourceType="addData.resourceType" v-if="addData.resourceType == 'MONITOR_XSKY_CEPH_OSD'" :status="status" :resourceIds="addData.resourceIds"></xsky-osd>
                <xsky-chache ref="resourceList" :resourceType="addData.resourceType" v-if="addData.resourceType == 'MONITOR_XSKY_DISK'" :status="status" :resourceIds="addData.resourceIds"></xsky-chache>
                <xsky-file-sys ref="resourceList" :resourceType="addData.resourceType" v-if="addData.resourceType == 'MONITOR_XSKY_FILESYSTEM'" :status="status" :resourceIds="addData.resourceIds"></xsky-file-sys>
                <cisco ref="resourceList" :resourceType="addData.resourceType" v-if="addData.resourceType == 'MONITOR_CISCO_SANFABRIC'" :status="status" :resourceIds="addData.resourceIds"></cisco>
              </basic-form-item>
            </basic-form>
          </div>
          <div v-show="active == 2" key="2">
            <basic-form label-width="130px" ref="data2" :status-icon="true" :model="addData.data">
              <basic-form-item label="已关联：">
                {{ addData.policyName }}
              </basic-form-item>
              <basic-form-item label="选择分发策略：">
                <el-form :inline="true">
                  <el-form-item>
                    <el-input placeholder="名称" v-model="listQuery.policyName"> </el-input>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="ghost" icon="el-icon-search" @click="handleSearchPolicy">搜索</el-button>
                    <el-button type="ghost" icon="el-icon-refresh" @click="handleResetPolicy">重置</el-button>
                  </el-form-item>
                  <el-form-item class="pull-right">
                    <el-button type="text" icon="el-icon-plus" @click="handleCreatePolicy">新增分发策略</el-button>
                  </el-form-item>
                </el-form>
                <basic-table :data="policyList" :params="policyParams" :get-list="getPolicy" :total="policyTotal">
                  <el-table-column prop="name" label="名称" show-overflow-tooltip>
                    <template #default="scope">
                      <el-radio :label="scope.row.id" v-model="addData.policyId" @change="changePolicyId">{{ scope.row.name }} </el-radio>
                    </template>
                  </el-table-column>
                  <el-table-column prop="ip" label="延迟时间" show-overflow-tooltip>
                    <template #default="scope">
                      {{ waiteTimeFilter(scope.row.waitTime) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="remind" label="接收提示告警" show-overflow-tooltip>
                    <template #default="scope">
                      {{ booleanFilter(scope.row.remind) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="secondary" label="接收次要告警" show-overflow-tooltip>
                    <template #default="scope">
                      {{ booleanFilter(scope.row.secondary) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="primary" label="接收重要告警" show-overflow-tooltip>
                    <template #default="scope">
                      {{ booleanFilter(scope.row.primary) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="urgent" label="接收紧急告警" show-overflow-tooltip>
                    <template #default="scope">
                      {{ booleanFilter(scope.row.urgent) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="email" label="邮件" show-overflow-tooltip>
                    <template #default="scope">
                      {{ booleanFilter(scope.row.email) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="message" label="站内信" show-overflow-tooltip>
                    <template #default="scope">
                      {{ booleanFilter(scope.row.message) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="dingding" label="钉钉" show-overflow-tooltip>
                    <template #default="scope">
                      {{ booleanFilter(scope.row.dingding) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="weixin" label="微信" show-overflow-tooltip>
                    <template #default="scope">
                      {{ booleanFilter(scope.row.weixin) }}
                    </template>
                  </el-table-column>
                </basic-table>
              </basic-form-item>
            </basic-form>
            <el-drawer v-model:visible="addPolicyFlag" direction="rtl" size="875px" id="drawer">
              <div slot="title">新增分发策略</div>
              <el-card>
                <add style="margin-bottom: 60px" ref="policy" @refresh="refresh"></add>
                <div class="addFoot">
                  <el-button type="primary" @click="addPolicy" class="m-l m-b">确定</el-button>
                  <el-button type="ghost" @click="canclePolicy" class="m-l m-b">取消</el-button>
                </div>
                <div style="clear: both"></div>
              </el-card>
            </el-drawer>
          </div>
        </div>
        <div class="footer">
          <div style="text-align: center">
            <el-button type="ghost" class="m-r-xs" @click="cancle">取 消</el-button>
            <span></span>
            <el-button type="ghost" class="m-r-xs" v-if="active > 0" @click="goStep(false)">上一步</el-button>
            <span></span>
            <el-button type="primary" class="m-r-xs" v-if="active < 2" @click="goStep(true)">下一步</el-button>
            <span></span>
            <el-button type="primary" @click="submit" v-if="active == 2">确 定</el-button>
          </div>
        </div>
      </el-col>
      <div style="clear: both"></div>
    </el-row>
  </div>
</template>

<script>
/* global $ */
import { getMetrics, getDistributions, createRuleGroup, modifyRuleGroup, getRuleGroupDetail } from 'services/monitor/index'
import { booleanFilter, waiteTimeFilter } from '@/filters/index'
import { getResourceList } from 'services/platform/index'
import add from '../policy/add.vue'
import vm from './vm.vue'
import host from './host.vue'
import opService from './op_service.vue'
import easyService from './easy_service.vue'
import dataStore from './vcenter_dataStore.vue'
import dellDevice from './storage_hw_dell_device.vue'
import dellDisk from './storage_hw_dell_disk.vue'
import dellVolume from './storage_hw_dell_volume.vue'
import k8sNode from './k8s_node.vue'
import k8sPod from './k8s_container.vue'
import hmcServer from './hmc_host.vue'
import hmcLpar from './hmc_lpar.vue'
import database from './database.vue'
import xskyFileSys from './xsky_fileSys.vue'
import xskyBucket from './xsky_bucket.vue'
import xskyChache from './xsky_chache.vue'
import xskyOsd from './xsky_disk.vue'
import xskyPool from './xsky_pool.vue'
import xskyRouter from './xsky_router.vue'
import xskyUser from './xsky_user.vue'
import xskyVolume from './xsky_volume.vue'
import cisco from './cisco.vue'
const relationList = [{ value: '>' }, { value: '>=' }, { value: '==' }, { value: '<' }, { value: '<=' }, { value: '!=' }]
const timeUnit = [
  { name: '小时', value: 'h' },
  { name: '分钟', value: 'm' },
  { name: '秒', value: 's' }
]
const levelData = [
  { value: 'URGENT', name: '紧急告警' },
  { value: 'PRIMARY', name: '重要告警' },
  { value: 'SECONDARY', name: '次要告警' },
  { value: 'REMIND', name: '提示告警' }
]
export default {
  components: {
    add,
    vm,
    host,
    dataStore,
    dellDevice,
    dellDisk,
    dellVolume,
    k8sNode,
    k8sPod,
    hmcServer,
    hmcLpar,
    database,
    xskyFileSys,
    xskyBucket,
    xskyChache,
    xskyOsd,
    xskyPool,
    xskyRouter,
    xskyUser,
    xskyVolume,
    cisco,
    opService,
    easyService
  },
  props: {},
  data() {
    return {
      booleanFilter,
      waiteTimeFilter,
      relationList,
      timeUnit,
      levelData,
      id: Number(this.$route.query.id),
      active: 0,
      status: 'create',
      addData: {
        resourceType: '',
        isGlobal: true,
        resourceIds: [],
        rules: [
          {
            metricId: '',
            data: [{ operator: '', threshold: '', unit: '', level: 'URGENT', time: '', timeunit: '' }]
          }
        ]
      },
      resourceList: [],
      unitList: [],
      metricsData: {
        title: [],
        content: []
      },
      list: null,
      total: null,
      listQuery: {
        name: '',
        ip: '',
        policyName: ''
      },
      params: {
        page: 1,
        rows: 10
      },
      receiverListData: [],
      selectList: [],
      idList: [],
      policyParams: {
        page: 1,
        row: 10
      },
      policyList: [],
      policyTotal: 0,
      loading: false,
      addPolicyFlag: false,
      flag: 0,
      funs: [],
      funType: {
        avg: '平均值',
        min: '最小值',
        max: '最大值'
      }
    }
  },
  methods: {
    init() {
      if (this.id) {
        this.status = 'update'
        getRuleGroupDetail(this.id).then((res) => {
          if (res.success) {
            const temp = res.data
            // const temp = JSON.parse(this.$route.query.data)
            const { id, name, remark, resourceType, isGlobal, policyId, resourceIds } = temp
            this.addData = {
              id,
              name,
              remark,
              resourceType,
              rules: [],
              isGlobal,
              resourceIds,
              policyId
            }
            const arr = []
            temp.rules.forEach((rule) => {
              const parent = arr.find((cur) => cur.metricId == rule.metricId)
              if (parent) {
                parent.data.push(rule)
              } else {
                const obj = {
                  tag: rule.tag,
                  metricId: rule.metricId,
                  data: [rule]
                }
                arr.push(obj)
              }
            })
            this.addData.rules = arr
            const data = []
            this.addData.rules.forEach((rule) => {
              rule.data.forEach((row) => {
                const time = row.for1.match(/^[0-9]+/gi)[0]
                const timeunit = row.for1.match(/[a-zA-Z]+$/gi)[0]
                const intervalTime = row.intervalTime ? row.intervalTime.match(/[0-9]+/gi)[0] : ''
                const interval_time_unit = row.intervalTime ? row.intervalTime.match(/[a-z|A-Z]+$/gi)[0] : ''
                if (!row.intervalTime) {
                  this.$set(rule, 'isEvent', true)
                }
                this.$set(row, 'time', time)
                this.$set(row, 'timeunit', timeunit)
                this.$set(row, 'intervalTime', intervalTime)
                this.$set(row, 'interval_time_unit', interval_time_unit)
              })
            })
            this.getMetricsList(this.addData.resourceType)
            this.changePolicyId(this.addData.policyId)
          }
        })
      } else {
        this.status = 'create'
      }
    },
    goStep(flag) {
      if (flag) {
        if (this.active >= 2) return
        if (this.active == 1) {
          if (this.addData.isGlobal === false) {
            this.$refs.resourceList.refreshId()
            this.addData.resourceIds = this.$refs.resourceList.idList
            if (this.addData.resourceIds.length >= 1) {
              this.active++
              this.getPolicy()
            } else {
              return this.$message.error('请选择关联资源')
            }
          } else {
            this.getPolicy()
            this.active++
          }
        }
        if (this.active == 0) {
          this.$refs.step1Data.validate((valid) => {
            if (valid) {
              for (let index = 0; index < this.addData.rules.length; index++) {
                const element = this.addData.rules[index]
                const flag = element.data.every((n) => {
                  if (element.isEvent) {
                    return n.time && n.timeunit && n.level
                  } else {
                    return (n.threshold || n.threshold === 0) && n.time && n.timeunit && n.level && n.fun && n.operator && n.intervalTime && n.interval_time_unit
                  }
                })
                if (!flag) {
                  return this.$message({
                    message: '请确保监控规则信息填写完整',
                    type: 'error'
                  })
                }
              }
              this.active++
              if (this.addData.isGlobal !== false) {
                this.$set(this.addData, 'isGlobal', true)
              }
            } else {
              return false
            }
          })
        }
      } else {
        if (this.active <= 0) return
        this.active--
      }
    },
    cancle() {
      this.$router.push({ name: 'monitorPolicy' })
    },
    addPolicy() {
      this.$refs.policy.addSubmit()
    },
    canclePolicy() {
      this.addPolicyFlag = false
    },
    refresh() {
      this.addPolicyFlag = false
      this.getPolicy()
    },
    submit() {
      const rules = []
      this.addData.rules.forEach((rule) => {
        rule.data.forEach((item) => {
          if (rule.isEvent) {
            const obj = {
              id: item.id,
              level: item.level,
              metricId: rule.metricId,
              for1: item.time + item.timeunit
            }
            rules.push(obj)
          } else {
            const obj = {
              id: item.id,
              fun: item.fun,
              intervalTime: item.intervalTime + item.interval_time_unit,
              level: item.level,
              metricId: rule.metricId,
              operator: item.operator,
              threshold: item.threshold,
              for1: item.time + item.timeunit
            }
            rules.push(obj)
          }
        })
      })
      const { id, name, remark, resourceType, isGlobal, policyId, resourceIds } = this.addData
      const addData = {
        id,
        name,
        remark,
        resourceType,
        rules: rules,
        isGlobal,
        resourceIds,
        policyId
      }
      const http = this.status == 'create' ? createRuleGroup : modifyRuleGroup
      http(addData).then((data) => {
        if (data.success) {
          this.$router.push({ name: 'monitorPolicy' })
        }
      })
    },
    changeValueType(obj, index) {
      if (this.metricsData.content[obj.tag][0]) {
        this.$set(obj, 'metricId', this.metricsData.content[obj.tag][0].id)
        this.setUnit(obj, this.metricsData.content[obj.tag])
      } else {
        this.$set(obj, 'metricId', '')
      }
      // obj.data.forEach(rule => {
      //   Object.keys(rule).forEach(key => {
      //     rule[key] = ''
      //   })
      // })
    },
    changeResourceType(value) {
      this.addData.isGlobal = true
      this.addData.resourceIds = []
      this.addData.rules = [
        {
          metricId: '',
          data: [{ operator: '>', level: '', time: '', timeunit: 'm', fun: '', threshold: '', intervalTime: '', interval_time_unit: 'm' }]
        }
      ]
      this.getMetricsList(value)
    },
    getMetricsList(value) {
      getMetrics({
        resourceType: value
      }).then((data) => {
        if (data.success) {
          this.metricsData = data.data
          if (this.status == 'create' || (this.status == 'update' && this.flag != 0)) {
            this.$set(this.addData.rules[0], 'tag', this.metricsData.title[0])
            this.changeValueType(this.addData.rules[0])
            this.flag++
          }
        }
      })
    },
    changeRange() {
      if (this.$refs.resourceList) {
        this.$refs.resourceList.selectList = []
      }
      this.addData.resourceIds = []
    },
    getPolicy() {
      getDistributions(this.policyParams).then((data) => {
        if (data.success) {
          this.policyList = data.data.rows
          this.policyTotal = data.data.total
        }
      })
    },
    handleCreatePolicy() {
      this.addPolicyFlag = true
    },
    handleSearchPolicy() {
      this.policyParams.page = 1
      this.policyParams.params = this.$tools.handleSearchParam({
        'name:LK': this.listQuery.policyName
      })
      this.getPolicy()
    },
    handleResetPolicy() {
      this.listQuery.policyName = ''
      this.$set(this.addData, 'policyId', '')
      this.$set(this.addData, 'policyName', '')
      this.handleSearchPolicy()
    },
    changePolicyId(id) {
      getDistributions({
        simple: true
      }).then((data) => {
        if (data.success) {
          const list = data.data.rows
          for (let index = 0; index < list.length; index++) {
            const element = list[index]
            if (element.id == id) {
              this.$set(this.addData, 'policyName', element.name)
              return
            }
          }
        }
      })
    },
    setUnit(rule, data) {
      for (let index = 0; index < data.length; index++) {
        const element = data[index]
        if (element.id == rule.metricId) {
          this.$set(rule, 'unit', element.unit)
          if (element.isEvent) {
            this.$set(rule, 'isEvent', true)
          } else {
            this.$set(rule, 'isEvent', false)
          }
        }
      }
    },
    removeItem(key, data) {
      data.splice(key, 1)
    },
    addRule(data) {
      data.push({ data: [{ operator: '>', level: '', time: '', timeunit: 'm', fun: '', threshold: '', intervalTime: '', interval_time_unit: 'm' }], metricId: '' })
      const len = data.length - 1
      this.$set(this.addData.rules[len], 'tag', this.metricsData.title[0])
      this.changeValueType(this.addData.rules[len])
    },
    addItem(data, parent) {
      data.push({ operator: '>', level: '', time: '', timeunit: 'm', fun: '', threshold: '', intervalTime: '', interval_time_unit: 'm', unit: data[0].unit })
    },
    getFuns(rule) {
      if (rule?.metricId) {
        const { fun } = this.metricsData.content[rule.tag]?.find((item) => item.id == rule.metricId) || {}
        return fun?.map((item) => ({ label: this.funType[item], value: item })) || []
      }
      return []
    }
  },
  created() {
    getResourceList().then(({ data, success }) => {
      if (success) {
        this.resourceList = data.rows.map((item) => ({ ...item, value: item.resourceType }))
      }
    })
    this.init()
  }
}
</script>

<style lang="scss" scoped>
.el-dialog__wrapper {
  ::v-deep .el-dialog {
    .el-dialog__header {
      padding: 0 !important;
      background-color: #fff !important;
      border: none !important;
    }
    .el-dialog__body {
      padding: 0 !important;
    }
  }
}
// .el-steps {
//   ::v-deep .el-step {
//   }
// }
.box {
  margin-top: 44px;
  padding: 20px 50px;
  background: #fff;
  .title {
    padding: 5px 0px;
    font-size: 16px;
    font-weight: bold;
  }
  .body_view {
    min-height: 300px;
    padding: 0px 15px;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 1px;
      height: 1px;
    }
    &::-webkit-scrollbar-thumb {
      border-radius: 100px;
      -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    }
    &::-webkit-scrollbar-track {
      -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
      border-radius: 0;
    }
  }
  .rule-item {
    .rule-right {
      display: inline-block;
      vertical-align: top;
      padding: 10px;
      border: 1px solid rgba(221, 221, 221, 1);
    }
    .rule-right-1 {
      width: calc(100% - 86px);
    }
  }
  .ruleColumn {
    width: 220px !important;
    margin-bottom: 10px;
  }
  .ruleColumnText {
    width: calc(10% - 20px);
    min-width: 100px;
    margin-bottom: 10px;
  }
  .icon-operate {
    font-size: 24px;
    vertical-align: middle;
    color: #c0c4cc;
    &:hover {
      cursor: pointer;
      color: #409eff;
    }
  }
  .footer {
    height: 40px;
    padding: 20px 15px 0px 15px;
    border-top: 1px solid rgba(221, 221, 221, 1);
  }
}
.common-detail {
  background: #fff;
  position: absolute;
  z-index: 2;
  width: 100%;
  right: 0;
  top: 0;
  border: 1px solid #e6e6e6;
  .detail-header {
    width: calc(100% - 40px);
    height: 44px;
    line-height: 44px;
    position: absolute;
    z-index: 99;
    background: #fff;
    padding: 0 20px;
    border-bottom: 1px solid #e6e6e6;
    .title {
      display: inline-block;
      color: #333;
    }
    .line {
      position: relative;
      top: 4px;
      margin: 0 10px;
      height: 20px;
      width: 1px;
      display: inline-block;
      background-color: #b5b5b5;
    }
    .detail-back {
      color: #46abf1;
      cursor: pointer;
    }
  }
}
.addFoot {
  width: 100%;
  height: 60px;
  line-height: 60px;
  padding: 10px;
  background: #f0f2f9;
  position: fixed;
  bottom: 0px;
  z-index: 1000;
}
</style>
