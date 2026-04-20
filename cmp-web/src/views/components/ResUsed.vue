<template>
  <el-row class="full-height res-wrapper" :gutter="10">
    <el-select class="vendor-select" v-model="vendorId" @change="getCountData">
      <el-option v-for="item in vendorList" :key="item.id" :value="item.id" :label="item.name"></el-option>
    </el-select>
    <el-col :span="24 / countData.length" v-for="item in countData" :key="item.name" class="full-height res-cell">
      <el-col :span="12" class="full-height">
        <liquid-fill-charts :data="item" height="100%"></liquid-fill-charts>
        <div class="cell-title">{{ item.name }}</div>
      </el-col>
      <el-col :span="12">
        <el-row class="m-t-n">
          <el-col :span="24" class="liguid-box">
            <span class="liguid-box-name">总量：</span>
            <span class="liguid-box-value">{{ item.total }}</span>
          </el-col>
          <el-col :span="24" class="liguid-box">
            <span class="liguid-box-name">已使用：</span>
            <span class="liguid-box-value">{{ item.used }}</span>
          </el-col>
          <el-col :span="24" class="liguid-box">
            <span class="liguid-box-name">未使用：</span>
            <span class="liguid-box-value">{{ item.free }}</span>
          </el-col>
        </el-row>
      </el-col>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import { defineComponent, PropType, ref, unref } from '@vue/composition-api'
import { conditionCloudVendor } from 'services/platform/index'
import { getPortal } from 'services/system'

export default defineComponent({
  props: {
    itemData: {
      type: Object as PropType<{ config: any }>,
      required: true
    }
  },
  setup() {
    const vendorList = ref([])
    const vendorId = ref()
    async function getVendor() {
      const data = await conditionCloudVendor({
        condition: JSON.stringify({
          condition: 'listByTypes',
          types: ['OPENSTACK', 'EASYSTACK', 'VMWARE', 'INSPURRAIL', 'EASYSTACK', 'CLOUDTOWER', 'ZSTACK', 'FUSIONSPHERE', 'USPHERE', 'CNWARE', 'H3C', 'SMARTX', 'SANGFOR', 'APSARASTACK']
        })
      })
      if (data.success) {
        vendorList.value = data.data
        if (unref(vendorList).length) {
          vendorId.value = (unref(vendorList)[0] as any).id
        }
        getCountData(unref(vendorId))
      }
    }
    getVendor()
    const countData = ref([])
    async function getCountData(vendorId: number) {
      const res = await getPortal({ vendorId, code: 'resUsed' })
      if (res.success) {
        const vendorType = unref(vendorList).find(({ id }) => id === vendorId).type
        countData.value = res.data.filter((item) => {
          if (['INSPURRAIL', 'FUSIONSPHERE', 'SANGFOR'].includes(vendorType)) {
            if (item.name === '磁盘') return false
          }
          return true
        })
      }
    }
    return {
      vendorId,
      vendorList,
      countData,
      getCountData
    }
  }
})
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
