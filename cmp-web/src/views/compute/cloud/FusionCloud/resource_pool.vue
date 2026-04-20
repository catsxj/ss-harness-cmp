<template>
  <div>
    <el-row :gutter="5">
      <el-col :span="24" class="m-b">
        <el-cascader style="width: 300px" v-model="select" :options="resourcePool" :props="{ checkStrictly: true }" clearable @change="changeData"></el-cascader>
      </el-col>
      <el-col :span="24" class="m-b">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>基本信息</span>
          </div>
          <div class="basic-info">
            <el-row class="m-l m-r">
              <el-col :span="8" class="attr">
                <span class="attr-name">名称：</span>
                <span class="attr-value">{{ currentName }}</span>
              </el-col>
              <el-col :span="8" class="attr">
                <span class="attr-name">本层级：</span>
                <span class="attr-value">{{ currentType == 'resourcePool' ? '资源池' : '可用分区' }}</span>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <div class="m-b">计算资源</div>
      </el-col>
      <el-col :span="24" class="m-b-xs">
        <el-row :gutter="5">
          <el-col :span="12">
            <el-card class="box-card m-t-xs">
              <div slot="header" class="clearfix">
                <span>宿主机状态统计</span>
              </div>
              <div>
                <pie-charts ref="host" v-if="dashboardData.host" id="host" :data="dashboardData.host" width="100%" height="200px" theme="宿主机状态统计"></pie-charts>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="box-card m-t-xs">
              <div slot="header" class="clearfix">
                <span>弹性云服务状态统计</span>
              </div>
              <div>
                <pie-charts ref="cloudserver" v-if="dashboardData.vm" id="cloudserver" :data="dashboardData.vm" width="100%" height="200px" theme="弹性云服务状态统计"></pie-charts>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="box-card m-t-xs">
              <div slot="header" class="clearfix">
                <span v-if="chartData.cpu">CPU (超分比：{{ chartData.cpu.oversubscriptionRatio }})</span>
              </div>
              <el-row>
                <el-col :span="12">
                  <div>CPU总量</div>
                  <div style="text-align: center">
                    <div style="font-size: 32px; margin-top: 50px" v-if="chartData.cpu">{{ chartData.cpu.total }}</div>
                    <div>核</div>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div style="margin-bottom: 19px"></div>
                  <pie-charts ref="cpu" v-if="chartData.cpu.oversubscriptionCapacity" id="cpu" :data="chartData.cpu.oversubscriptionCapacity" width="100%" height="200px" theme="CPU" unit="核" :setting="setting"></pie-charts>
                </el-col>
              </el-row>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="box-card m-t-xs">
              <div slot="header" class="clearfix">
                <span v-if="chartData.memory">内存 (超分比：{{ chartData.memory.oversubscriptionRatio }})</span>
              </div>
              <el-row>
                <el-col :span="12">
                  <div>Memory 使用量</div>
                  <pie-charts ref="mem1" v-if="chartData.memory.actualCapacity" id="mem1" :data="chartData.memory.actualCapacity" width="100%" height="200px" theme="Memory使用量" unit="GB" :setting="setting"></pie-charts>
                </el-col>
                <el-col :span="12">
                  <div>Memory 分配率</div>
                  <pie-charts ref="mem2" v-if="chartData.memory.oversubscriptionCapacity" id="mem2" :data="chartData.memory.oversubscriptionCapacity" width="100%" height="200px" theme="Memory分配率" unit="GB" :setting="setting"></pie-charts>
                </el-col>
              </el-row>
            </el-card>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <div class="m-t-xs m-b-xs">存储资源</div>
      </el-col>
      <el-col :span="24">
        <el-card class="box-card m-t-xs">
          <div slot="header" class="clearfix">
            <span>存储池</span>
          </div>
          <el-row>
            <el-col :span="12">
              <div>存储使用率</div>
              <pie-charts ref="storage1" v-if="chartData.storagePool.actualCapacity" id="storage1" :data="chartData.storagePool.actualCapacity" width="100%" height="200px" theme="存储使用率" unit="TB" :setting="setting"></pie-charts>
            </el-col>
            <el-col :span="12">
              <div>存储分配率（超分）</div>
              <pie-charts ref="storage2" v-if="chartData.storagePool.oversubscriptionCapacity" id="storage2" :data="chartData.storagePool.oversubscriptionCapacity" width="100%" height="200px" theme="存储分配率" unit="TB" :setting="setting"></pie-charts>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
      <el-col :span="24">
        <el-card class="box-card m-t-xs">
          <div slot="header" class="clearfix">
            <span>存储资源概览</span>
          </div>
          <div>
            <bar-charts :data="storageDashboard" v-if="storageDashboard" id="storageDashboard" width="100%" height="260px" unit="GB"></bar-charts>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script>
// import chartBox from 'views/components/chartBox.vue'
import { getResourcePool, getResourcPoolsDashboard, getAzoneDashboard, getResourceCapacities, getAzoneCapacities, getStorageResDashboard, getStorageAzoneDashboard } from 'services/monitor/manageone'
const setting = {
  fixed: 2
}
export default {
  // components: { chartBox },
  props: {
    detailId: {
      type: String
    }
  },
  data() {
    return {
      setting,
      select: [],
      id: null,
      currentType: 'resourcePool',
      currentName: '',
      vendorId: this.$route.query.vendorId,
      resourcePool: [],
      dashboardData: {},
      chartData: {
        cpu: {},
        memory: {},
        storagePool: {}
      },
      storageDashboard: null
    }
  },
  methods: {
    getResourcePoolsData() {
      getResourcePool({
        vendorId: this.vendorId
      }).then((data) => {
        if (data.success) {
          this.resourcePool = data.data
          this.resourcePool.forEach((item, index) => {
            item.value = item.value + ':' + item.label + ':' + item.tag
            if (index == 0) {
              this.select = [item.value]
            }
            item.children.forEach((child) => {
              child.value = child.value + ':' + child.label + ':' + child.tag
            })
          })
          this.changeData(this.select)
        }
      })
    },
    getDashboard(type) {
      let http = getResourcPoolsDashboard
      if (type == 'azone') {
        http = getAzoneDashboard
      }
      http({
        id: this.id,
        vendorId: this.vendorId
      }).then((data) => {
        if (data.success) {
          this.dashboardData = data.data
        }
      })
    },
    getCapacities(type) {
      let http = getResourceCapacities
      if (type == 'azone') {
        http = getAzoneCapacities
      }
      http({
        id: this.id,
        vendorId: this.vendorId
      }).then((data) => {
        if (data.success) {
          this.chartData = data.data
        }
      })
    },
    getStoragePoolData(type) {
      let http = getStorageResDashboard
      if (type == 'azone') {
        http = getStorageAzoneDashboard
      }
      http({
        id: this.id,
        vendorId: this.vendorId
      }).then((data) => {
        if (data.success) {
          this.storageDashboard = data.data
        }
      })
    },
    changeData(selections) {
      if (selections.length) {
        const obj = selections[selections.length - 1].split(':')
        this.id = obj[0]
        this.currentName = obj[1]
        this.currentType = obj[2]
        this.getDashboard(obj[2])
        this.getCapacities(obj[2])
        this.getStoragePoolData(obj[2])
      }
    }
  },
  created() {
    this.getResourcePoolsData()
  }
}
</script>
