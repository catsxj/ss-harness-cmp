<template>
  <el-card>
    <div>
      <AdvanceTable :card-border="false" title="账单报表" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" @selection-change="handleSelectionChange">
        <template v-slot:action>
          <el-button type="ghost" @click="importData"> <i class="el-icon-upload2"></i> 导入 </el-button>
          <el-button type="ghost" :disabled="multipleSelection.length < 2" @click="handleMerge">合并账单</el-button>
        </template>
        <template #name="val, record">
          <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
        </template>
        <template #source="val, record">
          <!-- {{ record.source | billPlatform }} -->
          {{ record.source }}
        </template>
        <template #operate="val, record">
          <el-button type="text" @click="handleExport(record.id)"> <i class="el-icon-download"></i> 导出 </el-button>
          <div class="action-divider"></div>
          <el-button type="text" @click="remove(record.id)"> <i class="el-icon-delete"></i> 删除 </el-button>
        </template>
      </AdvanceTable>
    </div>
    <detail v-if="detailDialogVisible" :detailId="detailId" :detailSource="detailSource" :detailName="detailName" @goBack="goBackList"></detail>
    <ImportDialog :dialog="importDialog" v-if="importDialog.visible" ref="importDialog" @importClear="importClear" @refresh="getList"></ImportDialog>
  </el-card>
</template>

<script>
import crypto from 'utils/crypto.js'
import detail from './detail.vue'
import ImportDialog from './importDialog.vue'
import { environmentData } from '@/common/commonData'
import { createUser, modifyUser, removeUser, createAuth, removeAuth, getAuth } from 'services/task/server'
import { billList, exportBill, detailHost, patchHost, getDc, patchHosts, modifyHost, removeBill, getTaskServer, mergeBill } from 'services/platform/index'
import webSocket from '@/common/mixins/getGlobalSocket'

