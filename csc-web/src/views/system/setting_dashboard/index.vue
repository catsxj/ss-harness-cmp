<template>
  <el-row>
    <el-col :span="4" class="pool" v-if="isSetting">
      <el-card class="box-card monitor-card">
        <div slot="header" class="clearfix">
          <span>模板池</span>
        </div>
        <div class="pool-container">
          <div class="pool-item" v-for="(item, key) in poolData" :key="item.id" :index="key">
            <el-tooltip class="item" effect="dark" :content="item.describe" placement="top">
              <div>
                <img class="node-img" :src="item.image" alt="" /><br />
                {{ item.name }}
              </div>
            </el-tooltip>
          </div>
        </div>
      </el-card>
    </el-col>
    <el-col :span="20" class="setting-container" :class="{ full: !isSetting }">
      <div class="box-card monitor-card">
        <div slot="header" class="clearfix" v-if="isSetting">
          <span>设置</span>
          <div class="pull-right">
            <el-button type="primary" size="mini" @click="savePanel">
              <Icon type="icon-baocun"></Icon>
              保存配置
            </el-button>
          </div>
        </div>
        <grid-layout v-if="layoutData.length" :layout="layoutData" :col-num="12" :row-height="80" :is-draggable="isDraggable" :is-resizable="isResizable" :vertical-compact="true" :margin="[10, 10]" :use-css-transforms="true">
          <grid-item v-for="(item, key) in layoutData" :key="item.i" :x="item.x" :y="item.y" :w="item.w" :h="item.h" :i="item.i" @resize="resizeEvent" @resized="resizedEvent">
            <el-card style="height: 100%; border: none !important">
              <div slot="header" class="clearfix">
                <span class="card-title">{{ item.config.title }}</span>
                <div class="pull-right" v-if="isSetting">
                  <el-dropdown @command="handleOperate" trigger="click">
                    <span class="el-dropdown-link">操作<i class="el-icon-arrow-down el-icon--right"></i></span>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item :command="{ flag: 1, item: item }">编辑</el-dropdown-item>
                      <el-dropdown-item :command="{ flag: 2, key: key }">删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </div>
                <el-radio-group class="header-tab" v-model="item.selectKey" size="mini" v-if="item.config.type === 'TABBARCHART'">
                  <el-radio-button v-for="(row, key) in item.typeData" :key="row.name" :label="key">{{ row.name }} </el-radio-button>
                </el-radio-group>
                <el-radio-group class="header-tab" v-model="item.config.params.range" size="mini" v-if="item.config.type === 'TABLINECHART'" @change="getTabData(item)">
                  <el-radio-button v-for="row in item.periodData" :key="row.value" :label="row.value">{{ row.name }} </el-radio-button>
                </el-radio-group>
              </div>
              <el-row class="small-box" v-if="item.config.type === 'DATAVIEW'" :style="{}">
                <el-row>
                  <el-col :span="24">
                    <router-link :to="{ name: item.config.pathName }">
                      <div class="small-box-item">
                        <div class="small-box-h" :style="{ background: item.config.colour }">
                          <Icon :type="item.config.icon"></Icon>
                        </div>
                        <div class="small-box-count">
                          <div class="font-large">{{ item.data }}</div>
                          <div class="font-desc">{{ item.config.title }}</div>
                        </div>
                      </div>
                    </router-link>
                  </el-col>
                </el-row>
              </el-row>
              <div class="small-box" v-else-if="item.config.type === 'CHART'">
                <bar-charts :ref="`line${item.i}`" :setting="{ barColor: barColorFun(item.config.color) }" v-if="item.config.defaultChart === 'bar' && item.data.values" :id="item.i" :data="item.data" width="100%" height="100%"></bar-charts>
                <line-charts :ref="`line${item.i}`" v-else-if="item.data.values" :id="item.i" :data="item.data" width="100%" height="100%" :setting="{ color: item.config.color }"></line-charts>
              </div>
              <div class="small-box" v-else-if="item.config.type === 'TABBARCHART'">
                <bar-charts :ref="`line${item.i}`" v-if="item.typeData" :id="item.i" :data="item.typeData[item.selectKey].data" width="100%" height="100%" :setting="{ color: item.config.color }"></bar-charts>
              </div>
              <div class="small-box" v-else-if="item.config.type === 'TABLINECHART'">
                <line-charts :ref="`line${item.i}`" v-if="item.data.values" :id="item.i" :data="item.data" width="100%" height="100%" :setting="{ color: item.config.color }"></line-charts>
              </div>
              <div class="small-box" v-else-if="item.config.type === 'LIQUIDFILL'">
                <el-row style="height: 100%" class="m-t" v-if="item.data.value !== undefined">
                  <el-col :span="12" style="height: 100%">
                    <liquid-fill-charts :id="item.i" :data="item.data" width="100%" height="80%"></liquid-fill-charts>
                  </el-col>
                  <el-col :span="12">
                    <el-row class="m-t-lg">
                      <el-col :span="24" class="liguid-box">
                        <span class="liguid-box-name">总量：</span>
                        <span class="liguid-box-value">{{ item.data.total }} {{ item.config.unit }}</span>
                      </el-col>
                      <el-col :span="24" class="liguid-box">
                        <span class="liguid-box-name">已使用：</span>
                        <span class="liguid-box-value">{{ item.data.used }} {{ item.config.unit }}</span>
                      </el-col>
                      <el-col :span="24" class="liguid-box">
                        <span class="liguid-box-name">未使用：</span>
                        <span class="liguid-box-value">{{ item.data.free }} {{ item.config.unit }}</span>
                      </el-col>
                    </el-row>
                  </el-col>
                </el-row>
              </div>
              <div class="small-box" v-else-if="item.config.code == 'alarmList'">
                <div class="grid-container">
                  <basic-table :data="item.data.rows">
                    <el-table-column label="告警名称" prop="name"> </el-table-column>
                    <el-table-column label="告警目标" prop="target"> </el-table-column>
                    <el-table-column label="告警级别">
                      <template slot-scope="scope">
                        <level-icon :color="scope.row.level | alarmLevelColor">{{ scope.row.level | alarmLevel('level') }} </level-icon>
                      </template>
                    </el-table-column>
                    <el-table-column label="告警状态">
                      <template slot-scope="scope">
                        <status-icon :type="scope.row.status | alarmStatusColor">{{ scope.row.status | alarmStatus('status') }} </status-icon>
                      </template>
                    </el-table-column>
                    <el-table-column label="触发时间" prop="gmtTrigger"> </el-table-column>
                    <el-table-column label="确认时间" prop="gmtConfirm"> </el-table-column>
                    <el-table-column label="确认人" prop="confirmer"> </el-table-column>
                    <div slot="pagination"></div>
                  </basic-table>
                </div>
              </div>
              <div class="small-box" v-else-if="item.config.type == 'PIE'">
                <pie-charts :ref="`line${item.i}`" v-if="item.data.length" :id="item.i" :data="item.data" width="100%" height="100%" :theme="item.config.title" :unit="item.config.unit" :setting="{ color: item.config.color, center: ['27%', '50%'] }"></pie-charts>
              </div>
            </el-card>
          </grid-item>
        </grid-layout>
        <el-row v-if="layoutData.length == 0">
          <el-col :span="24" class="no-data">
            <Icon type="icon-zanwushuju">暂无数据</Icon>
          </el-col>
        </el-row>
        <el-dialog title="编辑" :close-on-click-modal="false" :visible.sync="dialogVisible" width="900px">
          <el-form label-width="90px">
            <el-form-item v-for="item in configData" :label="item.name + '：'" :key="item.name">
              <template v-if="item.type !== 'HIDDEN'">
                <el-input v-model="item.defaultValue" v-if="item.type === 'TEXT'"></el-input>
                <el-select v-model="item.defaultValue" v-else-if="item.type === 'SELECT'">
                  <el-option v-for="row in item.config" :key="row.value" :label="row.name" :value="row.value"></el-option>
                </el-select>
                <el-row v-else-if="item.type === 'COLOUR'">
                  <el-col :span="4" v-for="(row, key) in item.config" :key="key">
                    <span class="color-label">{{ row.name }}：</span>
                    <el-color-picker v-model="row.value"></el-color-picker>
                  </el-col>
                </el-row>
                <el-select v-model="item.defaultValue" v-else-if="item.type === 'CASCADER'" @change="getCascaderData(item)">
                  <el-option v-for="row in item.config.data" :key="row.value" :label="row.name" :value="row.value"></el-option>
                </el-select>
                <el-select v-model="item.defaultValue" v-else-if="item.type === 'REMOTEDATA'" clearable>
                  <el-option v-for="row in item.data" :key="row.id" :label="row.name" :value="row.id"></el-option>
                </el-select>
              </template>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="ghost" @click.native="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click.native="settingPanel">确定</el-button>
          </div>
        </el-dialog>
      </div>
    </el-col>
  </el-row>
