<template>
  <el-row :gutter="10" class="dashboard-container">
    <el-col :span="24" class="title">欢迎，{{ userData.name }}</el-col>
    <el-col :xl="18" :md="16">
      <el-col :span="24">
        <div class="card-dashboard">
          <div class="card-title">我的资源</div>
          <el-scrollbar class="custom-scrollbar" style="height: 180px; overflow-x: hidden">
            <el-row :gutter="10" v-if="myResource.length != 0">
              <el-col :span="6" v-for="item in myResource" :key="item.sn">
                <div class="resource-cell" @click="goPage(item)">
                  <span class="icon">
                    <img :src="item.icon" alt="" />
                  </span>
                  <span class="cell-name">{{ item.name }}</span>
                  <span class="cell-count">{{ item.number }}</span>
                </div>
              </el-col>
            </el-row>
            <empty v-if="myResource.length == 0"> </empty>
          </el-scrollbar>
        </div>
        <!-- <div class="card m-t">
          <div class="card-title">云主机服务状态</div>
          <el-row class="host-overview m-t-lg">
            <div class="host-cell" v-for="item in hostServiceStatus" :key="item.name">
              <span class="host-name">{{item.name}}</span>
              <span class="host-value">{{item.value}}</span>
            </div>
          </el-row>
        </div> -->
      </el-col>
      <Block :type="PENDING" />
      <Block :type="WARNING" />
      <AS />
      <el-col :span="24" class="m-t">
        <div class="card-dashboard">
          <div class="card-title">云主机申请趋势</div>
          <line-charts id="line" :data="hostServiceTrend" width="100%" height="292px" :setting="{ color: '#3D72F4' }" :options="hostOpitons" v-if="hostServiceTrend.keys"></line-charts>
        </div>
      </el-col>
      <Tenant></Tenant>
    </el-col>
    <el-col :xl="6" :md="8" class="el-right">
      <div class="card-dashboard">
        <div class="card-title">我的账户</div>
        <el-row>
          <el-col :span="6">
            <el-avatar :src="userData.portrait" :size="60"></el-avatar>
          </el-col>
          <el-col :span="18">
            <basic-form label-position="right" class="info-form">
              <basic-form-item label="用户名称：">{{ userData.name }}</basic-form-item>
              <basic-form-item label="用户角色：">{{ userData.accountCategory === 'Tenant' ? '租户管理员' : '普通用户' }}</basic-form-item>
              <basic-form-item label="登录时间：">{{ userData.lastLoginDate }}</basic-form-item>
            </basic-form>
          </el-col>
        </el-row>
      </div>
      <div class="card-dashboard m-t el-right-card">
        <div class="card-title">云主机状态统计</div>
        <pie-charts height="260px" width="100%" :data="hostStatusOverview" unit="个" v-if="hostStatusOverview" :setting="setting" :options="options"> </pie-charts>
      </div>
      <div class="card-dashboard m-t el-right-card">
        <a @click="$router.push('/order/list')">查看更多</a>
        <div class="card-title">订单类型统计</div>
        <!-- <bar-reverse-charts height="260px" width="100%" id="resVm" :data="orderOverview" v-if="orderOverview.keys" :setting="{color: 'rgba(24, 144, 255, 0.8)'}">
        </bar-reverse-charts> -->
        <pie-charts height="260px" width="100%" :data="orderOverview" :setting="setting" :options="options" />
      </div>
      <OS :setting="setting" :options="options" />
    </el-col>
  </el-row>
</template>
<script lang="ts">
import goPageMixins from '@/layouts/components/sidebar/goPageMixins'
import { computed, defineComponent, onMounted, ref, reactive } from '@vue/composition-api'
import { getVmStatus } from 'services/charts/vm'
import { getOrderStatus } from 'services/charts/order'
import { getOrderCount } from 'services/services/order'
import AS from './account.vue'
import Block, { PENDING, WARNING } from './block.vue'
import OS from './orderStatus.vue'
import Tenant from './tenant/dashboard.vue'
interface BarData {
  keys: Array<any>
  values: Array<any>
  [k: string]: any
}

