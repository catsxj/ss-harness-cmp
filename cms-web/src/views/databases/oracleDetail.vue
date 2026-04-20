<template>
  <el-card>
    <common-detail :title="basicData.name" @goBack="goBack">
      <div slot="custom_content">
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="资源概览" name="overview">
            <detail-map :detail="basicData" :list="detailMapList"></detail-map>
            <el-row :gutter="5">
              <el-col :span="12" v-for="chart in typeData" :key="chart.value">
                <chart-box :params-data="chart" :item-data="dashboradData[chart.value]"></chart-box>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="数据文件" name="datafile">
            <basic-table :data="dataFlies">
              <el-table-column show-overflow-tooltip label="资源名称" prop="resourceName"></el-table-column>

              <el-table-column show-overflow-tooltip label="表空间" prop="tablespace"></el-table-column>

              <el-table-column show-overflow-tooltip label="数据文件状态">
                <template slot-scope="scope">{{ scope.row.status }}</template>
              </el-table-column>

              <el-table-column show-overflow-tooltip label="数据文件大小(MB)" prop="total"></el-table-column>

              <el-table-column show-overflow-tooltip label="是否自动扩展">
                <template slot-scope="scope">{{ booleanFilter(scope.row.autoExtensible) }}</template>
              </el-table-column>

              <el-table-column show-overflow-tooltip label="数据文件已使用空间(MB)" prop="used"></el-table-column>

              <el-table-column show-overflow-tooltip label="利用率(%)" prop="useratio"></el-table-column>

              <div slot="pagination"></div>
            </basic-table>
          </el-tab-pane>
          <el-tab-pane label="日志文件" name="logfile">
            <basic-table :data="logFlies">
              <el-table-column show-overflow-tooltip label="资源名称" prop="member"></el-table-column>

              <el-table-column show-overflow-tooltip label="日志文件大小(MB)" prop="bytes"></el-table-column>

              <el-table-column show-overflow-tooltip label="是否归档">
                <template slot-scope="scope">{{ booleanFilter(scope.row.archived) }}</template>
              </el-table-column>

              <el-table-column show-overflow-tooltip label="日志状态" prop="status"></el-table-column>

              <el-table-column show-overflow-tooltip label="第一次改变系统检查点号">
                <template slot-scope="scope">{{ scope.row.firstChange }}</template>
              </el-table-column>

              <el-table-column show-overflow-tooltip label="第一次改变时间" prop="firstTime"></el-table-column>

              <div slot="pagination"></div>
            </basic-table>
          </el-tab-pane>
          <el-tab-pane label="表空间" name="tablespace">
            <div class="detail-title">表空间</div>
            <basic-table :data="tableSpaces.permanent">
              <el-table-column show-overflow-tooltip label="资源名称" prop="name"></el-table-column>

              <el-table-column show-overflow-tooltip label="表空间状态" prop="status"></el-table-column>

              <el-table-column show-overflow-tooltip label="表空间大小(MB)">
                <template slot-scope="scope">{{ scope.row.total }}</template>
              </el-table-column>

              <el-table-column show-overflow-tooltip label="表空间已使用空间(MB)" prop="used"></el-table-column>

              <el-table-column show-overflow-tooltip label="表空间利用率(%)">
                <template slot-scope="scope">{{ scope.row.usedRatio }}</template>
              </el-table-column>

              <el-table-column show-overflow-tooltip label="自动扩展" prop="autoExpand">
                <template slot-scope="scope">{{ autoType(scope.row.autoExpand) }}</template>
              </el-table-column>

              <div slot="pagination"></div>
            </basic-table>
            <p></p>
            <div class="detail-title">临时表空间</div>
            <basic-table :data="tableSpaces.temporary">
              <el-table-column show-overflow-tooltip label="资源名称" prop="name"></el-table-column>

              <el-table-column show-overflow-tooltip label="表空间状态" prop="status"></el-table-column>

              <el-table-column show-overflow-tooltip label="表空间大小(MB)">
                <template slot-scope="scope">{{ scope.row.total }}</template>
              </el-table-column>

              <el-table-column show-overflow-tooltip label="表空间已使用空间(MB)" prop="used"></el-table-column>

              <el-table-column show-overflow-tooltip label="表空间利用率(%)">
                <template slot-scope="scope">{{ scope.row.usedRatio }}</template>
              </el-table-column>

              <el-table-column show-overflow-tooltip label="自动扩展" prop="autoExpand">
                <template slot-scope="scope">{{ autoType(scope.row.autoExpand) }}</template>
              </el-table-column>

              <div slot="pagination"></div>
            </basic-table>
            <p></p>
            <div class="detail-title">回滚表空间</div>
            <basic-table :data="tableSpaces.undo">
              <el-table-column show-overflow-tooltip label="资源名称" prop="name"></el-table-column>

              <el-table-column show-overflow-tooltip label="表空间状态" prop="status"></el-table-column>

              <el-table-column show-overflow-tooltip label="表空间大小(MB)">
                <template slot-scope="scope">{{ scope.row.total }}</template>
              </el-table-column>

              <el-table-column show-overflow-tooltip label="表空间已使用空间(MB)" prop="used"></el-table-column>

              <el-table-column show-overflow-tooltip label="表空间利用率(%)">
                <template slot-scope="scope">{{ scope.row.usedRatio }}</template>
              </el-table-column>

              <el-table-column show-overflow-tooltip label="自动扩展" prop="autoExpand">
                <template slot-scope="scope">{{ autoType(scope.row.autoExpand) }}</template>
              </el-table-column>

              <div slot="pagination"></div>
            </basic-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </common-detail>
  </el-card>
