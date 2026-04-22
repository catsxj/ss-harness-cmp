<template>
  <div class="control-wrapper">
    <el-select class="dc-select" v-model="dcId" @change="getCount">
      <el-option v-for="item in dcList" :key="item.id" :value="item.id" :label="item.name"></el-option>
    </el-select>
    <div class="control-cell m-r">
      <div class="icon-wrapper">
        <svg-icon icon-name="svg-vm"></svg-icon>
      </div>
      <div class="count">
        <!-- TODO: i18n -->
        <span>云主机</span>
        <span>{{ data.vmNum }}</span>
      </div>
    </div>
    <div class="control-cell m-r">
      <div class="icon-wrapper">
        <svg-icon icon-name="svg-host"></svg-icon>
      </div>
      <div class="count">
        <!-- TODO: i18n -->
        <span>物理机</span>
        <span>{{ data.hostNum }}</span>
      </div>
    </div>
    <div class="control-cell" style="background: #ece6f6">
      <div class="icon-wrapper">
        <svg-icon icon-name="svg-image"></svg-icon>
      </div>
      <div class="count">
        <!-- TODO: i18n -->
        <span>镜像</span>
        <span>{{ data.imageNum }}</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { getDc } from 'services/platform/index'
import { getResourceCountByDc } from 'services/system/portal'

interface DcItem {
  id: number | string
  name: string
}

interface CountData {
  vmNum: number
  hostNum: number
  imageNum: number
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
defineProps<{
  itemData: { config?: any }
}>()

const data = ref<CountData>({
  vmNum: 0,
  hostNum: 0,
  imageNum: 0
})
const dcId = ref<number | string | undefined>(undefined)
const dcList = ref<DcItem[]>([])

;(async function () {
  const res = await getDc({ page: 1, rows: 10000 })
  if (res.success) {
    dcList.value = res.data.rows
    if (dcList.value.length) {
      dcId.value = dcList.value[0].id
      getCount()
    }
  }
})()

async function getCount() {
  if (dcId.value === undefined) return
  const res = await getResourceCountByDc(dcId.value)
  data.value = res.data
}
</script>
<style lang="scss" scoped>
.control-wrapper {
  display: flex;
  .control-cell {
    display: flex;
    flex: 1;
    background: #e8efff;
    padding: 16px;
    border-radius: 4px;
    .icon-wrapper {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #fff;
      text-align: center;
      line-height: 50px;
      font-size: 28px;
      color: #7ca0fb;
    }
    .count {
      display: flex;
      flex-direction: column;
      margin-left: 8px;
      span:nth-child(2) {
        font-size: 20px;
      }
    }
  }
  .dc-select {
    width: 200px;
    position: absolute;
    right: 20px;
    top: 12px;
  }
}
</style>
