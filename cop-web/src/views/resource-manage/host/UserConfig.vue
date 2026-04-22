<template>
  <div>
    <!--用户配置界面-->
    <el-dialog title="用户配置" :close-on-click-modal="false" v-if="userConfig.visible" :visible.sync="userConfig.visible" width="60%">
      <el-row>
        <basic-form :model="userConfigData" label-width="100px" ref="userConfigData">
          <el-col :span="24">
            <el-col :span="6">
              <basic-form-item label="认证用户名" prop="user" :rules="[required]">
                <el-input v-model="userConfigData.user" auto-complete="off"></el-input>
              </basic-form-item>
            </el-col>
            <el-col :span="6">
              <basic-form-item label="认证密码" prop="pasd" :rules="[required]">
                <el-input type="password" v-model="userConfigData.pasd" auto-complete="new-password"></el-input>
              </basic-form-item>
            </el-col>
            <el-col :span="6">
              <basic-form-item label="端口：" prop="port" :rules="[portRequired]">
                <el-tooltip class="item" :content="`默认端口为${isWindows ? 5986 : 22}`" placement="top" effect="light">
                  <el-input-number v-model="userConfigData.port" controls-position="right" :precision="0" :min="1" :max="65535"></el-input-number>
                </el-tooltip>
              </basic-form-item>
            </el-col>
            <el-col :span="6">
              <el-checkbox class="m-l-lg" v-if="!isWindows" v-model="userConfigData.options.become">是否SUDO </el-checkbox>
            </el-col>
          </el-col>
        </basic-form>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-tabs v-model="activeTitle" @tab-click="handleClick">
            <el-tab-pane label="新增用户" name="addUser">
              <basic-form v-if="activeTitle == 'addUser'" :model="addUserData" label-width="120px" ref="addUserData">
                <el-row>
                  <el-col :span="12">
                    <basic-form-item label="用户名称：" prop="userName" :rules="[required, specialNoChinese, noOnlyNum]">
                      <el-input v-model="addUserData.userName" :maxlength="32" auto-complete="off"></el-input>
                    </basic-form-item>
                  </el-col>
                  <el-col :span="12">
                    <basic-form-item label="用户描述：" prop="description">
                      <el-input v-model="addUserData.description" auto-complete="off"></el-input>
                    </basic-form-item>
                  </el-col>
                  <el-col :span="12">
                    <basic-form-item label="密码：" prop="password" :rules="[required]">
                      <el-input type="password" v-model="addUserData.password" auto-complete="new-password"></el-input>
                    </basic-form-item>
                  </el-col>
                  <el-col :span="12">
                    <basic-form-item label="密码确认：" prop="repassword" :rules="[required]">
                      <el-input type="password" v-model="addUserData.repassword" auto-complete="new-password"></el-input>
                    </basic-form-item>
                  </el-col>
                  <el-col :span="24" v-if="osCategory == 'AIX'">
                    <el-col :span="12">
                      <basic-form-item label="加密方式：" prop="crypted_type">
                        <el-select v-model="addUserData.crypted_type" placeholder="加密方式">
                          <el-option v-for="(item, key) in cryptedType" :key="key" :label="item" :value="key"> </el-option>
                        </el-select>
                      </basic-form-item>
                    </el-col>
                  </el-col>
                  <el-col :span="12">
                    <basic-form-item label="用户组：" prop="group" :rules="[specialNoChinese]">
                      <el-input v-model="addUserData.group" auto-complete="off"></el-input>
                    </basic-form-item>
                  </el-col>
                  <el-col :span="12" v-if="!isWindows">
                    <basic-form-item label="过期时间：" prop="expires">
                      <el-date-picker style="width: 100%" v-model="addUserData.expires" type="date" placeholder="选择日期" format="yyyy/MM/dd" value-format="yyyy/MM/dd"> </el-date-picker>
                    </basic-form-item>
                  </el-col>
                  <el-col :span="12" v-else>
                    <basic-form-item label="账户是否到期：" prop="password_expired">
                      <el-radio v-model="addUserData.password_expired" :label="true">到期</el-radio>
                      <el-radio v-model="addUserData.password_expired" :label="false">不到期</el-radio>
                    </basic-form-item>
                  </el-col>
                  <el-col :span="12" v-if="!isWindows">
                    <basic-form-item label="shell设置：" prop="shell" :rules="[headSlash]">
                      <el-input v-model="addUserData.shell" auto-complete="off"></el-input>
                    </basic-form-item>
                  </el-col>
                  <el-col :span="24">
                    <basic-form-item>
                      <el-checkbox v-if="!isWindows" v-model="addUserData.userSudo" @change="isSudo">是否SUDO </el-checkbox>
                    </basic-form-item>
                  </el-col>
                  <div v-if="addUserData.userSudo">
                    <el-col :span="24">
                      <el-col :span="12">
                        <basic-form-item label="主机名：" prop="hosts">
                          <el-input v-model="addUserData.hosts" auto-complete="off"></el-input>
                        </basic-form-item>
                      </el-col>
                      <el-col :span="12">
                        <basic-form-item label="操作者：" prop="operators">
                          <el-input v-model="addUserData.operators" auto-complete="off"></el-input>
                        </basic-form-item>
                      </el-col>
                    </el-col>
                    <el-col :span="24">
                      <el-col :span="12">
                        <basic-form-item label="命令：" prop="commands">
                          <el-input v-model="addUserData.commands" auto-complete="off"></el-input>
                        </basic-form-item>
                      </el-col>
                      <el-col :span="12">
                        <basic-form-item label="标签：" prop="tags">
                          <el-select clearable v-model="addUserData.tags" placeholder="请选择标签">
                            <el-option v-for="(item, index) in tagsData" :key="index" :label="item" :value="item"></el-option>
                          </el-select>
                        </basic-form-item>
                      </el-col>
                    </el-col>
                    <el-col :span="24">
                      <basic-form-item label="注释：" prop="comment" :rules="[notChinese]">
                        <el-input type="textarea" v-model="addUserData.comment" auto-complete="off" :rules="[notChinese]"></el-input>
                      </basic-form-item>
                    </el-col>
                  </div>
                </el-row>
              </basic-form>
            </el-tab-pane>
            <el-tab-pane label="删除用户" name="delUser">
              <basic-form v-if="activeTitle == 'delUser'" :model="delUserData" label-width="100px" ref="delUserData">
                <el-row>
                  <el-col :span="12">
                    <basic-form-item label="用户名称：" prop="userName" :rules="[required, specialNoChinese, noOnlyNum]">
                      <el-input v-model="delUserData.userName" auto-complete="off"></el-input>
                    </basic-form-item>
                  </el-col>
                  <el-col :span="12" v-if="!isWindows">
                    <basic-form-item>
                      <el-checkbox v-model="delUserData.force">强制删除</el-checkbox>
                    </basic-form-item>
                  </el-col>
                </el-row>
              </basic-form>
            </el-tab-pane>
            <el-tab-pane label="修改用户" name="modifyUser">
              <basic-form v-if="activeTitle == 'modifyUser'" :model="modifyUserData" label-width="100px" ref="modifyUserData">
                <el-row>
                  <el-col :span="12">
                    <basic-form-item label="用户名称：" prop="userName" :rules="[required, specialNoChinese, noOnlyNum]">
                      <el-input v-model="modifyUserData.userName" auto-complete="off"></el-input>
                    </basic-form-item>
                  </el-col>
                  <el-col :span="12">
                    <basic-form-item label="用户描述：" prop="description">
                      <el-input v-model="modifyUserData.description" auto-complete="off"></el-input>
                    </basic-form-item>
                  </el-col>
                  <el-col :span="24">
                    <el-col :span="12">
                      <basic-form-item label="密码：" prop="password" :rules="[required]">
                        <el-input style="width: 180px" type="password" :disabled="edit.password" v-model="modifyUserData.password" auto-complete="new-password"></el-input>
                        <i class="el-icon-edit m-l-sm" @click="isEdit('password')"></i>
                      </basic-form-item>
                    </el-col>
                    <el-col :span="12" v-if="!edit.password">
                      <basic-form-item label="密码确认：" prop="repassword" :rules="[required]">
                        <el-input v-model="modifyUserData.repassword" type="password" auto-complete="new-password"></el-input>
                      </basic-form-item>
                    </el-col>
                  </el-col>
                  <el-col :span="24" v-if="osCategory == 'AIX'">
                    <el-col :span="12" v-show="!edit.password">
                      <basic-form-item label="加密方式：" prop="crypted_type">
                        <el-select v-model="modifyUserData.crypted_type">
                          <el-option v-for="(item, key) in cryptedType" :key="key" :label="item" :value="key"> </el-option>
                        </el-select>
                      </basic-form-item>
                    </el-col>
                  </el-col>
                  <el-col :span="12">
                    <basic-form-item label="用户组：" prop="group" :rules="[specialNoChinese]">
                      <el-input style="width: 180px" :disabled="edit.group" v-model="modifyUserData.group" auto-complete="off"></el-input>
                      <i class="el-icon-edit m-l-sm" @click="isEdit('group')"></i>
                    </basic-form-item>
                  </el-col>
                  <el-col :span="12" v-if="!isWindows" key="1">
                    <basic-form-item label="过期时间：" prop="expires">
                      <el-date-picker style="width: 180px" :disabled="edit.expires" v-model="modifyUserData.expires" type="date" placeholder="选择日期" format="yyyy/MM/dd" value-format="yyyy/MM/dd">
                      </el-date-picker>
                      <i class="el-icon-edit m-l-sm" @click="isEdit('expires')"></i>
                    </basic-form-item>
                  </el-col>
                  <el-col :span="12" v-else key="2">
                    <basic-form-item label="账户是否到期：" prop="password_expired">
                      <el-radio v-model="modifyUserData.password_expired" :label="true">到期</el-radio>
                      <el-radio v-model="modifyUserData.password_expired" :label="false">不到期</el-radio>
                    </basic-form-item>
                  </el-col>
                  <el-col :span="12" v-if="!isWindows">
                    <basic-form-item label="shell设置：" prop="shell" :rules="[headSlash]">
                      <el-input style="width: 180px" :disabled="edit.shell" v-model="modifyUserData.shell" auto-complete="off"></el-input>
                      <i class="el-icon-edit m-l-sm" @click="isEdit('shell')"></i>
                    </basic-form-item>
                  </el-col>
                </el-row>
              </basic-form>
            </el-tab-pane>
            <el-tab-pane label="权限设置" name="setUser" v-if="!isWindows">
              <basic-form v-if="activeTitle == 'setUser'" :model="setUserData" label-width="100px" ref="setUserData">
                <el-row>
                  <el-col :span="18">
                    <basic-form-item label="用户名称：" prop="userName" :rules="[required, specialNoChinese]">
                      <el-input v-model="setUserData.userName" auto-complete="off" placeholder="如果是一个用户组名称，请在名称前增加%。例如：%groupname"></el-input>
                    </basic-form-item>
                  </el-col>
                  <el-col :span="5" :offset="1">
                    <el-button type="ghost" @click="handleSearchAuth">查看</el-button>
                  </el-col>
                  <el-col :span="24">
                    <basic-form-item>
                      <el-tag>如果是一个用户组名称，请在名称前增加%。例如：%groupname</el-tag>
                    </basic-form-item>
                  </el-col>
                  <el-col :span="24">
                    <basic-form-item>
                      <div class="authorityBox">{{ setUserData.Content }}</div>
                    </basic-form-item>
                  </el-col>
                </el-row>
                <el-row style="margin-left: 100px; border: 1px solid #cccccc; padding: 10px">
                  <el-col :span="24">
                    <el-col :span="12">
                      <basic-form-item label="主机名：" prop="hosts">
                        <el-input v-model="setUserData.hosts" auto-complete="off"></el-input>
                      </basic-form-item>
                    </el-col>
                    <el-col :span="12">
                      <basic-form-item label="操作者：" prop="operators">
                        <el-input v-model="setUserData.operators" auto-complete="off"></el-input>
                      </basic-form-item>
                    </el-col>
                  </el-col>
                  <el-col :span="24">
                    <el-col :span="12">
                      <basic-form-item label="命令：" prop="commands">
                        <el-input v-model="setUserData.commands" auto-complete="off"></el-input>
                      </basic-form-item>
                    </el-col>
                    <el-col :span="12">
                      <basic-form-item label="标签：" prop="tags">
                        <el-select clearable v-model="setUserData.tags" placeholder="请选择标签">
                          <el-option v-for="(item, index) in tagsData" :key="index" :label="item" :value="item"></el-option>
                        </el-select>
                      </basic-form-item>
                    </el-col>
                  </el-col>
                  <el-col :span="24">
                    <basic-form-item label="注释：" prop="comment" :rules="[notChinese]">
                      <el-input type="textarea" v-model="setUserData.comment" auto-complete="off" :rules="[notChinese]"></el-input>
                    </basic-form-item>
                  </el-col>
                </el-row>
              </basic-form>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="userConfig.visible = false">取消</el-button>
        <el-button type="primary" @click.native="userConfigSubmit">确定</el-button>
        <el-button v-if="activeTitle == 'setUser'" type="danger" @click.native="delUserAuth">删除权限</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import validate from '@/validate/index'
