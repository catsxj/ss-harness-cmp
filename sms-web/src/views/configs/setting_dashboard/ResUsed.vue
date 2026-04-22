<template>
  <el-row class="full-height res-wrapper" :gutter="10">
    <el-select class="vendor-select" v-model="vendorId" @change="getCountData">
      <el-option v-for="item in vendorList" :key="item.id" :value="item.id" :label="item.name"></el-option>
    </el-select>
    <el-col :span="24 / (countData.length || 1)" v-for="item in countData" :key="item.name" class="full-height res-cell">
      <el-col :span="12" class="full-height">
        <!-- TODO: cmp-echarts - 后续用本地 echarts 组件替换 -->
        <liquid-fill-charts :data="item" height="100%"></liquid-fill-charts>
        <div class="cell-title">{{ item.name }}</div>
      </el-col>
      <el-col :span="12">
        <el-row class="m-t-n">
          <el-col :span="24" class="liguid-box">
            <!-- TODO: i18n -->
            <span class="liguid-box-name">总量：</span>
            <span class="liguid-box-value">{{ item.total }}</span>
          </el-col>
          <el-col :span="24" class="liguid-box">
            <!-- TODO: i18n -->
            <span class="liguid-box-name">已使用：</span>
            <span class="liguid-box-value">{{ item.used }}</span>
          </el-col>
          <el-col :span="24" class="liguid-box">
            <!-- TODO: i18n -->
            <span class="liguid-box-name">未使用：</span>
            <span class="liguid-box-value">{{ item.free }}</span>
          </el-col>
        </el-row>
      </el-col>
    </el-col>
  </el-row>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { conditionCloudVendor } from 'services/platform/index'
import { getPlatformStats } from 'services/system/portal'

interface VendorItem {
  id: number | string
  name: string
  type: string
}

interface CountItem {
  name: string
  total: number | string
  used: number | string
  free: number | string
  [key: string]: unknown
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
defineProps<{
  itemData: { config?: any }
}>()

const vendorList = ref<VendorItem[]>([])
const vendorId = ref<number | string | undefined>(undefined)

async function getVendor() {
  const data = await conditionCloudVendor({
    condition: JSON.stringify({
      condition: 'listByTypes',
      types: ['OPENSTACK', 'VMWARE', 'FUSIONSPHERE', 'INSPURRAIL', 'SANGFOR', 'CLOUDTOWER']
    })
  })
  if (data.success) {
    vendorList.value = data.data
    if (vendorList.value.length) {
      vendorId.value = vendorList.value[0].id
    }
    if (vendorId.value !== undefined) getCountData(vendorId.value)
  }
}
getVendor()

const countData = ref<CountItem[]>([])

async function getCountData(id: number | string) {
  const vendor = vendorList.value.find((v) => v.id === id)
  if (!vendor) return
  const vendorType = vendor.type
  const res = await getPlatformStats({ vendorId: id, code: 'resUsed' })
  if (res.success) {
    countData.value = res.data.filter((item: CountItem) => {
      if (['SANGFOR'].includes(vendorType)) {
        // TODO: i18n
        if (item.name === '磁盘') return false
      }
      return true
    })
  }
}
</script>
<style lang="scss" scoped>
.full-height {
  height: 100%;
}
.vendor-select {
  width: 200px;
  position: absolute;
  right: 0;
  top: -47px;
}
.res-cell {
  display: flex;
  align-items: center;
}
.cell-title {
  text-align: center;
  font-weight: bold;
  margin-top: -18px;
}
.liguid-box {
  margin-top: 15px;
  font-size: 12px;
  .liguid-box-name {
    display: inline-block;
    text-align: left;
    width: 50px;
    color: #707274;
  }
  .liguid-box-value {
    display: inline-block;
    text-align: right;
    color: #393b3e;
    width: calc(100% - 55px);
  }
}
</style>
