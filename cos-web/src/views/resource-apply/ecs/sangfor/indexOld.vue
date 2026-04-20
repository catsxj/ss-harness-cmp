<template>
  <div>
    <common-wrapper code="compute" :add-data="addData" ref="common" :elements="elements" :item-data="itemData" :disabled="disabled" :getParams="getParams" @vendorId="getVendorIdAfter">
      <div class="item-block">
        <h5>资源信息</h5>
        <el-row :gutter="20">
          <el-col :span="12">
            <basic-form-item label="资源池" validate="required" prop="configs.azId">
              <el-select class="basic-cmp" v-model="addData.configs.azId" @change="azChange">
                <el-option v-for="item in azList" :label="item.name" :value="item.uuid" :key="item.id"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </el-row>
      </div>
      <div class="item-block">
        <h5>云主机信息</h5>
        <el-row :gutter="20">
          <el-col :span="12">
            <basic-form-item label="云主机名称：" validate="required,vcName" prop="configs.name">
              <el-input class="basic-cmp" v-model="addData.configs.name"></el-input>
              <div class="tip">5~22位英文、数字、-的组合，不可为空</div>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="主机名：" validate="required" prop="configs.hostName">
              <el-input class="basic-cmp" v-model="addData.configs.hostName"></el-input>
              <span class="input-desc-text">
                <el-tooltip class="item" effect="dark" placement="right">
                  <div slot="content">1.安装虚拟机性能优化工具后，设置才会生效<br />2.Windows操作系统设置hostname后需重启后才生效</div>
                  <i class="el-icon-question"></i>
                </el-tooltip>
              </span>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="m-b-lg">
          <el-col :span="12">
            <basic-form-item label="密码设置：" validate="false,sangforVM" prop="configs.password">
              <el-input v-model="addData.configs.password" placeholder="请输入密码" show-password class="basic-cmp"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="确认密码：" validate="false,sangforVM" prop="configs.confirm_password">
              <el-input v-model="addData.configs.confirm_password" placeholder="请确认密码" show-password class="basic-cmp"></el-input>
            </basic-form-item>
          </el-col>
        </el-row>
      </div>
      <div class="item-block">
        <h5>配置信息</h5>
        <basic-form-item label="产品类型：">
          <el-radio-group v-model="currentElement.categoryId" @change="getSku(currentElement)">
            <el-radio-button :label="item.id" v-for="(item, index) in currentElement.categoryList" :key="index">{{ item.name }}</el-radio-button>
          </el-radio-group>
        </basic-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <basic-form-item label="克隆虚拟机：" validate="required" prop="configs.sourceVmId">
              <el-select class="basic-cmp" v-model="addData.configs.sourceVmId" @change="vmChange">
                <el-option v-for="(item, index) in cloneVmList" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="克隆方式：" validate="required" prop="configs.cloneType">
              <el-select class="basic-cmp" v-model="addData.configs.cloneType" :disabled="!storagePolicyIsShow || isEven">
                <el-option v-for="(item, index) in cloneTypeList" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="">
              <span class="input-desc-text">
                <el-checkbox v-model="addData.configs.start" :true-label="1" :false-label="0"><span class="tip">克隆完成后 ，自动启动克隆出来的虚拟机</span></el-checkbox>
              </span>
            </basic-form-item>
          </el-col>
        </el-row>
        <basic-form-item label="规格：">
          <sku-table :skus="currentElement.skuList" style="max-width: 850px" :mode="addData.emption.duration.mode" :show-price="true">
            <el-table-column show-overflow-tooltip label="规格代码" prop="code">
              <template v-slot="scope">
                <el-radio v-model="currentElement.skuId" :label="scope.row.id" :disabled="addData.location.version === '6.3'">{{ scope.row.code }}</el-radio>
              </template>
            </el-table-column>
          </sku-table>
        </basic-form-item>
        <template>
          <basic-form-item label="系统盘大小：">
            <span class="tip"> {{ addData.configs.size }} GB </span>
          </basic-form-item>
          <basic-form-item label="磁盘：">
            <el-button v-if="addData.configs.disks.length <= 15" type="text" @click="addDisk">添加数据盘</el-button>
            <el-row v-for="(item, index) in addData.configs.disks" :key="item.id" class="m-t">
              <el-col :span="9">
                <span style="font-size: 12px">分配方式：</span>
                <el-select :disabled="item.type === 'derive_disk'" class="basic-cmp" v-model="item.preallocate" placeholder="请选择">
                  <el-option label="精简分配" value="off"></el-option>
                  <el-option label="预分配" value="full"></el-option>
                  <el-option label="动态分配" value="metadata"></el-option>
                </el-select>
              </el-col>
              <el-col :span="9">
                <!-- <el-input-number v-model="item.size_mb" controls-position="right" :min="+addData.elements[1].specs[0].disk"></el-input-number> <span class="tip">GB</span> -->
                <span style="font-size: 12px">磁盘大小：</span>
                <el-select class="basic-cmp" v-model="item.size_mb" @change="sizeMBChange(item.size_mb, index)">
                  <el-option :label="generateSpec(item.spec)" v-for="item in systemElement.skuList" :key="item.id" :value="item.id"></el-option>
                </el-select>
              </el-col>
              <el-col :span="3">
                <span v-if="item.type === 'derive_disk'" class="tip">原大小：{{ item.size }}GB</span>
                <el-button v-else type="danger" icon="el-icon-delete" circle @click="deleteDisk(index)"></el-button>
              </el-col>
            </el-row>
          </basic-form-item>
        </template>
        <el-row :gutter="20">
          <el-col :span="12">
            <basic-form-item label="故障迁移：">
              <span class="input-desc-text">
                <el-checkbox v-model="addData.configs.ha" :true-label="1" :false-label="0"></el-checkbox>&nbsp;当虑拟机所在主机出现故障时，自动切换到其它物理主机上运行。
                <el-tooltip class="item" effect="dark" content="当前主机故障时，自动切换到其他主机上运行" placement="right">
                  <i class="el-icon-question"></i>
                </el-tooltip>
              </span>
            </basic-form-item>
          </el-col>
        </el-row>
        <template>
          <el-row :gutter="20">
            <el-col :span="12">
              <basic-form-item label="存储位置：" validate="required" prop="configs.storage">
                <el-select class="basic-cmp" v-model="addData.configs.storage" @change="storageChange">
                  <el-option v-for="(item, index) in dataStoresList" :key="index" :label="item.name" :value="item.id"></el-option>
                </el-select>
              </basic-form-item>
            </el-col>
            <el-col :span="12">
              <basic-form-item label="分组：" validate="required" prop="configs.groupUuid">
                <el-select class="basic-cmp" v-model="addData.configs.groupUuid">
                  <el-option v-for="(item, index) in groupsList" :key="index" :label="item.name" :value="item.uuid"></el-option>
                </el-select>
              </basic-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <basic-form-item label="存储策略：" validate="required" prop="configs.storagePolicy">
                <el-select class="basic-cmp" v-model="addData.configs.storagePolicy">
                  <el-option v-for="(item, index) in policyList" :key="index" :label="item.name" :value="item.id"></el-option>
                </el-select>
              </basic-form-item>
            </el-col>
            <el-col :span="12">
              <basic-form-item label="运行位置：" validate="required" prop="configs.alwaysTryHost">
                <el-select class="basic-cmp" v-model="addData.configs.alwaysTryHost">
                  <el-option v-for="(item, index) in hostList" :key="index" :label="item.name" :value="item.uuid"></el-option>
                </el-select>
              </basic-form-item>
            </el-col>
          </el-row>
        </template>
        <basic-form-item label="加入堡垒机：" label-width="120px">
          <el-switch v-model="addData.configs.isAddShterm" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
        </basic-form-item>
        <el-row>
          <el-col :span="12">
            <basic-form-item label="备注：">
              <el-input class="basic-cmp" type="textarea" :rows="2" placeholder="请输入内容" v-model="addData.configs.remark"></el-input>
            </basic-form-item>
          </el-col>
        </el-row>
      </div>
      <div class="item-block">
        <h5>网络信息</h5>
        <el-row :gutter="20">
          <el-col :span="12">
            <basic-form-item label="网卡：" validate="required" prop="configs.interfaceId">
              <el-select class="basic-cmp m-r-lg" v-model="addData.configs.interfaceId" @change="bvsChange">
                <el-option v-for="(item, index) in networkList" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
              <el-button type="text" @click="networkDialog.visible = true">网络配置</el-button>
            </basic-form-item>
          </el-col>
          <!-- <el-col :span="12">
            <basic-form-item label="网络连接：">
              <span class="input-desc-text">
                <el-checkbox v-model="addData.configs.disableNet" :true-label="0" :false-label="1"></el-checkbox>
                启用克隆出来的虚拟机的网卡
                <el-tooltip class="item" effect="dark" content="勾选此项后，克隆出来的新虚拟机可能和原虚拟机的IP冲突。" placement="right">
                  <i class="el-icon-question"></i>
                </el-tooltip>
              </span>
            </basic-form-item>
          </el-col> -->
        </el-row>
        <el-row>
          <el-col :span="12">
            <basic-form-item label="端口组：" prop="configs.portUuid" validate="required" v-if="portList.length > 0">
              <el-select class="basic-cmp" v-model="addData.configs.portUuid">
                <el-option v-for="item in portList" :key="item.id" :value="item.uuid" :label="item.name"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </el-row>
      </div>
      <div slot="preview-card">
        <category-display label="机型" :item="currentElement"></category-display>
        <category-display label="系统盘类型" :item="elements[1]" :disks="addData.configs.disks" :skuList="systemElement.skuList" :version="addData.location.version"></category-display>
      </div>
    </common-wrapper>
    <ConfigNetwork ref="configNetworkDom" v-show="networkDialog.visible" :count="addData.emption.count" :add-data="addData.configs" :dialogData="networkDialog" :vendorId="addData.location.vendorId"></ConfigNetwork>
  </div>
