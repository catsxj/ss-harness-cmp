<template>
  <div class="wrapper-container">
    <el-row>
      <basic-form :model="serverMgData" ref="serverMgData">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>服务管理</span>
            <el-button type="primary" size="mini" class="pull-right" style="cursor: pointer" @click="goBack()">
              <i class="el-icon-back"></i>
              返回
            </el-button>
          </div>
          <el-col :span="24">
            <el-col :span="10">
              <basic-form-item label="认证方式：" prop="ways" :rules="[required]">
                <el-select v-model="serverMgData.ways">
                  <el-option v-for="(item, index) in waysData" :key="index" :label="item.name" :value="item.value"></el-option>
                </el-select>
              </basic-form-item>
            </el-col>
          </el-col>
          <el-col :span="24" v-if="serverMgData.ways == 'SINGLE'">
            <el-col :span="10">
              <basic-form-item label="用户名：" prop="user" :rules="[required]" required-message="请输入用户名">
                <el-input v-model="serverMgData.user" auto-complete="off"></el-input>
              </basic-form-item>
            </el-col>
            <el-col :span="12">
              <basic-form-item label="密码：" prop="pasd" :rules="[required]" required-message="请输入密码">
                <el-input type="password" v-model="serverMgData.pasd" auto-complete="new-password"></el-input>
              </basic-form-item>
            </el-col>
            <el-col :span="10">
              <basic-form-item label="端口：" prop="port" :rules="[required]">
                <el-tooltip class="item" :content="`默认端口为${isWindows ? 5986 : 22}`" placement="top" effect="light">
                  <el-input-number v-model="serverMgData.port" controls-position="right" :precision="0" :min="1" :max="65535"></el-input-number>
                </el-tooltip>
              </basic-form-item>
            </el-col>
            <el-col :span="12">
              <basic-form-item label="">
                <el-checkbox v-if="!isWindows" v-model="serverMgData.sudo">是否SUDO</el-checkbox>
              </basic-form-item>
            </el-col>
          </el-col>
          <el-col :span="24">
            <el-col :span="10">
              <basic-form-item label="服务名：" prop="serviceName" :rules="[required]" required-message="请输入服务名">
                <el-input v-model="serverMgData.serviceName" auto-complete="off"></el-input>
              </basic-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="操作：" prop="operate" v-if="!isWindows" :rules="[required]">
                <el-select clearable v-model="serverMgData.operate" placeholder="请选择操作" filterable>
                  <el-option v-for="(item, index) in operateData" :key="index" :label="item.name" :value="item.value"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="操作：" prop="operate" v-if="isWindows" :rules="[required]">
                <el-tooltip class="item" effect="dark" content="删除操作有一定风险，请慎重选择" placement="top">
                  <el-select clearable v-model="serverMgData.operate" placeholder="请选择操作" filterable>
                    <el-option v-for="(item, index) in operateData2" :key="index" :label="item.name" :value="item.value"></el-option>
                  </el-select>
                </el-tooltip>
              </el-form-item>
            </el-col>
          </el-col>
          <el-col :span="24">
            <el-col :span="10">
              <el-form-item label="参数：" prop="args">
                <el-input v-model="serverMgData.args" auto-complete="off"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="开机自启动：" v-if="!isWindows">
                <el-select clearable v-model="serverMgData.enabled" placeholder="请选择">
                  <el-option v-for="(item, index) in enabledData" :key="index" :label="item.name" :value="item.value"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="启动类型：" v-if="isWindows">
                <el-select clearable v-model="serverMgData.start_mode" placeholder="请选择">
                  <el-option v-for="(item, index) in enabledData2" :key="index" :label="item.name" :value="item.value"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-col>
          <el-col :span="24" class="wrapper-sm">
            <el-button type="primary" @click="carryOut">执行</el-button>
            <el-button type="ghost" @click="goBack">取消</el-button>
          </el-col>
          <el-col :span="24" v-if="!this.isWindows">
            <el-row class="m-t wrapper-sm">
              <el-form label-width="120px">
                <el-col :span="24">
                  <el-col :span="20">
                    <el-form-item label="服务日志地址：" prop="fileName">
                      <el-input placeholder="" v-model="filepath"> </el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="3" class="m-l">
                    <el-button type="info" @click="handleRealLog">查看</el-button>
                  </el-col>
                </el-col>
                <el-col :span="24">
                  <div class="log-content" id="logContent">
                    <pre id="pre">{{ realLog }}</pre>
                  </div>
                </el-col>
              </el-form>
            </el-row>
          </el-col>
        </el-card>
      </basic-form>
    </el-row>
  </div>
</template>

