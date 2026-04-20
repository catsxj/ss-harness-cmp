<template>
  <el-container class="setting-wrapper" :class="{ full: !isSetting }">
    <el-header class="setting-header" v-if="isSetting">
      <span>自定义设置</span>
      <div>
        <el-button type="text" @click="reset()">恢复默认设置</el-button>
        <!-- <el-button>取消</el-button> -->
        <el-button type="primary" @click="savePanels" :loading="loading">保存</el-button>
      </div>
    </el-header>
    <el-container class="setting-container">
      <el-aside width="200px" class="setting-aside" v-if="isSetting">
        <div class="aside-tool">
          <span>隐藏已添加模块</span>
          <el-switch class="pull-right" v-model="hideSelectedModule"></el-switch>
        </div>
        <el-scrollbar class="pool-scroll">
          <draggable :list="poolList" v-bind="{ sort: false, group: { name: 'field', pull: 'clone', put: false } }" @end="drop">
            <div class="pool-item" :class="forbidPoolCodes.includes(item.code) && 'forbid'" v-for="item in poolList" :key="item.id" :index="item.id" v-show="!(hideSelectedModule && forbidPoolCodes.includes(item.code))">
              <span>{{ item.name }}</span>
              <i class="icon" :class="forbidPoolCodes.includes(item.code) ? 'el-icon-success' : 'el-icon-plus'"></i>
            </div>
          </draggable>
        </el-scrollbar>
      </el-aside>
      <el-main class="setting-main" id="setting-container">
        <el-scrollbar style="height: 100%">
          <div v-if="!isSetting" class="top-header">
            <span>您好，{{ userData.name }} 欢迎您使用CMP多云管理平台！</span>
            <el-button class="pull-right" type="text" @click="goPage('/config/dashboard-setting')">首页设置</el-button>
          </div>
          <grid-layout v-if="layoutData && layoutData.length" :layout="layoutData" :col-num="12" :row-height="16" :is-draggable="isSetting" :is-resizable="isSetting" :vertical-compact="true" :margin="[16, 16]" :use-css-transforms="true">
            <grid-item class="grid-item" v-for="(item, key) in layoutData" :key="item.i" :x="item.x" :y="item.y" :w="item.w" :h="item.h" :i="item.i" @resize="resizeEvent" @resized="resizeEvent">
              <div class="view-card">
                <div class="card-title">
                  <span>{{ item.config.title }}</span>
                  <div class="card-operate" v-if="isSetting">
                    <el-dropdown>
                      <span class="operate-icon"><i class="el-icon-setting"></i></span>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item @click.native="handleEdit(item)">编辑</el-dropdown-item>
                        <el-dropdown-item @click.native="handleDelete(key)">删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                  </div>
                </div>
                <div class="card-body" v-if="item.ready">
                  <loop-charts
                    v-if="item.config.type == 'LoopCharts'"
                    :setting="getChartConfig(item)"
                    :ref="`line${item.i}`"
                    :id="item.i"
                    :data="item.data"
                    width="100%"
                    height="100%"
                    :theme="item.config.title"
                    :unit="item.config.unit"
                    :type="['TodayAlarmCount'].includes(item.config.code) ? 'half' : ''"
                  ></loop-charts>
                  <line-charts v-else-if="item.config.type == 'LineCharts'" :ref="`line${item.i}`" :id="item.i" :data="item.data" width="100%" height="100%" :unit="item.config.unit" :setting="getChartConfig(item)"></line-charts>
                  <bar-reverse-charts v-else-if="item.config.type == 'BarReverseCharts'" :ref="`line${item.i}`" :id="item.i" :data="item.data" width="100%" height="100%" :unit="item.config.unit" :setting="topSetting"></bar-reverse-charts>
                  <component v-else :is="getComponent(item.config)" :item-data="item" :is-setting="isSetting"></component>
                </div>
              </div>
            </grid-item>
          </grid-layout>
          <el-dialog title="卡片配置" :close-on-click-modal="false" :visible.sync="dialogVisible" width="800px">
            <el-form label-width="90px">
              <template v-for="item in configData">
                <el-form-item :label="item.name + '：'" v-if="item.type === 'TEXT'" :key="item.name">
                  <el-input v-model="item.defaultValue"></el-input>
                </el-form-item>
                <select-vendor :itemData="item" :config-data="configData" v-else-if="item.type === 'SELECTVENDOR'" :key="item.name"> </select-vendor>
              </template>
            </el-form>
            <div slot="footer" class="dialog-footer">
              <el-button type="ghost" @click.native="dialogVisible = false">取消</el-button>
              <el-button type="primary" @click.native="settingPanel">确定</el-button>
            </div>
          </el-dialog>
          <empty class="empty" v-if="layoutData && layoutData.length === 0">
            <div class="text-center">
              <div class="m-b-xs">暂无数据</div>
              <div>请按照所纳管的平台进入<router-link class="detail-href" :to="{ name: 'SettingDashboard' }">管理中心→系统配置→首页配置</router-link>中配置相关数据</div>
            </div>
          </empty>
        </el-scrollbar>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
