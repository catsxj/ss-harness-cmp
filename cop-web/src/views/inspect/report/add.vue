<template>
  <div class="addEventPush">
    <common-detail @goBack="back" :title="dialog.title">
      <div slot="detail_header" class="pull-right">
        <el-button type="primary" size="mini" @click="save" v-if="!dialog.isView">提交</el-button>
        <el-button size="mini" @click="back">{{ dialog.isView ? '关闭' : '取消' }}</el-button>
      </div>
      <template #item_container>
        <div class="detail-content">
          <el-form :disabled="dialog.isView" ref="form" v-loading="loading" element-loading-text="拼命加载中" element-loading-spinner="el-icon-loading" class="form" :model="addData" label-width="150px" label-position="right">
            <el-row :gutter="20">
              <el-col :span="18">
                <el-form-item label="报表名称：" prop="name" :rules="rules" required>
                  <el-input v-model.trim="addData.name" :maxlength="32" show-word-limit></el-input>
                </el-form-item>
              </el-col>
              <!-- <el-col :span="18">
                <basic-form-item label="报表类型：" prop="type" validate="required">
                  <el-radio-group v-model="addData.type" :disabled="!!dialog.id">
                    <el-radio v-for="item in typeList" :label="item.value" :key="item.value" border>{{item.name}}</el-radio>
                  </el-radio-group>
                </basic-form-item>
              </el-col> -->
              <!-- 报表模板 -->
              <template v-if="addData.type === 'template'">
                <el-col :span="18">
                  <basic-form-item label="报表模板：" prop="template" validate="required">
                    <el-select v-model="addData.template" placeholder="选择报表模板" clearable filterable>
                      <el-option v-for="item in templateList" :key="item.code" :label="item.name" :value="item.code"> </el-option>
                    </el-select>
                  </basic-form-item>
                </el-col>
              </template>
              <template v-if="addData.type === 'custom'">
                <el-col :span="18">
                  <el-form-item label="巡检分类：" prop="inspectType" :rules="rules" required>
                    <el-select v-model="addData.inspectType" filterable @change="getInspectList">
                      <el-option v-for="item in inspectTypeList" :key="item.code" :label="item.name" :value="item.code"> </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="18">
                  <el-form-item label="巡检名称：" prop="inspectId" :rules="rules" required>
                    <el-select v-model="addData.inspectId" filterable @change="getInspectDetail">
                      <el-option v-for="item in inspectList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </template>
              <el-col :span="18">
                <basic-form-item label="报表周期：" prop="period" validate="required">
                  <el-radio-group v-model="addData.period" @change="initTimeSet">
                    <el-radio v-for="item in cycle" :label="item.code" :key="item.code">{{ item.name }}</el-radio>
                  </el-radio-group>
                </basic-form-item>
              </el-col>
              <el-col :span="18">
                <!-- 周期时间设置 -->
                <time-set ref="paramSet" :itemData="addData" :dialog="dialog"></time-set>
              </el-col>
              <el-col :span="18">
                <basic-form-item label="报表状态：" prop="status" validate="required">
                  <el-radio-group v-model="addData.status">
                    <el-radio v-for="item in status" :label="item.code" :key="item.code" border>{{ item.name }}</el-radio>
                  </el-radio-group>
                </basic-form-item>
              </el-col>
              <!-- 报表模板 -->
              <template v-if="addData.type === 'template'">
                <el-col :span="18">
                  <el-form-item label="报表标题：" prop="title" :rules="rules" required>
                    <el-input v-model.trim="addData.title" :maxlength="32" show-word-limit></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="22">
                  <el-form-item required>
                    <CardLayout title="列表信息">
                      <template-list :itemData="addData" :inspectTypeList="inspectTypeList"></template-list>
                    </CardLayout>
                  </el-form-item>
                </el-col>
              </template>
              <!-- 自定义报表 -->
              <template v-if="addData.type === 'custom'">
                <el-col :span="18">
                  <el-form-item label="报表标题：" prop="title" :rules="rules" required>
                    <el-input v-model.trim="addData.title" :maxlength="32" show-word-limit></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="18">
                  <el-form-item required>
                    <CardLayout title="基础信息">
                      <param-base :itemData="addData"></param-base>
                    </CardLayout>
                  </el-form-item>
                </el-col>
                <el-col :span="22">
                  <el-form-item required>
                    <CardLayout title="列表信息">
                      <param-list :itemData="addData" :itemList="itemList" :ipList="ipList" :warnList="warnList"></param-list>
                    </CardLayout>
                  </el-form-item>
                </el-col>
              </template>
              <el-col :span="18">
                <el-row :gutter="20" type="flex">
                  <el-col>
                    <basic-form-item label="报表订阅：" validate="required">
                      <el-cascader v-model="addData.departIds" :options="options2" :props="props" @change="getDepartData"> </el-cascader>
                    </basic-form-item>
                  </el-col>
                  <el-col>
                    <el-button type="primary" @click="searchUserList">查询用户</el-button>
                    <el-button @click="resetUserList">清空</el-button>
                  </el-col>
                </el-row>
              </el-col>
              <el-col :span="18">
                <basic-form-item>
                  <el-transfer v-model="addData.sendMsg" :data="userList" :titles="['用户列表', '已选用户']" :props="{ key: 'id', label: 'name' }" filterable> </el-transfer>
                </basic-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </template>
    </common-detail>
  </div>
