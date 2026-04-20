<template>
  <basic-form :model="formData" ref="addForm" label-width="0" :disabled="disabled">
    <basic-table :data="showParamList" ref="addTable" :span-method="arraySpanMethod">
      <el-table-column label="序号" show-overflow-tooltip width="60px">
        <template slot-scope="{ $index }">
          <basic-form-item label="" key="index">
            {{ $index + 1 }}
          </basic-form-item>
        </template>
      </el-table-column>
      <el-table-column label="命名规则" show-overflow-tooltip width="160px">
        <template slot-scope="{ row, $index }">
          <basic-form-item label="" :rules="rules.nameRuleIdRule" :prop="`showParamList.${$index}.configs.nameRuleId`" key="namerule">
            <el-select v-model="row.configs.nameRuleId" placeholder="请选择命名规则" clearable filterable @change="changeNameRuleId(row, $index)">
              <el-option v-for="(item, index) in nameruleList" :key="index" :label="item.name" :value="item.id"> </el-option>
            </el-select>
          </basic-form-item>
        </template>
      </el-table-column>
      <el-table-column label="云主机名称" show-overflow-tooltip width="160px">
        <template slot-scope="{ row, $index }">
          <basic-form-item label="" validate="newVmName" :rules="rules.vmNameRule" :prop="`showParamList.${$index}.configs.name`">
            <el-input v-model="row.configs.name" @change="changeName(row, $index)" :disabled="!!row.configs.nameRuleId"> </el-input>
          </basic-form-item>
        </template>
      </el-table-column>
      <el-table-column label="主机名" show-overflow-tooltip width="160px">
        <template slot-scope="{ row, $index }">
          <basic-form-item v-if="['SANGFOR'].includes(row.subLocation.vendorType)" label="" key="sangforHostname"> </basic-form-item>
          <basic-form-item v-else label="" validate="required,vmHostName" :prop="`showParamList.${$index}.configs.vmHostName`" key="hostname">
            <el-input v-model="row.configs.vmHostName"> </el-input>
          </basic-form-item>
        </template>
      </el-table-column>
      <!-- <el-table-column label="云平台类型" show-overflow-tooltip>
        <template slot-scope="{ row,$index }">
          <basic-form-item label="">
            <el-select v-model="row.subLocation.vendorType">
              <el-option :label="item | vendorName" :value="item" v-for="item in vendorTypelist" :key="item"></el-option>
            </el-select>
          </basic-form-item>
        </template>
      </el-table-column> -->
      <el-table-column label="区域" show-overflow-tooltip width="180px">
        <template slot-scope="{ row, $index }">
          <basic-form-item label="" validate="required" :prop="`showParamList.${$index}.subLocation.region`" key="region">
            <el-select v-model="row.subLocation.region" @change="changeRegion(row, true)" filterable>
              <el-option :label="item.regionName" :value="item.region" v-for="item in regionList" :key="item.region"></el-option>
            </el-select>
          </basic-form-item>
        </template>
      </el-table-column>
      <el-table-column label="可用区" show-overflow-tooltip width="180px">
        <template slot-scope="{ row, $index }">
          <basic-form-item label="" validate="required" :prop="`showParamList.${$index}.subLocation.az`" key="az">
            <el-select v-model="row.subLocation.az" @change="changeAz(row, true)" filterable>
              <el-option :label="item.azName" :value="item.availablitiyZone" v-for="item in getZoneListByRegion(row)" :key="item.availablitiyZone"></el-option>
            </el-select>
          </basic-form-item>
        </template>
      </el-table-column>
      <el-table-column label="镜像类型" show-overflow-tooltip width="180px">
        <template slot-scope="{ row, $index }">
          <basic-form-item label="" validate="required" :prop="`showParamList.${$index}.configs.osCategory`" key="osCategory">
            <el-select v-model="row.configs.osCategory" placeholder="请选择" @change="getVersionList(row, true)" filterable>
              <el-option v-for="(item, index) in row.osList" :key="index" :label="item" :value="item"> </el-option>
            </el-select>
          </basic-form-item>
        </template>
      </el-table-column>
      <el-table-column label="镜像版本" show-overflow-tooltip width="180px">
        <template slot-scope="{ row, $index }">
          <basic-form-item label="" validate="required" :prop="`showParamList.${$index}.configs.osVersion`" key="osVersion">
            <el-select v-model="row.configs.osVersion" placeholder="请选择" @change="getImage(row, true)" filterable>
              <el-option v-for="(item, index) in row.versionList" :disabled="!!item.disabled" :key="index" :label="item.name" :value="item.name"> </el-option>
            </el-select>
          </basic-form-item>
        </template>
      </el-table-column>
      <el-table-column label="CPU（核）" show-overflow-tooltip width="160px">
        <template slot-scope="{ row, $index }">
          <basic-form-item v-if="row.subLocation.isPublic" label="" validate="required" key="cpu" :prop="`showParamList.${$index}.configs.flavorId`">
            <el-select v-model="row.configs.flavorId" placeholder="请选择规格" @change="changeFlavor(row)" filterable>
              <el-option v-for="item in row.flavorList" :key="item.id" :label="`${item.name}【${item.cpu}核 ${item.memory}GB】`" :value="item.id"> </el-option>
            </el-select>
          </basic-form-item>
          <basic-form-item v-else label="" validate="required" :prop="`showParamList.${$index}.configs.cpu`">
            <el-input-number :min="1" :max="500" v-model="row.configs.cpu" @change="(val) => changeCpu(val, row)"> </el-input-number>
          </basic-form-item>
        </template>
      </el-table-column>
      <el-table-column label="内存（GB）" show-overflow-tooltip width="160px">
        <template slot-scope="{ row, $index }">
          <basic-form-item label="" validate="required" :prop="`showParamList.${$index}.configs.memory`" key="memory">
            <el-input-number :min="row.configs.templateRam" :max="500" v-model="row.configs.memory" @change="(val) => changeMemory(val, row)"> </el-input-number>
          </basic-form-item>
        </template>
      </el-table-column>
      <el-table-column label="磁盘（GB）" show-overflow-tooltip width="160px">
        <template slot-scope="{ row, $index }">
          <basic-form-item label="" validate="required" :prop="`showParamList.${$index}.configs.sysDisk.disk`" key="disk">
            <span class="detail-href" @click="handleOpenDiskDialog(row, $index)">
              <template v-if="getDiskTotalSize(row) > 0">
                <div>系统盘: {{ getDiskType(row, row.configs.sysDisk.cloudCategory, 'publicSysDiskTypeList') }}{{ row.configs.sysDisk.disk }}GB</div>
                <div v-for="(item, index) in row.configs.addDiskList" :key="index">
                  <span style="width: 45px; display: inline-block">{{ index === 0 ? '数据盘: ' : '' }}</span>
                  <span> {{ getDiskType(row, item.cloudCategory, 'publicDataDiskTypeList') }}{{ item.disk }}GB </span>
                </div>
              </template>
              <template v-else>配置</template>
            </span>
          </basic-form-item>
        </template>
      </el-table-column>
      <el-table-column label="网络" show-overflow-tooltip min-width="180px">
        <template slot-scope="{ row, $index }">
          <basic-form-item label="" :prop="`showParamList.${$index}`" :rules="rules.networkCardConfigsRule" key="networkCardConfigs">
            <span class="detail-href" @click="handleOpenNetworkDialog(row, $index)">
              <template v-if="row.subLocation.isPublic">
                <div v-if="row.configs.vpcId">VPC: {{ row.configs.vpcName || row.configs.vpcId }}</div>
                <div v-if="row.configs.subnetId">子网: {{ row.configs.subnetName || row.configs.subnetId }}</div>
                <div v-if="row.configs.groups && row.configs.groups.length">安全组: {{ row.configs.groups.join('、') }}</div>
              </template>
              <template v-if="row.configs.networkCardConfigs.length && row.configs.networkCardConfigs[0].ipPoolId">
                <div v-for="(item, index) in row.configs.networkCardConfigs" :key="index">
                  <template v-if="item.ipPoolId">
                    <span>{{ item.ipPoolName }}</span>
                    <span v-if="item.address.length">-{{ item.address.join('、') }}</span>
                    <span v-else>-自动分配IP</span>
                  </template>
                </div>
              </template>
              <template v-if="!(row.configs.subnetId || (row.configs.networkCardConfigs.length && row.configs.networkCardConfigs[0].ipPoolId))">配置</template>
            </span>
          </basic-form-item>
        </template>
      </el-table-column>
      <el-table-column label="密码" show-overflow-tooltip width="180px">
        <template slot-scope="{ row, $index }">
          <basic-form-item v-if="row.subLocation.vendorType === 'H3C'" label="" validate="required,noNumber" :prop="`showParamList.${$index}.configs.password`" key="h3cp">
            <el-input v-model="row.configs.password" placeholder="请输入密码" show-password></el-input>
          </basic-form-item>
          <basic-form-item v-else label="" validate="required,vmPassword" :prop="`showParamList.${$index}.configs.password`" key="otherp">
            <el-input v-model="row.configs.password" placeholder="请输入密码" show-password></el-input>
          </basic-form-item>
          <basic-form-item label="" validate="required" :prop="`showParamList.${$index}.configs.confirm_password`">
            <el-input v-model="row.configs.confirm_password" placeholder="请再次输入密码" show-password></el-input>
          </basic-form-item>
          <basic-form-item v-if="row.subLocation.vendorType === 'SUGONCLOUD'" label="" validate="required,sugonVNCPassword" :prop="`showParamList.${$index}.configs.vncPassword`" key="sugon">
            <el-input v-model="row.configs.vncPassword" placeholder="请输入VNC密码" show-password></el-input>
          </basic-form-item>
        </template>
      </el-table-column>
      <el-table-column label="用途" show-overflow-tooltip width="160px">
        <template slot-scope="{ row, $index }">
          <basic-form-item label="" validate="required" :prop="`showParamList.${$index}.subLocation.purpose`" key="purpose">
            <el-input v-model="row.subLocation.purpose"> </el-input>
          </basic-form-item>
        </template>
      </el-table-column>
      <el-table-column label="软件配置" show-overflow-tooltip width="160px" v-if="addData.preview.isInstallSoftware">
        <template slot-scope="{ row, $index }">
          <basic-form-item label="">
            <span class="detail-href" @click="openGraph(row, $index)"> {{ getGraphConfigLabel(row) }} </span>
          </basic-form-item>
        </template>
      </el-table-column>
      <el-table-column label="宿主机" show-overflow-tooltip width="160px" v-if="itemData">
        <template slot-scope="{ row, $index }">
          <basic-form-item label="" :prop="`showParamList.${$index}`" :rules="rules.hostRule" key="hostId">
            <span class="detail-href" @click="handleOpenHostDialog(row, $index)">
              <template v-if="row.preview && row.preview.hosts && row.preview.hosts.length">
                <div v-for="(item, index) in row.preview.hosts" :key="index">云主机{{ index + 1 }}: {{ item.hostName }} - {{ item.storeName }}</div>
              </template>
              <template v-else>配置</template>
            </span>
          </basic-form-item>
        </template>
      </el-table-column>
      <el-table-column label="数量" show-overflow-tooltip width="160px">
        <template slot-scope="{ row, $index }">
          <basic-form-item label="" validate="required" :prop="`showParamList.${$index}.emption.count`" key="count">
            <el-input-number v-model="row.emption.count" :min="1" :max="20"> </el-input-number>
          </basic-form-item>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160px" fixed="right">
        <template slot-scope="{ row, $index }">
          <basic-form-item label="">
            <el-button type="text" @click="handleClone(row)">复制</el-button>
            <el-button type="text" @click="handleSub($index)">删除</el-button>
          </basic-form-item>
        </template>
      </el-table-column>
      <span slot="pagination"></span>
    </basic-table>
    <DataDisk v-if="addDiskDialog.visible" :dialog="addDiskDialog" @success="changeDisk" :disabled="disabled"></DataDisk>
    <Host v-if="addHostDialog.visible" :dialog="addHostDialog" :disabled="disabled"></Host>
    <Ippool v-if="addNetworkDialog.visible" :dialog="addNetworkDialog" :disabled="disabled" :showParamList="showParamList"></Ippool>
    <el-dialog :visible.sync="graphDialog.visible" title="作业编排" width="1200px" append-to-body top="5vh" :closeOnClickModal="false">
      <Graph v-if="graphDialog.visible" :graphDialog="graphDialog" @back="graphDialog.visible = false" :disabled="disabled"></Graph>
    </el-dialog>
  </basic-form>