import { computed, nextTick, ref, unref, watch } from '@vue/composition-api'
import VueGridLayout from 'vue-grid-layout'
import draggable from 'vuedraggable'
import CommonOperation from './CommonOperation.vue'
import AccessControl from './AccessControl.vue'
import DataCenterOverview from './DataCenterOverview.vue'
import CountCard from './CountCard.vue'
import DataView from './DataView.vue'
import ResUsed from './ResUsed.vue'
import AlarmCount from './AlarmCount.vue'
import TaskHistory from './TaskHistory.vue'
import SelectVendor from './SelectVendor.vue'
import { getPanel, getPool, savePanel, getConfig, resetPanel } from 'services/system/portal'
import request from 'utils/request'
import { wrapperParams } from 'utils'
import { Message, MessageBox } from 'element-ui'
import { getCardData } from './utils'
import { topSetting } from './data'

const GridLayout = VueGridLayout.GridLayout
const GridItem = VueGridLayout.GridItem
const colorMap = ['#1890FF', '#F84540', '#18BE6A', '#696BD8', '#FE9900', '#01b3eb']
const color = ['#E03B3B', '#F09C2B', '#049BD3', '#1E54DE']
export default {
  components: {
    GridLayout,
    GridItem,
    draggable,
    CommonOperation,
    AccessControl,
    DataCenterOverview,
    CountCard,
    DataView,
    ResUsed,
    AlarmCount,
    TaskHistory,
    SelectVendor
  },
  setup(props, context) {
    const loading = ref(false)
    // 是否可配置
    const isSetting = ref(true)
    function init() {
      getPanelList()
      if (context.root.$route.path === '/resource_dashboard') {
        // 展示界面
        isSetting.value = false
      } else {
        getPoolList()
        isSetting.value = true
      }
    }
    init()
    watch(
      () => context.root.$route.path,
      () => {
        init()
      }
    )
    // 卡片池处理
    const poolList = ref([])
    const hideSelectedModule = ref(false)
    const poolMap = computed(() => {
      const map = {}
      unref(poolList).forEach((item) => {
        map[item.id] = item
      })
      return map
    })
    async function getPoolList() {
      const res = await getPool({ serverName: 'CMC' })
      if (res.success) {
        poolList.value = res.data
      }
    }
    // 获取内容面板
    const layoutData = ref([])
    const forbidPoolCodes = computed(() => {
      return unref(layoutData)
        .map((item) => item.config.code)
        .filter((item) => {
          return !['PM', 'VM', 'DATAVIEW'].includes(item)
        })
    })
    // 获取组件数据
    function getData(url, params, item) {
      request
        .get(url, {
          params: wrapperParams(params)
        })
        .then((data) => {
          if (data.success) {
            item.data = data.data
          }
        })
    }
    function handleListData(item) {
      const config = (item.config = JSON.parse(item.config))
      const location = item.location.split(',')
      item.x = Number(location[0])
      item.y = Number(location[1])
      item.w = Number(location[2])
      item.h = Number(location[3])
      item.i = item.id.toString()
      item.data = {}
      item.ready = false
      setTimeout(() => {
        item.ready = true
      })
      getCardData(item)
      config.url && getData(config.url, config.params, item)
      return item
    }
    async function getPanelList() {
      loading.value = true
      const data = await getPanel({ serverName: 'CMC' })
      loading.value = false
      if (data.success) {
        const result = []
        data.data.forEach((item) => {
          result.push(handleListData(item))
        })
        layoutData.value = result
      }
    }
    // 新建panel
    function drop(e) {
      const id = e.item.getAttribute('index')
      const poolItem = poolMap.value[id]
      if (forbidPoolCodes.value.includes(poolItem.code)) return
      // 处理生成坐标
      const colWidth = document.getElementById('setting-container').offsetWidth / 12
      let x = Math.round((e.originalEvent.pageX - 300) / colWidth)
      let y = Math.round((e.originalEvent.pageY - 92) / 80)
      unref(layoutData).forEach((item) => {
        const xMax = item.x + item.w
        const yMax = item.y + item.h
        if (x >= item.x && x <= xMax && y >= item.y && y <= yMax) {
          x = item.x
          y = item.y
        }
      })

      handleCreate(x, y, poolItem)
    }
    async function handleCreate(x, y, data) {
      const { width, height, url, id, name, type, code, moreConfig } = data
      if (x + width > 12) x = 12 - width // 数据处理防止坐标溢出
      const obj = {
        x: x,
        y: y,
        w: width,
        h: height,
        ready: false,
        i: new Date().getTime().toString(),
        config: {
          url,
          id,
          title: name,
          type,
          moreConfig,
          code
        },
        data: {}
      }
      const params = { code: data.code }
      data.properties.forEach((item) => {
        const { code, defaultValue } = item
        defaultValue && (obj.config[code] = defaultValue)
        if (item.paramsd) params[code] = defaultValue
        // if (item.code === 'color') {
        //   const color = []
        //   JSON.parse(item.config).forEach((cell) => {
        //     color.push(cell.value)
        //   })
        //   obj.config.color = color
        // }
      })
      obj.config.params = params
      getCardData(obj)
      data.url && getData(data.url, params, obj)
      layoutData.value.unshift(obj)
      await nextTick()
      obj.ready = true
    }
    function getComponent(config) {
      const map = {
        // PM: 'ServerStatusOverview',
        // VM: 'ServerStatusOverview'
      }
      return map[config.code] || config.type
    }
    // 保存配置
    async function savePanels() {
      const handleConfig = function () {
        const config = []
        layoutData.value.forEach((item) => {
          const obj = {
            id: item.id,
            serverName: 'CMC',
            location: [item.x, item.y, item.w, item.h].join(','),
            config: item.config
          }
          config.push(obj)
        })
        return config
      }
      loading.value = true
      try {
        const res = await savePanel({
          serverName: 'CMC',
          config: handleConfig()
        })
        if (res.success) {
          Message.success(res.message)
          goPage('/resource_dashboard')
        }
      } catch (error) {}
      loading.value = false
    }
    // 恢复默认设置
    async function reset() {
      MessageBox.confirm('您确定要恢复默认设置吗?', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      })
        .then(async () => {
          const res = await resetPanel()
          if (res.success) {
            Message.success(res.message)
            goPage('/resource_dashboard')
          }
        })
        .catch((e) => {})
    }
    const userData = computed(() => context.root.$store.getters.userData || {})
    // 编辑删除卡片
    const currentPanel = ref({})
    const configData = ref({})
    function handleDelete(index) {
      layoutData.value.splice(index, 1)
    }
    const dialogVisible = ref(false)
    async function handleEdit(item) {
      currentPanel.value = item
      const config = item.config
      configData.value = [
        {
          code: 'title',
          defaultValue: config.title,
          name: '卡片标题',
          paramsd: false,
          type: 'TEXT'
        }
      ]
      // 是否需要额外配置
      if (config.moreConfig) {
        const res = await getConfig({
          poolId: config.id
        })
        if (res.success) {
          configData.value = res.data
        }
      }
      unref(configData).forEach((item) => {
        item.defaultValue = config[item.code]
        if (item.config) item.config = JSON.parse(item.config)
        if (item.code === 'color' && config.color) {
          item.config.forEach((cell, key) => {
            cell.value = config.color[key]
          })
        }
      })
      dialogVisible.value = true
    }
    // 对组件进行设置
    function settingPanel() {
      const config = currentPanel.value.config
      const params = { code: config.code }
      unref(configData).forEach((item) => {
        config[item.code] = item.defaultValue
        // 是否传参
        if (item.paramsd) params[item.code] = item.defaultValue
        if (item.code === 'color') {
          config.color = []
          item.config.forEach((cell) => {
            config.color.push(cell.value)
          })
        }
      })
      dialogVisible.value = false
      config.params = params
      config.url && getData(config.url, params, currentPanel.value)
    }
    // 改变大小
    function resizeEvent(i) {
      const item = context.refs[`line${i}`]
      const chart = item && item[0].chart
      if (chart) chart.resize()
    }
    function goPage(path) {
      const router = context.root.$router
      router.push(path)
      // router.push({
      //   name: 'Redirect',
      //   query: {
      //     path
      //   }
      // })
    }
    function getChartConfig(item) {
      const { chartConfig } = item.config
      return typeof chartConfig === 'string' ? JSON.parse(chartConfig) : chartConfig
    }
    return {
      topSetting,
      loading,
      userData,
      poolList,
      hideSelectedModule,
      layoutData,
      forbidPoolCodes,
      drop,
      getComponent,
      isSetting,
      savePanels,
      reset,
      getChartConfig,
      // 卡片操作
      dialogVisible,
      currentPanel,
      configData,
      handleDelete,
      handleEdit,
      settingPanel,
      resizeEvent,
      color,
      goPage
    }
  }
}
</script>
<style lang="scss" scoped>
.setting-wrapper {
  height: calc(100vh - 50px);
  overflow: hidden;
  flex-direction: column;
  &.full {
    margin: 0 -16px;
  }
  .setting-container {
    height: calc(100% - 50px);
  }
}
.setting-header {
  background: #fff;
  height: 50px !important;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e4e4e4;
  & > span {
    font-weight: bold;
    flex: 1;
  }
}
.setting-aside {
  background: #fff;
  height: 100%;
  padding: 16px;
  .aside-tool {
    margin-bottom: 18px;
  }
  .pool-scroll {
    height: calc(100% - 50px);
  }
  .pool-item {
    display: flex;
    align-items: center;
    border-radius: 4px;
    height: 36px;
    padding: 0 12px;
    font-size: 12px;
    cursor: move;
    border: 1px solid #e6e6e6;
    margin-bottom: 10px;
    &.forbid {
      cursor: not-allowed;
    }
    & > span {
      flex: 1;
    }
    .icon {
      color: #1e54de;
      font-size: 16px;
    }
  }
}
.view-card {
  height: 100%;
  box-sizing: border-box;
  border-radius: 4px;
  background: #ffffff;
  padding: 20px;
  position: relative;
  overflow: hidden;
  .card-title {
    font-weight: bold;
    color: #393b3e;
    margin-bottom: 20px;
  }
  .card-body {
    height: calc(100% - 40px);
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .card-operate {
    position: absolute;
    right: -32.5px;
    top: -32.5px;
    display: flex;
    z-index: 2;
    align-items: center;
    justify-content: center;
    width: 65px;
    height: 65px;
    border-radius: 50%;
    background: rgba(30, 84, 222, 0.25);
    .operate-icon {
      color: #fff;
      position: absolute;
      bottom: -24px;
      left: -18px;
      cursor: pointer;
    }
  }
}
.grid-item {
  touch-action: none;
  box-sizing: border-box;
}
.setting-main {
  padding: 0;
  height: 100%;
  .top-header {
    padding: 17px 17px 0;
  }
}
.full-height {
  height: 100%;
}
</style>
