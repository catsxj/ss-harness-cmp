<template>
  <basic-form label-width="120px" :model="itemData" v-bind="$attrs">
    <basic-form-item label="名称：">{{ upgradeData.instanceName }}</basic-form-item>
    <basic-form-item label="原规格：">{{ upgradeData.preview.specName }}</basic-form-item>
    <basic-form-item label="IP地址：" v-if="isArray(upgradeData.preview.privateIpsList)">{{ upgradeData.preview.privateIpsList.map(item => item.address).join('、') || '--' }}</basic-form-item>
    <basic-form-item label="规格：">
      <el-select v-model="upgradeData.flavorId" @change="flavorChange" filterable v-loading="loading">
        <el-option v-for="item in flavorList" :key="item.id + item.name" :label="item.name + '(' + item.cpu + '核/' + item.memory + 'GB)'" :value="item.id"></el-option>
      </el-select>
    </basic-form-item>
  </basic-form>
</template>

<script>
import { conditionFlavor } from 'services/platform/index'
import { cloneDeep, isArray } from 'lodash-es'
export default {
  props: {
    itemData: {
      type: Object
    }
  },
  data() {
    return {
      loading: false,
      flavorList: [],
      flavorDetail: false,
      upgradeData: {}
    }
  },
  created() {
    this.upgradeData = cloneDeep(this.itemData)
    // 代码兼容处理
    if (typeof this.itemData.preview === 'string') {
      this.upgradeData.preview = JSON.parse(this.itemData.preview)
    }
    this.getList()
  },
  methods: {
    isArray,
    getList() {
      this.loading = true
      // 统一用这个接口,参数各个平台自己传
      conditionFlavor({
        ...this.itemData.params
      })
        .then((data) => {
          if (data.success) {
            this.flavorList = data.data.sort((a, b) => a.cpu - b.cpu || a.memory - b.memory)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    flavorChange() {
      const { cpu, memory } = this.flavorList.find((item) => item.id === this.upgradeData.flavorId)
      this.upgradeData.upgrade[0].specs[0].cpu = cpu
      this.upgradeData.upgrade[0].specs[1].memory = memory
    },
    getApplyData() {
      const obj = cloneDeep(this.upgradeData)
      obj.operation = 'Upgrade'
      return obj
    }
  }
}
</script>