</template>
<script>
/* global $ */

import VueGridLayout from 'vue-grid-layout'
import { getPanel, getPool, getConfig, savePanel } from 'services/system/portal'
import request from 'utils/request'
import { wrapperParams } from 'utils/index'
import levelIcon from 'views/monitor/components/statusIcon.vue'
const GridLayout = VueGridLayout.GridLayout
const GridItem = VueGridLayout.GridItem
const periodData = [
  { name: '周', value: 'WEEK' },
  { name: '月', value: 'MONTH' },
  {
    name: '季度',
    value: 'QUARTER'
  },
  { name: '半年', value: 'HALFYEAR' },
  { name: '一年', value: 'YEAR' }
]
const baseUrl = '/csc/v1'
export default {
  components: {
    GridLayout,
    GridItem,
    levelIcon
  },
  data() {
    return {
      isSetting: true, // 是否配置界面
      currentPanel: {}, // 当前组件
      configData: [],
      poolData: [],
      fullscreen: false,
      isDraggable: true, // 是否可拖拽
      isResizable: true, // 是否可改变大小
      layoutData: [],
      dialogVisible: false
    }
  },
  created() {
    this.init()
  },
  watch: {
    $route() {
      this.init()
    }
  },
  methods: {
    init() {
      this.getPanel()
      if (this.$route.name == 'ResourceDashboard') {
        // 展示界面
        this.isSetting = false
        this.isDraggable = false
        this.isResizable = false
      } else {
        this.getPool()
        this.isSetting = true
        this.isDraggable = true
        this.isResizable = true
      }
    },
    drawPool() {
      const self = this
      let _target
      // 拖拽效果
      $('.pool-item').draggable({
        helper: 'clone', // 拖动是否为本身
        revert: true, // 拖拽后是否回到初始位置
        revertDuration: 200,
        start: function () {
          _target = $(this)
        }
      })
      $('.setting-container').droppable({
        drop: function (e) {
          // 处理生成坐标
          const colWidth = $(this).width() / 12
          let x = Math.round((e.pageX - 300) / colWidth)
          let y = Math.round((e.pageY - 92) / 80)
          self.layoutData.forEach(item => {
            const xMax = item.x + item.w
            const yMax = item.y + item.h
            if (x >= item.x && x <= xMax && y >= item.y && y <= yMax) {
              x = item.x
              y = item.y
            }
          })
          self.handleCreate(x, y, self.poolData[_target.attr('index')])
          return false
        }
      })
    },
    handleOperate(command) {
      switch (command.flag) {
        case 1:
          this.currentPanel = command.item
          const config = command.item.config
          this.dialogVisible = true
          getConfig({
            poolId: config.id
          }).then(data => {
            if (data.success) {
              this.configData = data.data
              this.configData.forEach(item => {
                item.defaultValue = config[item.code]
                if (item.config) item.config = JSON.parse(item.config)
                if (item.code === 'color' && config.color) {
                  item.config.forEach((cell, key) => {
                    cell.value = config.color[key]
                  })
                }

                if (item.type === 'CASCADER') this.getCascaderData(item)
              })
            }
          })
          break
        case 2:
          this.layoutData.splice(command.key, 1)
          break
      }
    },
    // 新建图表
    handleCreate(x, y, data) {
      if (x + data.width > 12) x = 12 - data.width // 数据处理防止坐标溢出
      const obj = {
        x: x,
        y: y,
        w: data.width,
        h: data.height,
        i: new Date().getTime().toString(),
        config: {
          url: data.url,
          id: data.id,
          title: data.name,
          type: data.type,
          code: data.code
        },
        data: {}
      }
      const params = { code: data.code }
      data.properties.forEach(item => {
        obj.config[item.code] = item.defaultValue
        if (item.paramsd) params[item.code] = item.defaultValue
        if (item.code === 'color') {
          const color = []
          JSON.parse(item.config).forEach(cell => {
            color.push(cell.value)
          })
          obj.config.color = color
        }
        if (item.code === 'dataType') {
          for (const a of JSON.parse(item.config)) {
            if (a.value === item.defaultValue) {
              obj.config.icon = a.icon
              obj.config.colour = a.colour
              obj.config.pathName = a.pathName
            }
          }
        }
      })
      obj.config.params = params
      this.getData(data.url, params, obj)
      this.layoutData.unshift(obj)
    },
    resizeEvent(i) {
      const item = this.$refs[`line${i}`]
      const chart = item && item[0].chart
      if (chart) chart.resize()
    },
    resizedEvent(i) {
      const item = this.$refs[`line${i}`]
      const chart = item && item[0].chart
      if (chart) chart.resize()
    },
    // 处理表格数据
    handleLineChartData(data, item) {
      item.data = {
        keys: data.keys,
        values: data.values
      }
    },
    getTabData(item) {
      const { url, params } = item.config
      this.getData(url, params, item)
    },
    // 获取组件数据
    getData(url, params, item) {
      request
        .get(`${baseUrl}${url}`, {
          params: wrapperParams(params)
        })
        .then(data => {
          if (data.success) {
            switch (item.config.type) {
              case 'CHART':
                this.handleLineChartData(data.data, item)
                break
              case 'PIE':
              case 'LIQUIDFILL':
                item.data = data.data
                break
              case 'TABBARCHART':
                this.$set(item, 'typeData', data.data)
                this.$set(item, 'selectKey', 0)
                break
              case 'TABLINECHART':
                this.$set(item, 'periodData', Object.assign({}, periodData))
                item.data = data.data
                break
              default:
                item.data = data.data
            }
          }
        })
    },
    handleListData(item) {
      const config = (item.config = JSON.parse(item.config))
      const location = item.location.split(',')
      item.x = Number(location[0])
      item.y = Number(location[1])
      item.w = Number(location[2])
      item.h = Number(location[3])
      item.i = item.id.toString()
      item.data = ''
      this.getData(config.url, config.params, item)
      return item
    },
    getPanel() {
      getPanel({ serverName: 'CSC' }).then(data => {
        if (data.success) {
          this.layoutData = []
          data.data.forEach(item => {
            this.layoutData.push(this.handleListData(item))
          })
          setTimeout(() => {
            this.drawPool()
          })
        }
      })
    },
    getPool() {
      getPool({ serverName: 'CSC' }).then(data => {
        if (data.success) {
          this.poolData = data.data
          setTimeout(() => {
            this.drawPool()
          })
        }
      })
    },
    // 对组件池进行设置
    settingPanel() {
      const config = this.currentPanel.config
      const params = { code: config.code }
      this.configData.forEach(item => {
        config[item.code] = item.defaultValue
        // 是否传参
        if (item.paramsd) params[item.code] = item.defaultValue
        if (item.code === 'color') {
          config.color = []
          item.config.forEach(cell => {
            config.color.push(cell.value)
          })
        }
        // 数据展示特殊处理

        if (item.code === 'dataType') {
          item.config.forEach(row => {
            if (row.value === item.defaultValue) {
              config.icon = row.icon
              config.colour = row.colour
              config.pathName = row.pathName
            }
          })
        }
      })
      this.dialogVisible = false
      config.params = params
      this.getData(config.url, params, this.currentPanel)
    },
    // 保存配置
    savePanel() {
      const self = this
      const handleConfig = function () {
        const config = []
        self.layoutData.forEach(item => {
          const obj = {
            id: item.id,
            serverName: 'CSC',
            location: [item.x, item.y, item.w, item.h].join(','),
            config: item.config
          }
          config.push(obj)
        })
        return config
      }
      savePanel({
        serverName: 'CSC',
        config: handleConfig()
      }).then(data => {
        if (data.success) {
          this.$message({
            type: 'success',
            message: data.message
          })
        }
      })
    },
    barColorFun(map) {
      if (!map) return
      return item => {
        return map[item.dataIndex]
      }
    },
    getCascaderData(item) {
      const config = item.config
      const params = {}
      params[config.param] = item.defaultValue
      request
        .get(`${baseUrl}${item.config.url}`, {
          params: {
            params: JSON.stringify([{ param: params, sign: 'EQ' }]),
            simple: true
          }
        })
        .then(data => {
          if (data.success) {
            this.$set(this.configData[config.num], 'data', data.data.rows)
          }
        })
    }
  }
}
</script>
<style lang="scss">
.pool {
  position: fixed;
  width: 130px !important;
  z-index: 2;
}

