<template>
  <div>
    <basic-form :model="addData" label-width="100px" ref="addData">
      <el-row class="search-container m-b-md">
        <el-col :span="24" class="legend">基本设置</el-col>
        <el-col :span="24">
          <el-row :gutter="20">
            <el-col :span="12">
              <basic-form-item label="策略名称：" validate="required" prop="name">
                <el-input v-model="addData.name"></el-input>
              </basic-form-item>
            </el-col>
            <el-col :span="12">
              <basic-form-item label="延迟时间：" prop="waitTime" title="指告警发生后如果未恢复正常，时隔多久触发该分发策略" validate="required" required-message="请选择延迟时间">
                <el-select clearable v-model="addData.waitTime" placeholder="延迟时间">
                  <el-option v-for="(item, index) in waitTimeArr" :key="index" :label="item | waiteTime('waiteTime')" :value="item"> </el-option>
                </el-select>
              </basic-form-item>
            </el-col>
            <el-col :span="12">
              <basic-form-item label="关注级别：">
                <el-checkbox v-model="addData.urgent">紧急</el-checkbox>
                <el-checkbox v-model="addData.primary">重要</el-checkbox>
                <el-checkbox v-model="addData.secondary">次要</el-checkbox>
                <el-checkbox v-model="addData.remind">提示</el-checkbox>
              </basic-form-item>
            </el-col>
            <el-col :span="12">
              <basic-form-item label="发送方式：" style="margin-bottom: 0px">
                <el-checkbox v-model="addData.email">邮件</el-checkbox>
                <el-checkbox v-model="addData.message">站内信</el-checkbox>
                <el-checkbox v-model="addData.dingding">钉钉</el-checkbox>
                <el-checkbox v-model="addData.weixin">微信</el-checkbox>
              </basic-form-item>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
      <add-user class="m-b" ref="receiveUser" :receiverIds="addData.receiverIds" :flag="flag"></add-user>
      <CardLayout title="屏蔽策略">
        <el-row class="m-b">
          <basic-form-item label="启用：" prop="action">
            <el-switch v-model="addData.action" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
          </basic-form-item>
          <el-tabs ref="shieldPolicy" v-model="activeName" type="border-card">
            <el-tab-pane name="Mon" label="星期一">
              <basic-form-item label="时间设置：" prop="name">
                <el-time-picker is-range v-model="blockPolicy[0].time" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" placeholder="选择时间范围" format="HH:mm" value-format="HH:mm"> </el-time-picker>
              </basic-form-item>
              <basic-form-item label="告警策略：" prop="name">
                <el-select clearable v-model="blockPolicy[0].type">
                  <el-option label="接收告警" value="on"></el-option>
                  <el-option label="屏蔽告警" value="off"></el-option>
                </el-select>
              </basic-form-item>
            </el-tab-pane>
            <el-tab-pane name="Tue" label="星期二">
              <basic-form-item label="时间设置：" prop="name">
                <el-time-picker is-range v-model="blockPolicy[1].time" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" placeholder="选择时间范围" format="HH:mm" value-format="HH:mm"> </el-time-picker>
              </basic-form-item>
              <basic-form-item label="告警策略：" prop="name">
                <el-select clearable v-model="blockPolicy[1].type">
                  <el-option label="接收告警" value="on"></el-option>
                  <el-option label="屏蔽告警" value="off"></el-option>
                </el-select>
              </basic-form-item>
            </el-tab-pane>
            <el-tab-pane name="Wed" label="星期三">
              <basic-form-item label="时间设置：" prop="name">
                <el-time-picker is-range v-model="blockPolicy[2].time" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" placeholder="选择时间范围" format="HH:mm" value-format="HH:mm"> </el-time-picker>
              </basic-form-item>
              <basic-form-item label="告警策略：" prop="name">
                <el-select clearable v-model="blockPolicy[2].type">
                  <el-option label="接收告警" value="on"></el-option>
                  <el-option label="屏蔽告警" value="off"></el-option>
                </el-select>
              </basic-form-item>
            </el-tab-pane>
            <el-tab-pane name="Thu" label="星期四">
              <basic-form-item label="时间设置：" prop="name">
                <el-time-picker is-range v-model="blockPolicy[3].time" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" placeholder="选择时间范围" format="HH:mm" value-format="HH:mm"> </el-time-picker>
              </basic-form-item>
              <basic-form-item label="告警策略：" prop="name">
                <el-select clearable v-model="blockPolicy[3].type">
                  <el-option label="接收告警" value="on"></el-option>
                  <el-option label="屏蔽告警" value="off"></el-option>
                </el-select>
              </basic-form-item>
            </el-tab-pane>
            <el-tab-pane name="Fri" label="星期五">
              <basic-form-item label="时间设置：" prop="name">
                <el-time-picker is-range v-model="blockPolicy[4].time" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" placeholder="选择时间范围" format="HH:mm" value-format="HH:mm"> </el-time-picker>
              </basic-form-item>
              <basic-form-item label="告警策略：" prop="name">
                <el-select clearable v-model="blockPolicy[4].type">
                  <el-option label="接收告警" value="on"></el-option>
                  <el-option label="屏蔽告警" value="off"></el-option>
                </el-select>
              </basic-form-item>
            </el-tab-pane>
            <el-tab-pane name="Sat" label="星期六">
              <basic-form-item label="时间设置：" prop="name">
                <el-time-picker is-range v-model="blockPolicy[5].time" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" placeholder="选择时间范围" format="HH:mm" value-format="HH:mm"> </el-time-picker>
              </basic-form-item>
              <basic-form-item label="告警策略：" prop="name">
                <el-select clearable v-model="blockPolicy[5].type">
                  <el-option label="接收告警" value="on"></el-option>
                  <el-option label="屏蔽告警" value="off"></el-option>
                </el-select>
              </basic-form-item>
            </el-tab-pane>
            <el-tab-pane name="Sun" label="星期日">
              <basic-form-item label="时间设置：" prop="name">
                <el-time-picker is-range v-model="blockPolicy[6].time" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" placeholder="选择时间范围" format="HH:mm" value-format="HH:mm"> </el-time-picker>
              </basic-form-item>
              <basic-form-item label="告警策略：" prop="name">
                <el-select clearable v-model="blockPolicy[6].type">
                  <el-option label="接收告警" value="on"></el-option>
                  <el-option label="屏蔽告警" value="off"></el-option>
                </el-select>
              </basic-form-item>
            </el-tab-pane>
          </el-tabs>
        </el-row>
      </CardLayout>
    </basic-form>
  </div>