<script>
/* global $ */
import crypto from 'utils/crypto.js'
import { manageService } from 'services/task/server'
import { getToken } from 'utils/auth'
import validate from '@/validate'
const operateData = [
  { name: '启动', value: 'started' },
  { name: '停止', value: 'stopped' },
  { name: '重新启动', value: 'restarted' },
  { name: '重新加载', value: 'reloaded' }
]
const operateData2 = [
  { name: '启动', value: 'started' },
  { name: '停止', value: 'stopped' },
  { name: '重新启动', value: 'restarted' },
  { name: ' 删除', value: 'absent' },
  { name: ' 暂停', value: 'paused' }
]
const enabledData = [
  { name: '设置开机启动', value: true },
  { name: '取消开机启动', value: false }
]
const enabledData2 = [
  { name: '自动（延迟启动）', value: 'delayed' },
  { name: '自动', value: 'auto' },
  { name: '手动', value: 'manual' },
  { name: '禁用', value: 'disabled' }
]
export default {
  data() {
    return {
      required: validate.required,
      waysData: [],
      operateData,
      operateData2,
      enabledData,
      enabledData2,
      serverMgData: { ways: 'SINGLE', enabled: null, start_mode: null },
      port: '',
      host: '',
      socket: null,
      filepath: '',
      realLog: '',
      isWindows: false
    }
  },
  created() {
    if (this.$route.params.osCategory && this.$route.params.osCategory == 'WINDOWS') {
      this.isWindows = true
    } else {
      this.isWindows = false
    }
    if (this.isWindows) {
      this.waysData = [{ name: '单一认证', value: 'SINGLE' }]
    } else {
      this.waysData = [
        { name: '单一认证', value: 'SINGLE' },
        { name: '互信认证', value: 'TRUST' }
      ]
      this.serverMgData.sudo = true
    }
    this.serverMgData.host = this.host = this.$route.params.host
    this.serverMgData.category = this.$route.params.osCategory
    this.serverMgData.segmentId = this.$route.params.segmentId
    this.serverMgData.port = this.isWindows ? 5986 : 22
  },
  methods: {
    carryOut() {
      this.$refs.serverMgData.validate(valid => {
        if (valid) {
          // windows
          if (this.isWindows && !this.serverMgData.operate && !this.serverMgData.start_mode) {
            return this.$message({
              message: '操作和启动类型必须至少选择一项',
              type: 'error'
            })
          }
          // linux
          if (!this.isWindows && !this.serverMgData.operate && (this.serverMgData.enabled === undefined || this.serverMgData.enabled === '')) {
            return this.$message({
              message: '操作和启动类型必须至少选择一项',
              type: 'error'
            })
          }
          let edit1
          if (this.serverMgData.ways == 'TRUST') {
            edit1 = ['category', 'host', 'port', 'segmentId']
          } else {
            edit1 = ['category', 'pasd', 'sudo', 'host', 'user', 'port', 'segmentId']
          }
          const edit2 = ['serviceName', 'operate', 'args', 'segmentId']
          const serverMgData = { targets: [{}] }
          edit1.forEach(attr => {
            if (attr == 'sudo') {
              serverMgData.targets[0][attr] = true
            } else {
              serverMgData.targets[0][attr] = this.serverMgData[attr] || ''
            }
          })
          const tag = Boolean(this.serverMgData.sudo)
          if (tag) {
            serverMgData.options = {}
            serverMgData.options.become = true
          } else {
            serverMgData.options = {}
            serverMgData.options.become = false
          }
          if (this.serverMgData.enabled || this.serverMgData.enabled === false) {
            edit2.push('enabled')
          }
          if (this.isWindows && this.serverMgData.start_mode) {
            edit2.push('start_mode')
          }
          edit2.forEach(attr => {
            serverMgData[attr] = this.serverMgData[attr]
          })
          if (serverMgData.enabled === '') {
            delete serverMgData.enabled
          }
          if (serverMgData.targets[0].pasd) {
            serverMgData.targets[0].pasd = crypto.encrypt(serverMgData.targets[0].pasd)
          }
          manageService(serverMgData).then(data => {
            if (data.success) {
              this.$notify({
                message: data.message,
                type: 'success'
              })
            }
          })
        }
      })
    },
    handleRealLog() {
      const that = this
      this.realLog = ''
      this.position = ''
      if (this.socket) {
        this.socket.close()
      }
      const protocol = location.protocol === 'http:' ? 'ws' : 'wss'
      this.socket = new WebSocket(`${protocol}://${location.host}/api/sms/logViewService`, getToken())
      const target = document.getElementById('logContent')
      const handleDom = function() {
        const height = target.find('#pre').height()
        target.animate({ scrollTop: height + 'px' }, 200)
      }
      this.socket.onopen = function() {
        that.socket.send(
          JSON.stringify({
            logger: 'service.logger',
            logsize: 1024,
            target: that.host,
            port: that.port,
            filepath: that.filepath,
            user: that.serverMgData.user,
            password: crypto.encrypt(that.serverMgData.pasd),
            category: that.serverMgData.category
          })
        )
      }
      this.socket.onmessage = function(event) {
        const data = JSON.parse(event.data)
        if (!data || !data.success) {
          that.realLog += data.content
          that.socket.close()
        }
        if (data && data.success && data.content) {
          that.realLog += data.content
          that.position = data.position
        }
        handleDom()
        setTimeout(function() {
          if (that.socket.readyState == 1) {
            that.socket.send(
              JSON.stringify({
                logger: 'service.logger',
                target: that.host,
                position: that.position,
                port: that.port,
                filepath: that.filepath,
                user: that.serverMgData.user,
                password: crypto.encrypt(that.serverMgData.pasd)
              })
            )
          }
        }, 1000)
      }
    },
    goBack() {
      history.go(-1)
    }
  },
  beforeDestroy() {
    if (this.socket) {
      this.socket.close()
    }
  }
}
</script>

<style scoped>
.log-content {
  color: #ffffff !important;
  height: 120px;
  border: 1px solid #eee;
  background: RGBA(28, 32, 38, 0.9);
  padding: 15px;
  overflow: auto;
}
</style>
