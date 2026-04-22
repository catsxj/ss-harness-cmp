<template>
  <common-detail @goBack="goBack" :title="detail.name">
    <el-card slot="custom_content">
      <div class="build-container">
        <basic-form :model="data" ref="form" labelWidth="120px" style="width: 100%">
          <basic-form-item label="任务名称" prop="remark" validate="required" required-message="请输入任务名称">
            <el-input placeholder="请输入任务名称" v-model="data.remark"/>
          </basic-form-item>
          <basic-form-item v-if="type == '1'" label="标准文件" prop="standardFile" validate="required" required-message="请选择标准文件">
            <el-select placeholder="请选择标准文件" v-model="data.standardFile" filterable clearable>
              <el-option v-for="item in files" :key="item.id" :label="item.fileName" :value="item.id">
              </el-option>
            </el-select>
          </basic-form-item>
          <basic-form-item label="对比文件类型" prop="filePath" validate="required">
            <el-radio label="1" v-model="data.type">对比文件路径</el-radio>
            <el-input v-model="data.filePath"/>
            <span v-if="data.type == '2'">提示：只有在白名单中的命令才能进行对比</span>
          </basic-form-item>
          <basic-form-item v-if="type != '3'" label="对比类型" prop="typeStand">
            <el-radio label="2" v-model="data.typeStand">即时对比</el-radio>
            <el-radio label="1" v-model="data.typeStand">定时对比</el-radio>
          </basic-form-item>
          <!-- <basic-form-item label="执行方式：">
            <el-radio-group v-model="data.executeType" @change="executeChange()">
              <el-radio-button label="remote">Remote</el-radio-button>
              <el-radio-button label="saltStack">SaltStack</el-radio-button>
            </el-radio-group>
          </basic-form-item> -->
          <target-server v-if="data.executeType == 'remote' || data.executeType == 'saltStack'" ref="targetRef" label-width="120px" :hide-auth-way="data.executeType === 'saltStack'"></target-server>
          <agent-server v-else ref="targetRef" :itemData="itemList" :agent-type="data.executeType"></agent-server>
          <template v-if="data.typeStand == '1' || type == '3'">
            <basic-form-item label="周期" prop="daily">
              <el-radio-group v-model="data.daily" @change="dailyChange">
                <el-radio-button label="0">每天</el-radio-button>
                <el-radio-button label="1">每周</el-radio-button>
                <el-radio-button label="2">每月</el-radio-button>
              </el-radio-group>
            </basic-form-item>
            <basic-form-item label="开始时间" prop="startTime" validate="required" required-message="请选择开始时间">
              <el-select v-if="data.daily == '1'" v-model="data.day" style="margin-right: 10px;width: 40%">
                <el-option v-for="item in days" :key="item" :value="item" :label="item">
                </el-option>
              </el-select>
              <el-select v-if="data.daily == '2'" v-model="data.date" style="margin-right: 10px;width: 40%">
                <el-option v-for="item in 31" :key="item" :value="`${item}号`" :label="`${item}号`">
                </el-option>
              </el-select>
              <el-time-picker style="width: 40%"
                v-model="data.startTime"
                placeholder="任意时间点"
                format="HH:mm"
                value-format="HH:mm">
              </el-time-picker>
            </basic-form-item>
          </template>
          <basic-form-item style="textAlign: right;">
            <el-button type="primary" @click="create" :loading="cLoading">创建工单</el-button>
          </basic-form-item>
        </basic-form>
      </div>
    </el-card>
    <el-dialog title="请选择文件" :close-on-click-modal="false" v-if="dialogVisible"
      :visible.sync="dialogVisible" width="580px" append-to-body>
      <basic-form :model="data" ref="form">
        <basic-form-item label="文件" prop="file" validate="required" required-message="请选择文件">
          <el-input placeholder="请选择文件" v-model="importFile" readonly style="width: 80%;margin-right: 10px"/>
          <el-button type="primary" @click="$refs.selectFile.click()">浏览</el-button>
        </basic-form-item>
        <span style="font-size: 12px">注：请上传文件格式为txt的IP列表 eg:127.0.0.1（换行）146.240.110.1（换行）146.240.110.4</span>
      </basic-form>
      <input type="file" v-show="false" ref="selectFile" @change="handleImportFileChange">
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click.native="upload" :loading="loading">提交</el-button>
      </div>
    </el-dialog>
  </common-detail>
</template>

