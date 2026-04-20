<template>
  <el-row class="full-height res-wrapper" :gutter="10">
    <el-col :span="12" v-for="(item, i) in countData" :key="i" class="full-height res-cell">
      <el-card class="box-card alarm-statistics">
        <span class="card-title">{{ item.title }}</span>
        <el-select class="pull-right vendor-select" v-model="item.vendorId" @change="handleParams(item, item.type)">
          <el-option v-for="vendorItem in item.vendorList" :key="vendorItem.id" :value="vendorItem.id" :label="vendorItem.name"></el-option>
        </el-select>
        <div class="type-select">
          <el-button-group>
            <el-button size="mini" :type="item.type.indexOf('cpu') > -1 ? 'primary' : ''" plain @click="handleParams(item, 'cpu')">CPU</el-button>
            <el-button size="mini" :type="item.type.indexOf('mem') > -1 ? 'primary' : ''" plain @click="handleParams(item, 'memory')">内存</el-button>
          </el-button-group>
        </div>
        <div class="full-height">
          <bar-reverse-charts @goToPage="goToPage" height="300px" width="100%" :id="'res' + i" :data="item.data" unit="%" v-if="item.data" :setting="{ color: 'rgba(24, 144, 255, 0.8)' }"></bar-reverse-charts>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>
<script>
import { conditionCloudVendor, detailVm } from 'services/platform/index'
import { getResTops } from 'services/monitor/index'
import { getPortal } from 'services/system'

export default {
  props: {},
  data() {
    return {
      countData: [
        {
          title: '云主机CPU利用率',
          vendorId: '',
          code: 'VM',
          type: 'cpu',
          params: '',
          data: null,
          types: ['OPENSTACK', 'EASYSTACK', 'VMWARE', 'INSPURRAIL', 'FUSIONCLOUD', 'HMC', 'MANAGEONE', 'KUBERNETES', 'TIANYI', 'HUAWEI', 'H3C', 'ALIYUN', 'SMARTX', 'CLOUDTOWER', 'ZSTACK', 'CECSTACK', 'FUSIONSPHERE', 'QCLOUD', 'USPHERE', 'CNWARE', 'AZURE', 'APSARASTACK'],
          vendorList: []
        },
        {
          title: '宿主机CPU利用率',
          vendorId: '',
          code: 'PM',
          type: 'cpu',
          params: '',
          data: null,
          types: ['OPENSTACK', 'EASYSTACK', 'VMWARE', 'INSPURRAIL', 'FUSIONCLOUD', 'HMC', 'MANAGEONE', 'KUBERNETES', 'TIANYI', 'HUAWEI', 'H3C', 'SMARTX', 'CLOUDTOWER', 'ZSTACK', 'CECSTACK', 'FUSIONSPHERE', 'USPHERE', 'CNWARE', 'APSARASTACK'],
          vendorList: []
        }
      ]
    }
  },
  created() {
    this.getVendor()
  },
  methods: {
    async getVendor() {
      this.countData.forEach(async (item) => {
        const data = await conditionCloudVendor({
          condition: JSON.stringify({
            condition: 'listByTypes',
            types: item.types
          })
        })
        if (data.success) {
          item.vendorList = data.data
          if (item.vendorList.length) {
            item.vendorId = item.vendorList[0].id
            this.handleParams(item, 'cpu')
          }
        }
      })
    },
    handleParams(data, type) {
      data.type = type
      if (data.code == 'VM' && data.type == 'cpu') {
        data.params = 'vmCpu'
        data.title = '云主机CPU利用率TOP5'
      }
      if (data.code == 'VM' && data.type == 'memory') {
        data.params = 'vmMem'
        data.title = '云主机内存利用率TOP5'
      }
      if (data.code == 'PM' && data.type == 'cpu') {
        data.title = '宿主机CPU利用率TOP5'
        data.params = 'hostCpu'
      }
      if (data.code == 'PM' && data.type == 'memory') {
        data.params = 'hostMem'
        data.title = '宿主机内存利用率TOP5'
      }
      this.getData(data)
    },
    getData(item) {
      getResTops({
        vendorId: item.vendorId,
        type: item.params,
        limit: 5
      }).then((data) => {
        const index = this.countData.findIndex((data) => data.params == item.params)
        this.countData[index].data = data.data
      })
    },
    goToPage(data) {
      console.log(data)
      if (data.seriesName.indexOf('云主机') > -1) {
        this.goToVM(data)
      } else {
        this.goToHost(data)
      }
    },
    goToVM(data) {
      const key = data.name
      const obj = this.countData[0].data.topParams[key]
      switch (obj.type) {
        case 'VMWARE':
          let biosUuid
          detailVm(obj.id).then((res) => {
            if (res.success) {
              biosUuid = res.data.biosUuid
              this.$router.push({ name: 'vCenterVmMonitor', query: { id: obj.id, name: data.name, identifier: obj.identifier, hostName: obj.hostName, vendorId: obj.vendorId, biosUuid: biosUuid } })
            }
          })
          break
        case 'OPENSTACK':
          this.$router.push({ name: 'OpenStackVmMonitor', query: { id: obj.id, name: data.name, identifier: obj.identifier, vendorId: obj.vendorId } })
          break
        case 'EASYSTACK':
          this.$router.push({ name: 'EasyStackVmMonitor', query: { id: obj.id, name: data.name, identifier: obj.identifier, vendorId: obj.vendorId } })
          break
        case 'MANAGEONE':
          this.$router.push({ name: 'mOneVmMonitor', query: { id: obj.id, name: data.name, identifier: obj.identifier, vendorId: obj.vendorId } })
          break
      }
    },
    goToHost(data) {
      const key = data.name
      const obj = this.countData[1].data.topParams[key]
      switch (obj.type) {
        case 'VMWARE':
          this.$router.push({ name: 'vCenterServerMonitor', query: { id: obj.id, name: data.name, identifier: obj.identifier, vendorId: obj.vendorId } })
          break
        case 'OPENSTACK':
          this.$router.push({ name: 'OpenStackServerMonitor', query: { id: obj.id, name: data.name, identifier: obj.identifier, vendorId: obj.vendorId } })
          break
        case 'EASYSTACK':
          this.$router.push({ name: 'EasyStackServerMonitor', query: { id: obj.id, name: data.name, identifier: obj.identifier, vendorId: obj.vendorId } })
          break
        case 'MANAGEONE':
          this.$router.push({ name: 'mOneServerMonitor', query: { id: obj.id, name: data.name, identifier: obj.identifier, vendorId: obj.vendorId } })
          break
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.alarm-statistics {
  padding: 20px;
  margin-bottom: 10px;
  .card-title {
    font-weight: bold;
    color: #393b3e;
    margin: 10px 0 20px 10px;
  }
}
.vendor-select {
  width: 200px;
  // position: relative;;
  // right: 10px;
  // top: 10px;
}
// .res-cell {
//   display: flex;
//   align-items: center;
// }
// .cell-title {
//   text-align: center;
//   font-weight: bold;
//   margin-top: -18px;
// }
.type-select {
  text-align: center;
  margin-top: 20px;
}
</style>