const setting = {
  center: ['50%', '50%'],
  radius: ['40%', '50%'],
  richCount: 20,
  color: ['#3D72F4', '#E03B3B', '#F09C2B', '#8C8E91'],
  itemStyle: {
    borderRadius: 0,
    borderColor: '#fff',
    borderWidth: 2
  }
}
const options = {
  legend: {
    orient: 'horizontal',
    x: 'center',
    y: 'bottom',
    top: 'bottom',
    icon: 'circle',
    itemWidth: 10,
    itemHeight: 10,
    formatter: null
  }
}

export default defineComponent({
  mixins: [goPageMixins],
  components: {
    AS,
    Block,
    OS,
    Tenant
  },
  setup(props, context) {
    // 订单统计
    const myResource = ref([])
    async function getResource() {
      const res = await getOrderCount()
      if (res.success) {
        myResource.value = res.data
      }
    }
    getResource()
    // 主机状态统计
    const hostStatusOverview = ref([])
    async function getVmStatusCount() {
      const res = await getVmStatus('getStatusStatistics')
      if (res.success) {
        hostStatusOverview.value = res.data
      }
    }
    getVmStatusCount()
    // 主机状态趋势
    const hostServiceTrend = ref({})
    const hostOpitons = ref({})
    async function getVmStatusTrend() {
      const res = await getVmStatus('getNumberTrend')
      if (res.success) {
        hostServiceTrend.value = res.data
        hostOpitons.value = {
          series: [
            {
              data: (hostServiceTrend.value as any).values[0].data,
              type: 'line',
              smooth: false,
              name: '数量'
            }
          ]
        }
      }
    }
    getVmStatusTrend()
    // 订单统计
    const orderOverview = ref({})
    async function getOrderOverview() {
      const res = await getOrderStatus('orderCategoryOverview')
      if (res.success) {
        orderOverview.value = handleBarDataToPieData(res.data)
      }
    }
    const handleBarDataToPieData = (barData: BarData) => {
      const { keys, values } = barData
      const pieData = keys.map((item, index) => {
        return {
          name: item,
          value: values[0].data[index]
        }
      })
      return pieData
    }
    getOrderOverview()
    const userData = computed(() => context.root.$store.state.app.userData)
    return {
      myResource,
      hostStatusOverview,
      hostServiceTrend,
      orderOverview,
      userData,
      PENDING,
      WARNING,
      setting,
      options,
      hostOpitons
    }
  }
})
</script>
<style lang="scss" scoped>
.dashboard-container {
  padding-bottom: 35px;
}
.info-form ::v-deep .basic-form-item {
  margin-bottom: 0px;
}
.title {
  font-size: 12px;
  color: #333;
  margin: 20px 15px;
}
.card-dashboard {
  background: #fff;
  padding: 15px;
  border-radius: 5px;
  color: #333;
  font-size: 12px;
  position: relative;
  .card-title {
    margin-bottom: 15px;
    font-size: 14px;
    font-weight: 700;
  }
  & > a {
    position: absolute;
    top: 20px;
    right: 20px;
    color: #277cfc;
    cursor: pointer;
  }
}
.resource-cell {
  display: flex;
  align-items: center;
  background: #f2f2f2;
  height: 40px;
  padding: 0 10px;
  margin-bottom: 10px;
  cursor: pointer;
  &:hover {
    background: #d7d7d7;
  }
  .icon {
    padding: 2px 10px 0 0;
    img {
      height: 20px;
    }
  }
  .cell-name {
    font-size: 12px;
    flex: 1;
  }
  .cell-count {
    font-size: 16px;
    font-weight: 700;
  }
}
.money-total {
  font-size: 36px;
  font-weight: 700;
}
.host-overview {
  display: flex;
  .host-cell {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    padding: 18px;
    color: #4b4d58;
    font-weight: bold;
    .host-value {
      font-size: 45px;
    }
    &:hover {
      background: #e4e4e4;
    }
    & + .host-cell {
      border-left: 1px dashed #eac7c7;
    }
  }
}
.el-scrollbar__view {
  overflow: hidden;
}
.el-right-card {
  height: 285px;
}
</style>