import { createUser, modifyUser, removeUser, createAuth, removeAuth, getAuth } from 'services/task/server'
import crypto from 'utils/crypto.js'
export default {
  props: {
    userConfig: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      notChinese: validate.notChinese,
      required: validate.required,
      noOnlyNum: validate.noOnlyNum,
      specialNoChinese: { pattern: /^[\w%\-+._]{1,}$/, message: '不能输入中文和除.+=_空格外的其他特殊字符' },
      headSlash: { pattern: /^\/.{0,}$/, message: '须以/开头' },
      portRequired: { required: true, message: '请输入', trigger: ['change', 'blur'] },
      tagsData: ['NOPASSWD', 'PASSWD', 'NOEXEC', 'EXEC', 'SETENV', 'NOSETENV', 'LOG_INPUT', 'NOLOG_INPUT', 'LOG_OUTPUT', 'NOLOG_OUTPUT'],
      cryptedType: ['des', 'sha512', 'sha256', 'sha1'],
      // 用户配置
      isWindows: false,
      osCategory: '',
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
      modifyData: {
        dialog: false,
        data: {}
      },
      setConfigData: {
        dialog: false,
        data: {}
      }
    }
  },
  created() {
    if (this.userConfig.osCategory) {
      this.osCategory = this.userConfig.osCategory.toLocaleUpperCase()
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
    this.userConfigData.user = ''
    this.userConfigData.pasd = ''
    this.userConfigData.port = this.isWindows ? 5986 : 22
    this.userConfigData.category = this.userConfig.osCategory
    this.userConfigData.segmentId = this.userConfig.segmentId
    this.userConfigData.host = this.userConfig.ip
    this.userConfigData.sudo = true
  },
  methods: {
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

              const edit1 = ['category', 'pasd', 'sudo', 'host', 'user', 'port', 'segmentId']
              let edit2
              if (this.isWindows) {
                edit2 = ['userName', 'description', 'password', 'group', 'password_expired', 'shell', 'userSudo', 'hosts', 'operators', 'commands', 'tags', 'comment', 'segmentId']
              } else {
                edit2 = ['userName', 'description', 'password', 'group', 'expires', 'shell', 'userSudo', 'hosts', 'operators', 'commands', 'tags', 'comment', 'segmentId']
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
                  this.userConfig.visible = false
                  this.$emit('back')
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
              const edit1 = ['category', 'pasd', 'sudo', 'host', 'user', 'port', 'segmentId']
              const edit2 = ['userName', 'force', 'segmentId']
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
                  this.userConfig.visible = false
                  this.$emit('back')
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
              const edit1 = ['category', 'pasd', 'sudo', 'host', 'user', 'port', 'segmentId']
              let edit2
              if (this.isWindows) {
                edit2 = ['userName', 'description', 'password', 'group', 'password_expired', 'shell', 'segmentId']
              } else {
                edit2 = ['userName', 'description', 'password', 'group', 'expires', 'shell', 'segmentId']
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
                  this.userConfig.visible = false
                  this.$emit('back')
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
              const edit1 = ['category', 'pasd', 'sudo', 'host', 'user', 'port', 'segmentId']
              const edit2 = ['userName', 'hosts', 'operators', 'commands', 'tags', 'comment', 'segmentId']
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
                  this.userConfig.visible = false
                  this.$emit('back')
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
              const edit1 = ['category', 'pasd', 'sudo', 'host', 'user', 'port', 'segmentId']
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
              const params = {
                become: setUserData.options.become,
                category: setUserData.targets[0].category,
                pasd: setUserData.targets[0].pasd,
                sudo: setUserData.targets[0].sudo,
                host: setUserData.targets[0].host,
                user: setUserData.targets[0].user,
                port: setUserData.targets[0].port,
                segmentId: setUserData.targets[0].segmentId,
                userName: setUserData.userName
              }
              getAuth(params).then((data) => {
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
                const edit1 = ['category', 'pasd', 'sudo', 'host', 'user', 'port', 'segmentId']
                const edit2 = ['userName', 'segmentId']
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
                    this.userConfig.visible = false
                    this.$emit('back')
                  }
                })
              })
            }
          })
        }
      })
    }
  }
}
</script>

<style>
</style>