.pool .el-card__body {
  padding: 0;
}

.pool-container {
  height: calc(100vh - 180px);
  overflow: auto;
}

.setting-container {
  margin-left: 140px;
  min-height: calc(100vh - 150px);
  width: calc(100% - 135px) !important;
}

.setting-container.full {
  margin-left: 0;
  margin-top: -10px;
  width: 100% !important;
  .header-tab {
    margin-right: -15px;
  }
}

.header-tab {
  float: right;
  margin: -4px 10px 0 0;
  .el-radio-button__orig-radio:checked + .el-radio-button__inner {
    color: inherit;
    background-color: #fff !important;
    border-color: #2d8cf0;
  }
}

.setting-container .el-card {
  border: none !important;
}

.setting-container > .el-card > .el-card__body {
  padding: 5px;
}

.setting-container .no-data {
  min-height: 460px;
}

.pool-item {
  display: inline-block;
  text-align: center;
  border-bottom: 1px solid #e6e6e6;
  cursor: pointer;
  width: 100%;
  padding: 23.5px 0;
  font-size: 14px;
  /*color: #666;*/
  z-index: 2;
}

.vue-grid-item .el-card__body {
  padding: 15px 10px !important;
  height: calc(100% - 35px);
}

.monitor-form .el-form-item {
  margin-bottom: 0 !important;
}

.el-dropdown-link {
  cursor: pointer;
}

.small-box {
  border-radius: 2px;
  position: relative;
  display: block;
  width: 100%;
  height: calc(100% - 30px);
}

.small-box-item {
  height: 60px;
  /*background: #fff;*/
  padding: 20px;
  display: flex;
  cursor: pointer;
  width: auto;
  .small-box-h {
    background: #57a3f3;
    width: 60px;
    height: 60px;
    border-radius: 30px;
    text-align: center;
    line-height: 60px;
    margin-right: 20px;
    .iconfont {
      color: #fff;
      font-size: 25px;
    }
  }
  .small-box-count {
    /*color: #333;*/
    .font-large {
      font-size: 28px;
    }
    .font-desc {
      /*color: #666666;*/
    }
  }
}

.grid-container {
  height: 100%;
  overflow: auto;
}

.font-large {
  font-size: 16px;
  font-weight: bold;
}

.el-button-group .useType {
  border-radius: 0px !important;
}

.useTypeActive {
  border-color: #46b3f8 !important;
}

.color-label {
  display: inline-block;
  position: relative;
  bottom: 10px;
}

.liguid-box {
  margin-top: 15px;
  font-size: 12px;
  /*color: #666;*/
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
</style>
