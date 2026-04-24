<template>
  <div>
    <!-- <div class="box-card m-l m-b-xs">
      <div class="basic-info">
        <el-row>
          <el-col :span="8" class="attr">
            <span class="attr-name">平台名称：</span>
            <span class="attr-value">{{detailData.name}}</span>
          </el-col>
          <el-col :span="8" class="attr">
            <span class="attr-name">平台类型：</span>
            <span class="attr-value">{{detailData.type}}</span>
          </el-col>
          <el-col :span="8" class="attr" v-if="vendorType != 'MANAGEONE'">
            <span class="attr-name">版本：</span>
            <span class="attr-value">{{detailData.version}}</span>
          </el-col>
          <el-col :span="8" class="attr">
            <span class="attr-name">数据中心：</span>
            <span class="attr-value">{{detailData.dcName}}</span>
          </el-col>
          <el-col :span="8" class="attr">
            <span class="attr-name">所属环境：</span>
            <span class="attr-value">{{detailData.envName}}</span>
          </el-col>
        </el-row>
      </div>
    </div> -->
    <detail-map :detail="detailData" :list="detailMapList"></detail-map>
    <el-row :gutter="5">
      <el-col :span="resUsedData.length === 3 ? 8 : 12" v-for="item in resUsedData" :key="item.name" class="m-t-xs">
        <el-card :header="item.name + '使用率'">
          <el-col :span="12">
            <liquid-fill-charts :id="item.name" :data="item" width="100%" height="200px"></liquid-fill-charts>
          </el-col>
          <el-col :span="12">
            <el-row class="count-container">
              <el-col :span="24" class="liguid-box">
                <span class="liguid-box-name">总量：</span>
                <span class="liguid-box-value">{{ item.total }} {{ item.unit }}</span>
              </el-col>
              <el-col :span="24" class="liguid-box">
                <span class="liguid-box-name">已使用：</span>
                <span class="liguid-box-value">{{ item.used }} {{ item.unit }}</span>
              </el-col>
              <el-col :span="24" class="liguid-box">
                <span class="liguid-box-name">未使用：</span>
                <span class="liguid-box-value">{{ item.free }} {{ item.unit }}</span>
              </el-col>
            </el-row>
          </el-col>
        </el-card>
      </el-col>
      <el-col :span="24" class="m-t-xs m-b-xs">
        <div>
          <el-row :gutter="5">
            <el-col :span="12">
              <el-card class="box-card">
                <div slot="header" class="clearfix">
                  <span>{{ resTitle[0] }}</span>
                  <span class="pull-right">
                    <el-button-group>
                      <el-button size="mini" :type="restype[0] == 'cpu' ? 'primary' : ''" @click="getResourceCpu(0)">CPU</el-button>
                      <el-button size="mini" :type="restype[0] == 'mem' ? 'primary' : ''" @click="getResourceMem(0)">内存</el-button>
                    </el-button-group>
                  </span>
                </div>
                <div>
                  <bar-reverse-charts @goToPage="goToVM" height="300px" width="100%" id="resVm" :data="resVmTopsData" unit="%" v-if="resVmTopsData" :setting="{ color: 'rgba(24, 144, 255, 0.8)' }"> </bar-reverse-charts>
                </div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card class="box-card">
                <div slot="header" class="clearfix">
                  <span>{{ resTitle[1] }}</span>
                  <span class="pull-right">
                    <el-button-group>
                      <el-button size="mini" :type="restype[1] == 'cpu' ? 'primary' : ''" @click="getResourceCpu(1)">CPU</el-button>
                      <el-button size="mini" :type="restype[1] == 'mem' ? 'primary' : ''" @click="getResourceMem(1)">内存</el-button>
                    </el-button-group>
                  </span>
                </div>
                <div>
                  <bar-reverse-charts @goToPage="goToHost" height="300px" width="100%" id="resHost" :data="resHostTopsData" unit="%" v-if="resHostTopsData" :setting="{ color: 'rgba(24, 144, 255, 0.8)' }"></bar-reverse-charts>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-col>
      <el-col :span="24" class="m-b-xs">
        <el-row :gutter="5">
          <el-col :span="6">
            <el-card class="box-card">
              <div slot="header" class="clearfix">宿主机状态统计</div>
              <div>
                <pie-charts ref="pie1" v-if="statusPieChartData.PM" id="pie1" :data="statusPieChartData.PM" width="100%" :setting="setting1" height="200px" theme="宿主机状态统计"></pie-charts>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="box-card">
              <div slot="header" class="clearfix">云主机状态统计</div>
              <div>
                <pie-charts ref="pie2" v-if="statusPieChartData.VmPie" id="pie2" :data="statusPieChartData.VmPie" width="100%" :setting="setting1" height="200px" theme="云主机状态统计"></pie-charts>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="box-card">
              <div slot="header" class="clearfix">宿主机告警统计</div>
              <div>
                <pie-charts ref="pie3" v-if="alarmPieChartData.HOST" id="pie3" :data="alarmPieChartData.HOST" width="100%" :setting="setting2" height="200px" theme="宿主机告警统计"></pie-charts>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="box-card">
              <div slot="header" class="clearfix">云主机告警统计</div>
              <div>
                <pie-charts ref="pie4" v-if="alarmPieChartData.VM" id="pie4" :data="alarmPieChartData.VM" width="100%" :setting="setting2" height="200px" theme="云主机告警统计"></pie-charts>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="24" class="m-b-xs">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>告警统计</span>
            <span class="pull-right">
              <el-button-group>
                <el-button size="mini" :type="item.value == chart2.step ? 'primary' : ''" v-for="item in intervalData" :key="item.value" @click="changeInterval(item.value)">{{ item.name }}</el-button>
                <el-button size="mini" :type="chart2.step === 0 ? 'primary' : ''" @click="userDefind()">自定义</el-button>
              </el-button-group>
            </span>
          </div>
          <div>
            <bar-charts ref="chart2" height="250px" width="100%" id="cpu" :data="chart2Data" :setting="setting2" v-if="chart2Data"></bar-charts>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-dialog title="自定义时间" :close-on-click-modal="false" v-if="userDefindVisible" v-model:visible="userDefindVisible">
      <basic-form>
        <basic-form-item label="选择时间：">
          <el-date-picker v-model="userDefindTime2" type="datetimerange" size="mini" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="timestamp" :picker-options="pickerOptions"></el-date-picker>
        </basic-form-item>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="close">取消</el-button>
        <el-button type="primary" @click="userDefindSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getAlarmChart, getResTops } from 'services/monitor/index.js'