<script>
import axios from 'axios'
import { getStandardFiles, getCheckDeviceGroupList, getAllDeviceList, getDeviceGroupRelation, createCompare, createCrossCompare, createHistoryCompare } from 'services/task/compare'
import TargetServer from 'views/task/graph/targetServer/TargetServer.vue'
export default {
  props: {
    // 1: 标准对比 2: 跨机对比 3: 历史对比
    type: {
      type: String,
      default: '1'
    }
  },
  components: {
    TargetServer
    // TargetServer: () => import('./server/targetServer'),
    // AgentServer: () => import('views/bsm-cache/cmdbServer/agentServer')
  },
  data () {
    return {
      inspectType: 4,
      typechangeorderid: '1',
      detail: {
        name: '创建对比任务'
      },
      whoUse: '',
      itemList: {
        authenMode: 'SINGLE',
        sudo: true,
        identId: '',
        account: 'root',
        hostList: []
      },
      listQuery: {},
      selectedList: [],
      selectedList2: [],
      hostList: [],
      selectedGroupList: [],
      groupList: [],
      activeName: 'single',
      data: {
        executeType: 'remote',
        type: '1',
        typeStand: '2',
        standardFile: '',
        daily: '0',
        startTime: '00:00',
        day: '日',
        date: '1号',
        file: '',
        showChangeOrder: false,
        deviceID: '',
        remark: '',
        filePath: ''
      },
      files: [],
      days: ['日', '一', '二', '三', '四', '五', '六'],
      dialogVisible: false,
      loading: false,
      cLoading: false
    }
  },
  computed: {
    importFile () {
      const data = this.data.file
      if (data) { return data.name }
      return ''
    },
    tHostList () {
      const res = []
      const ids = []
      this.hostList.forEach(item => {
        ids.push(item.key)
        res.push(item)
      })
      this.selectedList2.forEach(item => {
        if (ids.indexOf(item.key) == -1) {
          res.push(item)
        }
      })
      return res
    }
  },
  mounted () {
    if (this.type === '3') {
      this.whoUse = 'historyCompare'
    }
    const list = { 1: '标准', 2: '跨机', 3: '历史' }
    if (this.type) {
      this.detail.name = `创建${list[this.type]}对比任务`
    }
    if (['1', '2'].includes(this.type)) {
      this.handleHostSearch()
      this.handleGroupSearch()
    }
    this.type == '1' && this.getFiles()
    this.type == '3' && this.handleHostSearch()
  },
  methods: {
    executeChange () {
      const targetRef = this.$refs.targetRef
      if (this.data.executeType == 'remote') {
        targetRef.setMode('SINGLE')
        this.itemList.sudo = true
      } else {
        targetRef.setMode('TRUST')
        this.itemList.sudo = false
      }
      this.itemList.identId = ''
      this.itemList.account = 'root'
      this.itemList.hostList = []
      this.itemList.executeType = this.data.executeType
    },
    hostChange (val) {
      const tmp = {}
      const res = []
      const keyList = [...val]
      for (const j of this.hostList) {
        tmp[j.key] = j
      }
      for (const i of this.selectedList2) {
        if (!tmp[i.key]) {
          tmp[i.key] = i
        }
      }
      keyList.forEach(item => {
        const shost = tmp[item] ? tmp[item] : { key: item, label: item }
        res.push(shost)
      })
      this.selectedList2 = res
    },
    getHostByGroupId (item) {
      this.groupList.forEach(group => {
        delete group.active
      })
      item.active = true
      getCheckDeviceGroupList({
        groupid: item.id
      }).then(data => {
        this.selectedGroupList = data.manageip.split(',').filter(x => x)
      })
    },
    getFiles () {
      getStandardFiles().then(data => {
        this.files = data || []
        if (this.files.length) {
          this.data.standardFile = this.files[0].id
        }
      })
    },
    handleHostSearch () {
      getAllDeviceList({
        deviceName: this.listQuery.deviceName,
        IP: this.listQuery.IP
      }).then(data => {
        this.hostList = data || []
        this.hostList.forEach(item => {
          item.key = item.deviceID + '--' + item.ip
          item.label = item.deviceName + '--' + item.ip
        })
        if (this.type == '3' && this.hostList.length > 0) {
          this.data.deviceID = this.hostList[0].key
        }
      })
    },
    handleGroupSearch () {
      getDeviceGroupRelation({
        groupname: this.listQuery.groupName
      }).then(data => {
        this.groupList = data || []
        this.groupList.forEach(item => {
          item.label = item.groupname
        })
      })
    },
    goBack (val) {
      this.$emit('goBack', val)
    },
    dailyChange () {
      this.data.startTime = '00:00'
      this.data.date = '1号'
      this.data.day = '日'
    },
    upload () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.loading = true
          const instance = axios.create({
            // baseURL: process.env.VUE_APP_BASEURL,
            timeout: 20000
          })
          const formData = new FormData()
          formData.append('textfield_choose', this.data.file.name)
          formData.append('file', this.data.file)
          formData.append('action', 'file')

          instance({
            url: 'api/cop/v1/compare/upload/ips',
            method: 'get',
            data: formData
          }).then(data => {
            const res = data.data
            if (res.success) {
              const strs = res.result[0].IPandIDStr.split(',').filter(x => x)
              const ids = []
              this.hostList.forEach(item => {
                ids.push(item.key)
              })
              for (const i of strs) {
                if (this.selectedList.indexOf(i) == -1) {
                  const index = ids.indexOf(i)
                  const target = index == -1 ? { key: i, label: i } : this.hostList[index]
                  this.selectedList.push(i)
                  this.selectedList2.push(target)
                }
              }
              // this.$notify.success(data.message)
              this.dialogVisible = false
            } else {
              this.$notify.error(res.message || '部分ip不正确')
            }
            this.loading = false
          })
        }
      })
    },
    fileMgt () {
      this.data.file = ''
      this.loading = false
      this.dialogVisible = true
    },
    handleImportFileChange (event) {
      if (!event.target.files || !event.target.files.length) {
        return
      }
      const file = event.target.files[0]
      const param = file.name
      const testBlank = /^[^\s]*$/
      if (!param) {
        this.$message.error('请选择文件上传')
        return
      }
      if (!testBlank.test(param)) {
        this.$message.error('文件名不能包含空格')
        return
      }
      this.data.file = file
      event.target.value = null
    },
    verifyHost () {
      if (this.type != '3') {
        const le = this.activeName == 'single' ? this.selectedList.length : this.selectedGroupList.length
        if (!le) {
          this.$message.error('请选择主机')
          return false
        }
        if (this.type == '2' && le < 2) {
          this.$message.error('请至少选择两个主机')
          return false
        }
      }
      return true
    },
    create () {
      // if (!this.verifyHost()) { return }
      const targetRef = this.$refs.targetRef
      const target = targetRef && targetRef.getPostData()
      this.$refs.form.validate((valid) => {
        if (valid && target) {
          if (!target.data.length) {
            this.$message.error('请选择服务器')
          } else {
            this.cLoading = true
            const _target = {
              executeType: this.data.executeType,
              ...target
            }
            if (this.data.executeType == 'remote' || this.data.executeType == 'saltStack') {
              // _target.authenMode = target.authenMode
              // _target.sudo = target.sudo
              // _target.identId = target.identId
            } else {
              _target.account = target.account
            }
            const params = {
              filePath: this.data.filePath,
              remark: this.data.remark,
              type: this.data.type,
              params: JSON.stringify(_target)
            }
            if (this.type == '1') {
              for (const i of this.files) {
                if (i.id == this.data.standardFile) {
                  params.standardFile = i.fileName
                  break
                }
              }
              params.clientName = window.location.hostname
            }
            if (this.type == '3') {
              params.startTime = this.getTime()
              if (this.typechangeorderid == '3' ||
                  (
                    this.typechangeorderid == '2' &&
                    this.data.showChangeOrder == '0'
                  )
              ) {
                params.changeOrderId = this.data.changeOrderId
              }
              params.deviceID = this.data.deviceID
            } else {
              if (this.data.typeStand == '1') {
                params.startTime = this.getTime()
              }
              if (this.activeName == 'single') {
                params.id = this.selectedList.join(',')
              } else {
                params.id = this.selectedGroupList.join(',')
              }
            }
            let http
            if (this.type == '1') {
              http = createCompare
            } else if (this.type == '3') {
              http = createHistoryCompare
            } else {
              http = createCrossCompare
            }
            http(params).then(data => {
              if (data.success) {
                this.$message({ message: '创建成功', type: 'success' })
                this.goBack(true)
              } else {
                this.$messae({ message: data.message, type: 'error' })
              }
            }).finally(_ => {
              this.cLoading = false
            })
          }
        }
      })
    },
    getTime () {
      let startTime = ''
      const time = this.data.startTime
      if (this.data.daily == '0') {
        startTime = `每天 ${time}`
      } else if (this.data.daily == '1') {
        startTime = `每周${this.data.day} ${time}`
      } else {
        startTime = `每月 ${this.data.date} ${time}`
      }
      return startTime
    }
  }
}
</script>

