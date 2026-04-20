<template>
  <full-screen-container :width="2816" :height="1536" @getScale="getScale" :loading="loading">
    <Header></Header>
    <el-row class="container">
      <MapBg ref="mapRef" @getData="change" :scale="scale" />
      <el-col :span="8" class="left">
        <div class="card mini">
          <router-link to="/screen/dc">
            <div class="card-title">数据中心概况</div>
          </router-link>
          <div class="card-body">
            <el-row :gutter="20">
              <el-col :span="8" v-for="item in dcList" :key="item.id">
                <div class="dc-item">
                  <img :src="`/scr-web/static/img/outside/${item.config.logo}.png`" alt="">
                  <span>{{item.name}}</span>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
        <div class="card mini">
          <router-link to="/screen/resource">
            <div class="card-title">云资源概况</div>
          </router-link>
          <div class="card-body">
            <el-row :gutter="15">
              <el-col :span="12">
                <ResourceCount title="云主机总数(台)" :value="resourceCount.vms" color=""></ResourceCount>
              </el-col>
              <el-col :span="12">
                <ResourceCount title="CPU总量(核)" :value="resourceCount.cpu" color="#18BE6A" icon="/scr-web/static/img/sip/cpu.png"></ResourceCount>
              </el-col>
              <el-col :span="12">
                <ResourceCount title="内存总量(TB)" :value="resourceCount.mem" color="#1890FF" icon="/scr-web/static/img/sip/mem.png"></ResourceCount>
              </el-col>
              <el-col :span="12">
                <ResourceCount title="存储总量(TB)" :value="resourceCount.disk" color="#FF6600" icon="/scr-web/static/img/sip/storage.png"></ResourceCount>
              </el-col>
            </el-row>
          </div>
        </div>
        <div class="card mini">
          <router-link to="/screen/business_network">
            <div class="card-title">网资源概况</div>
          </router-link>
          <div class="card-body">
            <el-row :gutter="20">
              <el-col :span="12" v-for="(item) in netOverview" :key="item.name">
                <div class="net-item">
                  <div class="net-value">{{item.value}}</div>
                  <div class="net-name">{{item.name}}</div>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
        <div class="card mini">
          <router-link to="/screen/business">
            <div class="card-title">业务工单概况</div>
          </router-link>
          <div class="card-body">
            <el-row :gutter="20" style="margin-top: 50px">
              <el-col :span="8" v-for="(item, index) in orderOverview" :key="item.name">
                <OrderCount :title="item.name" :value="item.value" :color="getColor(index)"></OrderCount>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-col>
      <el-col :span="8" class="center">
      </el-col>
      <el-col :span="8" class="right">
        <div class="card">
          <div class="card-title">云主机新增和注销趋势</div>
          <div class="card-body">
            <line-charts :setting="{}" :data="serverTrend" v-if="serverTrend.keys" width="100%" height="100%">
            </line-charts>
          </div>
        </div>
        <div class="card">
          <div class="card-title">各单位资源使用量统计</div>
          <div class="card-body">
            <scroll-table :data="tenantResourceList" :column-width="['80px']" :columns="['单位名称', '云主机(台)', 'CPU(核)' , '内存(GB)' , '存储(GB)']" :options="{singleHeight: 40,  limitMoveNum: 7}">
              <template v-slot="scope">
                <el-popover popper-class="popover-resource" placement="left" trigger="click">
                  <scroll-table :data="scope.row.vendorServers" :columns="['平台类型', '云主机(台)', 'CPU(核)' , '内存(GB)' , '存储(GB)']" :options="{singleHeight: 40,  limitMoveNum: 8}">
                    <template v-slot="scope">
                      <scroll-table-column :value="scope.row.type" width="80px">
                      </scroll-table-column>
                      <scroll-table-column :value="scope.row.number">
                      </scroll-table-column>
                      <scroll-table-column :value="scope.row.cpu">
                      </scroll-table-column>
                      <scroll-table-column :value="scope.row.mem">
                      </scroll-table-column>
                      <scroll-table-column :value="scope.row.disk">
                      </scroll-table-column>
                    </template>
                  </scroll-table>
                  <scroll-table-column slot="reference" :value="scope.row.name" width="80px">
                  </scroll-table-column>
                </el-popover>
                <scroll-table-column :value="scope.row.number">
                </scroll-table-column>
                <scroll-table-column :value="scope.row.cpu">
                </scroll-table-column>
                <scroll-table-column :value="scope.row.mem">
                </scroll-table-column>
                <scroll-table-column :value="scope.row.disk">
                </scroll-table-column>
              </template>
            </scroll-table>
          </div>
        </div>
        <div class="card">
          <div class="card-title">系统资源情况</div>
          <div class="card-body">
            <scroll-table :data="projectResourceList" :column-width="['80px']" :columns="['系统名称', '云主机(台)', 'CPU(核)' , '内存(GB)' , '存储(GB)']" :options="{singleHeight: 40,  limitMoveNum: 7}">
              <template v-slot="scope">
                <scroll-table-column :value="scope.row.name" width="80px">
                </scroll-table-column>
                <scroll-table-column :value="scope.row.number">
                </scroll-table-column>
                <scroll-table-column :value="scope.row.cpu">
                </scroll-table-column>
                <scroll-table-column :value="scope.row.mem">
                </scroll-table-column>
                <scroll-table-column :value="scope.row.disk">
                </scroll-table-column>
              </template>
            </scroll-table>
          </div>
        </div>
      </el-col>
    </el-row>
  </full-screen-container>
