<template>
  <div>
    <el-card class="relative m-b" v-for="(param, parentIndex) in showParamList" :key="parentIndex" v-loading="loading">
      <div class="operate-block" v-if="!disabled">
        <el-tooltip content="新增" placement="top">
          <el-button icon="el-icon-plus" size="medium" circle @click="handleAdd()"></el-button>
        </el-tooltip>
        <el-tooltip content="移除" placement="bottom" v-if="showParamList.length > 1">
          <el-button icon="el-icon-minus" size="medium" circle @click="handleDelete(parentIndex)"></el-button>
        </el-tooltip>
        <el-tooltip content="克隆" placement="top">
          <el-button icon="el-icon-copy-document" size="medium" circle @click="handleClone(parentIndex)"></el-button>
        </el-tooltip>
      </div>
      <h5>服务器{{ parentIndex + 1 }} <el-button class="m-l-lg" type="text" @click="handleView()">点击快速浏览服务器框架规格</el-button></h5>
      <basic-form :model="param.configs" ref="addForm" label-position="left" label-width="130px">
        <el-button type="text" class="no-pointer">基础配置</el-button>
        <el-row :span="24">
          <el-col :span="24">
            <basic-form-item label="框架规格：" prop="serverSpecId" validate="required">
              <el-select filterable :disabled="disabled" v-model="param.configs.serverSpecId" @change="serverSpecChange(parentIndex)">
                <el-option v-for="item in serverSpecList" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="8">
            <basic-form-item label="CPU架构：" prop="cpuFramework" validate="required">
              <el-select filterable :disabled="disabled" v-model="param.configs.cpuFramework" class="w" @change="cpuFrameworkChange(parentIndex, true)">
                <el-option v-for="item in cpuFrameworkList" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="8">
            <basic-form-item label="CPU主频(GHz）" prop="cpuHz" validate="required">
              <el-select filterable class="w" :disabled="disabled" v-model="param.configs.cpuHz" @change="cpuHzChange(parentIndex, true)">
                <el-option v-for="item in param.cpuHzList" :key="item" :label="item" :value="item"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="8">
            <basic-form-item label="CPU核心数(个）" prop="cpuNum" validate="required">
              <el-select filterable class="w" :disabled="disabled" v-model="param.configs.cpuNum" @change="cpuNumChange(parentIndex, true)">
                <el-option v-for="item in param.cpuNumList" :key="item" :label="item" :value="item"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="8">
            <basic-form-item label="内存频率(MHz）" prop="memHz" validate="required">
              <el-select filterable class="w" :disabled="disabled" v-model="param.configs.memHz" @change="memHzChange(parentIndex, true)">
                <el-option v-for="item in memHzList" :key="item" :label="item" :value="item"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="8">
            <basic-form-item label="内存容量(GB)" prop="memSize" validate="required">
              <el-select filterable class="w" :disabled="disabled" v-model="param.configs.memSize" @change="memSizeChange(parentIndex)">
                <el-option v-for="item in param.memSizeList" :key="item" :label="item" :value="item"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="8">
            <basic-form-item label="操作系统：" prop="os" validate="required">
              <el-select filterable class="w" :disabled="disabled" v-model="param.configs.os" @change="osChange(parentIndex)">
                <el-option v-for="item in osList" :key="item.specName" :label="item.specName" :value="item.specName"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-divider></el-divider>
        <el-button type="text" class="no-pointer">硬盘配置</el-button>
        <el-row :span="24" class="hover" v-for="(disk, index) in param.configs.disks" :key="index + 'disk'">
          <el-col :span="12">
            <basic-form-item :label="'硬盘' + (index + 1) + '：'" :prop="'disks.' + index + '.type'" validate="required">
              <el-select filterable class="w m-r" :disabled="disabled" v-model="disk.type" @change="diskTypeChange(parentIndex, index, true)">
                <el-option v-for="item in diskTypeList" :key="item" :label="item" :value="item"></el-option>
              </el-select>
              <el-select filterable class="w m-r" :disabled="disabled" v-model="disk.size" placeholder="请选择硬盘容量" @change="diskSizeChange(parentIndex, index, true)">
                <el-option v-for="item in disk.diskSizeList" :key="item" :label="item" :value="item"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="配件名称：" :prop="'disks.' + index + '.name'" validate="required">
              <template v-if="!!itemData">
                <el-select filterable class="w m-r" :disabled="disabled" v-model="disk.name" @change="diskNameChange(parentIndex, index, true)">
                  <el-option v-for="item in disk.diskNameList" :key="item" :label="item" :value="item"></el-option>
                </el-select>
              </template>
              <template v-if="!disabled">
                <el-button type="text" @click="handleAddDisk(parentIndex)">增加</el-button>
                <el-button type="text" @click="handleDeleteDisk(parentIndex, index)" v-if="param.configs.disks.length > 1">删除</el-button>
              </template>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-divider></el-divider>
        <el-button type="text" class="no-pointer">网络配置</el-button>
        <el-row :span="24" class="hover" v-for="(networkCard, index) in param.configs.networkCards" :key="index + 'net'">
          <el-col :span="8">
            <basic-form-item :label="'网卡' + (index + 1) + '：'" :prop="'networkCards.' + index + '.id'" validate="required,ip">
              <el-input class="w m-r" :disabled="disabled" v-model="networkCard.id"> </el-input>
            </basic-form-item>
          </el-col>
          <template v-if="!!itemData">
            <el-col :span="8">
              <basic-form-item label="业务网段：" :prop="'networkCards.' + index + '.segment'">
                <el-input class="w m-r" :disabled="disabled" v-model="networkCard.segment"> </el-input>
              </basic-form-item>
            </el-col>
            <el-col :span="8">
              <basic-form-item label="MAC：" :prop="'networkCards.' + index + '.mac'">
                <el-input class="w m-r" :disabled="disabled" v-model="networkCard.mac" placeholder="使用多个英文逗号分割填写"> </el-input>
                <template v-if="!disabled">
                  <el-button type="text" @click="handleAddNetworkCard(parentIndex)">增加</el-button>
                  <el-button type="text" @click="handleDeleteNetworkCard(parentIndex, index)" v-if="param.configs.networkCards.length > 1">删除</el-button>
                </template>
              </basic-form-item>
            </el-col>
          </template>
        </el-row>
        <el-divider></el-divider>
        <el-button type="text" class="no-pointer">服务器信息</el-button>
        <el-row :span="24">
          <el-col :span="8">
            <basic-form-item label="服务器型号：">
              <el-select filterable class="w m-b" :disabled="disabled" v-model="param.configs.model" @change="serverModelChange(parentIndex)">
                <el-option v-for="item in serverSpecList" :key="item.model" :label="item.model" :value="item.model"></el-option>
              </el-select>
              <div class="server-info">
                <div class="item">CPU路数: {{ param.preview.cpuSlotCount }}</div>
                <div class="item">内存槽位: {{ param.preview.memSlotCount }}</div>
                <div class="item">U数: {{ param.preview.uCount }}</div>
                <div class="item">Pci插槽数: {{ param.preview.pciSlotCount }}</div>
                <div class="item">电源接口数: {{ param.preview.powerInterfaceCount }}</div>
                <div class="item">硬盘槽位数: {{ param.preview.diskSlotCount }}</div>
              </div>
            </basic-form-item>
          </el-col>
          <template v-if="!!itemData">
            <el-col :span="8">
              <basic-form-item label="品牌：">
                <el-input class="w m-b" v-model="param.preview.brandName" disabled> </el-input>
              </basic-form-item>
            </el-col>
            <el-col :span="8">
              <basic-form-item label="设备类型：">
                <el-input class="w m-b" v-model="param.preview.deviceType" disabled> </el-input>
              </basic-form-item>
            </el-col>
            <el-col :span="8">
              <basic-form-item label="唯一标识：">
                <el-input class="w" :disabled="disabled" v-model="param.preview.uniqueId"> </el-input>
              </basic-form-item>
            </el-col>
            <el-col :span="8">
              <basic-form-item label="机房：">
                <el-select filterable class="w" :disabled="disabled" v-model="param.preview.roomId" @change="locationChange(parentIndex)">
                  <el-option v-for="item in locationList" :key="item.id" :label="item.name" :value="item.id"></el-option>
                </el-select>
              </basic-form-item>
            </el-col>
            <el-col :span="8">
              <basic-form-item label="机柜：">
                <el-select filterable class="w" :disabled="disabled" v-model="param.preview.rackId">
                  <el-option v-for="item in param.rackList" :key="item.id" :label="item.name" :value="item.id"></el-option>
                </el-select>
              </basic-form-item>
            </el-col>
            <el-col :span="8">
              <basic-form-item label="单位：">
                <el-input class="w" :disabled="disabled" v-model="param.preview.company"> </el-input>
              </basic-form-item>
            </el-col>
            <el-col :span="8">
              <basic-form-item label="出厂年份：">
                <el-date-picker class="w" :disabled="disabled" v-model="param.preview.year" value-format="yyyy-MM-dd"> </el-date-picker>
              </basic-form-item>
            </el-col>
            <el-col :span="8">
              <basic-form-item label="维保年份：">
                <el-date-picker class="w" :disabled="disabled" v-model="param.preview.warrantyYear" value-format="yyyy-MM-dd"> </el-date-picker>
              </basic-form-item>
            </el-col>
            <el-col :span="8">
              <basic-form-item label="PN/PID：">
                <el-input class="w" :disabled="disabled" v-model="param.preview.pn"> </el-input>
              </basic-form-item>
            </el-col>
            <el-col :span="8">
              <basic-form-item label="SN：">
                <el-input class="w" :disabled="disabled" v-model="param.preview.sn"> </el-input>
              </basic-form-item>
            </el-col>
            <el-col :span="8">
              <basic-form-item label="单/双电源：">
                <el-select filterable class="w" :disabled="disabled" v-model="param.preview.power">
                  <el-option label="单电源" value="单电源"></el-option>
                  <el-option label="双电源" value="双电源"></el-option>
                </el-select>
              </basic-form-item>
            </el-col>
            <el-col :span="8">
              <basic-form-item label="预计使用年限：">
                <el-input class="w" :disabled="disabled" v-model="param.preview.useYear"> </el-input>
              </basic-form-item>
            </el-col>
            <el-col :span="8">
              <basic-form-item label="ILO：">
                <el-input class="w" :disabled="disabled" v-model="param.preview.ilo"> </el-input>
              </basic-form-item>
            </el-col>
            <el-col :span="8">
              <basic-form-item label="上架时间：">
                <el-date-picker class="w" :disabled="disabled" v-model="param.preview.shelfTime" value-format="yyyy-MM-dd"> </el-date-picker>
              </basic-form-item>
            </el-col>
          </template>
        </el-row>
        <el-divider></el-divider>
        <el-button type="text" class="no-pointer m-r">其他配件</el-button>
        <el-row :span="24" class="hover" v-for="(other, index) in param.configs.otherParts" :key="index + 'other'">
          <el-col :span="8">
            <basic-form-item :label="'配件类型' + (index + 1) + '：'">
              <el-select filterable class="w m-r" :disabled="disabled" v-model="other.type" @change="otherTypeChange(parentIndex, index, true)">
                <el-option v-for="item in otherPartTypeList" :key="item" :label="item" :value="item"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="8">
            <basic-form-item label="配件名称">
              <template v-if="!!itemData">
                <el-select filterable class="w m-r" :disabled="disabled" v-model="other.name">
                  <el-option v-for="item in other.nameList" :key="item" :label="item" :value="item"></el-option>
                </el-select>
              </template>
              <template v-if="!disabled">
                <el-button type="text" @click="handleAddOtherPart(parentIndex)" v-if="param.configs.otherParts && param.configs.otherParts.length > 0">增加</el-button>
                <el-button type="text" @click="handleDeleteOtherPart(parentIndex, index)">删除</el-button>
              </template>
            </basic-form-item>
          </el-col>
        </el-row>
        <template v-if="!disabled">
          <el-button type="primary" size="mini" @click="handleAddOtherPart(parentIndex)" v-if="param.configs.otherParts && param.configs.otherParts.length === 0">增加</el-button>
        </template>
      </basic-form>
    </el-card>
    <ServerSpecDialog :visible="serverSpecDialog.visible" :addData="serverSpecDialog" />
  </div>