</template>

<script>
import { conditionService, conditionImage, getNameRule, conditionFlavor, conditionVoleme } from 'services/platform/index'
import { getPoolCondition } from 'services/platform/pool'
import { uniqBy, cloneDeep } from 'lodash-es'
import { transformNetworkConfig } from './ImageItem.vue'
import { subApplicationParam, GEN_UUID, ServiceCodeMap, defaultTask } from '../data/EFCInit'
import Ippool, { CECSTACK_DEFAULT_CONFIG, NETCARD_DEFAULT_CONFIG, CLOUDTOWER_DEFAULT_CONFIG } from './EFCIppool.vue'
import DataDisk, { PUBLIC_DISK_TYPE_MAP } from './EFCDataDisk.vue'
import Host from './EFCHost.vue'
import sku from '../mixins/EFCsku.js'
import Graph from 'views/resource-apply/graph/graph.vue'
import { getVolumeTpl } from 'services/platform/smart.js'
export default {
  name: 'VmList',
  mixins: [sku],
  components: {
    Ippool,
    DataDisk,
    Graph,
    Host
  },
  props: {
    itemData: {
      type: [Object, Boolean]
    },
    showParamList: {
      type: Array,
      required: true,
      default: () => []
    },
    addData: {
      type: Object,
      required: true,
      default: () => {}
    },
    disabled: {
      type: Boolean
    }
  },
  provide() {
    // 使用函数的形式，可以访问到 `this`
    return {
      getSubApplicationParamsForTaskServer: () => this.addData.subApplicationParams.filter((item) => item.taskGroupUuid === this.graphDialog.task.taskGroupUuid)
    }
  },
  computed: {
    formData() {
      return { showParamList: this.showParamList }
    },
    regionList() {
      return this.allPoolList.reduce((pre, cur) => {
        if (!pre.find((item) => item.region == cur.region)) {
          pre.push({
            regionName: cur.regionName,
            region: cur.region
          })
        }
        return pre
      }, [])
    }
  },
  data() {
    return {
      nameruleList: [],
      vendorTypelist: [],
      allPoolList: [],
      addDiskDialog: {
        visible: false,
        index: '',
        row: {}
      },
      addNetworkDialog: {
        visible: false,
        row: {},
        cb: () => {}
      },
      addHostDialog: {
        visible: false,
        row: {},
        cb: () => {}
      },
      rules: {
        networkCardConfigsRule: [
          {
            required: true,
            validator: (rule, value, callback) => {
              const validateNetworkCard = this.validateNetworkCard(value)
              if (validateNetworkCard.valid) {
                callback()
              } else {
                callback(new Error(validateNetworkCard.message))
              }
            },
            trigger: null
          }
        ],
        hostRule: [
          {
            required: true,
            validator: (rule, value, callback) => {
              const validateHosts = this.validateHosts(value)
              if (validateHosts.valid) {
                callback()
              } else {
                callback(new Error(validateHosts.message))
              }
            },
            trigger: null
          }
        ],
        nameRuleIdRule: [
          {
            required: false,
            validator: (rule, value, callback) => {
              const row = rule.field.split('.')[1]
              if (!this.showParamList[row].configs.nameRuleId && !this.showParamList[row].configs.name) {
                callback(new Error('命名规则与云主机名称不能同时为空'))
              } else {
                callback()
              }
            }
          }
        ],
        vmNameRule: [
          {
            required: false,
            validator: (rule, value, callback) => {
              const row = rule.field.split('.')[1]
              if (!this.showParamList[row].configs.nameRuleId && !this.showParamList[row].configs.name) {
                callback(new Error('命名规则与云主机名称不能同时为空'))
              } else {
                callback()
              }
            }
          }
        ]
      },
      graphDialog: {
        visible: false,
        task: {},
        cb: () => {}
      },
      CTDataDisktemplateData: []
    }
  },
  created() {
    getNameRule({
      page: 1,
      rows: 9999
    }).then((data) => {
      if (data.success) {
        this.nameruleList = data.data.rows
      }
    })
    this.getAllPool()
    // 获取云平台类型
    conditionService('server').then((data) => {
      if (data.success) {
        this.vendorTypelist = data.data
      }
    })
  },
  methods: {
    changeNameRuleId(row, index) {
      if (row.configs.nameRuleId) row.configs.name = ''
      this.$refs.addForm && this.$refs.addForm.$refs.formRef.validateField(`showParamList.${index}.configs.name`)
    },
    changeName(row, index) {
      if (row.configs.name) row.configs.nameRuleId = ''
      this.$refs.addForm && this.$refs.addForm.$refs.formRef.validateField(`showParamList.${index}.configs.nameRuleId`)
    },
    // 公有云的规格不可以手动输入,需要选择
    arraySpanMethod({ row, column }) {
      if (row.subLocation.isPublic) {
        if (column.label === 'CPU（核）') {
          return [1, 2]
        }
        if (column.label === '内存（GB）') {
          return [0, 0]
        }
      }
    },
    getGraphConfigLabel(row) {
      const task = this.addData.tasks?.find(({ taskGroupUuid }) => taskGroupUuid === row.taskGroupUuid)
      if (!task) return '配置'
      return `${task.taskName}`
    },
    openGraph(row) {
      if (!this.addData.location.name) return this.$message.error('请填写业务信息')
      if (!row.configs.vmHostName) return this.$message.error('请填写主机名')
      if (!row.configs.password) return this.$message.error('请填写密码')
      this.$emit('handleUpdateParamList')
      this.graphDialog.visible = true
      this.graphDialog.task = this.addData.tasks?.find((item) => item.taskGroupUuid === row.taskGroupUuid) || {
        ...defaultTask,
        taskGroupUuid: row.taskGroupUuid
      }
      this.graphDialog.cb = () => {
        this.graphDialog.task.taskName = `${this.addData.location.name}_${this.graphDialog.task.name}`
        const findIndex = this.addData.tasks?.findIndex((item) => item.taskGroupUuid === row.taskGroupUuid)
        if (findIndex > -1) {
          this.addData.tasks[findIndex] = this.graphDialog.task
        } else {
          this.addData.tasks.push(this.graphDialog.task)
        }
      }
    },
    changeCpu(val, row) {
      row.elements[0].specs[0].cpu = val
    },
    changeMemory(val, row) {
      row.elements[0].specs[1].memory = val
    },
    async changeFlavor(row) {
      const { cpu, memory, flavorUuid } = row.flavorList.find((item) => item.id === row.configs.flavorId)
      this.changeCpu(cpu, row)
      this.changeMemory(memory, row)
      // 公有云根据规格去查系统盘类型
      row.preview.flavorUuid = flavorUuid
      this.getPublicDiskTypeList(row, true)
    },
    // 将磁盘配置保存到 elements 中
    async changeDisk(index = -1, row) {
      row = index > -1 ? this.showParamList[index] : row
      // 兼容处理
      if (!row.elements[1]?.specs) {
        row.elements[1] = {
          ignore: false,
          isLoadData: true,
          serviceCode: '',
          categoryId: '',
          category: '',
          specs: [
            // {
            //   disk: 50
            // }
          ],
          serviceItem: {}
        }
      }
      // QCLOUD/MANAGEONE 不需要把系统盘放在 elements[1] 中, 放在 elements[0].specs[2] 中 ---------------------------------
      // 防止切换云平台时将 QCLOUD/MANAGEONE 已设置的系统盘大小带过去
      row.elements[0].specs.splice(2)
      // 最终拼接参数时忽略系统盘
      row.elements[1].ignore = ['QCLOUD', 'MANAGEONE'].includes(row.subLocation.vendorType)
      // QCLOUD/MANAGEONE 不需要把系统盘放在 elements[1] 中, 放在 elements[0].specs[2] 中 ---------------------------------

      // 系统盘
      row.elements[1].specs = [{ disk: row.configs.sysDisk.disk }]
      // 设置磁盘类型
      if (row.subLocation.isPublic) row.elements[1].cloudCategory = row.configs.sysDisk.cloudCategory
      row.configs.sysDisk.categoryId = row.elements[1].categoryId
      // 根据 addDiskList 生成数据盘
      row.elements.splice(2)
      if (row.configs.addDiskList.length) {
        const dataDiskElementClone = cloneDeep({ ...row.elements[1], ignore: false })
        row.configs.addDiskList.map((item) => {
          const _item = { ...dataDiskElementClone, specs: [{ disk: item.disk }] }
          if (row.subLocation.isPublic && item.cloudCategory) {
            // 设置磁盘类型
            _item.cloudCategory = item.cloudCategory
          }
          row.elements.push(_item)
        })
      }
      // 设置各个云平台的默认磁盘配置
      const vendorType = row.subLocation.vendorType
      const vendorId = row.subLocation.vendorId
      switch (vendorType) {
        case 'VMWARE':
        case 'SMARTX':
          row.configs.sysDisk.diskType = 'thin'
          // 设置磁盘默认数据
          row.configs.addDiskList = row.configs.addDiskList.map((item) => ({
            disk: item.disk,
            createLvm: false,
            diskType: 'thin',
            fileSystem: 'ext3',
            forceMount: false
          }))
          break
        case 'INSPURRAIL':
          row.configs.sysDisk.diskType = 'thin'
          // 设置磁盘默认数据
          row.configs.addDiskList = row.configs.addDiskList.map((item) => ({
            disk: item.disk,
            templateDisk: item.templateDisk,
            createLvm: false,
            diskType: 'thin',
            fileSystem: 'ext3',
            forceMount: false
          }))
          break
        case 'CNWARE':
          // 在镜像那里设置
          break
        case 'CLOUDTOWER':
          const busData = [
            { name: 'VIRTIO', value: 'VIRTIO' },
            { name: 'SCSI', value: 'SCSI' },
            { name: 'IDE', value: 'IDE' }
          ]
          // 设置磁盘默认数据
          if (!this.CTDataDisktemplateData.length || this.CTDataDisktemplateData[0].vendorId !== vendorId) {
            await getVolumeTpl({
              simple: true,
              params: this.$tools.handleSearchParam({ vendorId, name: 'REPLICA_2_THIN_PROVISION' })
            }).then((data) => {
              if (data.success) {
                if (!data.data.rows.length) {
                  row.configs.addDiskList = []
                  return this.$message.error('获取CLOUDTOWER存储策略数据为空,请联系管理员')
                }
                this.CTDataDisktemplateData = data.data.rows
              }
            })
          }
          row.configs.addDiskList = row.configs.addDiskList.map((item) => ({
            disk: item.disk,
            type: 'newDisk',
            bus: busData[0].value,
            volumeTemplateId: this.CTDataDisktemplateData[0].id, // 存储策略
            volumeTemplateName: this.CTDataDisktemplateData[0].name
          }))
          break
        case 'CECSTACK':
          // 根据服务类型设置系统盘 diskType
          // if (row.elements?.[1]?.categoryList) row.configs.sysDisk.diskType = row.elements[1].categoryList.find(({ id }) => id === row.elements[1].categoryId)?.code || 'hdd'
          // row.configs.addDiskList = row.configs.addDiskList.map((item, index) => {
          //   // 根据服务类型设置数据盘 diskType
          //   const patchElements = row.elements[2 + index]
          //   if (patchElements.categoryList?.length) item.diskType = patchElements.categoryList.find(({ id }) => id === patchElements.categoryId)?.code || 'hdd'
          //   return {
          //     disk: item.disk,
          //     deleteWithInstance: true,
          //     bootVolume: false,
          //     volumeUnit: 'GiB'
          //   }
          // })
          row.configs.addDiskList.forEach((item) => {
            row.publicDataDiskTypeList.find((i) => {
              if (i.name === item.cloudCategory) {
                item.diskMode = i.diskMode
              }
            })
          })
          break
        case 'QCLOUD':
          // 系统盘在底层就是以字符串 '系统盘 xxxG' 的形式存在, 可以视为不算作资源计费项
          // 只保留第一项
          row.elements[0].specs[2] = {
            disk: row.configs.sysDisk.disk
          }
          break
        case 'MANAGEONE':
          break
        case 'SANGFOR':
          // 设置磁盘默认数据
          row.configs.sysDisk.sizeModified = row.configs.sysDisk.disk !== row.configs.sysDisk.templateDisk
          row.configs.addDiskList = row.configs.addDiskList.map((item) => ({
            disk: item.disk,
            templateDisk: item.templateDisk,
            sizeModified: item.disk !== item.templateDisk,
            // 精简分配
            preallocate: item.preallocate || 'off',
            // 数据盘统一为 new_disk
            type: 'new_disk',
            isOldDisk: item.isOldDisk || 0,
            id: item.id || '',
            storageId: item.storageId || '',
            storageFile: item.storageFile || ''
          }))
          break
        case 'SUGONCLOUD':
          row.configs.addDiskList.forEach((item) => {
            row.publicDataDiskTypeList.find((i) => {
              if (i.name === item.cloudCategory) {
                item.diskMode = i.diskMode
              }
            })
          })
          break
        default:
          break
      }
    },
    handleClone(row = subApplicationParam) {
      const cloneData = cloneDeep(row)
      cloneData.taskGroupUuid = GEN_UUID()
      cloneData.taskTargetUuid = GEN_UUID()
      cloneData.configs.name = ''
      // 克隆时重置已选择 ip
      cloneData.configs.networkCardConfigs.map((item) => {
        if (item.ipPolicy === 'Manual') {
          item.address = []
          item.ipPolicy = 'Auto'
        }
      })
      this.showParamList.push(cloneData)
    },
    handleSub(index) {
      this.showParamList.splice(index, 1)
    },
    handleOpenNetworkDialog(row, index) {
      this.addNetworkDialog.visible = true
      this.addNetworkDialog.row = row
      this.addNetworkDialog.cb = () => {
        this.$refs.addForm && this.$refs.addForm.$refs.formRef.validateField(`showParamList.${index}`)
      }
    },
    getDiskTotalSize(row) {
      return row.configs.sysDisk.disk + row.configs.addDiskList.reduce((pre, cur) => pre + cur.disk, 0)
    },
    getDiskType(row, cloudCategory, listKey) {
      if (!cloudCategory || !row.subLocation.isPublic) return ''
      const _typeList = row[listKey] || []
      let type = _typeList.find(({ value }) => value === cloudCategory)?.name
      return type ? (type += '-') : ''
    },
    handleOpenDiskDialog(row, index) {
      this.addDiskDialog.visible = true
      this.addDiskDialog.row = row
      this.addDiskDialog.index = index
    },
    handleOpenHostDialog(row, index) {
      this.addHostDialog.visible = true
      this.addHostDialog.row = row
      this.addHostDialog.cb = () => {
        this.$refs.addForm && this.$refs.addForm.$refs.formRef.validateField(`showParamList.${index}`)
      }
    },
    getOsList(row, manual) {
      if (!row.subLocation.vendorId) return
      let params
      if (row.subLocation.isPublic) {
        params = {
          condition: 'listByImageType',
          vendorId: row.subLocation.vendorId,
          status: 'ACTIVE',
          tenantId: 0,
          regionId: row.subLocation.region,
          imageType: 'PUBLIC'
        }
      } else {
        params = {
          condition: 'listTenantImages',
          vendorId: row.subLocation.vendorId
        }
        if (row.subLocation.vendorType === 'SANGFOR') {
          if (!row.subLocation.azUuid) return
          params.azUuid = row.subLocation.azUuid
        }
      }
      conditionImage(params).then((data) => {
        if (data.success) {
          row.imageData = Object.freeze(data.data)
          this.$set(row, 'osList', Object.keys(row.imageData))
          if (!row.osList.includes(row.configs.osCategory)) row.configs.osCategory = row.osList[0]
          if (manual) {
            row.configs.osVersion = ''
          }
          this.$set(row, 'versionList', [])
          this.getVersionList(row, !row.configs.osVersion)
        } else {
          row.configs.osCategory = ''
          row.configs.osVersion = ''
          row.osList = []
          row.versionList = []
          row.configs.networkCardConfigs = []
        }
      })
      return row.osList
    },

    getVersionList(row, manual) {
      if (row.subLocation.isPublic) {
        if (!row.configs.osCategory) return
        row.versionList = row.imageData[row.configs.osCategory].map(({ name }) => ({ name }))
      } else {
        row.versionList = Object.keys(row.imageData[row.configs.osCategory]).map((key) => {
          const image = row.imageData[row.configs.osCategory][key]?.[0]
          const disabled = row.subLocation.vendorType === 'H3C' && !(image.account || image.password)
          return {
            name: disabled ? key + '-模板未配置账号密码，请联系管理员前往云主机模板页面进行操作' : key,
            disabled
          }
        })
      }
      if (!row.versionList.find(({ name }) => name === row.configs.osVersion)) {
        row.configs.osVersion = row.versionList.find(({ disabled }) => !disabled)?.name
      }
      this.getImage(row, manual)
    },
    getImage(row, manual) {
      let obj
      if (row.subLocation.isPublic) {
        obj = row.imageData[row.configs.osCategory].find(({ name }) => row.configs.osVersion === name)
      } else {
        obj = row.imageData[row.configs.osCategory][row.configs.osVersion]?.[0]
      }
      if (!obj) return
      console.log(manual)
      if (manual) {
        row.configs.imageId = obj.id
        if (row.subLocation.isPublic) {
          this.getFlavorList(row, manual)
        }
        // 电子云为 minDisk
        // cloudtower 镜像中可能没系统盘大小
        row.configs.templateDisk = obj.templateDisk || obj.minDisk || 50
        row.configs.templateRam = obj.minRam / 1024 || 1
        if (row.configs.memory < row.configs.templateRam) row.configs.memory = row.configs.templateRam
        row.configs.sysDisk.disk = row.configs.templateDisk
      }
      // 公有云
      if (row.subLocation.isPublic) {
        if (manual) {
          // 公有云没有 networkCardConfigs 相关
          this.$set(row.configs, 'networkCardConfigs', [])
        }
      } else if (['H3C', 'CLOUDTOWER'].includes(row.subLocation.vendorType)) {
        if (manual) {
          this.$set(row.configs, 'networkCardConfigs', [
            {
              ...NETCARD_DEFAULT_CONFIG,
              networkId: obj.networkId,
              // CLOUDTOWER 特殊参数
              ...(row.subLocation.vendorType === 'CLOUDTOWER' ? CLOUDTOWER_DEFAULT_CONFIG : {})
            }
          ])
        }
      } else if (['VMWARE', 'SMARTX', 'INSPURRAIL'].includes(row.subLocation.vendorType)) {
        if (manual) {
          if (!obj.networkCards?.length) this.$message.error('镜像缺少网卡，请检查镜像是否正确')
          this.$set(
            row.configs,
            'networkCardConfigs',
            obj.networkCards.map((item) => {
              return {
                ...NETCARD_DEFAULT_CONFIG,
                networkCardId: item.id
              }
            })
          )
          if (row.subLocation.vendorType == 'INSPURRAIL') {
            // 模板里面的磁盘配置
            const volumes = obj.volumes || []
            const addDiskList = []
            volumes.map(({ bootVolume, size }) => {
              if (bootVolume) {
                row.configs.templateDisk = size
                row.configs.sysDisk.disk = size
              } else {
                addDiskList.push({ disk: size, templateDisk: size })
              }
            })
            this.$set(row.configs, 'addDiskList', addDiskList)
          }
        }
      } else if (row.subLocation.vendorType == 'SANGFOR') {
        row.configs.vmUuid = obj.imageUuid
        if (manual) {
          // 根据镜像还原网卡
          // 不回显,默认一张网卡
          // const hardware_status = JSON.parse(obj.detail || '{}')?.hardware_status
          // if (!hardware_status) return this.$message.error('镜像缺少网卡，请检查镜像是否正确')
          // const configs = transformNetworkConfig(hardware_status).map(item => ({
          //   ...NETCARD_DEFAULT_CONFIG
          // }))
          this.$set(row.configs, 'networkCardConfigs', [{ ...NETCARD_DEFAULT_CONFIG }])
        }
        if (manual) {
          // 根据镜像还原磁盘
          const volumes = obj.volumes || []
          const addDiskList = []
          volumes.map(({ bootVolume, size, diskPolicieUuid, sangforId, sangforStorageId, sangforStorageFile }) => {
            if (bootVolume) {
              row.configs.templateDisk = size
              row.configs.sysDisk.disk = size
              // 原来的大小,用来判断有没有改动过
              row.configs.sysDisk.templateDisk = size
              row.configs.sysDisk.type = 'derive_disk'
              row.configs.sysDisk.preallocate = diskPolicieUuid || 'off'
              row.configs.sysDisk.isOldDisk = 1
              row.configs.sysDisk.id = sangforId
              row.configs.sysDisk.storageId = sangforStorageId
              row.configs.sysDisk.storageFile = sangforStorageFile
            } else {
              addDiskList.push({ disk: size, templateDisk: size, preallocate: diskPolicieUuid || 'off', isOldDisk: 1, id: sangforId, storageId: sangforStorageId, storageFile: sangforStorageFile })
            }
          })
          this.$set(row.configs, 'addDiskList', addDiskList)
        }
      } else if (row.subLocation.vendorType === 'CNWARE') {
        const res = JSON.parse(obj.configuration).devices.map((d) => {
          if (d.capacity) {
            const size = Number(d.capacity) / 1024 / 1024 / 1024
            // 系统盘大小
            row.configs.templateDisk = size
          }
          return {
            ...d
          }
        })
        if (manual) {
          row.configs.sysDisk = { ...row.configs.sysDisk, ...(res?.[0] || {}) }
        }
      } else if (row.subLocation.vendorType === 'SUGONCLOUD') {
        if (manual) {
          row.configs.sysDisk = {
            disk: obj.minDisk,
            diskType: obj.stores
          }
        }
      }
      // 设置硬盘参数
      if (manual) this.changeDisk(-1, row)
    },
    setVendor(row, manual = true) {
      const findVendorList = this.getVendorListByRegionZone(row)
      const pool = findVendorList.filter((item) => item.vendorId == row.subLocation.vendorId)[0]
      if (!pool) return this.$message.error('当前可用区下不存在资源池')
      console.log('当前资源池:', pool.vendorType, pool.name, pool.isPublic)
      const { vendorType, id, azUuid, isPublic } = pool
      row.subLocation.poolGroupId = id
      row.subLocation.azUuid = azUuid
      row.subLocation.vendorType = vendorType
      row.subLocation.isPublic = isPublic || vendorType === 'CECSTACK' || vendorType === 'SUGONCLOUD'
      row.networkRelations = pool.networkRelations || []
      row.service = ServiceCodeMap.server[vendorType]
      row.elements.map((item, index) => {
        item.serviceCode = index === 0 ? ServiceCodeMap.server[vendorType] : ServiceCodeMap.disk[vendorType]
      })
      // 只有青云创建需要, 为了统一都设置上
      row.configs.regionId = row.subLocation.region
      row.configs.zoneId = row.subLocation.az
      switch (vendorType) {
        case 'VMWARE':
        case 'INSPURRAIL':
          row.configs.isAddShterm = false
          break
        case 'CLOUDTOWER':
          row.configs.serverId = 0
          row.configs.ha = true
          row.configs.firmware = 'BIOS'
          row.configs.status = 'running'
          row.configs.fullClone = false
          break
        case 'SANGFOR':
          row.configs.isAddShterm = false
          row.configs.cloneType = 'fast'
          row.configs.interfaceType = 'rtl8139'
          row.configs.disableNet = 1
          row.configs.ha = 0
          row.configs.start = 0
          break
        case 'SUGONCLOUD':
          row.configs.projectUuid = pool.poolGroupProjects[0].projectUuid || ''
          break
        default:
          break
      }
      // 根据云平台类型设置默认磁盘配置
      this.changeDisk(-1, row)
      this.getData(row, manual)
    },
    async getData(row, manual = true) {
      // 加载服务目录
      if (!this.itemData || !this.disabled) this.loadSku(row, manual)
      this.getOsList(row, manual)
      if (row.subLocation.isPublic) {
        this.getFlavorList(row, manual)
        this.getPublicDiskTypeList(row, manual)
      }

      // 清空之前所选
      if (manual) {
        row.configs.vpcId = ''
        row.configs.subnetId = ''
        row.configs.vpcName = ''
        row.configs.subnetName = ''
        row.configs.groups = []
        row.vpcList = []
        row.subnetList = []
        row.groupList = []
        row.preview.hosts = []
      }
    },
    // 付费模式变更
    durationModeChange() {
      this.showParamList.map((row) => {
        if (row.subLocation.isPublic) this.getFlavorList(row, true)
      })
    },
    getFlavorList(row, manual) {
      if (manual && row.configs.flavorId) row.configs.flavorId = ''
      this.$set(row, 'flavorList', [])
      conditionFlavor({
        condition: JSON.stringify({
          condition: 'listAvailable',
          vendorId: row.subLocation.vendorId,
          regionId: row.subLocation.region,
          zoneId: row.subLocation.az,
          instanceChargeType: this.addData.emption.duration.mode === 'Hour' ? 'PostPaid' : 'PrePaid',
          imageUuid: row.configs.osVersion
        })
      }).then(async (data) => {
        if (data.success) {
          row.flavorList = data.data.map(({ id, name, cpu, memory, flavorUuid }) => ({ id, name, cpu, memory, flavorUuid })).sort((a, b) => a.cpu - b.cpu || a.memory - b.memory)
          if (data.data.length) {
            if (!row.preview) row.preview = {}
            if (manual) {
              // 手动切换
              row.configs.flavorId = row.flavorList[0].id
              row.preview.flavorUuid = row.flavorList[0].flavorUuid
            }
            // this.getPublicDiskTypeList(row, manual)
            this.changeFlavor(row)
          }
        }
      })
    },
    // 查询系统盘类型
    async getPublicDiskTypeList(row, manual) {
      this.$set(row, 'publicSysDiskTypeList', [])
      this.$set(row, 'publicDataDiskTypeList', [])
      const _initSysDisk = () => {
        // 当前盘类型是否在对应的盘类型列表中,如果不在则初始化为盘类型列表的第一项
        if (row.publicSysDiskTypeList.length) {
          // 系统盘
          if (!row.publicSysDiskTypeList.find((i) => i.value === row.configs.sysDisk.cloudCategory)) {
            row.configs.sysDisk.cloudCategory = row.publicSysDiskTypeList[0].value
          }
        }
      }
      const _initDataDisk = () => {
        // 当前盘类型是否在对应的盘类型列表中,如果不在则初始化为盘类型列表的第一项
        if (row.publicDataDiskTypeList.length) {
          // 数据盘
          row.configs.addDiskList.forEach((item) => {
            if (!row.publicDataDiskTypeList.find((i) => i.value === item.cloudCategory)) {
              item.cloudCategory = row.publicDataDiskTypeList[0].value
            }
          })
        }
      }
      const _publicDiskTypeList = PUBLIC_DISK_TYPE_MAP[row.subLocation.vendorType] || []
      if (_publicDiskTypeList.length) {
        // 部分云平台写死的盘类型
        row.publicSysDiskTypeList = _publicDiskTypeList
        row.publicDataDiskTypeList = _publicDiskTypeList
        _initSysDisk()
        _initDataDisk()
      } else {
        if (!row.preview.flavorUuid) return
        // 系统盘接口
        const sysRes = await conditionVoleme({
          condition: 'listAvailable',
          vendorId: row.subLocation.vendorId,
          regionId: row.subLocation.region,
          zoneId: row.subLocation.az,
          instanceChargeType: this.addData.emption.duration.mode === 'Hour' ? 'PostPaid' : 'PrePaid',
          volumeKind: 'SystemDisk',
          resourceType: 'instance',
          instanceType: row.preview.flavorUuid
        })
        if (!sysRes.success || !sysRes.data.length) return
        row.publicSysDiskTypeList = sysRes.data
        _initSysDisk()
        // 数据盘接口
        const systemDiskCategory = row.publicSysDiskTypeList.find((i) => i.value === row.configs.sysDisk.cloudCategory).key
        const dataDiskRef = await conditionVoleme({
          condition: 'listAvailable',
          vendorId: row.subLocation.vendorId,
          regionId: row.subLocation.region,
          zoneId: row.subLocation.az,
          instanceChargeType: this.addData.emption.duration.mode === 'Hour' ? 'PostPaid' : 'PrePaid',
          volumeKind: 'DataDisk',
          resourceType: 'instance',
          instanceType: row.preview.flavorUuid,
          systemDiskCategory: systemDiskCategory
        })
        if (!dataDiskRef.success || !dataDiskRef.data.length) return
        row.publicDataDiskTypeList = dataDiskRef.data
        _initDataDisk()
      }
    },
    getZoneListByRegion(row) {
      const filterPools = this.allPoolList.filter((item) => item.region == row.subLocation.region)
      if (!filterPools.length) return []
      // 同一地域下可能会存在重复可用区,去重处理
      if (filterPools[0].isPublic) {
        const formatPools = []
        // 将多个可用区扁平化放在资源池中
        filterPools.map((pool) => {
          pool.regionRelations.map((zone) => {
            formatPools.push({ ...pool, availablitiyZone: zone.zoneId, azName: zone.zoneName })
          })
        })
        return uniqBy(formatPools, 'availablitiyZone')
      } else {
        return uniqBy(filterPools, 'availablitiyZone')
      }
    },
    getVendorListByRegionZone(row) {
      const zoneList = this.getZoneListByRegion(row)
      return zoneList.filter((item) => item.availablitiyZone == row.subLocation.az)
    },
    // 地域变化
    // manual 手动切换
    changeRegion(row, manual = true) {
      this.setZone(row, manual)
    },
    // 设置可用区
    setZone(row, manual = true) {
      const zoneList = this.getZoneListByRegion(row)
      // 手动切换才需要置空
      if (manual && !zoneList.length) return (row.subLocation.az = '')
      if (!zoneList.find((item) => item.availablitiyZone === row.subLocation.az)) {
        row.subLocation.az = zoneList[0].availablitiyZone
      }
      this.changeAz(row, manual)
    },
    // 可用区改变
    changeAz(row, manual = true) {
      const findVendorList = this.getVendorListByRegionZone(row)
      if (manual && !findVendorList.length) return (row.subLocation.vendorId = '')
      if (!findVendorList.find((item) => item.vendorId === row.subLocation.vendorId)) {
        row.subLocation.vendorId = findVendorList[0].vendorId
      }
      this.setVendor(row, manual)
    },
    // 所有资源池
    async getAllPool() {
      const res = await getPoolCondition({
        condition: 'listPoolGroups',
        tenantId: this.addData.location.tenantId
      })
      if (!res.success) return
      this.allPoolList = res.data.map((item) => {
        // 存在公有云/公有云私有化部署, 但他们的资源处理方式都是公有云, 只不过私有化部署时 isPublic 为 false, 只涉及管理端的地域相关
        item.isPublic = item.isPublic || ['QCLOUD', 'MANAGEONE', 'CECSTACK'].includes(item.vendorType)
        return item
      })
      if (!this.regionList.length) return
      const [{ region }] = this.regionList
      if (!this.showParamList[0].subLocation.region) {
        this.showParamList[0].subLocation.region = region
      }
      this.showParamList.map((item) => {
        this.changeRegion(item, false)
      })
    },
    validateHosts(param) {
      const res = {
        valid: true,
        message: ''
      }
      // 申请时 || 没有手动填时
      if (!this.itemData || !param.preview?.hosts?.length) return res
      const everyHasSelect = param.preview.hosts.every((i) => i.hostId && i.storeId)
      const noHasSelect = param.preview.hosts.every((i) => !i.hostId && !i.storeId)
      if (everyHasSelect || noHasSelect) {
        if (everyHasSelect && param.preview.hosts.length !== param.emption.count) {
          res.valid = false
          res.message = '云主机数量与宿主机数量不一致'
        }
      } else {
        res.valid = false
        res.message = '请选择宿主机和数据存储'
      }

      return res
    },
    validateNetworkCard(param) {
      const res = {
        valid: true,
        message: ''
      }
      let flag = false
      let addressLenFlag = false
      let ipLenFlag = false
      let vpcFlag = false
      // 私有云 ip 校验
      if (!param.subLocation.isPublic) {
        param.configs.networkCardConfigs.forEach((item) => {
          if (!item.ipPoolId || (item.ipPolicy == 'Manual' && item.address.length == 0) || (item.checkIpv6 && (!item.ipv6PoolId || (item.ipv6Policy == 'Manual' && item.ipv6Address.length == 0)))) flag = true
          if (item.ipPolicy == 'Manual' && item.address.length !== param.emption.count) {
            addressLenFlag = true
          }
          if (item.ipPolicy === 'Auto' && item.showIps?.length < param.emption.count) {
            ipLenFlag = true
          }
        })
      }
      // 公有云 vpc/子网 校验
      if (param.subLocation.isPublic && !(param.configs.vpcId || param.configs.subnetId)) {
        vpcFlag = true
      }
      if (flag) {
        res.valid = false
        res.message = '网卡信息配置不完善'
        return res
      }
      if (addressLenFlag) {
        res.valid = false
        res.message = 'IP数量与云主机订购数量不一致'
        return res
      }
      if (ipLenFlag) {
        res.valid = false
        res.message = 'IP池可用IP数量不足'
        return res
      }
      if (vpcFlag) {
        res.valid = false
        res.message = '缺少 VPC 和子网信息'
      }
      return res
    },
    getParams() {
      let data = false
      this.$refs.addForm.validate((valid) => {
        if (valid) {
          const result = []
          this.showParamList.forEach((param) => {
            if (!param.configs.name && !param.configs.nameRuleId) {
              data = false
              this.$message.error('命名规则与云主机名称不能同时为空')
              return
            }
            const validateNetworkCard = this.validateNetworkCard(param)
            if (!validateNetworkCard.valid) {
              data = false
              return
            }
            const { password, confirm_password, ...other } = param.configs
            if (password !== confirm_password) {
              data = false
              this.$message.error('两次密码输入不一致')
              return
            }
            result.push({
              ...other,
              categoryId: param.elements[0].categoryId
            })
          })
          if (result.length === this.showParamList.length) data = result
        } else {
          this.$message.error('虚拟机信息未填写完整')
        }
      })
      return data
    }
  }
}
</script>

<style scope>
.el-tooltip__popper:empty {
  display: none;
}
</style>