const detailSetting = {
  type: 'host'
  // columns: [
  //   [
  //     { name: '数据中心', value: 'dcname' },
  //     { name: '所属机房', value: 'roomname' },
  //     { name: '所属机柜', value: 'rackname' }
  //   ],
  //   [
  //     { name: '设备名称', value: 'name' },
  //     { name: '设备类别', value: 'category' },
  //     { name: '资产类别', value: 'assetCategory' }
  //   ],
  //   [
  //     { name: '服务IP', value: 'serviceIp' },
  //     { name: '管理IP', value: 'manageIp' },
  //     { name: '所属平台', value: 'vendorName' }
  //   ],
  //   [
  //     { name: '操作系统', value: 'os' },
  //     { name: '系统类别', value: 'osCategory' },
  //     { name: '主机名称', value: 'hostname' }
  //   ]
  // ]
}
const tagsData = ['NOPASSWD', 'PASSWD', 'NOEXEC', 'EXEC', 'SETENV', 'NOSETENV', 'LOG_INPUT', 'NOLOG_INPUT', 'LOG_OUTPUT', 'NOLOG_OUTPUT']
export default {
  mixins: [webSocket],
  components: {
    ImportDialog,
    detail
  },
  data() {
    return {
      detailSetting,
      environmentData,
      tagsData,
      // monthList: [
      //   {
      //     name: '一月份',
      //     label: '1'
      //   },
      //   {
      //     name: '二月份',
      //     label: '2'
      //   },
      //   {
      //     name: '三月份',
      //     label: '3'
      //   },
      //   {
      //     name: '四月份',
      //     label: '4'
      //   },
      //   {
      //     name: '五月份',
      //     label: '5'
      //   },
      //   {
      //     name: '六月份',
      //     label: '6'
      //   },
      //   {
      //     name: '七月份',
      //     label: '7'
      //   },
      //   {
      //     name: '八月份',
      //     label: '8'
      //   },
      //   {
      //     name: '九月份',
      //     label: '9'
      //   },
      //   {
      //     name: '十月份',
      //     label: '10'
      //   },
      //   {
      //     name: '十一月份',
      //     label: '11'
      //   },
      //   {
      //     name: '十二月份',
      //     label: '12'
      //   }
      // ],
      searchData: {
        // month: '',
      },
      columns: [
        {
          type: 'selection'
        },

        {
          label: '名称',
          prop: 'name',
          scopedSlots: { customRender: 'name' }
        },
        {
          label: '月份',
          prop: 'month'
        },

        {
          label: '创建时间',
          prop: 'gmtCreate'
        },
        {
          label: '账单来源',
          prop: 'source',
          scopedSlots: { customRender: 'source' }
        },
        {
          label: '创建人',
          prop: 'creatorName'
        },
        {
          label: '操作',
          disabled: true,
          width: '220px',
          scopedSlots: { customRender: 'operate' }
        }
      ],
      searchConfigs: [
        { label: '名称', value: 'name', type: 'Input' },
        {
          label: '月份',
          value: 'month',
          type: 'Select',
          data: [
            {
              name: '一月份',
              id: '1月份'
            },
            {
              name: '二月份',
              id: '2月份'
            },
            {
              name: '三月份',
              id: '3月份'
            },
            {
              name: '四月份',
              id: '4月份'
            },
            {
              name: '五月份',
              id: '5月份'
            },
            {
              name: '六月份',
              id: '6月份'
            },
            {
              name: '七月份',
              id: '7月份'
            },
            {
              name: '八月份',
              id: '8月份'
            },
            {
              name: '九月份',
              id: '9月份'
            },
            {
              name: '十月份',
              id: '10月份'
            },
            {
              name: '十一月份',
              id: '11月份'
            },
            {
              name: '十二月份',
              id: '12月份'
            }
          ]
        }
      ],
      importDialog: {
        visible: false
      },
      cryptedType: ['des', 'sha512', 'sha256', 'sha1'],
      groupDataList: [],
      dataCenterData: [],
      list: [],
      total: null,
      showDetail: false,
      listQuery: {
        name: '',
        type: '',
        manageIp: ''
      },
      loading: false,
      params: {
        page: 1,
        rows: 10
      },
      multipleSelection: [],
      idList: [],
      selectList: [],
      dialogFormVisible: false,
      detailDialogVisible: false,
      //        详情数据
      detailData: {
        server: {},
        config: {},
        assets: {},
        title: '机器详情',
        header: '基本信息'
      },
      // 用户配置
      isWindows: false,
      osCategory: '',
      userConfigVisible: false,
      userConfigData: { options: { become: true } },
      addUserData: {
        crypted_type: 'des'
      },
      delUserData: {},
      modifyUserData: {
        crypted_type: 'des'
      },
      setUserData: {},
      edit: {
        password: true,
        group: true,
        expires: true,
        shell: true
      },
      activeTitle: '',
      ids: [],
      detailId: '',
      detailSource: '',
      detailName: ''
    }
  },
  computed: {
    assetCategory() {
      return this.$route.name
    }
  },
  created() {
    // this.handleSearch()
    this.getList()
  },
  methods: {
    importClear() {
      this.getList()
    },
    handleExport(id) {
      exportBill(id)
    },
    getList() {
      this.loading = true
      billList(this.params)
        .then((data) => {
          if (data.success) {
            this.list = data.data.rows
            this.total = data.data.total
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    getDataCenter() {
      getDc({}).then((data) => {
        if (data.success) {
          this.dataCenterData = data.data.rows
        }
      })
    },
    reset(data) {
      this.$confirm('计划重装下发后，该机器将会移入裸金属服务器中，进行重新装机。确定下发?', '提示', {
        confirmButtonText: '确定',
        confirmButtonClass: 'el-button--primary',
        type: 'warning'
      }).then(() => {
        patchHost('reinstall', { id: data.id }).then((data) => {
          if (data.success) {
            this.$message.success({
              message: data.message,
              type: 'success'
            })
            this.getList()
          }
        })
      })
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        'name:EQ': `${this.searchData.name}`,
        'month:EQ': `${this.searchData.month}`
        // lkParam: {
        //   name: this.searchData.name,
        //   month: this.searchData.month
        // }
      })
      this.getList()
    },
    handleCreate(id) {
      if (id) {
        this.$router.push({ name: 'modifyHost', params: { id: id } })
      } else {
        this.$router.push({ name: 'CreateHost', params: {} })
      }
    },
    handleEdit(row) {
      this.editData = { ...row }
      this.editDialogVisible = true
    },
    editSubmit() {
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          modifyHost(this.editData).then((data) => {
            if (data.success) {
              this.$message.success(data.message)
              this.getList()
            }
          })
        }
      })
    },
    handleOpen($event, id) {
      this.$confirm('确定要启动物理主机？?', '提示', {
        confirmButtonText: '确定',
        confirmButtonClass: 'el-button--primary',
        type: 'warning'
      }).then(() => {
        patchHost('start', { id: id }).then((data) => {
          if (data.success) {
            this.$message.success({
              message: data.message,
              type: 'success'
            })
            this.getList()
          }
        })
      })
    },
    handleOpens($event, id) {
      let list = []
      this.refreshId()
      list = this.idList
      if (list.length == 0) {
        return this.$message.error('请选择主机')
      }
      this.$confirm('确定要启动物理主机？?', '提示', {
        confirmButtonText: '确定',
        confirmButtonClass: 'el-button--primary',
        type: 'warning'
      }).then(() => {
        patchHosts('start', list).then((data) => {
          if (data.success) {
            this.$message.success({
              message: data.message,
              type: 'success'
            })
            this.getList()
          }
        })
      })
    },
    handleStop($event, id) {
      this.$confirm('确定要停止物理主机？?', '提示', {
        confirmButtonText: '确定',
        confirmButtonClass: 'el-button--primary',
        type: 'warning'
      }).then(() => {
        patchHost('stop', { id: id }).then((data) => {
          if (data.success) {
            this.$message.success({
              message: data.message,
              type: 'success'
            })
            this.getList()
          }
        })
      })
    },
    handleStops($event, id) {
      let list = []
      this.refreshId()
      list = this.idList
      if (list.length == 0) {
        return this.$message.error('请选择主机')
      }
      this.$confirm('确定要停止物理主机？?', '提示', {
        confirmButtonText: '确定',
        confirmButtonClass: 'el-button--primary',
        type: 'warning'
      }).then(() => {
        patchHosts('stop', list).then((data) => {
          if (data.success) {
            this.$message.success({
              message: data.message,
              type: 'success'
            })
            this.getList()
          }
        })
      })
    },
    handleMerge() {
      mergeBill(this.ids).then((data) => {
        if (data.success) {
          this.$notify({
            message: data.message,
            type: 'success'
          })
          this.getList()
        }
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
      this.ids = []
      this.multipleSelection.forEach((item) => {
        this.ids.push(item.id)
      })
    },
    // 跳转详情页
    getDetail(rows) {
      this.detailId = rows.id
      this.detailSource = rows.source
      this.detailName = rows.name
      this.detailDialogVisible = true
    },
    goBackList() {
      this.detailDialogVisible = false
    },
    // 用户设置
    isEdit(attr) {
      this.edit[attr] = !this.edit[attr]
    },
    isSudo() {
      if (this.addUserData.userSudo) {
        this.addUserData.hosts = 'ALL'
        this.addUserData.operators = 'ALL'
        this.addUserData.commands = 'ALL'
        this.addUserData.tags = 'NOPASSWD'
      } else {
        delete this.addUserData.hosts
        delete this.addUserData.operators
        delete this.addUserData.commands
        delete this.addUserData.tags
      }
    },
    handleClick(tab) {
      switch (tab.name) {
        case 'delUser':
          this.delUserData = {}
          break
        case 'modifyUser':
          this.modifyUserData = {
            crypted_type: 'des'
          }
          if (this.isWindows) {
            this.$set(this.modifyUserData, 'password_expired', false)
          }
          this.edit = {
            password: true,
            group: true,
            expires: true,
            shell: true
          }
          break
        case 'setUser':
          this.setUserData = {
            hosts: 'ALL',
            operators: 'ALL',
            commands: 'ALL',
            tags: 'NOPASSWD',
            Content: ''
          }
          break
      }
    },
    handleUser(id, osCategory) {
      if (osCategory) {
        this.osCategory = osCategory.toLocaleUpperCase()
      }
      this.userConfigData = { user: '', pasd: '', port: '', options: { become: true } }
      this.addUserData = {
        tags: null,
        crypted_type: 'des'
      }
      this.activeTitle = 'addUser'
      if (this.osCategory == 'WINDOWS') {
        this.isWindows = true
      } else {
        this.isWindows = false
      }
      if (this.isWindows) {
        this.$set(this.addUserData, 'password_expired', false)
      }
      // 获取机器详情
      detailHost(id).then((data) => {
        if (data.success) {
          this.userConfigData.user = data.data.config.username
          this.userConfigData.pasd = data.data.config.password
          this.userConfigData.port = data.data.config.sshPort
          this.userConfigData.category = data.data.osCategory
          this.userConfigData.host = data.data.manageIp
          this.userConfigData.sudo = true
          this.userConfigVisible = true
        }
      })
    },
    userConfigSubmit() {
      switch (this.activeTitle) {
        case 'addUser':
          this.addUser()
          break
        case 'delUser':
          this.delUser()
          break
        case 'modifyUser':
          this.modifyUser()
          break
        case 'setUser':
          this.setUser()
          break
      }
    },
    addUser() {
      this.$refs.userConfigData.validate((valid) => {
        if (valid) {
          this.$refs.addUserData.validate((valid) => {
            if (valid) {
              if (this.addUserData.password != this.addUserData.repassword) {
                return this.$message({
                  message: '两次密码输入不一致',
                  type: 'error'
                })
              }

              const edit1 = ['category', 'pasd', 'sudo', 'host', 'user', 'port']
              let edit2
              if (this.isWindows) {
                edit2 = ['userName', 'description', 'password', 'group', 'password_expired', 'shell', 'userSudo', 'hosts', 'operators', 'commands', 'tags', 'comment']
              } else {
                edit2 = ['userName', 'description', 'password', 'group', 'expires', 'shell', 'userSudo', 'hosts', 'operators', 'commands', 'tags', 'comment']
              }
              const addUserData = { targets: [{}] }
              edit1.forEach((attr) => {
                addUserData.targets[0][attr] = this.userConfigData[attr] || ''
              })
              edit2.forEach((attr) => {
                if (attr == 'userSudo') {
                  this.addUserData[attr] = Boolean(this.addUserData[attr])
                }
                addUserData[attr] = this.addUserData[attr]
              })
              if (addUserData.targets[0].pasd) {
                addUserData.targets[0].pasd = crypto.encrypt(addUserData.targets[0].pasd)
              }
              if (addUserData.password) {
                addUserData.password = crypto.encrypt(addUserData.password)
              }
              if (!addUserData.tags) {
                delete addUserData.tags
              }
              if (!this.isWindows) {
                const tag = Boolean(this.userConfigData.options.become)
                if (tag) {
                  addUserData.options = {}
                  addUserData.options.become = true
                } else {
                  addUserData.options = {}
                  addUserData.options.become = false
                }
              }
              if (this.osCategory == 'AIX') {
                addUserData.crypted_type = this.addUserData.crypted_type
              }
              createUser(addUserData).then((data) => {
                if (data.success) {
                  this.$notify({
                    message: data.message,
                    type: 'success'
                  })
                  this.userConfigVisible = false
                  this.getList()
                }
              })
            }
          })
        }
      })
    },
    delUser() {
      this.$refs.userConfigData.validate((valid) => {
        if (valid) {
          this.$refs.delUserData.validate((valid) => {
            if (valid) {
              const edit1 = ['category', 'pasd', 'sudo', 'host', 'user', 'port']
              const edit2 = ['userName', 'force']
              const delUserData = { targets: [{}] }
              edit1.forEach((attr) => {
                delUserData.targets[0][attr] = this.userConfigData[attr] || ''
              })
              edit2.forEach((attr) => {
                if (attr == 'force') {
                  this.delUserData[attr] = Boolean(this.delUserData[attr])
                }
                delUserData[attr] = this.delUserData[attr]
              })
              if (delUserData.targets[0].pasd) {
                delUserData.targets[0].pasd = crypto.encrypt(delUserData.targets[0].pasd)
              }
              if (!this.isWindows) {
                const tag = Boolean(this.userConfigData.options.become)
                if (tag) {
                  delUserData.options = {}
                  delUserData.options.become = true
                } else {
                  delUserData.options = {}
                  delUserData.options.become = false
                }
              }
              removeUser(delUserData).then((data) => {
                if (data.success) {
                  this.$notify({
                    message: data.message,
                    type: 'success'
                  })
                  this.userConfigVisible = false
                  this.getList()
                }
              })
            }
          })
        }
      })
    },
    modifyUser() {
      this.$refs.userConfigData.validate((valid) => {
        if (valid) {
          this.$refs.modifyUserData.validate((valid) => {
            if (valid) {
              if (this.modifyUserData.repassword && this.modifyUserData.password != this.modifyUserData.repassword) {
                return this.$message({
                  message: '两次密码输入不一致',
                  type: 'error'
                })
              }
              const edit1 = ['category', 'pasd', 'sudo', 'host', 'user', 'port']
              let edit2
              if (this.isWindows) {
                edit2 = ['userName', 'description', 'password', 'group', 'password_expired', 'shell']
              } else {
                edit2 = ['userName', 'description', 'password', 'group', 'expires', 'shell']
              }
              const modifyUserData = { targets: [{}] }
              edit1.forEach((attr) => {
                modifyUserData.targets[0][attr] = this.userConfigData[attr] || ''
              })
              edit2.forEach((attr) => {
                modifyUserData[attr] = this.modifyUserData[attr]
              })
              if (modifyUserData.targets[0].pasd) {
                modifyUserData.targets[0].pasd = crypto.encrypt(modifyUserData.targets[0].pasd)
              }
              if (modifyUserData.password) {
                modifyUserData.password = crypto.encrypt(modifyUserData.password)
              }
              if (!this.isWindows) {
                const tag = Boolean(this.userConfigData.options.become)
                if (tag) {
                  modifyUserData.options = {}
                  modifyUserData.options.become = true
                } else {
                  modifyUserData.options = {}
                  modifyUserData.options.become = false
                }
              }
              if (this.osCategory == 'AIX') {
                modifyUserData.crypted_type = this.modifyUserData.crypted_type
              }
              modifyUser(modifyUserData).then((data) => {
                if (data.success) {
                  this.$notify({
                    message: data.message,
                    type: 'success'
                  })
                  this.userConfigVisible = false
                  this.getList()
                }
              })
            }
          })
        }
      })
    },
    setUser() {
      this.$refs.userConfigData.validate((valid) => {
        if (valid) {
          this.$refs.setUserData.validate((valid) => {
            if (valid) {
              const edit1 = ['category', 'pasd', 'sudo', 'host', 'user', 'port']
              const edit2 = ['userName', 'hosts', 'operators', 'commands', 'tags', 'comment']
              const setUserData = { targets: [{}] }
              edit1.forEach((attr) => {
                setUserData.targets[0][attr] = this.userConfigData[attr] || ''
              })
              edit2.forEach((attr) => {
                setUserData[attr] = this.setUserData[attr]
              })
              if (setUserData.targets[0].pasd) {
                setUserData.targets[0].pasd = crypto.encrypt(setUserData.targets[0].pasd)
              }
              if (!this.isWindows) {
                const tag = Boolean(this.userConfigData.options.become)
                if (tag) {
                  setUserData.options = {}
                  setUserData.options.become = true
                } else {
                  setUserData.options = {}
                  setUserData.options.become = false
                }
              }
              createAuth(setUserData).then((data) => {
                if (data.success) {
                  this.$notify({
                    message: data.message,
                    type: 'success'
                  })
                  this.userConfigVisible = false
                  this.getList()
                }
              })
            }
          })
        }
      })
    },
    handleSearchAuth() {
      const that = this
      this.$refs.userConfigData.validate((valid) => {
        if (valid) {
          this.$refs.setUserData.validate((valid) => {
            if (valid) {
              const edit1 = ['category', 'pasd', 'sudo', 'host', 'user', 'port']
              const setUserData = { targets: [{}] }
              edit1.forEach((attr) => {
                setUserData.targets[0][attr] = that.userConfigData[attr] || ''
              })
              if (setUserData.targets[0].pasd) {
                setUserData.targets[0].pasd = crypto.encrypt(setUserData.targets[0].pasd)
              }
              setUserData.userName = that.setUserData.userName
              if (!this.isWindows) {
                const tag = Boolean(that.userConfigData.options.become)
                if (tag) {
                  setUserData.options = {}
                  setUserData.options.become = true
                } else {
                  setUserData.options = {}
                  setUserData.options.become = false
                }
              }
              getAuth(setUserData).then((data) => {
                if (data.success) {
                  that.setUserData.Content = data.data.content
                  if (!that.setUserData.Content) {
                    that.$message({
                      message: '# 查找对象没有配置sudo权限或者不存在',
                      type: 'info'
                    })
                  }
                }
              })
            }
          })
        }
      })
    },
    // 删除权限
    delUserAuth() {
      this.$refs.userConfigData.validate((valid) => {
        if (valid) {
          this.$refs.setUserData.validate((valid) => {
            if (valid) {
              this.$confirm('您确定要删除此权限吗?', '提示', {
                confirmButtonClass: 'el-button--danger',
                type: 'warning'
              }).then(() => {
                const edit1 = ['category', 'pasd', 'sudo', 'host', 'user', 'port']
                const edit2 = ['userName']
                const setUserData = { targets: [{}] }
                edit1.forEach((attr) => {
                  setUserData.targets[0][attr] = this.userConfigData[attr] || ''
                })
                edit2.forEach((attr) => {
                  setUserData[attr] = this.setUserData[attr]
                })
                if (setUserData.targets[0].pasd) {
                  setUserData.targets[0].pasd = crypto.encrypt(setUserData.targets[0].pasd)
                }
                if (!this.isWindows) {
                  const tag = Boolean(this.userConfigData.options.become)
                  if (tag) {
                    setUserData.options = {}
                    setUserData.options.become = true
                  } else {
                    setUserData.options = {}
                    setUserData.options.become = false
                  }
                }
                removeAuth(setUserData).then((data) => {
                  if (data.success) {
                    this.$notify({
                      message: data.message,
                      type: 'success'
                    })
                    this.userConfigVisible = false
                    this.getList()
                  }
                })
              })
            }
          })
        }
      })
    },
    remove(id) {
      this.$confirm('确定要删除账单?', '提示', {
        confirmButtonText: '确定',
        confirmButtonClass: 'el-button--primary',
        type: 'warning'
      }).then(() => {
        removeBill(id).then((data) => {
          if (data.success) {
            this.$message.success({
              message: data.message,
              type: 'success'
            })
            this.getList()
          }
        })
      })
    },
    // 服务
    handleServer(id, osCategory) {
      let OC = null
      if (osCategory) {
        OC = osCategory.toLocaleUpperCase()
      }
      this.$router.push({ name: 'serverConfig', params: { id: id, type: 'pm', osCategory: OC } })
    },
    // 导入数据
    importData() {
      this.importDialog = {
        visible: true
      }
    },
    goMonitor(id) {
      this.$router.push({
        name: ''
      })
    }
  }
}
</script>
