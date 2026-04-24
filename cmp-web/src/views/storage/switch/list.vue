<template>
  <div>
    <el-row :gutter="10">
      <el-col :span="6" v-for="item in storageData" :key="item.id">
        <el-card class="server_view m-b">
          <div slot="header" class="clearfix">
            <div class="pull-left headerName" :title="item.name">
              {{ item.name }}
            </div>
            <div class="pull-right">
              <svg-icon icon-name="svg-service-ops" class="m-l-sm" title="开启监控" v-if="!item.isAlarm" @click="handleOperate(1, item.id)"></svg-icon>
              <svg-icon icon-name="svg-service-ops" class="m-l-sm" title="关闭监控" v-else @click="handleOperate(2, item.id)"></svg-icon>
            </div>
            <div style="clear: both"></div>
          </div>
          <div class="server-body" @click="go(item)">
            <el-row>
              <el-col :span="12" class="body-left">
                <div class="body-left-header">
                  <img src="/web-common-resource/img/cloud/storage.png" alt="" />
                </div>
                <div class="body-left-body" :class="{ colorRed: item.flag, colorWarn: item.warnFlag }">
                  {{ platformStatusFilter(item.status) }}
                </div>
              </el-col>
              <el-col :span="12" class="body-right">
                <div class="tag-box">
                  <div class="tag" v-for="(item1, index1) in SMIS_FABRIC.value" :key="index1">
                    <el-col :span="12">{{ item1.name }}</el-col>
                    <el-col :span="7" :class="'tag' + (index1 + 1)">{{ item[item1.value] }}</el-col>
                    <el-col :span="2" :offset="1">{{ item1.unit }}</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="8">监控</el-col>
                    <el-col :span="12" :class="item.isAlarm ? 'tag2' : 'tag3'">{{ item.isAlarm ? '已开启' : '已关闭' }}</el-col>
                    <div style="clear: both"></div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
      <empty v-if="!storageData.length"></empty>
    </el-row>
  </div>
</template>

<script>
import { platformStatusFilter } from '@/filters/index'
import webSocket from '@/common/mixins/getGlobalSocket'
import crypto from 'utils/crypto.js'
import { openMonitor, closeMonitor } from 'services/monitor'
import { getCloudVendor } from 'services/platform/index'
const SMIS_FABRIC = {
  value: [
    { name: '交换机', value: 'fabricCount', unit: '个' },
    { name: 'ZONE', value: 'zoneCount', unit: '个' },
    { name: '别名', value: 'aliasCount', unit: '个' }
  ]
}
export default {
  mixins: [webSocket],
  components: {},
  data() {
    return {
      platformStatusFilter,
      SMIS_FABRIC,
      storageData: [],
      params: {
        page: 1,
        rows: 10000
      },
      plugInVisible: false,
      plugInData: {}
    }
  },
  methods: {
    // 跳转
    go(item) {
      if (!item.isAlarm) {
        return this.$message.error('该平台未开启监控，请先开启监控')
      }
      const projectName = JSON.parse(item.authentication).projectName
      let routerName = ''
      switch (projectName) {
        case 'cisco_nxos':
          routerName = 'MonitorCisco'
          break
      }
      this.$router.push({
        name: routerName,
        query: {
          vendorId: item.id,
          vendorName: item.name
        }
      })
    },
    onmessage(data) {
      if (data.operate.indexOf('sync') > -1) {
        this.getStorageData()
      }
    },
    getStorageData() {
      this.storageData = []
      getCloudVendor(
        {
          page: 1,
          rows: 10000,
          params: JSON.stringify([{ param: { vendorCategory: 'NETWORK' }, sign: 'EQ' }])
        },
        '/nms/v1/vendors'
      ).then((data) => {
        if (data.success) {
          const vendor1 = data.data.rows
          vendor1.forEach((item) => {
            item.flag = false
            item.warnFlag = false
            item.projectName = JSON.parse(item.authentication).projectName
            Object.keys(item).forEach((key) => {
              if (item[key] === null) item[key] = 0
            })
            if (item.status == 'ABNORMAL' || item.status == 'DANGER') {
              item.flag = true
            }
            if (item.status === 'WARN') item.warnFlag = true
            this.storageData.push(item)
          })
        }
      })
    },
    handleOperate(flag, id) {
      let tip
      let list = []
      if (id) {
        list.push(id)
      } else {
        this.refreshId()
        list = this.idList
      }
      switch (flag) {
        case 1:
          tip = '确定要开启监控吗？'
          this.$confirm(tip, '提示', {
            confirmButtonClass: 'el-button--danger',
            type: 'warning'
          })
            .then(() => {
              openMonitor({
                ids: list
              }).then((data) => {
                if (data.success) {
                  this.$message.success({
                    message: data.message,
                    type: 'success'
                  })
                  this.getStorageData()
                }
              })
            })
            .catch(() => {})
          break
        case 2:
          tip = '确定要关闭监控吗？'
          this.$confirm(tip, '提示', {
            confirmButtonClass: 'el-button--danger',
            type: 'warning'
          })
            .then(() => {
              closeMonitor({
                ids: list
              }).then((data) => {
                if (data.success) {
                  this.$message.success({
                    message: data.message,
                    type: 'success'
                  })
                  this.getStorageData()
                }
              })
            })
            .catch(() => {})
          break
      }
    }
  },
  created() {
    this.getStorageData()
  }
}
</script>

<style scoped>
.body-left {
  height: 100%;
  margin: 25px 0;
  padding: 0px 5px;
  text-align: center;
}

.body-right {
  height: 100%;
}

.tag-box {
  margin: 20px 0;
  padding: 0px 5px;
  border-left: 1px solid #ebebeb;
}

.tag1 {
  text-align: right;
  font-weight: bold;
  font-size: 12px;
  line-height: 1.7;
  color: #2c8cf0;
}

.tag2 {
  text-align: right;
  font-weight: bold;
  font-size: 12px;
  line-height: 1.7;
  color: #18be6a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tag3 {
  text-align: right;
  font-weight: bold;
  font-size: 12px;
  line-height: 1.7;
  color: #ff6600;
}
.tag4 {
  text-align: right;
  font-weight: bold;
  font-size: 12px;
  line-height: 1.7;
  color: #ff6600;
}
.colorRed {
  color: red !important;
}

.colorWarn {
  color: #fe9900 !important;
}

.body-left img {
  margin: 36px 0px 12px 0px;
}
.server_view {
  -webkit-transition: all 0.2s linear;
  transition: all 0.2s linear;
}

.server_view:hover {
  z-index: 2;
  -webkit-box-shadow: 0 7px 15px rgba(0, 0, 0, 0.1);
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.1);
  -webkit-transform: translate3d(0, -1px, 0);
  transform: translate3d(0, -1px, 0);
}
.server-body {
  height: 220px;
  overflow: hidden;
  cursor: pointer;
}

.tag {
  width: 100%;
  padding: 5px;
}

.headerName {
  width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