<style lang="scss" scoped>
.build-container {
  display: flex;
}
.compare-group {
  .group-panel {
    border: 1px solid #ebeef5;
    border-radius: 4px;
    overflow: hidden;
    background: #fff;
    display: inline-block;
    vertical-align: middle;
    width: 200px;
    max-height: 100%;
    box-sizing: border-box;
    position: relative;
  }
  .group-panel__header {
    height: 40px;
    line-height: 40px;
    background: #f5f7fa;
    margin: 0;
    padding-left: 15px;
    border-bottom: 1px solid #ebeef5;
    box-sizing: border-box;
    color: #000;
    font-size: 16px;
    font-weight: 400;
  }
  .group-panel__body {
    height: 246px;
  }
  .group-panel__list {
    margin: 0;
    list-style: none;
    height: 246px;
    overflow: auto;
    box-sizing: border-box;
    span {
      color: #606266;
      padding: 6px 0;
      height: 42px;
      line-height: 30px;
      padding-left: 15px;
      display: block;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: block;
      box-sizing: border-box
    }
    span:hover {
      cursor: pointer;
      color: #46abf1;
    }
    span.active {
      background: #fafafa;
    }
  }
  .group-panel__empty {
    margin: 0;
    height: 30px;
    line-height: 30px;
    padding: 6px 15px 0;
    color: #909399;
    text-align: center;
  }
}
</style>