</template>

<script>
import { cloneDeep, get } from 'lodash-es'
import { subServerApplicationParam, GEN_UUID } from '../data/EFCInit.js'
import ServerSpecDialog from './ServerSpecDialog.vue'
import { getRoom, getRack } from 'services/platform/index'
import { getServer, getDiskSpecs, getParts, getCpuSpecs, getMemorySpecs } from 'services/services/physicalSpec.js'
import { conditionServicesList } from 'services/services/catelog'
export default {
  components: {
    ServerSpecDialog
  },
  inject: {
    currentNode: {
      default: { roleName: '' }
    },
    isReSubmit: {
      default: false
    }
  },
  props: {
    addData: {
      type: Object
    },
    itemData: {
      type: [Object, Boolean]
    },
    disabled: {
      type: Boolean
    },
    showParamList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: false,
      subnetLoading: false,
      serverSpecDialog: {
        visible: false
      },
      serverSpecList: [],
      cpuFrameworkList: [
        { name: 'X86', id: 'X86' },
        { name: 'ARM', id: 'ARM' },
        { name: 'C86', id: 'C86' }
      ],
      osList: [],
      allOtherPartList: [],
      otherPartTypeList: [],
      allDiskSpecsList: [],
      diskTypeList: [],
      allCpuSpecsList: [],
      allMemSpecsList: [],
      memHzList: [],
      // 机房列表
      locationList: []
    }
  },
  async created() {
    this.getServer()
    this.getOs()
    await this.getDiskSpec()
    this.getParts()
    await this.getCpuSpecs()
    await this.getMemSpecs()
    this.getLocation()
    if (this.itemData) {
      // 审批时回显
      this.showParamList.map((item, index) => {
        this.cpuFrameworkChange(index)
        this.memHzChange(index)
        item.configs.disks.map((disk, idx) => {
          this.diskTypeChange(index, idx)
        })
        item.configs.otherParts.map((other, idx) => {
          this.otherTypeChange(index, idx)
        })
      })
    }
  },
  methods: {
    otherTypeChange(parentIndex, index, manual) {
      this.getOtherPartNameList(parentIndex, index, manual)
    },
    getOtherPartNameList(parentIndex, index, manual) {
      const { type } = this.showParamList[parentIndex].configs.otherParts[index]
      const list = this.allOtherPartList.filter(item => item.partType === type)
      this.showParamList[parentIndex].configs.otherParts[index].nameList = list.map(({ name }) => name)
      if (manual) {
        this.showParamList[parentIndex].configs.otherParts[index].name = this.showParamList[parentIndex].configs.otherParts[index].nameList[0] || ''
      }
      this.otherNameChange(parentIndex, index, manual)
    },
    otherNameChange(parentIndex, index, manual) {
      this.getFinalOtherPartSpec(parentIndex, index, manual)
    },
    getFinalOtherPartSpec(parentIndex, index, manual) {
      const { type, name } = this.showParamList[parentIndex].configs.otherParts[index]
      const find = this.allOtherPartList.find(item => item.partType === type && item.name === name)
      if (manual) {
        this.showParamList[parentIndex].configs.otherParts[index].id = find?.id || ''
        this.showParamList[parentIndex].configs.otherParts[index].price = find?.price || 0
      }
    },
    diskTypeChange(parentIndex, index, manual) {
      this.getDiskSizeList(parentIndex, index, manual)
    },
    getDiskSizeList(parentIndex, index, manual) {
      const { type } = this.showParamList[parentIndex].configs.disks[index]
      const list = this.allDiskSpecsList.filter(item => item.diskType === type)
      this.showParamList[parentIndex].configs.disks[index].diskSizeList = list.map(({ capacity }) => capacity)
      if (manual) {
        this.showParamList[parentIndex].configs.disks[index].size = this.showParamList[parentIndex].configs.disks[index].diskSizeList[0] || ''
      }
      this.diskSizeChange(parentIndex, index, manual)
    },
    diskSizeChange(parentIndex, index, manual) {
      this.getDiskNameList(parentIndex, index, manual)
    },
    // 根据硬盘类型和容量获取硬盘配件列表
    getDiskNameList(parentIndex, index, manual) {
      const { type, size } = this.showParamList[parentIndex].configs.disks[index]
      const list = this.allDiskSpecsList.filter(item => item.diskType === type && item.capacity === size)
      this.showParamList[parentIndex].configs.disks[index].diskNameList = list.map(({ name }) => name)
      if (manual) {
        this.showParamList[parentIndex].configs.disks[index].name = this.showParamList[parentIndex].configs.disks[index].diskNameList[0] || ''
      }
      this.diskNameChange(parentIndex, index, manual)
    },
    diskNameChange(parentIndex, index, manual) {
      this.getFinalDiskSpec(parentIndex, index, manual)
    },
    // 根据硬盘类型、容量和配件名称获取最终的硬盘规格
    getFinalDiskSpec(parentIndex, index, manual) {
      const { type, size, name } = this.showParamList[parentIndex].configs.disks[index]
      const find = this.allDiskSpecsList.find(item => item.diskType === type && item.capacity === size && item.name === name)
      if (manual) {
        this.showParamList[parentIndex].configs.disks[index].id = find?.id || ''
        this.showParamList[parentIndex].configs.disks[index].price = find?.price || 0
      }
    },
    // 根据内存频率和容量获取最终的内存规格
    getFinalMemSpec(parentIndex, manual) {
      const { memHz, memSize } = this.showParamList[parentIndex].configs
      const find = this.allMemSpecsList.find(({ frequency, size }) => frequency === memHz && size === memSize)
      if (manual) {
        this.showParamList[parentIndex].configs.memSpecId = find?.id || ''
        this.showParamList[parentIndex].configs.memPrice = find?.price || 0
      }
    },
    memSizeChange(parentIndex, manual) {
      this.getFinalMemSpec(parentIndex, manual)
    },
    getMemSizeList(parentIndex, manual) {
      const { memHz } = this.showParamList[parentIndex].configs
      const list = this.allMemSpecsList.filter(({ frequency }) => frequency === memHz)
      this.showParamList[parentIndex].memSizeList = list.map(({ size }) => size)
      if (manual) {
        this.showParamList[parentIndex].configs.memSize = this.showParamList[parentIndex].memSizeList[0] || ''
      }
      this.memSizeChange(parentIndex, manual)
    },
    // 内存频率变化
    memHzChange(parentIndex, manual) {
      this.getMemSizeList(parentIndex, manual)
    },

    // 根据架构、主频、核心数获取最终的 CPU 规格
    getFinalCpuSpec(parentIndex, manual) {
      const { cpuFramework, cpuHz, cpuNum } = this.showParamList[parentIndex].configs
      const find = this.allCpuSpecsList.find(({ framework, cpuHz: df, coreNum: cn }) => framework === cpuFramework && df === cpuHz && cn === cpuNum)
      if (manual) {
        this.showParamList[parentIndex].configs.cpuSpecId = find?.id || ''
        this.showParamList[parentIndex].configs.cpuPrice = find?.price || 0
      }
    },
    cpuNumChange(parentIndex, manual) {
      this.getFinalCpuSpec(parentIndex, manual)
    },
    // 根据架构和主频获取 CPU 核心数列表
    getCpuNumList(parentIndex, manual) {
      const { cpuFramework, cpuHz } = this.showParamList[parentIndex].configs
      const list = this.allCpuSpecsList.filter(({ framework, dominantFrequency: df }) => framework === cpuFramework && df === cpuHz)
      this.showParamList[parentIndex].cpuNumList = list.map(({ coreNum }) => coreNum)
      if (manual) {
        // 设置 CPU 核心数的默认值
        this.showParamList[parentIndex].configs.cpuNum = this.showParamList[parentIndex].cpuNumList[0] || ''
      }
      this.cpuNumChange(parentIndex, manual)
    },
    cpuHzChange(parentIndex, manual) {
      this.getCpuNumList(parentIndex, manual)
    },
    // 根据 CPU 架构获取主频列表
    getCpuHzList(parentIndex, manual) {
      const { cpuFramework } = this.showParamList[parentIndex].configs
      const list = this.allCpuSpecsList.filter(({ framework }) => framework === cpuFramework)
      this.showParamList[parentIndex].cpuHzList = list.map(({ dominantFrequency }) => dominantFrequency)
      if (manual) {
        // 设置主频的默认值
        this.showParamList[parentIndex].configs.cpuHz = this.showParamList[parentIndex].cpuHzList[0] || ''
      }
      this.cpuHzChange(parentIndex, manual)
    },
    cpuFrameworkChange(parentIndex, manual) {
      this.getCpuHzList(parentIndex, manual)
    },
    osChange(parentIndex) {
      const os = this.osList.find(item => item.specName === this.showParamList[parentIndex].configs.os)
      if (!os) return
      this.showParamList[parentIndex].configs.osPrice = os.price
    },
    // 选择框架后，带出CPU、内存、硬盘、配件信息，用户可基于已经选择的框架参数进行调整
    serverSpecChange(parentIndex) {
      this.setDefaultInfo(parentIndex)
    },
    serverModelChange(parentIndex) {
      const find = this.serverSpecList.find(({ model }) => model === this.showParamList[parentIndex].configs.model)
      if (!find) return
      if (!this.showParamList[parentIndex].preview) this.showParamList[parentIndex].preview = {}
      this.showParamList[parentIndex].preview.cpuSlotCount = find.cpuSlotCount
      this.showParamList[parentIndex].preview.memSlotCount = find.memSlotCount
      this.showParamList[parentIndex].preview.uCount = find.uCount
      this.showParamList[parentIndex].preview.pciSlotCount = find.pciSlotCount
      this.showParamList[parentIndex].preview.powerInterfaceCount = find.powerInterfaceCount
      this.showParamList[parentIndex].preview.diskSlotCount = find.diskSlotCount
      this.showParamList[parentIndex].preview.brandName = find.brandName
      this.showParamList[parentIndex].preview.deviceType = '服务器'
    },
    setDefaultInfo(parentIndex) {
      const find = this.serverSpecList.find(({ id }) => id === this.showParamList[parentIndex].configs.serverSpecId)
      if (!find) return
      console.log({ ...find })
      this.showParamList[parentIndex].configs.cpuFramework = find.cpuFramework
      this.cpuFrameworkChange(parentIndex)
      this.showParamList[parentIndex].configs.cpuHz = find.cpuHz
      this.cpuHzChange(parentIndex)
      this.showParamList[parentIndex].configs.cpuNum = find.cpuNum
      this.cpuNumChange(parentIndex)
      this.showParamList[parentIndex].configs.memHz = find.memHz
      this.memHzChange(parentIndex)
      this.showParamList[parentIndex].configs.memSize = find.memSize
      this.memSizeChange(parentIndex)
      this.showParamList[parentIndex].configs.disks = JSON.parse(find.diskSpecIds || '[""]').map(item => {
        const obj = (find.diskSpecList || []).find(part => part.id === item) || { diskType: '', capacity: 0, name: '', price: 0, id: '' }
        return {
          type: obj.diskType,
          size: obj.capacity,
          name: obj.name,
          price: obj.price,
          id: obj.id
        }
      })
      this.showParamList[parentIndex].configs.disks.map((item, idx) => {
        this.diskTypeChange(parentIndex, idx)
      })
      this.showParamList[parentIndex].configs.model = find.model
      this.serverModelChange(parentIndex)
      this.showParamList[parentIndex].configs.otherParts = JSON.parse(find.partsSpecIds || '[""]').map(item => {
        const obj = (find.partsSpecList || []).find(part => part.id === item) || { partType: '', id: '', name: '', price: 0 }
        return {
          type: obj.partType,
          id: obj.id,
          name: obj.name,
          price: obj.price
        }
      })
    },
    handleAddOtherPart(parentIndex) {
      this.showParamList[parentIndex].configs.otherParts.push({ type: '', id: '', name: '', price: 0 })
    },
    handleDeleteOtherPart(parentIndex, index) {
      this.showParamList[parentIndex].configs.otherParts.splice(index, 1)
    },
    handleAddNetworkCard(parentIndex) {
      this.showParamList[parentIndex].configs.networkCards.push({ id: '' })
    },
    handleDeleteNetworkCard(parentIndex, index) {
      this.showParamList[parentIndex].configs.networkCards.splice(index, 1)
    },
    handleAddDisk(parentIndex) {
      this.showParamList[parentIndex].configs.disks.push({ type: '', size: '', price: 0 })
    },
    handleDeleteDisk(parentIndex, index) {
      this.showParamList[parentIndex].configs.disks.splice(index, 1)
    },
    async getParts() {
      const res = await getParts({ page: 1, rows: 9999, params: JSON.stringify([{ param: { status: 1 }, sign: 'EQ' }]) })
      if (!res.success) return
      this.allOtherPartList = res.data.rows
      this.otherPartTypeList = [...new Set(res.data.rows.map(item => item.partType))]
    },
    async getDiskSpec() {
      const res = await getDiskSpecs({ page: 1, rows: 9999, params: JSON.stringify([{ param: { status: 1 }, sign: 'EQ' }]) })
      if (!res.success) return
      this.allDiskSpecsList = res.data.rows
      this.diskTypeList = [...new Set(res.data.rows.map(item => item.diskType))]
    },
    async getServer() {
      const res = await getServer({ page: 1, rows: 9999, params: JSON.stringify([{ param: { status: 1 }, sign: 'EQ' }]) })
      if (!res.success) return
      this.serverSpecList = res.data.rows
    },
    async getCpuSpecs() {
      const res = await getCpuSpecs({ page: 1, rows: 9999, params: JSON.stringify([{ param: { status: 1 }, sign: 'EQ' }]) })
      if (!res.success) return
      this.allCpuSpecsList = res.data.rows
    },
    async getMemSpecs() {
      const res = await getMemorySpecs({ page: 1, rows: 9999, params: JSON.stringify([{ param: { status: 1 }, sign: 'EQ' }]) })
      if (!res.success) return
      this.allMemSpecsList = res.data.rows
      this.memHzList = res.data.rows.map(({ frequency }) => frequency)
    },
    async getOs() {
      // 获取操作系统服务目录
      conditionServicesList({
        condition: JSON.stringify({
          condition: 'queryByCode',
          code: 'physical.standard.server'
        })
      }).then(data => {
        if (data.success) {
          this.osList = JSON.parse(data.data.basicPrice || '[]').map(item => {
            item.specName = item.specName.join('-')
            return item
          })
        }
      })
    },
    async getLocation() {
      const res = await getRoom({ page: 1, rows: 9999 })
      if (!res.success) return
      this.locationList = res.data.rows
    },
    locationChange(parentIndex) {
      const find = this.locationList.find(item => item.id === this.showParamList[parentIndex].preview.roomId)
      if (!find) return
      this.showParamList[parentIndex].preview.locationName = find.name
      this.getRackList(parentIndex)
    },
    async getRackList(parentIndex) {
      const id = this.showParamList[parentIndex].preview.roomId
      const res = await getRack({ page: 1, rows: 9999, params: JSON.stringify([{ param: { roomId: id }, sign: 'EQ' }]) })
      if (!res.success) return
      this.$set(this.showParamList[parentIndex], 'rackList', res.data.rows)
    },
    handleView() {
      this.serverSpecDialog.visible = true
    },
    getParams() {
      let data = false
      for (let index = 0; index < this.$refs.addForm.length; index++) {
        this.$refs.addForm[index].validate(valid => {
          if (valid) {
            const param = this.showParamList[index]
            const { password, confirm_password, ...other } = param.configs
            if (password !== confirm_password) {
              data = false
              this.$message.error('两次密码输入不一致')
              // 终止 for 循环
              return
            }
            const result = {
              ...other
            }

            if (!Array.isArray(data)) data = []
            data.push(result)
          }
        })
      }
      return data
    },
    handleAdd() {
      this.showParamList.push(subServerApplicationParam)
    },
    async handleClone(index) {
      const cloneData = cloneDeep(this.showParamList[index])
      cloneData.configs.taskGroupUuid = GEN_UUID()
      cloneData.configs.taskTargetUuid = GEN_UUID()
      this.showParamList.push(cloneData)
    },
    async handleDelete(index) {
      this.showParamList.splice(index, 1)
    }
  }
}
</script>

<style scoped lang="scss">
@import '../index.scss';
.el-divider {
  width: 1200px;
}
.relative {
  position: relative;
}
.no-pointer {
  cursor: auto;
}
.server-info {
  position: absolute;
  top: 40px;
  left: 0;
  display: flex;
  .item {
    color: #666;
    font-size: 12px;
    line-height: 12px;
    width: 80px;
  }
}
.operate-block {
  position: absolute;
  right: 20px;
  top: 270px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}
.hover {
  .el-form-item--small.el-form-item {
    margin-bottom: 9px;
    margin-top: 9px;
  }
  &:hover {
    background-color: #f5f7fa;
  }
}
</style>
