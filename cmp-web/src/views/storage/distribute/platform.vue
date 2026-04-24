<template>
  <div>
    <el-row :gutter="10">
      <el-col :span="6" v-for="item in vendorData" :key="item.id">
        <el-card class="server_view m-b">
          <div slot="header" class="clearfix">
            <div class="pull-left headerName" :title="item.name">
              {{ item.name }}
            </div>
            <div class="pull-right">
              <svg-icon icon-name="svg-service-ops" class="m-l-sm" title="开启监控" v-if="!item.isAlarm" @click="handleOperate(1, item.id)"></svg-icon>
              <svg-icon icon-name="svg-service-ops" class="m-l-sm" title="关闭监控" v-else @click="handleOperate(2, item.id)"></svg-icon>
              <svg-icon icon-name="svg-resource-ops" class="m-l-sm" style="font-size: 16px" title="配置数据源" @click="handleOp(item)"></svg-icon>
            </div>
            <div style="clear: both"></div>
          </div>
          <div class="server-body" @click="go(item)">
            <el-row>
              <el-col :span="12" class="body-left">
                <div class="body-left-header">
                  <img src="/web-common-resource/img/cloud/xsky.png" alt="" />
                </div>
                <div class="body-left-body" :class="{ colorRed: item.flag, colorWarn: item.warnFlag }">
                  {{ platformStatusFilter(item.status) }}
                </div>
              </el-col>
              <el-col :span="12" class="body-right">
                <div class="tag-box">
                  <div class="tag" v-for="(item1, index1) in xskyShowList" :key="index1">
                    <el-col :span="12">{{ item1.name }}</el-col>
                    <el-col :span="7" :class="'tag' + (index1 + 1)">{{ item[item1.value] }}</el-col>
                    <el-col :span="2" :offset="1">{{ item1.unit }}</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">监控</el-col>
                    <el-col :span="10" :class="item.isAlarm ? 'tag2' : 'tag3'">{{ item.isAlarm ? '已开启' : '已关闭' }}</el-col>
                    <div style="clear: both"></div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
      <empty v-if="!vendorData.length"></empty>
    </el-row>
    <el-dialog title="配置超分比" :close-on-click-modal="false" v-if="configRatioVisible" v-model:visible="configRatioVisible">
      <basic-form :model="configRatioData" label-width="130px" ref="configRatioData">
        <el-row :gutter="10">
          <el-col :span="24">
            <basic-form-item label="vcpu超分比：" prop="vcpuRatio" validate="required"> <el-input-number :min="0" v-model="configRatioData.vcpuRatio"></el-input-number> 倍 </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="内存超分比：" prop="ramRatio" validate="required"> <el-input-number :min="0" v-model="configRatioData.ramRatio"></el-input-number> 倍 </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="磁盘超分比：" prop="diskRatio" validate="required"> <el-input-number :min="0" v-model="configRatioData.diskRatio"></el-input-number> 倍 </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="configRatioVisible = false">取消</el-button>
        <el-button type="primary" @click="configRatioSubmit">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="数据源" :close-on-click-modal="false" v-if="opVisible" v-model:visible="opVisible" width="600px">
      <basic-form :model="opData" label-width="150px" ref="opData">
        <el-row :gutter="10">
          <el-col :span="24">
            <basic-form-item label="prometheus地址：" prop="address" validate="required">
              <el-input v-model="opData.address" auto-complete="off"></el-input>
            </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="opVisible = false">取消</el-button>
        <el-button type="primary" @click="opSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { platformStatusFilter } from '@/filters/index'
import webSocket from '@/common/mixins/getGlobalSocket'
import { openMonitor, closeMonitor, getRatio, ratioOk, configDataSource } from 'services/monitor'
import { conditionCloudVendor } from 'services/platform/index'
export default {
  mixins: [webSocket],
  components: {},
  data() {
    return {
      platformStatusFilter,
      xskyShowList: [
        { name: '对象用户', value: 'objectUserCount', unit: '个' },
        { name: '存储桶', value: 'objectBucketCount', unit: '个' },
        { name: '存储池', value: 'poolCount', unit: '个' }
      ],
      vendorData: [],
      search: {
        name: ''
      },
      params: {
        page: 1,
        rows: 10000
      },
      configRatioVisible: false,
      configRatioData: {
        targets: [],
        timeout: 1800
      },
      opVisible: false,
      opData: {}
    }
  },
  created() {
    this.getVendor()
  },
  methods: {
    // 跳转
    go(item) {
      if (!item.isAlarm) {
        return this.$message.error('该平台未开启监控，请先开启监控')
      }
      switch (item.type) {
        case 'XSKY':
          this.$router.push({
            name: 'MonitorStorageXsky',
            query: {
              vendorId: item.id,
              vendorName: item.name,
              type: item.type
            }
          })
          break
        default:
          break
      }
    },
    onmessage(data) {
      if (data.operate.indexOf('sync') > -1) {
        this.getVendor()
      }
    },
    getVendor() {
      conditionCloudVendor({
        condition: JSON.stringify({
          condition: 'listByTypes',
          types: ['XSKY']
        })
      }).then((data) => {
        if (data.success) {
          this.vendorData = data.data
          this.vendorData.forEach((item) => {
            item.flag = false
            item.warnFlag = false
            if (item.status == 'ABNORMAL' || item.status == 'DANGER') {
              item.flag = true
            }
            if (item.status === 'WARN') item.warnFlag = true
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
                  this.getVendor()
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
                  this.getVendor()
                }
              })
            })
            .catch(() => {})
          break
      }
    },
    handleConfigRatio(id) {
      getRatio({ simple: true, params: JSON.stringify({ vendorId: id }) }).then((data) => {
        if (data.success) {
          this.configRatioData = {
            vendorId: id,
            vcpuRatio: data.data.vcpuRatio,
            ramRatio: data.data.ramRatio,
            diskRatio: data.data.diskRatio
          }
          this.configRatioVisible = true
        }
      })
    },
    configRatioSubmit() {
      this.$refs.configRatioData.validate((valid) => {
        if (valid) {
          ratioOk(this.configRatioData).then((data) => {
            if (data.success) {
              this.$message({ message: data.message, type: 'success' })
              this.configRatioVisible = false
              this.getList()
            }
          })
        }
      })
    },
    handleOp(item) {
      const { id: vendorId, props } = item
      this.opData = {
        vendorId
      }
      if (props) {
        const {
          monitor: {
            xsky: { address }
          }
        } = JSON.parse(props)
        this.opData.address = address
      }
      this.opVisible = true
    },
    opSubmit() {
      this.$refs.opData.validate((valid) => {
        if (valid) {
          configDataSource(this.opData.vendorId, this.opData).then((data) => {
            if (data.success) {
              this.$message({ message: data.message, type: 'success' })
              this.opVisible = false
              this.getList()
            }
          })
        }
      })
    }
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
  /* height: 160px; */
  overflow: hidden;
  cursor: pointer;
}

.tag {
  width: 100%;
  padding: 5px;
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
.headerName {
  width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