</template>

<script>
import Header from './components/Header'
import { reactive, toRefs, ref } from '@vue/composition-api'
import ResourceCount from '../count_screen/ResourceCount'
import OrderCount from './components/OrderCount'
// import CenterCount from './components/CenterCount'
import OutsideCenter from './OutsideCenter'
import MapBg from './map'
import {
  getOverview,
  getResource,
  getServerTrend,
  getTenantResource,
  getProjectResource,
  getNetworks,
  getOrders
} from 'services/screen/cloud_network'
import { getDcs } from 'services/screen/dc'
const getColor = (key) => {
  const colors = ['#08E1F9', '#1890FF', '#DEB40B']
  return colors[key % 3]
}
export default {
  components: {
    Header,
    ResourceCount,
    // CenterCount,
    MapBg,
    OutsideCenter,
    OrderCount
  },
  setup() {
    const state = reactive({
      serverTrend: {},
      resourceCount: {},
      tenantResourceList: [],
      projectResourceList: [],
      dcList: [],
      netOverview: [],
      orderOverview: [],
      loading: false,
      scale: 1
    })
    const mapRef = ref(null);
    let params = {}
    // 云主机申请趋势
    const getServerData = async () => {
      const res = await getServerTrend(params)
      if (res.success) {
        state.serverTrend = res.data
      }
    }
    // 云资源统计
    const getResourceCount = async () => {
      const res = await getResource(params)
      if (res.success) {
        state.resourceCount = res.data
      }
    }
    // 各单位资源统计
    const getTenantResourceList = async () => {
      const res = await getTenantResource(params)
      if (res.success) {
        state.tenantResourceList = res.data
      }
    }
    // 系统资源统计
    const getProjectResourceList = async () => {
      const res = await getProjectResource(params)
      if (res.success) {
        state.projectResourceList = res.data
      }
    }
    // 数据中心
    const getDcList = async () => {
      const res = await getDcs()
      if (res.success) {
        state.dcList = res.data.rows.map((item) => {
          return {
            ...item,
            config: JSON.parse(item.config)
          }
        })
        mapRef.value.addDcList(state.dcList);
      }
    }
    // 网资源概况
    const getNetworkOverview = async () => {
      const res = await getNetworks()
      if (res.success) {
        state.netOverview = res.data
      }
    }
    // 业务工单概况
    const getOrderOverview = async () => {
      const res = await getOrders()
      if (res.success) {
        state.orderOverview = res.data
      }
    }
    const change = async (param) => {
      state.loading = true
      params = param
      await Promise.all([
        getServerData(),
        getResourceCount(),
        getTenantResourceList(),
        getProjectResourceList(),
        getDcList(),
        getNetworkOverview(),
        getOrderOverview()
      ])
      state.loading = false
    }
    change()
    const getScale = (scale) => {
      state.scale = scale
    }
    return {
      ...toRefs(state),
      mapRef,
      getScale,
      change,
      getColor
    }
  }
}
</script>
<style lang="scss" scoped>
.container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 162px 38px 38px 38px;
  box-sizing: border-box;
}
.full {
  height: 100%;
  width: 100%;
}
.left,
.right {
  position: absolute;
  z-index: 10;
  width: 26%;
}
.right {
  right: 0;
}
.center {
  position: absolute;
  left: 26%;
  width: 48%;
  // height: 100%;
  // pointer-events: none;
}
.loop-card {
  display: flex;
  flex-wrap: wrap;
}
.card {
  // height: calc((100% - 200px) / 3 - 20px);
  height: 430px;
  padding: 20px;
  box-sizing: border-box;
  background: url('/scr-web/static/img/sip/card_bg.png');
  background-size: 100% 100%;
  z-index: 2;
  &.card-special {
    height: 850px;
  }
  &.mini {
    height: 320px;
    .card-title {
      text-decoration: underline;
      height: 21px;
      cursor: pointer;
    }
  }
  &:not(:last-child) {
    margin-bottom: 20px;
  }
  .card-title {
    font-size: 18px;
    border-left: 3px solid #0089ff;
    font-weight: bold;
    color: #d1d8e2;
    padding-left: 5px;
    margin-bottom: 10px;
  }
  .card-body {
    height: calc(100% - 35px);
  }
}
.dc-item {
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10px 50px;
  margin-top: 20px;
  background: url('/scr-web/static/img/outside/dc_bg.png');
  background-size: 100% 100%;
  img {
    height: 50px;
    margin-bottom: 5px;
  }
}
.net-item {
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  .net-name{
    font-size: 18px;
  }
  .net-value {
    width: 135px;
    height: 135px;
    line-height: 135px;
    text-align: center;
    background: url('/scr-web/static/img/outside/net_bg.png');
    background-size: 100% 100%;
    border-radius: 50%;
    font-weight: bold;
    font-size: 32px;
    margin-bottom: 30px;
  }
}
</style>
<style lang="scss">
.popover-resource {
  background: #121d32;
  border: 1px solid #293c55;
  width: 400px;
  .popper__arrow,
  .popper__arrow::after {
    border-left-color: #293c55 !important;
  }
}
</style>