</template>
<script>
import { booleanFilter } from '@/filters/index'
import chartBox from 'views/components/chartBox.vue'
import { getOraclesSummary, getOraclesFiles, getOraclesTableSpace } from 'services/monitor/database'
import detailMap from 'views/components/detailMap.vue'
const intervalData = [
  { name: '1H', value: '1H' },
  { name: '6H', value: '6H' },
  { name: '1D', value: '1D' },
  { name: '7D', value: '7D' },
  { name: '14D', value: '14D' }
]
export default {
  components: {
    chartBox,
    detailMap
  },
  beforeDestroy() {
    this.clear()
  },
  data() {
    return {
      booleanFilter,
      detailMapList: [
        { name: '地址', value: 'hostPort' },
        { name: '运行时间', value: 'runningTime' },
        { name: '会话数', value: 'sessionsInteger' },
        { name: '用户连接数', value: 'userConnections' },
        { name: '版本', value: 'version' }
      ],
      intervalData,
      typeData: [],
      resourceId: Number(this.$route.query.id),
      resourceName: this.$route.query.name,
      activeName: 'overview',
      basicData: {},
      dataFlies: [],
      logFlies: [],
      tableSpaces: {
        permanent: [],
        temporary: [],
        undo: []
      },
      // 图表
      dashboradData: {
        session_activity: {},
        activity: {},
        wait_time: {},
        user_connections: {},
        opened_cursors_current: {},
        cache_hit_ratio: {},
        data_dictionary_cache_hit_ratio: {},
        library_buffer_hit_ratio: {}
      }
    }
  },
  methods: {
    autoType(value) {
      const statusMap = {
        AUTO: '自动',
        MANUAL: '手动'
      }
      return statusMap[value]
    },
    handleClick() {
      switch (this.activeName) {
        case 'overview':
          this.getOverview()
          this.getData()
          break
        case 'datafile':
          this.getDataFiles()
          break
        case 'logfile':
          this.getLogFiles()
          break
        case 'tablespace':
          this.getTableSpace()
          break
      }
    },
    goBack() {
      this.$router.go(-1)
    },
    getOverview() {
      getOraclesSummary(this.resourceId).then((data) => {
        if (data.success) {
          this.basicData = data.data
          this.$set(this.basicData, 'name', this.resourceName)
          this.basicData.hostPort = this.basicData.host + ':' + this.basicData.port
        }
      })
    },
    getDataFiles() {
      getOraclesFiles(this.resourceId, {
        category: 'data'
      }).then((data) => {
        if (data.success) {
          this.dataFlies = data.data
        }
      })
    },
    getLogFiles() {
      getOraclesFiles(this.resourceId, {
        category: 'log'
      }).then((data) => {
        if (data.success) {
          this.logFlies = data.data
        }
      })
    },
    getTableSpace() {
      getOraclesTableSpace(this.resourceId).then((data) => {
        if (data.success) {
          this.tableSpaces = data.data
        }
      })
    },
    getData() {
      this.typeData = [
        {
          title: '活动数',
          value: 'session_activity',
          expr: JSON.stringify([
            'bocloud_oracledb_session_activity{res_id="' + this.resourceId + '",status="ACTIVE",type="BACKGROUND"}',
            'bocloud_oracledb_session_activity{res_id="' + this.resourceId + '",status="INACTIVE",type="USER"}',
            'bocloud_oracledb_session_activity{res_id="' + this.resourceId + '",status="ACTIVE",type="USER"}'
          ]),
          name: "['用户活动数', '用户非活动数', '后台活动数']",
          unit: '个'
        },
        {
          title: '性能视图',
          value: 'activity',
          expr: JSON.stringify([
            'bocloud_oracledb_activity{res_id="' + this.resourceId + '",name="user commits"}',
            'bocloud_oracledb_activity{res_id="' + this.resourceId + '",name="user rollbacks"}',
            'bocloud_oracledb_activity{res_id="' + this.resourceId + '",name="parse count (total)"}',
            'bocloud_oracledb_activity{res_id="' + this.resourceId + '",name="execute count"}'
          ]),
          name: "['用户提交数', '用户回滚数', '解析调用数', '执行的sql语句数']",
          unit: '次'
        },
        { title: 'wait_time', value: 'wait_time', expr: JSON.stringify(['bocloud_oracledb_wait_time{res_id="' + this.resourceId + '"}']), name: "['$wait_class']", unit: '秒' },
        { title: '连接数', value: 'user_connections', expr: JSON.stringify(['bocloud_oracledb_user_connections{res_id="' + this.resourceId + '"}']), name: "['$username']", unit: '个' },
        { title: '当前打开的游标', value: 'opened_cursors_current', expr: JSON.stringify(['bocloud_oracledb_opened_cursors_current{res_id="' + this.resourceId + '"}']), name: "['当前打开的游标']", unit: '个' },
        { title: '高速缓冲缓存命中率', value: 'cache_hit_ratio', expr: JSON.stringify(['bocloud_oracledb_cache_hit_ratio{res_id="' + this.resourceId + '"}']), name: "['高速缓冲缓存命中率']", unit: '%' },
        { title: '数据字典缓存命中率', value: 'data_dictionary_cache_hit_ratio', expr: JSON.stringify(['bocloud_oracledb_data_dictionary_cache_hit_ratio{res_id="' + this.resourceId + '"}']), name: "['数据字典缓存命中率']", unit: '%' },
        { title: '库缓冲区命中率', value: 'library_buffer_hit_ratio', expr: JSON.stringify(['bocloud_oracledb_library_buffer_hit_ratio{res_id="' + this.resourceId + '"}']), name: "['库缓冲区命中率']", unit: '%' }
      ]
      for (const key in this.dashboradData) {
        const element = this.dashboradData[key]
        this.$set(element, 'step', null)
        this.$set(element, 'stepValue', 20)
        this.$set(element, 'defindTime', [])
      }
    }
  },
  created() {
    this.handleClick()
  }
}
</script>
<style scoped>
.rate_box {
  background: #7c79b6;
  height: 140px;
  text-align: center;
  color: #fff;
}
.rate_box > p:nth-child(1) {
  height: 50px;
  line-height: 50px;
  margin-bottom: 0;
}
.rate_box > p:nth-child(2) {
  height: 60px;
  line-height: 60px;
  font-size: 32px;
  margin: 0;
}
</style>