import { detailCloudVendor, detailVm } from 'services/platform/index'
import { getPortal } from 'services/system'
import detailMap from './detailMap.vue'
const intervalData = [
  { name: '7D', value: '7' },
  { name: '15D', value: '15' },
  { name: '30D', value: '30' }
]
const setting1 = {
  center: ['26%', '50%'],
  richCount: 20,
  color: ['#18BE6A', '#1890FF', '#F84540', '#696BD8', '#FE9900', '#E66B1A']
}
const setting2 = {
  center: ['26%', '50%'],
  richCount: 20,
  color: ['#EC1C24', '#FF7F27', '#FFF200', '#4EAFF5']
}
export default {
  components: { detailMap },
  filters: {},
  data() {
    return {
      intervalData,
      setting1,
      setting2,
      detailData: {},
      detailMapList: [
        { name: 'CPU', value: 'cpuTotal' },
        { name: '内存', value: 'memTotal' },
        { name: '存储', value: 'diskTotal' },
        { name: '主机', value: 'hostCount', unit: '台' },
        { name: '云主机', value: 'instance', unit: '台' }
        // { name: 'CPU', value: 'cpuTotal', img: '/web-common-resource/img/platform/cpu.png' },
        // { name: '内存', value: 'memTotal', img: '/web-common-resource/img/platform/memorys.png' },
        // { name: '存储', value: 'diskTotal', img: '/web-common-resource/img/platform/disk.png' },
        // { name: '主机', value: 'hostCount', img: '/web-common-resource/img/platform/host.png', unit: '台' },
        // { name: '云主机', value: 'instance', img: '/web-common-resource/img/platform/host.png', unit: '台' }
      ],
      vendorId: this.$route.query.vendorId,
      vendorType: this.$route.query.type,
      restype: ['cpu', 'cpu'],
      resTitle: ['云主机CPU利用率TOP5', '宿主机CPU利用率TOP5'],
      resVmTopsData: null,
      resHostTopsData: null,
      resUsedData: [],
      statusPieChartData: {
        PM: null,
        VmPie: null
      },
      alarmPieChartData: {
        HOST: null,
        VM: null
      },
      chart2Data: null,
      chart2: {
        step: null
      },
      userDefindTime: [],
      userDefindTime2: [],
      userDefindVisible: false,
      pickerOptions: {
        disabledDate: (time) => {
          return time.getTime() > Date.now()
        }
      }
    }
  },
  created() {
    this.getDetail()
    this.getResourceCpu(0)
    this.getResourceCpu(1)
    this.getResUsedData()
    this.getAlarmPieData('HOST')
    this.getAlarmPieData('VM')
    this.getStatusPieData('PM')
    this.getStatusPieData('VmPie')
    this.changeInterval(7)
  },
  beforeDestroy() {},
  methods: {
    getDetail() {
      detailCloudVendor(this.$route.query.vendorId).then((data) => {
        if (data.success) {
          this.detailData = data.data
        }
      })
    },
    getResourceCpu(index) {
      this.restype[index] = 'cpu'
      if (index == 0) {
        this.getResTopsChart(index, 'vmCpu')
        this.resTitle[0] = '云主机CPU利用率TOP5'
      } else {
        this.getResTopsChart(index, 'hostCpu')
        this.resTitle[1] = '宿主机CPU利用率TOP5'
      }
    },
    getResourceMem(index) {
      this.restype[index] = 'mem'
      if (index == 0) {
        this.getResTopsChart(index, 'vmMem')
        this.resTitle[0] = '云主机内存利用率TOP5'
      } else {
        this.getResTopsChart(index, 'hostMem')
        this.resTitle[1] = '宿主机内存利用率TOP5'
      }
    },
    getResTopsChart(index, type) {
      getResTops({
        vendorId: this.vendorId,
        type: type,
        limit: 5
      }).then((data) => {
        if (index == 0) {
          this.resVmTopsData = data.data
        } else {
          this.resHostTopsData = data.data
        }
      })
    },
    goToVM(data) {
      const key = data.name
      const obj = this.resVmTopsData.topParams[key]
      switch (obj.type) {
        case 'VMWARE':
          let biosUuid
          detailVm(obj.id).then((res) => {
            if (res.success) {
              biosUuid = res.data.biosUuid
              this.$router.push({ name: 'vCenterVmMonitor', query: { id: obj.id, name: data.name, identifier: obj.identifier, hostName: obj.hostName, biosUuid: biosUuid } })
            }
          })
          break
        case 'OPENSTACK':
          this.$router.push({ name: 'OpenStackVmMonitor', query: { id: obj.id, name: data.name, identifier: obj.identifier } })
          break
        case 'EASYSTACK':
          this.$router.push({ name: 'EasyStackVmMonitor', query: { id: obj.id, name: data.name, identifier: obj.identifier } })
          break
        case 'MANAGEONE':
          this.$router.push({ name: 'mOneVmMonitor', query: { id: obj.id, name: data.name, identifier: obj.identifier } })
          break
        case 'YYJQCLOUD':
          this.$router.push({ name: 'yyjQcloudVmMonitor', query: { id: obj.id, name: data.name, identifier: obj.identifier } })
          break
      }
    },
    goToHost(data) {
      const key = data.name
      const obj = this.resHostTopsData.topParams[key]
      switch (obj.type) {
        case 'VMWARE':
          this.$router.push({ name: 'vCenterServerMonitor', query: { id: obj.id, name: data.name, identifier: obj.identifier } })
          break
        case 'OPENSTACK':
          this.$router.push({ name: 'OpenStackServerMonitor', query: { id: obj.id, name: data.name, identifier: obj.identifier } })
          break
        case 'EASYSTACK':
          this.$router.push({ name: 'EasyStackServerMonitor', query: { id: obj.id, name: data.name, identifier: obj.identifier } })
          break
        case 'MANAGEONE':
          this.$router.push({ name: 'mOneServerMonitor', query: { id: obj.id, name: data.name, identifier: obj.identifier } })
          break
        case 'YYJQCLOUD':
          this.$router.push({ name: 'yyjQcloudHostMonitor', query: { id: obj.id, name: data.name, identifier: obj.identifier, vendorId: obj.vendorId } })
          break
      }
    },
    getResUsedData() {
      getPortal({
        code: 'resUsed',
        vendorId: this.vendorId,
        vendor: this.vendorType
      }).then((data) => {
        if (data.success) {
          this.resUsedData = data.data.filter((item) => {
            if (['CLOUDTOWER', 'INSPURRAIL', 'FUSIONSPHERE', 'SANGFOR'].includes(this.vendorType)) {
              if (item.name === '磁盘') return false
            }
            return true
          })
          this.detailData.cpuTotal = data.data[0].total
          this.detailData.memTotal = data.data[1].total
          this.detailData.diskTotal = data.data[2].total
        }
      })
    },
    getAlarmPieData(type) {
      getAlarmChart({
        action: 'pieChart',
        vendorId: this.vendorId,
        type: type
      }).then((data) => {
        if (data.success) {
          this.alarmPieChartData[type] = data.data
        }
      })
    },
    getStatusPieData(type) {
      getPortal({
        code: type,
        vendorId: this.vendorId,
        vendor: this.vendorType
      }).then((data) => {
        if (data.success) {
          this.statusPieChartData[type] = data.data
        }
      })
    },
    getBarData() {
      getAlarmChart({
        action: 'barChart',
        vendorId: this.vendorId,
        start: this.chart2.start,
        end: this.chart2.end
      }).then((data) => {
        if (data.success) {
          this.chart2Data = data.data
        }
      })
    },
    // 改变周期
    changeInterval(value) {
      this.userDefindTime = []
      this.userDefindTime2 = []
      this.chart2.step = value
      // 获取当天 0 点的时间戳
      const timeStamp = new Date(new Date().setHours(0, 0, 0, 0)) / 1000
      this.chart2.end = timeStamp
      // 一天是86400秒   故 value 天前的时间戳为
      this.chart2.start = timeStamp - 86400 * value
      this.getBarData()
    },
    userDefind() {
      this.userDefindTime2 = Object.assign([], this.userDefindTime)
      this.userDefindVisible = true
    },
    userDefindSubmit() {
      this.userDefindTime = Object.assign([], this.userDefindTime2)
      if (this.userDefindTime.length) {
        this.chart2.step = 0
        this.chart2.end = Math.round(this.userDefindTime[1] / 1000)
        this.chart2.start = Math.round(this.userDefindTime[0] / 1000)
        this.getBarData()
        this.userDefindVisible = false
      } else {
        return this.$message.error('请选择自定义时间！')
      }
    },
    close() {
      this.userDefindVisible = false
    }
  }
}
</script>
<style lang="scss">
.count-container {
  margin-top: 40px;
}
.liguid-box {
  margin-top: 15px;
  font-size: 12px;
  color: #656565;
  .liguid-box-name {
    display: inline-block;
    text-align: left;
    width: 50px;
  }
  .liguid-box-value {
    display: inline-block;
    text-align: right;
    width: calc(100% - 55px);
  }
}
.attr {
  font-size: 12px;
  margin-bottom: 12px;
}
.attr-name {
  display: inline-block;
  white-space: nowrap;
  color: #999;
  width: 98px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.attr-value {
  display: inline-block;
  white-space: nowrap;
  width: calc(100% - 105px);
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