</template>
<script>
import { getUserList, status, cycle, typeList, inspectTypeList, allList } from '../utils/index'
import { getRoutineDetail, getAllInspectItem, getWarns, getReportsDetail, getTimings, createReports, modifyReports } from 'services/task/inspect'
import { getDepart } from 'services/system/depart'
import { getUser } from 'services/system/user'
export default {
  components: {
    paramBase: () => import('./paramBase'),
    paramList: () => import('./paramList'),
    templateList: () => import('./templateList'),
    timeSet: () => import('./timeSet')
  },
  props: ['dialog', 'detailData'],
  data() {
    return {
      rules: { required: true, message: '请输入内容', trigger: ['blur', 'change'] },
      status,
      cycle,
      typeList,
      inspectTypeList,
      loading: false,
      templateList: [
        {
          code: 'inspectReport',
          name: '巡检报表'
        }
      ],
      inspectList: [],
      addData: {
        period: 'Day',
        inspectType: '',
        choose: 'current',
        status: 'On',
        type: 'custom',
        tmpMsg: [],
        listMsg: [],
        baseMsg: [
          {
            id: 1,
            items: [...allList]
          },
          {
            id: 2,
            items: []
          }
        ],
        departIds: [],
        sendMsg: [],
        generateTime: '',
        week: '',
        day: ''
      },
      userList: [],
      options2: [],
      itemList: [],
      ipList: [],
      warnList: [],
      props: {
        label: 'name',
        value: 'id',
        children: 'depart',
        checkStrictly: true
      },
      departList: [],
      departMap: [],
      flag: true
    }
  },
  mounted() {
    this.getDepartData([0])
    this.searchUserList()
    getUserList(this).then(res => {
      this.userList = res.data.rows
    })
    if (this.dialog.id) {
      this.getDetail(this.dialog.id)
    }
  },
  methods: {
    initTimeSet() {
      this.$refs.paramSet.getNext(this.addData.period)
    },
    // 获取巡检详情
    getInspectDetail(id) {
      let routineId = null
      const inspectId = id || this.addData.inspectId
      this.inspectList.forEach(item => {
        if (item.id === inspectId) {
          routineId = item.routineId
        }
      })
      getRoutineDetail(routineId).then(res => {
        if (res.success) {
          let ipIndex = 0
          const groups = res.data.groups
          const ipSet = new Set([])
          const itemSet = new Set([])
          groups.forEach(group => {
            const targetData = JSON.parse(group.target)?.data
            targetData.forEach(ip => {
              ipSet.add(ip.host)
            })
            const itemIds = group.itemIds
            itemIds.forEach(item => {
              itemSet.add(item)
            })
          })
          const ipList = [...ipSet]
          ipList.forEach(ips => {
            this.ipList.push({
              id: ipIndex++,
              name: ips
            })
          })
          const itemList = [...itemSet]
          this.loadAllInspectItem().then(data => {
            data.forEach(item => {
              if (itemList.includes(item.id)) {
                this.itemList.push(item)
              }
            })
          })
          this.getWarnList().then(data => {
            this.warnList = data
          })
        }
      })
    },
    // 查询巡检指标
    loadAllInspectItem() {
      return new Promise((resolve, reject) => {
        getAllInspectItem().then(data => {
          if (data.success) {
            resolve(data.data)
          }
        })
      })
    },
    // 查询告警等级
    getWarnList() {
      return new Promise((resolve, reject) => {
        const params = {
          page: 1,
          rows: 999
        }
        getWarns(params).then(data => {
          if (data.success) {
            resolve(data.data.rows)
          }
        })
      })
    },
    getDetail(id) {
      this.loading = true
      getReportsDetail(id)
        .then(res => {
          const resData = res.data
          if (resData.type === 'custom') {
            this.getInspectList(resData.inspectType, false).then(_ => {
              this.getInspectDetail(resData.inspectId)
            })
          }
          const addData = { ...resData }
          const baseMsg = JSON.parse(resData.baseMsg)
          addData.departIds = []
          addData.listMsg = JSON.parse(resData.listMsg) || []
          addData.sendMsg = []
          const sendMsg = JSON.parse(resData.sendMsg)
          this.userList = sendMsg
          // 自定义模板
          if (resData.type === 'custom') {
            const noSelectBaseMsg = []
            for (const item1 of allList) {
              let flag = false
              for (const item2 of baseMsg) {
                if (item1.id === item2.id) {
                  flag = true
                }
              }
              if (!flag) {
                noSelectBaseMsg.push(item1)
              }
            }
            addData.baseMsg = [
              {
                id: 1,
                items: [...noSelectBaseMsg]
              },
              {
                id: 2,
                items: [...baseMsg]
              }
            ]
          } else {
            addData.listMsg.forEach(item => {
              item.inspectType = ''
            })
          }
          sendMsg.forEach(item => {
            addData.sendMsg.push(item.id)
          })
          this.addData = addData
          this.addData.departIds = JSON.parse(sendMsg[0].departIds)
          // this.initTimeSet()
        })
        .finally(_ => {
          this.loading = false
        })
    },
    getInspectList(data, clear = true) {
      // clear是否清除数据，编辑不做数据清除
      return new Promise((resolve, reject) => {
        const params = {
          page: 1,
          rows: 9999
        }
        params.params = JSON.stringify([
          {
            param: {
              category: data || this.addData.inspectType
            },
            sign: 'EQ'
          }
        ])
        getTimings(params).then(data => {
          if (data.success) {
            this.inspectList = data.data.rows
            clear && this.addData.inspectId && (this.addData.inspectId = '')
            resolve()
          }
        })
      })
    },
    back() {
      this.dialog.show = false
    },
    resetUserList() {
      this.addData.departIds = [0]
      this.searchUserList()
    },
    // 查询用户
    searchUserList() {
      if (this.addData.departIds?.length < 1 && !this.flag) {
        return
      }
      const departId = this.addData.departIds[this.addData.departIds.length - 1]
      let id = ''
      id = departId === 0 ? '' : departId
      const params = {}
      params.page = 1
      params.rows = 9999
      params.params = this.$tools.handleSearchParam({
        departId: id
      })
      getUser(params).then(data => {
        if (data.success) {
          this.userList = data.data.rows
          this.flag = false
        }
      })
    },
    getDepartData(value) {
      const departId = Array.isArray(value) ? value[value?.length - 1] : 0
      getDepart({ parentId: departId }).then(data => {
        if (data.success) {
          data.data.forEach(item => {
            this.departMap[item.id] = item
            if (item.children) {
              this.$set(item, 'depart', [])
            }
          })
          if (this.options2.length) {
            if (data.data.length) this.departMap[departId].depart = data.data
          } else this.options2 = data.data
        }
      })
    },
    save() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const baseMsg = this.addData?.baseMsg[1].items || []
          if (this.addData.type === 'custom' && baseMsg.length < 1) {
            return this.$message.error('基础信息不能为空')
          }
          if (this.addData?.listMsg?.length < 1) {
            return this.$message.error('列表信息不能为空')
          }
          if (this.addData?.sendMsg?.length < 1) {
            return this.$message.error('请选择订阅用户')
          }
          if (this.addData.type === 'template' && this.addData?.listMsg?.length > 0) {
            // name不能重复
            const hashName = {}
            for (const item of this.addData.listMsg) {
              if (hashName[item.name]) {
                this.$message.error('列表信息字段名称不能重复')
                return
              } else {
                hashName[item.name] = true
              }
            }
          }
          const saveData = JSON.parse(JSON.stringify(this.addData))
          const sendMsg = [],
            sendMsgIds = saveData?.sendMsg ? saveData?.sendMsg.slice() : []
          this.userList.forEach(item => {
            if (sendMsgIds.indexOf(item.id) > -1) {
              sendMsg.push(item)
            }
          })
          saveData.baseMsg = baseMsg
          saveData.sendMsg = sendMsg
          if (!saveData.inspectId) {
            saveData.inspectId = 0
          }
          let http = createReports
          if (this.dialog.id) {
            http = modifyReports
          }
          http(saveData).then(res => {
            if (res.success) {
              this.$notify.success(res.message)
              this.dialog.show = false
              this.$emit('getList')
            }
          })
        }
      })
    }
  }
}
</script>
<style lang="scss">
.addEventPush {
  background: #fff;
  position: absolute;
  width: 100%;
  height: 100%;
  bottom: 0;
  right: 0;
  z-index: 99;
  .detail-content {
    margin: 20px;
  }
  .form {
    margin: 20px 0 10px;
    .icon-primary {
      color: #2d8cf0;
      cursor: pointer;
      .bsm-icon {
        font-size: 16px;
      }
    }
  }
}
</style>
