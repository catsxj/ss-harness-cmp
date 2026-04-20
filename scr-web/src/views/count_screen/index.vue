<template>
  <full-screen-container :width="1920" :height="1080" :loading="loading">
    <Header code="COUNT_SCREEN"></Header>
    <div class="container">
      <el-row class="full">
        <el-col :span="8" class="left">
          <div class="card">
            <div class="card-title">资源总览</div>
            <div class="card-body">
              <el-row :gutter="15">
                <el-col :span="12">
                  <ResourceCount title="云主机总数(台)" :value="overviewData.vms" color=""></ResourceCount>
                </el-col>
                <el-col :span="12">
                  <ResourceCount title="CPU总量(核)" :value="overviewData.cpu" color="#18BE6A" icon="/scr-web/static/img/sip/cpu.png"></ResourceCount>
                </el-col>
                <el-col :span="12">
                  <ResourceCount title="内存总量(TB)" :value="overviewData.mem" color="#1890FF" icon="/scr-web/static/img/sip/mem.png"></ResourceCount>
                </el-col>
                <el-col :span="12">
                  <ResourceCount title="存储总量(TB)" :value="overviewData.disk" color="#FF6600" icon="/scr-web/static/img/sip/storage.png"></ResourceCount>
                </el-col>
              </el-row>
            </div>
          </div>
          <div class="card">
            <div class="card-title">近30天云主机申请趋势</div>
            <div class="card-body">
              <line-charts :data="vmApplyTrend" width="100%" height="100%">
              </line-charts>
            </div>
          </div>
          <div class="card">
            <div class="card-title">近30天云资源申请趋势</div>
            <div class="card-body">
              <line-charts  :data="resourceApplyTrend" width="100%" height="100%">
              </line-charts>
            </div>
          </div>
        </el-col>
        <el-col :span="8" class="center">
          <OneCenter @changeDc="change"></OneCenter>
        </el-col>
        <el-col :span="8" class="right">
          <div class="card">
            <div class="card-title">租户云资源统计</div>
            <div class="card-body">
              <scroll-table :data="tenantCount" :column-width="['80px']" :columns="['租户',  'CPU(核)' , '内存(GB)' , '存储(GB)']" :options="{singleHeight: 40}">
                <template v-slot="scope">
                  <scroll-table-column :value="scope.row.name" width="80px">
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
            <div class="card-title">应用系统云资源统计</div>
            <div class="card-body">
              <scroll-table :data="projectCount" :column-width="['80px']" :columns="['应用系统', 'CPU(核)' , '内存(GB)' , '存储(GB)']" :options="{singleHeight: 40}">
                <template v-slot="scope">
                  <scroll-table-column :value="scope.row.name" width="80px">
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
            <div class="card-title">业务云资源统计</div>
            <div class="card-body">
              <scroll-table :data="businessCount" :column-width="['80px']" :columns="['业务', 'CPU(核)' , '内存(GB)' , '存储(GB)']" :options="{singleHeight: 40}">
                <template v-slot="scope">
                  <scroll-table-column :value="scope.row.name" width="80px">
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
    </div>
  </full-screen-container>
</template>

<script>
import Header from 'components/ScreenWrapper/Header'
import { reactive, toRefs } from '@vue/composition-api'
import OneCenter from './OneCenter'
import ResourceCount from './ResourceCount'
import {
  getOverview,
  getVmApplyTrend,
  getResourceApplyTrend,
  getTenantResource,
  getProjectResource,
  getBusinessResource
} from 'services/screen/outside'

export default {
  components: { Header, ResourceCount, OneCenter },
  setup() {
    const state = reactive({
      loading: true,
      overviewData: {},
      vmApplyTrend: {},
      resourceApplyTrend: {},
      tenantCount: [],
      projectCount: [],
      businessCount: []
    })
    let dcId = ''
    // 资源概览
    const getOverviewData = async () => {
      const res = await getOverview(dcId)
      if (res.success) {
        state.overviewData = res.data
      }
    }
    // 云主机申请趋势
    const getVmTrend = async () => {
      const res = await getVmApplyTrend(dcId)
      if (res.success) {
        state.vmApplyTrend = res.data
      }
    }
    // 云资源申请趋势
    const getResourceTrend = async () => {
      const res = await getResourceApplyTrend(dcId)
      if (res.success) {
        state.resourceApplyTrend = res.data
      }
    }
    // 租户资源统计
    const getTenantCount = async () => {
      const res = await getTenantResource(dcId)
      if (res.success) {
        state.tenantCount = res.data
      }
    }
    // 应用系统资源统计
    const getProjectCount = async () => {
      const res = await getProjectResource(dcId)
      if (res.success) {
        state.projectCount = res.data
      }
    }
    // 业务资源
    const getBusinessCount = async () => {
      const res = await getBusinessResource(dcId)
      if (res.success) {
        state.businessCount = res.data
      }
    }
    const change = async (id) => {
      dcId = id
      try {
        await Promise.all([
          getOverviewData(),
          getVmTrend(),
          getResourceTrend(),
          getTenantCount(),
          getProjectCount(),
          getBusinessCount()
        ])
      } catch (error) {}
      state.loading = false
    }
    return {
      ...toRefs(state),
      change
    }
  }
}
</script>
<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100%;
  background: url('/scr-web/static/img/sip/bg.png') no-repeat;
  padding: 100px 20px 20px 20px;
  box-sizing: border-box;
}
.full {
  height: 100%;
  width: 100%;
}
.left,
.right {
  width: 26%;
}
.center {
  width: 48%;
  height: 100%;
}
.loop-card {
  display: flex;
}
.card {
  // height: calc((100% - 200px) / 3 - 20px);
  height: 310px;
  padding: 15px;
  box-sizing: border-box;
  background: url('/scr-web/static/img/sip/card_bg.png');
  background-size: 100% 100%;
  &:not(:last-child) {
    margin-bottom: 20px;
  }
  .card-title {
    font-size: 18px;
    border-left: 3px solid #0089ff;
    font-weight: bold;
    color: #bbefff;
    padding-left: 5px;
    margin-bottom: 10px;
  }
  .card-body {
    height: calc(100% - 35px);
    overflow: hidden;
  }
}
</style>