</template>
<script>
import { getDistributions, getDistriDetail, createDistri, modifyDistri, removeDistri } from 'services/monitor'
import addUser from './add_user.vue'
const searchSenderConfigs = [{ type: 'Input', label: '名称', value: 'name' }]
export default {
  props: {
    id: {
      type: Number,
      default: 0
    }
  },
  components: {
    addUser
  },
  data() {
    return {
      searchSenderConfigs,
      loading: false,
      paramsUser: {
        page: 1,
        rows: 10
      },
      listQuery: {},
      addData: {
        receiverIds: []
      },
      status: '',
      waitTimeArr: [0, 5, 10, 30, 60, 360, 720, 1440],
      activeName: 'Mon',
      blockPolicy: [
        { week: 1, type: '' },
        { week: 2, type: '' },
        { week: 3, type: '' },
        { week: 4, type: '' },
        { week: 5, type: '' },
        { week: 6, type: '' },
        { week: 0, type: '' }
      ],
      flag: 0
    }
  },
  methods: {
    init() {
      this.activeName = 'Mon'
      this.blockPolicy = [
        { week: 1, type: '', time: null },
        { week: 2, type: '', time: null },
        { week: 3, type: '', time: null },
        { week: 4, type: '', time: null },
        { week: 5, type: '', time: null },
        { week: 6, type: '', time: null },
        { week: 0, type: '', time: null }
      ]
      if (this.id) {
        this.status = 'update'
        getDistriDetail(this.id).then(data => {
          if (data.success) {
            this.addData = Object.assign({}, data.data)
            this.addData.roleIds = this.addData.roleIds ? JSON.parse(this.addData.roleIds) : []
            this.addData.blockPolicy.forEach(item => {
              this.blockPolicy.forEach(obj => {
                if (obj.week === item.week) {
                  obj.time = [item.beginTime, item.endTime]
                  obj.type = item.type
                }
              })
            })
            this.flag++
          }
        })
      } else {
        this.status = 'create'
        this.addData = {
          urgent: false,
          primary: false,
          secondary: false,
          remind: false,
          message: false,
          email: false,
          weixin: false,
          dingding: false,
          action: false,
          blockPolicy: [],
          receiverIds: []
        }
      }
    },
    addSubmit() {
      this.$refs.addData.validate(valid => {
        if (valid) {
          if (!this.addData.urgent && !this.addData.primary && !this.addData.secondary && !this.addData.remind) {
            return this.$message.error('请至少选择一种告警级别')
          }
          if (!this.addData.email && !this.addData.message && !this.addData.weixin && !this.addData.dingding) {
            return this.$message.error('请至少选择一种发送方式')
          }
          const addData = JSON.parse(JSON.stringify(this.addData))
          const receiverIds = this.$refs.receiveUser.userIds
          addData.receiverIds = receiverIds || []
          console.log(addData.receiverIds)
          if (addData.receiverIds.length == 0) {
            return this.$message.error('请选择消息接收人')
          }
          addData.blockPolicy = []
          let name
          const Flag = this.blockPolicy.every(function (item) {
            switch (item.week) {
              case 0:
                name = '星期日'
                break
              case 1:
                name = '星期一'
                break
              case 2:
                name = '星期二'
                break
              case 3:
                name = '星期三'
                break
              case 4:
                name = '星期四'
                break
              case 5:
                name = '星期五'
                break
              case 6:
                name = '星期六'
                break
            }
            return (item.time && item.type) || (!item.time && !item.type)
          })
          if (!Flag) {
            return this.$message({
              message: name + '信息填写不完整，请检查',
              type: 'error'
            })
          }
          this.blockPolicy.forEach(item => {
            if (item.time && item.type) {
              const obj = {
                week: item.week,
                beginTime: item.time[0],
                endTime: item.time[1],
                type: item.type
              }
              addData.blockPolicy.push(obj)
            }
          })
          if (this.status == 'create') {
            createDistri(addData).then(data => {
              if (data.success) {
                this.$notify({
                  message: data.message,
                  type: 'success'
                })
                this.$emit('refresh')
              }
            })
          } else {
            modifyDistri(addData).then(data => {
              if (data.success) {
                this.$notify({
                  message: data.message,
                  type: 'success'
                })
                this.$emit('refresh')
              }
            })
          }
        }
      })
    }
  },
  created() {
    this.init()
  },
  mounted() {}
}
</script>
<style scoped>
.el-dialog .el-dialog__footer {
  background: #f0f3fa;
  padding: 10px;
  text-align: right;
  border-top: 1px solid #e5e5e5;
  box-sizing: border-box;
}
</style>
