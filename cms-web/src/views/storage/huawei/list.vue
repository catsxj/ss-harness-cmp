<template>
  <div>
    <el-row :gutter="10">
      <el-col :span="6" class="m-b" v-for="item in storageData" :key="item.id">
        <el-card class="server_view">
          <div slot="header" class="clearfix">
            <div class="pull-left headerName" :title="item.name">
              {{ item.name }}
            </div>
            <div class="pull-right">
              <svg-icon icon-name="svg-service-ops" class="m-l-sm" title="开启监控" v-if="!item.isAlarm" @click.native="handleOperate(1, item.id)"></svg-icon>
              <svg-icon icon-name="svg-service-ops" class="m-l-sm" title="关闭监控" v-else @click.native="handleOperate(2, item.id)"></svg-icon>
              <!--<Icon type="icon-chajian" class="m-l-sm" style="font-size: 16px;" title="运维认证" @click.native="handlePlugIn(item.id)"></Icon>-->
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
                  <div class="tag" v-for="(item1, index1) in STORAGE[item.projectName].value" :key="index1">
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
    <el-dialog title="运维认证信息" :close-on-click-modal="false" v-if="plugInVisible" :visible.sync="plugInVisible">
      <basic-form :model="plugInData" label-width="130px" ref="plugInData">
        <el-row :gutter="10">
          <el-col :span="24">
            <basic-form-item label="IP地址：" prop="address" validate="required,ip">
              <el-input v-model="plugInData.address" auto-complete="off"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="用户名：" prop="username" validate="required">
              <el-input v-model="plugInData.username" auto-complete="off"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="密码：" prop="password" validate="required">
              <el-input type="password" v-model="plugInData.password" auto-complete="off"></el-input>
            </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="plugInVisible = false">取消</el-button>
        <el-button type="primary" @click.native="plugInSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { platformStatusFilter } from '@/filters/index'
import webSocket from '@/common/mixins/getGlobalSocket'
import crypto from 'utils/crypto.js'
import { openMonitor, closeMonitor, getAuthentications, authenticationsOk } from 'services/monitor'
import { getCloudVendor } from 'services/platform/index'
const STORAGE = {
  HUAWEI: {
    value: [
      { name: '硬盘域', value: 'mdiskCount', unit: '个' },
      { name: '存储池', value: 'poolCount', unit: '个' },
      { name: '存储卷', value: 'dataStoreCount', unit: '个' }
    ]
  },
  DELL: {
    value: [
      { name: '存储池', value: 'poolCount', unit: '个' },
      { name: '存储卷', value: 'dataStoreCount', unit: '个' }
    ]
  }
}
export default {
  mixins: [webSocket],
  components: {},
  data() {
    return {
      platformStatusFilter,
      STORAGE,
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
        case 'HUAWEI':
          routerName = 'MonitorHuawei'
          break
        case 'DELL_CMPL':
          routerName = 'MonitorDell'
          break
      }
      this.$router.push({
        name: routerName,
        query: {
          vendorId: item.id,
          vendorName: item.name,
          uuid: item.uuid,
          projectName: item.projectName
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
      getCloudVendor({
        page: 1,
        rows: 10000,
        params: JSON.stringify([
          { param: { vendorCategory: 'CENTRAL_STORAGE' }, sign: 'EQ' },
          { param: { authentication: '"projectName":"HUAWEI"' }, sign: 'LK' }
        ])
      }).then((data) => {
        if (data.success) {
          const vendor1 = data.data.rows
          vendor1.forEach((item) => {
            item.flag = false
            item.warnFlag = false
            item.projectName = 'HUAWEI'
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
      getCloudVendor({
        page: 1,
        rows: 10000,
        params: JSON.stringify([
          { param: { vendorCategory: 'CENTRAL_STORAGE' }, sign: 'EQ' },
          { param: { authentication: '"projectName":"DELL%CMPL"' }, sign: 'LK' }
        ])
      }).then((data) => {
        if (data.success) {
          const vendor2 = data.data.rows
          vendor2.forEach((item) => {
            item.flag = false
            item.warnFlag = false
            item.projectName = 'DELL'
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
    },
    handlePlugIn(id) {
      getAuthentications(id).then((data) => {
        if (data.success) {
          if (data.data) {
            this.plugInData = {
              vendorId: id,
              address: data.data.address,
              username: data.data.username,
              password: crypto.decrypt(data.data.password)
            }
          } else {
            this.plugInData = {
              vendorId: id
            }
          }
          this.plugInVisible = true
        }
      })
    },
    plugInSubmit() {
      this.$refs.plugInData.validate((valid) => {
        if (valid) {
          const plugInData = JSON.parse(JSON.stringify(this.plugInData))
          if (plugInData.password) {
            plugInData.password = crypto.encrypt(plugInData.password)
          }
          authenticationsOk(plugInData).then((data) => {
            if (data.success) {
              this.$message({ message: data.message, type: 'success' })
              this.plugInVisible = false
              this.getList()
            }
          })
        }
      })
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

.colorRed {
  color: red !important;
}

.colorWarn {
  color: #fe9900 !important;
}

.body-left img {
  margin: 10px 0px 12px 0px;
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
  height: 160px;
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