</template>

<script>
import { reactive, ref, toRefs, Ref, computed, onMounted, getCurrentInstance, nextTick, inject } from '@vue/composition-api'
import { handleSearchParam } from 'cmp-element/utils'
import { add, element } from '../../data/init'
import { cloneDeep } from 'lodash-es'
import { Message } from 'element-ui'
import { getNewPolicy, getVmGroups, getVmCondition, getDatastores, getHost, getNetwork, conditionVoleme, getAz, getGroupServerList } from 'services/platform'
import CommonWrapper from '../../components/CommonWrapper.vue'
import CategoryDisplay from '../../components/CategoryDisplay.vue'
import ConfigNetwork from './configNetwork.vue'
import { generateSpec } from 'views/resource-apply/utils'
import sku from '../../mixins/sku'
import store from '@/store'
import crypto from 'utils/crypto'

export default {
  components: { CommonWrapper, ConfigNetwork, CategoryDisplay },
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
  mixins: [sku],
  setup(props, { refs }) {
    let addData = reactive({
      ...cloneDeep(add),
      location: {
        ...add.location,
        vendorType: props.type
      },
      service: 'sangfor.standard.server',
      configs: {
        azId: '',
        sourceVmId: '',
        groupUuid: '',
        projectLeaderId: '',
        alwaysTryHost: '',
        cloneType: '',
        ha: 0,
        start: 0,
        disableNet: 1,
        resourceLabel: [],
        mac: '',
        storage: '',
        interfaceType: 'rtl8139',
        interfaceId: '',
        storagePolicy: '',
        portUuid: '',
        disks: [],
        isAddShterm: true,
        password: '',
        confirm_password: ''
      }
    })
    const elements = ref([
      {
        ...element,
        name: '云主机',
        serviceCode: 'sangfor.standard.server',
        main: true
      },
      {
        ...element,
        name: '系统盘',
        serviceCode: 'sangfor.storage.disk'
      }
      // {
      //   ...element,
      //   name: '数据盘',
      //   serviceCode: 'sangfor.storage.disk',
      //   isLoadData: false,
      //   elements: []
      // }
    ])
    const currentElement = computed(() => elements.value[0])
    const systemElement = computed(() => elements.value[1])
    const { proxy } = getCurrentInstance()
    const state = reactive({
      azList: [],
      list: [],
      checked: false,
      policyList: [],
      groupsList: [],
      cloneTypeList: [
        { name: '快速克隆', id: 'fast' },
        { name: '全量克隆', id: 'full' }
      ],
      cloneVmList: [],
      dataStoresList: [],
      hostList: [],
      networkList: [],
      params: {
        page: 1,
        rows: 9999
      },
      networkDialog: {
        visible: false,
        data: {
          mac: ''
        }
      },
      cpu: '',
      memory: '',
      storagePolicyIsShow: false,
      portList: [],
      isEven: false,
      storageLocation: '',
      storageGuid: ''
    })
    const getAzList = async () => {
      const {
        data: { rows }
      } = await getAz()
      state.azList = rows
      addData.configs.azId = props.itemData?.configs?.azId || rows[0]?.uuid
      azChange()
    }
    const azChange = (init) => {
      if (init) addData.configs.sourceVmId = ''
      getVmGroupsList()
      getDataStoresList()
      getHostList()
      getNetworkList('sangfor')
      getCloneVmList()
    }
    const getParams = () => {
      const { interfaceType, mac, ip, gateway, primaryDns, secondaryDns, disks, size, password, confirm_password } = addData.configs
      let params = { interfaceType, mac, ip, gateway, primaryDns, secondaryDns, disks }
      const configNetworkDom = refs.configNetworkDom
      const ipv4Radio = configNetworkDom?.ipv4Radio.includes(1)
      let res = true
      if (ipv4Radio && configNetworkDom?.$refs.addForms) {
        configNetworkDom.$refs.addForms.validate((valid) => {
          res = valid
        })
        if (!ip || !gateway || !interfaceType || !mac || !res) {
          Message.error('网络配置参数未填写完整')
          return false
        }
      }
      if (password !== confirm_password) {
        Message.error('两次密码输入不一致')
        return false
      }
      disks.forEach((item) => {
        if (item.type === 'derive_disk') {
          const itemSize = findItem(systemElement.value.skuList, item.size_mb, 'id')
          if (itemSize.spec[0].specValue < item.size) {
            Message.error('磁盘不能小于原磁盘大小')
            throw new Error()
          }
        }
      })
      if (!ipv4Radio) {
        params = {
          interfaceType,
          mac
        }
      }
      if (password) {
        const newPassword = crypto.encrypt(password)
        params.password = newPassword
        params.confirm_password = newPassword
      }
      if (addData.location.version === '6.8') {
        return { ...params }
      } else {
        return {
          params
        }
      }
    }
    const getPolicyList = async (id) => {
      const { data } = await getNewPolicy(id)
      state.policyList = data
    }
    const getVmGroupsList = async () => {
      const http = addData.location.version === '6.3' ? getVmGroups({ vendorId: addData.location.vendorId }) : getGroupServerList({ simple: true, page: 1, rows: 10000, params: handleSearchParam({ vendorId: addData.location.vendorId, azId: addData.configs.azId }) })
      const { data } = await http
      state.groupsList = data.rows || data
    }
    const getCloneVmList = async () => {
      const params = { vendorId: addData.location.vendorId, status: 'STOPPED', condition: 'listByVendorAndStatus', azUuid: addData.configs.azId }
      if (!params.azUuid) {
        delete params.azUuid
      }
      const { data } = await getVmCondition(params)
      state.cloneVmList = data
      addData.configs.sourceVmId = addData.configs.sourceVmId || data[0].id
      // if (props.itemData) vmChange(props.itemData.configs.sourceVmId, props.itemData.configs.cloneType)
      vmChange(addData.configs.sourceVmId)
    }
    const getDataStoresList = async () => {
      const {
        data: { rows }
      } = await getDatastores({ ...state.params, params: handleSearchParam({ vendorId: addData.location.vendorId, 'type:UEQ': 'SD', azUuid: addData.configs.azId }) })
      state.dataStoresList = rows
      // if (!rows[0] || props.itemData) return
      addData.configs.storage = props.itemData?.configs?.storage || rows[0].id
      storageChange(addData.configs.storage)
    }
    const getHostList = async () => {
      const {
        data: { rows }
      } = await getHost({ ...state.params, params: handleSearchParam({ vendorId: addData.location.vendorId, azUuid: addData.configs.azId }) })
      state.hostList = rows
    }
    const getNetworkList = async (vendorType) => {
      const { vendorId } = addData.location
      const {
        data: { rows }
      } = await getNetwork({ ...state.params, params: handleSearchParam({ vendorId, vendorType, azId: addData.configs.azId }) })
      state.networkList = rows
      addData.configs.interfaceId = props.itemData?.configs?.interfaceId || ''
      if (props.itemData?.configs?.interfaceId) bvsChange(props.itemData.configs.interfaceId)
    }
    const getVendorIdAfter = ([vendorId, vendorType]) => {
      if (!props.itemData) {
        const values = ['groupUuid', 'businessId', 'alwaysTryHost', 'storagePolicy', 'storage', 'sourceVmId']
        for (const key in addData.configs) {
          if (values.includes(key)) addData.configs[key] = ''
        }
      }
      if (addData.location.version === '6.8') {
        getAzList()
        elements.value[0].isLoadData = true
        // elements.value[1].isLoadData = true
      } else {
        addData.configs.azId = ''
        elements.value[0].isLoadData = false
        elements.value[1].isLoadData = false
        getVmGroupsList()
        getDataStoresList()
        getHostList()
        getNetworkList('sangfor')
        getCloneVmList()
      }
    }
    const vmChange = async (id) => {
      const item = findItem(state.cloneVmList, id, 'id')
      state.storageLocation = item.storageLocation
      // 获取skuList 计算价格
      proxy.getCategoryList(elements.value[0])
      proxy.getCategoryList(elements.value[1])

      const { data } = await conditionVoleme({ condition: 'listByVmId', serverId: id })
      if (!data.length) return
      addData.configs.size = data[0].size
      if (addData.location.version === '6.3') {
        elements.value[0].skuId = item.skuId
        // INFO 如果 虚拟机 instanceId 是奇数 克隆方式则只能为 全量克隆
        if (item?.instanceId % 2 !== 0) {
          state.isEven = true
          addData.configs.cloneType = 'full'
        } else {
          state.isEven = false
        }
        addData.elements = [handleElement({ ...item, serviceCode: elements.value[0].serviceCode }), handleElement({ ...data[0], serviceCode: elements.value[1].serviceCode })]
      } else {
        if (state.storageGuid !== state.storageLocation) {
          state.storagePolicyIsShow = false
          addData.configs.cloneType = 'full'
        } else {
          state.storagePolicyIsShow = true
          addData.configs.cloneType = props.itemData?.configs?.cloneType || addData.configs.cloneType
        }
        if (addData.configs.sourceVmId !== props?.itemData?.configs?.sourceVmId) {
          addData.configs.disks = data.map(({ size, diskPolicieUuid }, index) => {
            sizeMBChange(systemElement.value.skuId, index)
            return { id: `ide${index < 2 ? index : index + 1}`, type: 'derive_disk', preallocate: diskPolicieUuid, size_mb: systemElement.value.skuId, is_old_disk: 1, size }
          })
        }
      }
    }
    const handleElement = (data) => {
      const { serviceCode, skuId, category, categoryId } = data
      let specs = null
      if (serviceCode === 'sangfor.standard.server') {
        const { cpu, memory } = data
        state.cpu = cpu
        state.memory = memory
        specs = [{ cpu: cpu.toString() }, { memory: memory.toString() }]
      }
      if (serviceCode === 'sangfor.storage.disk') {
        elements.value[1].skuId = skuId
        elements.value[1].categoryId = categoryId
        const { size } = data
        specs = [{ disk: size.toString() }]
      }
      return { serviceCode, skuId, category, categoryId, specs }
    }
    const sizeMBChange = (id, index) => {
      if (index === 0 || elements.value[index + 1]) {
        elements.value[index + 1].skuId = id
      } else {
        elements.value.push({ ...elements.value[1], skuId: id })
      }
    }
    const findItem = (list, value, key) => list.find((item) => item[key] === value)
    const storageChange = async (val) => {
      const itemData = state.dataStoresList.find((item) => item.id === val)
      state.storageGuid = itemData.guid
      // INFO 当存储位置type 是 OTHER 克隆方式则只能为 全量克隆
      if (itemData?.type === 'OTHER') {
        addData.configs.cloneType = 'full'
        state.storagePolicyIsShow = false
      } else {
        state.storagePolicyIsShow = true
        getPolicyList(val)
      }
      if (addData.location.version === '6.8') {
        if (state.storageGuid !== state.storageLocation) {
          state.storagePolicyIsShow = false
          addData.configs.cloneType = 'full'
        } else {
          state.storagePolicyIsShow = true
        }
      }
      // addData.configs.cloneType = itemData.type === 'OTHER' ? 'full' : 'fast'
    }
    const bvsChange = (id) => {
      state.portList = []
      const { type, vlanGroups } = state.networkList.find((item) => item.id === id)
      if (type === 'bvs' || addData.location.version === '6.8') state.portList = vlanGroups
    }
    const addDisk = () => {
      const index = addData.configs.disks.length
      addData.configs.disks.push({
        id: `ide${index < 2 ? index : index + 1}`,
        type: 'new_disk',
        is_old_disk: 0,
        preallocate: 'off',
        size_mb: addData.configs.disks[0].size_mb
      })
      sizeMBChange(addData.configs.disks[0].size_mb, index)
    }
    const deleteDisk = (index) => {
      addData.configs.disks.splice(index, 1)
      elements.value.splice(index + 1, 1)
    }
    const getPostData = () => {
      let data = false
      data = refs.common.handlePostData()
      return data
    }
    const initParams = () => {
      if (!props.itemData) return
      // addData.configs.disks = addData.configs.disks.map((item: any) => {
      //   item.size_mb = item.size_mb / 1024
      //   return item
      // })
      addData = reactive({
        ...cloneDeep(props.itemData)
      })
      store.commit('SET_APPLY_NUM', addData.emption.count)
      addData.configs.interfaceId = addData.configs.interfaceId || ''
      if (props.itemData.configs.password) {
        addData.configs.password = crypto.decrypt(addData.configs.password)
        addData.configs.confirm_password = addData.configs.password
      }
      elements.value[0].skuId = addData.elements[0].skuId
      if (addData.configs.disks) {
        addData.elements.forEach((item, index) => {
          if (item.serviceCode === 'sangfor.storage.disk' && addData.configs.disks[index - 1]) {
            addData.configs.disks[index - 1].size_mb = item.skuId
            sizeMBChange(item.skuId, index - 1)
          }
        })
      }
      // storageChange(props.itemData.configs.storage)
      state.storagePolicyIsShow = Boolean(props.itemData.configs.storagePolicy)
    }
    initParams()
    onMounted(() => {})
    return { ...toRefs(state), elements, addData, getVendorIdAfter, vmChange, storageChange, currentElement, getParams, getPostData, bvsChange, azChange, addDisk, deleteDisk, systemElement, generateSpec, sizeMBChange }
  }
}
</script>

<style lang="scss" scoped>
@import '../../index.scss';
</style>
