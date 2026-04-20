<template>
  <div>
    <div class="row-magin">
      周期：日
      <el-button :disabled="ByDay" type="primary" @click.native="retry('ByDay')">重试</el-button>
    </div>
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="m-b-sm">
          <div slot="header">
            <span>云主机CPU利用率</span>
          </div>
          <bar-charts ref="topCpu" height="300px" width="100%" id="topCpu" :data="topCputData" v-if="Object.keys(topCputData).length !== 0"></bar-charts>
          <div v-else class="charts-data">
            <div>
              <Icon type="icon-zanwushuju"></Icon>
            </div>
            <div>暂无数据</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="m-b-sm">
          <div slot="header">
            <span>云主机内存利用率</span>
          </div>
          <bar-charts height="300px" width="100%" id="topMem" :data="topMemData" v-if="Object.keys(topMemData).length !== 0"></bar-charts>
          <div v-else class="charts-data">
            <div>
              <Icon type="icon-zanwushuju"></Icon>
            </div>
            <div>暂无数据</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="m-b-sm">
          <div slot="header">
            <span>云主机存储利用率</span>
          </div>
          <bar-charts height="300px" width="100%" id="topDisk" :data="topDiskData" v-if="Object.keys(topDiskData).length !== 0"></bar-charts>
          <div v-else class="charts-data">
            <div>
              <Icon type="icon-zanwushuju"></Icon>
            </div>
            <div>暂无数据</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <div class="row-magin">
      周期：周
      <el-button :disabled="ByWeek" type="primary" @click.native="retry('ByWeek')">重试</el-button>
    </div>
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="m-b-sm">
          <div slot="header">
            <span>云主机CPU利用率</span>
          </div>
          <bar-charts ref="weekTopCpu" height="300px" width="100%" id="weekTopCpu" :data="weekCpuData" v-if="Object.keys(weekCpuData).length !== 0"></bar-charts>
          <div v-else class="charts-data">
            <div>
              <Icon type="icon-zanwushuju"></Icon>
            </div>
            <div>暂无数据</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="m-b-sm">
          <div slot="header">
            <span>云主机内存利用率</span>
          </div>
          <bar-charts height="300px" width="100%" id="weekTopMem" :data="weekMemData" v-if="Object.keys(weekMemData).length !== 0"></bar-charts>
          <div v-else class="charts-data">
            <div>
              <Icon type="icon-zanwushuju"></Icon>
            </div>
            <div>暂无数据</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="m-b-sm">
          <div slot="header">
            <span>云主机存储利用率</span>
          </div>
          <bar-charts height="300px" width="100%" id="weekTopDisk" :data="weekDiskData" v-if="Object.keys(weekDiskData).length !== 0"></bar-charts>
          <div v-else class="charts-data">
            <div>
              <Icon type="icon-zanwushuju"></Icon>
            </div>
            <div>暂无数据</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <div class="row-magin">
      周期：月
      <el-button :disabled="ByMonth" type="primary" @click.native="retry('ByMonth')">重试</el-button>
    </div>
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="m-b-sm">
          <div slot="header">
            <span>云主机CPU利用率</span>
          </div>
          <bar-charts height="300px" width="100%" id="mothCpu" :data="mothCpuData" v-if="Object.keys(mothCpuData).length !== 0"></bar-charts>
          <div v-else class="charts-data">
            <div>
              <Icon type="icon-zanwushuju"></Icon>
            </div>
            <div>暂无数据</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="m-b-sm">
          <div slot="header">
            <span>云主机内存利用率</span>
          </div>
          <bar-charts height="300px" width="100%" id="mothMem" :data="mothMemData" v-if="Object.keys(mothMemData).length !== 0"></bar-charts>
          <div v-else class="charts-data">
            <div>
              <Icon type="icon-zanwushuju"></Icon>
            </div>
            <div>暂无数据</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="m-b-sm">
          <div slot="header">
            <span>云主机存储利用率</span>
          </div>
          <bar-charts height="300px" width="100%" id="mothDisk" :data="mothDiskData" v-if="Object.keys(mothDiskData).length !== 0"></bar-charts>
          <div v-else class="charts-data">
            <div>
              <Icon type="icon-zanwushuju"></Icon>
            </div>
            <div>暂无数据</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import webSocket from '@/common/mixins/getGlobalSocket'
import { getVmTop, checkStatus, handleRetry } from 'services/platform/index'

const intervalData = [
  { name: '华为云', measure: 'huawei' },
  { name: '阿里云', measure: 'aliyun' }
]
const intervalData2 = [{ name: '月', measure: 'month' }]
export default {
  mixins: [webSocket],
  filters: {},
  props: {
    cloudType: {
      type: String
    },
    topFlag: {
      type: Boolean
    }
  },
  data() {
    return {
      intervalData,
      intervalData2,
      // 使用概览数据
      initData: [],
      vmType: 'vm',
      CPU: {
        category: 'CPU',
        measure: 'week'
      },
      MEM: {
        category: 'MEM',
        measure: 'week'
      },
      DISK: {
        category: 'DISK',
        measure: 'week'
      },
      INST: {
        category: 'INST',
        measure: 'week'
      },
      dashboradData: [],
      trendData: {},
      topCputData: {},
      topMemData: {},
      topDiskData: {},
      weekCpuData: {},
      weekMemData: {},
      weekDiskData: {},
      mothCpuData: {},
      mothMemData: {},
      mothDiskData: {},
      ByDay: true,
      ByWeek: true,
      ByMonth: true
    }
  },
  created() {
    this.handleSearch()
  },
  methods: {
    onmessage(data) {
      if (data.operate == 'report.top.reset[ByDay]') {
        this.getData(this.vmType, 'Cpu', 'ByDay', '云主机cpu利用率', 'topCpu')
        this.getData(this.vmType, 'Mem', 'ByDay', '云主机内存利用率', 'topMem')
        this.getData(this.vmType, 'Disk', 'ByDay', '云主机存储利用率', 'topDisk')
      }
      if (data.operate == 'report.top.reset[ByWeek]') {
        this.getData(this.vmType, 'Cpu', 'ByWeek', '云主机cpu利用率', 'weekTopCpu')
        this.getData(this.vmType, 'Mem', 'ByWeek', '云主机内存利用率', 'weekTopMem')
        this.getData(this.vmType, 'Disk', 'ByWeek', '云主机存储利用率', 'weekTopDisk')
      }
      if (data.operate == 'report.top.reset[ByMonth]') {
        this.getData(this.vmType, 'Cpu', 'ByMonth', '云主机cpu利用率', 'mothCpu')
        this.getData(this.vmType, 'Mem', 'ByMonth', '云主机内存利用率', 'mothMem')
        this.getData(this.vmType, 'Disk', 'ByMonth', '云主机存储利用率', 'mothDisk')
      }
    },
    handleSearch() {
      this.checkStatus()
      this.getData(this.vmType, 'Cpu', 'ByDay', '云主机cpu利用率', 'topCpu')
      this.getData(this.vmType, 'Mem', 'ByDay', '云主机内存利用率', 'topMem')
      this.getData(this.vmType, 'Disk', 'ByDay', '云主机存储利用率', 'topDisk')
      this.getData(this.vmType, 'Cpu', 'ByWeek', '云主机cpu利用率', 'weekTopCpu')
      this.getData(this.vmType, 'Mem', 'ByWeek', '云主机内存利用率', 'weekTopMem')
      this.getData(this.vmType, 'Disk', 'ByWeek', '云主机存储利用率', 'weekTopDisk')
      this.getData(this.vmType, 'Cpu', 'ByMonth', '云主机cpu利用率', 'mothCpu')
      this.getData(this.vmType, 'Mem', 'ByMonth', '云主机内存利用率', 'mothMem')
      this.getData(this.vmType, 'Disk', 'ByMonth', '云主机存储利用率', 'mothDisk')
    },
    retry(type) {
      const params = {
        period: type
      }
      handleRetry(params).then((data) => {})
    },
    checkStatus() {
      checkStatus().then((data) => {
        this.ByDay = data.data.ByDay
        this.ByWeek = data.data.ByWeek
        this.ByMonth = data.data.ByMonth
      })
    },
    // 获取使用概览图表数据
    getData(vmType, metric, period, name, type) {
      const params = {
        vmType: vmType,
        metric: metric,
        period: period,
        name: name
      }
      getVmTop(params).then((data) => {
        if (data.success && data.data) {
          switch (type) {
            case 'topCpu':
              this.topCputData = data.data
              break
            case 'topMem':
              this.topMemData = data.data
              break
            case 'topDisk':
              this.topDiskData = data.data
              break
            case 'weekTopCpu':
              this.weekCpuData = data.data
              break
            case 'weekTopMem':
              this.weekMemData = data.data
              break
            case 'weekTopDisk':
              this.weekDiskData = data.data
              break
            case 'mothCpu':
              this.mothCpuData = data.data
              break
            case 'mothMem':
              this.mothMemData = data.data
              break
            case 'mothDisk':
              this.mothDiskData = data.data
              break
          }
        }
      })
    },
    // 改变使用概览周期
    changeInterval(type, value) {
      this[type].measure = value
      this.getData()
    }
  }
}
</script>

<style scoped>
.search-item {
  width: 20%;
}

.cosumeData {
  text-align: center;
  height: 80px;
  line-height: 40px;
  border-right: 1px solid #cccccc;
}

.cosumeData:last-of-type {
  border-right: none;
}
.row-magin {
  margin: 10px 0;
}
.charts-data {
  height: 300px;
  text-align: center;
  position: relative;
  transform: translateY(30%);
}
.charts-data .icon-zanwushuju {
  font-size: 50px;
  color: #333;
}
</style>
