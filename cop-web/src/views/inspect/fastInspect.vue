<template>
  <el-card :class="{ noborder: inspectType != 1 }">
    <div slot="header" class="clearfix" v-if="inspectType == 1">
      <span>快速巡检</span>
    </div>
    <basic-form :model="data" ref="form" labelWidth="100px" :disabled="inspectType == 4">
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <basic-form-item label="巡检分类：" prop="category" validate="required" required-message="请选择类别">
            <el-select v-model="data.category" filterable @change="handleInspectCategory">
              <el-option v-for="item in inspectTypeList" :key="item.code" :label="item.name" :value="item.code"> </el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <basic-form-item label="巡检名称：" prop="name" validate="required" required-message="请输入巡检名称">
            <el-input placeholder="请输入巡检名称" v-model.trim="data.name" :maxlength="32"></el-input>
          </basic-form-item>
        </el-col>
        <!-- <el-col :span="24" :offset="0">
          <basic-form-item label="应用系统：" prop="applicationName" required-message="请输入应用系统名称或者从CMDB选择">
            <el-row :gutter="20">
              <el-col :span="10" :offset="0">
                <el-input placeholder="请输入应用系统名称或者从CMDB选择" :maxlength="32" :disabled="isSelectCMDBSystem" v-model.trim="data.applicationName" clearable>
                  <el-button slot="append" type="primary" @click="selectCMDBSystem">CMDB应用系统</el-button>
                </el-input>
              </el-col>
              <el-col :span="8" :offset="0" v-if="isSelectCMDBSystem">
                <div class="flex-c">
                  <el-select v-model="data.applicationName" clearable filterable>
                    <el-option v-for="item in systemList" :key="item.id" :label="item.name" :value="item.name">
                    </el-option>
                  </el-select>
                  <el-button class="item" @click="() => { isSelectCMDBSystem = false }">确认</el-button>
                </div>
              </el-col>
            </el-row>
          </basic-form-item>
        </el-col> -->
      </el-row>
      <basic-form-item label="资源组：" class="host-container">
        <el-button type="primary" @click="addHostGroup" v-if="inspectType != 4">添加资源组</el-button>
        <el-card class="m-b card-layout" v-for="(item, index) in data.hostGroupList" :key="index">
          <div slot="header">
            <span @click="toggleShowStatus(item)" style="display: inline-block; width: calc(100% - 20px)">{{ item.name }}</span>
            <i class="el-icon-close" @click="delGroup(index, item)" v-if="inspectType != 4"></i>
          </div>
          <el-collapse-transition>
            <div class="host-container__body" v-if="item.show">
              <div style="height: 5px"></div>
              <CardLayout title="资源设置">
                <div style="padding: 20px">
                  <basic-form-item label="资源组名称：">
                    <el-input placeholder="请输入资源组名称" v-model.trim="item.name" @change="changeHostname(item)" />
                  </basic-form-item>
                  <!-- <basic-form-item label="执行方式：">
                    <el-radio-group v-model="item.executeType" @change="executeChange(item, index)">
                      <el-radio-button label="remote">Remote</el-radio-button> -->
                      <!-- <el-radio-button label="agent" v-if="showTabList.includes('hasAgent')">agent</el-radio-button> -->
                      <!-- <el-radio-button label="saltStack">SaltStack</el-radio-button>
                    </el-radio-group> -->
                    <!-- <el-checkbox
                      class="marL20"
                      v-if="showTabList.includes('hasJump')"
                      v-model="item.isJumpServer"
                      :disabled="data.category === 'NETWORK'"
                      @change="setExecuteType(item)"
                      >跳板机</el-checkbox> -->
                  <!-- </basic-form-item> -->
                </div>
              </CardLayout>
              <!-- <CardLayout title="跳板机模块" v-if="item.isJumpServer">
                <div style="padding: 20px">
                  <target-server-jump v-if="item.executeType == 'remote'" :disable="inspectType == 4" :ref="`jumptargetRef_${item.index}`" :itemData="item">
                  </target-server-jump>
                  <agent-server-jump v-else :ref="`jumptargetRef_${item.index}`" :disable="inspectType == 4" :itemData="item">
                  </agent-server-jump>
                </div>
              </CardLayout> -->
              <CardLayout title="资源选择">
                <div style="padding: 20px">
                  <target-server v-if="item.executeType == 'remote' || item.executeType == 'saltStack'" :disabled="inspectType == 4" :ref="`targetRef_${item.index}`" :hide-auth-way="item.executeType === 'saltStack'" :item-data="item.target" @host-change="(data) => hostChange(item, data)"> </target-server>
                  <agent-server v-else :ref="`targetRef_${item.index}`" :disable="inspectType == 4" :itemData="item"> </agent-server>
                </div>
              </CardLayout>
              <CardLayout title="巡检项设置">
                <div style="padding: 20px">
                  <basic-form-item label="设置分类：">
                    <el-radio-group v-model="item.setType" @change="changeInspectItemType(index)">
                      <el-radio label="hand">手工设置</el-radio>
                      <el-radio label="temp">选择模板</el-radio>
                    </el-radio-group>
                  </basic-form-item>
                  <basic-form-item label="指标分类：" v-if="item.setType === 'hand'">
                    <el-select v-model="item.normType" filterable @change="getInspectItemByType(index, item.normType)">
                      <el-option v-for="item in normListAll" :key="item.id" :label="item.name" :value="item.code"> </el-option>
                    </el-select>
                  </basic-form-item>
                  <basic-form-item label="巡检模板：" v-if="item.setType === 'temp'">
                    <el-select v-model="item.tempId" filterable @change="getTempDetail(index, item.tempId)">
                      <el-option v-for="item in tempList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
                    </el-select>
                  </basic-form-item>
                  <basic-form-item label="巡检项：" disabled>
                    <el-transfer v-model="item.itemIds" :data="inspectItem" :titles="['巡检项列表', '已选巡检项']" :props="{ key: 'id', label: 'name' }" filterable @change="clearCustomParams(item)">
                      <span slot-scope="{ option }">
                        <el-tooltip :content="option.name" placement="top" effect="light" :open-delay="500">
                          <span>{{ option.name }}</span>
                        </el-tooltip>
                      </span>
                    </el-transfer>
                  </basic-form-item>
                  <basic-form-item label="模板名称：" v-if="item.setType === 'hand'">
                    <el-row :gutter="20">
                      <el-col :span="12" :offset="0">
                        <el-input v-model.trim="item.tempName"></el-input>
                      </el-col>
                      <el-col :span="4" :offset="0">
                        <el-button type="primary" @click="saveTemp(item)">保存模板</el-button>
                      </el-col>
                    </el-row>
                  </basic-form-item>
                </div>
              </CardLayout>
              <CardLayout title="参数设置">
                <param-set style="padding: 20px" :itemData="item" :itemIndex="index" :inspectItem="inspectItem"></param-set>
              </CardLayout>
            </div>
          </el-collapse-transition>
        </el-card>
      </basic-form-item>
    </basic-form>
    <div class="inspect-footer" v-if="inspectType == '1'">
      <el-button type="primary" @click="submit('run')" :loading="loading">执行</el-button>
    </div>
  </el-card>
</template>

<script>
import { decrypt } from 'utils/crypto'
import AgentServer from 'views/bsm-cache/cmdbServer/agentServer'
import TargetServer from 'views/task/graph/targetServer/TargetServer.vue'
import TargetServerJump from './jumpServer/targetServerJump'
import AgentServerJump from './jumpServer/agentServerJump'
import ParamSet from './components/paramSet'
import { normListAll, inspectTypeList } from './utils/index'
import { getTabAuthor, getSystemList, getInspectItemByType, getTempList, getTempDetail, testGroupData } from './utils/methods'
import { createTemplates, getRoutineDetail, getAllInspectItem, createRun, createRoutine, modifyRoutine } from 'services/task/inspect'
export default {
  components: {
    TargetServer,
    AgentServer,
    ParamSet
  },
  props: {
    id: {
      type: [Number, String],
      default: ''
    },
    inspectType: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      normListAll,
      inspectTypeList, // 巡检类别
      systemList: [], // CMDB应用系统列表
      isSelectCMDBSystem: false, // 是否从CMDB选择应用系统
      title: {
        1: '快速巡检',
        2: '新建常规巡检',
        3: '编辑常规巡检',
        4: '查看常规巡检',
        5: '巡检克隆'
      },
      hostList: [],
      showTabList: ['hasRemote', 'hasAgent', 'hasJump', 'hasCmdb', 'hasNetwork', 'hasSafety'],
      index: 1,
      data: {
        name: '',
        applicationName: '',
        category: '',
        hostGroupList: []
      },
      inspectItem: [],
      tempList: [],
      loading: false
    }
  },
  created() {
    this.getTempList()
    this.loadAllInspectItem().then(() => {
      if (this.id) {
        this.getInspectById(this.id)
      } else {
        this.addHostGroup()
      }
    })
  },
  methods: {
    hostChange(item, data) {
      item.hostList = data
      this.clearCustomParams(item)
    },
    setExecuteType(item) {
      item.executeType = 'remote'
    },
    /**
     * // 根据不同巡检类型实现不同菜单控制
     */
    handleInspectCategory() {
      this.showTabList = getTabAuthor(this.data.category)
      this.data.hostGroupList.forEach((item) => {
        item.isJumpServer = false
        item.hostList = []
        if (!this.showTabList.includes('hasJump')) {
          item.isJumpServer = false
        }
        if (!this.showTabList.includes('hasCmdb')) {
          item.resourceType = 'CMDB_NETWORK_DEVICE'
        }
        if (this.showTabList.includes('hasCmdb')) {
          item.resourceType = 'CMDB_HOST'
        }
        // if (this.data.category === 'NETWORK') {
        //   this.$nextTick(() => {
        //     item.isJumpServer = true
        //   })
        // }
        if (!this.showTabList.includes('hasAgent')) {
          item.executeType = 'remote'
        }
      })
    },
    // 方式改变的时候清空依赖项数据
    changeInspectItemType(index) {
      this.clearInspectItemIds(index)
      this.loadAllInspectItem()
    },
    // 切换巡检项选择方式时清空已选巡检项
    clearInspectItemIds(index) {
      this.data.hostGroupList[index].itemIds = []
      this.data.hostGroupList[index].normType = null
      this.data.hostGroupList[index].tempId = null
    },
    // 巡检项改变时清空资源
    clearCustomParams(item) {
      item.customParams = []
    },
    // 从CMDB选择应用系统
    selectCMDBSystem() {
      this.isSelectCMDBSystem = true
      this.getSystemList()
    },
    // 保存模板
    saveTemp(data) {
      if (!data.itemIds?.length > 0) {
        this.$message.error('请选择巡检项')
        return
      }
      if (!data.tempName) {
        this.$message.error('请填写模板名称')
        return
      }
      this.loading = true
      const params = {
        item: []
      }
      data.itemIds.forEach((item) => {
        params.item.push({ id: Number(item) })
      })
      params.name = data.tempName
      createTemplates(params)
        .then((data) => {
          if (data.success) {
            this.$notify.success(data.message)
          }
        })
        .finally((_) => {
          this.loading = false
        })
    },
    // 根据指标获取巡检项
    getInspectItemByType(index, data) {
      if (data === 'all') {
        this.loadAllInspectItem()
      } else {
        getInspectItemByType(this, index, data).then((res) => {
          this.inspectItem = res
        })
      }
    },
    // 获取巡检模板
    getTempList() {
      getTempList(this).then((res) => {
        this.tempList = res
      })
    },
    // 获取巡检模板详情
    getTempDetail(index, id) {
      getTempDetail(this, index, id).then((res) => {
        this.data.hostGroupList[index].itemIds = res
      })
    },
    // 获取应用系统
    getSystemList() {
      getSystemList(this).then((res) => {
        this.systemList = res
      })
    },
    /**
     * 查询巡检信息
     */
    getInspectById(id) {
      const that = this
      getRoutineDetail(id).then((data) => {
        if (data.success) {
          this.data.name = data.data.name
          this.data.applicationName = data.data.applicationName
          this.data.category = data.data.category
          this.showTabList = getTabAuthor(this.data.category)
          if (this.inspectType == 5) {
            this.data.name += '-copy-' + new Date().getTime()
          }
          this.data.id = data.data.id
          this.data.hostGroupList.splice(0, this.data.hostGroupList.length)
          const routineGroups = data.data.groups || []
          const firIndex = this.index
          routineGroups.forEach((item) => {
            const target = JSON.parse(item.target)
            const jumpServer = (item.jumpServer && JSON.parse(item.jumpServer)) || {}
            // 解密 - 跳板机
            if (jumpServer.data && jumpServer.data?.length > 0) {
              jumpServer.data.forEach((jItem) => {
                jItem.pasd && (jItem.pasd = decrypt(jItem.pasd))
              })
              jumpServer.hostList = jumpServer.data
              delete jumpServer.data
            }
            const index = this.index++
            const rList = (target.data || []).slice()
            rList.unshift({
              id: 0,
              rawName: '选择全部'
            })
            const obj = {
              index: index,
              name: item.name,
              show: index == firIndex,
              hostList: target.data,
              isJumpServer: item.isJumpServer,
              jumpServer: jumpServer,
              resourceType: item.resourceType,
              resourceList: rList,
              itemIds: item.itemIds,
              executeType: item.executeType || 'remote',
              setType: item.setType || 'hand',
              authenMode: target.authenMode || 'SINGLE',
              sudo: target.sudo || true,
              identId: target.identId || '',
              account: target.account || 'root',
              target,
              customParams: []
            }
            this.data.hostGroupList.push(obj)
            // 通过timeout使customParams数据不被清除
            setTimeout(() => {
              obj.customParams = JSON.parse(item.customParams)
            })
          })
        }
      })
    },
    executeChange(item) {
      const targetRef = this.$refs[`targetRef_${item.index}`][0]
      if (!item.isJumpServer) {
        if (item.executeType == 'remote') {
          targetRef.setMode('SINGLE')
          item.sudo = true
        } else {
          targetRef.setMode('TRUST')
          item.sudo = false
        }
        item.identId = ''
        item.account = 'root'
        item.hostList.splice(0, item.hostList.length)
        if (item.executeType === 'agent') {
          item.resourceType = 'AGENT'
        }
      } else {
        this.$set(item, 'jumpServer', {
          authenMode: 'SINGLE',
          sudo: true,
          identId: '',
          account: 'root',
          hostList: []
        })
      }
    },
    changeHostname(item) {
      const index = item.index
      let flag = true
      for (const i of this.data.hostGroupList) {
        if (i.index != index && i.name == item.name) {
          this.$message.error('资源组名称不能重复')
          item.name = item.oldName
          flag = false
          break
        }
      }
      if (flag) {
        item.oldName = item.name
      }
    },
    nameExisted(name) {
      for (const i of this.data.hostGroupList) {
        if (i.name == name) {
          return true
        }
      }
      return false
    },
    delGroup(index, item) {
      this.$confirm(`是否确认删除资源组-${item.name}？`, '操作确认', {
        confirmButtonText: '确定',
        type: 'warning'
      }).then(() => {
        this.data.hostGroupList.splice(index, 1)
      })
    },
    addHostGroup() {
      const index = this.index++
      if (this.nameExisted(`资源组${index}`, 1)) {
        this.addHostGroup()
        return
      }
      this.data.hostGroupList.forEach((item) => {
        item.show = false
      })
      this.data.hostGroupList.push({
        index: index,
        name: '资源组' + index,
        oldName: '资源组' + index,
        show: true,
        executeType: 'remote',
        setType: 'hand',
        hostList: [],
        isJumpServer: false,
        jumpServer: {
          authenMode: 'SINGLE',
          sudo: true,
          identId: '',
          account: 'root',
          hostList: []
        },
        customParams: [],
        itemIds: [],
        authenMode: 'SINGLE',
        sudo: true,
        identId: '',
        account: 'root'
      })
    },
    handleTagClose(item, index) {
      item.hostList.splice(index, 1)
    },
    toggleShowStatus(item) {
      item.show = !item.show
    },
    loadAllInspectItem() {
      return getAllInspectItem().then((data) => {
        if (data.success) {
          this.inspectItem = data.data
        }
      })
    },
    handleSubmit(opType, data) {
      let http
      if (opType == 'run') {
        this.loading = true
        http = createRun
      } else if (opType == 'create') {
        if (this.data.id && this.inspectType != 5) {
          http = modifyRoutine
          data.id = this.data.id
        } else {
          http = createRoutine
        }
      }
      http(data)
        .then((data) => {
          if (data.success) {
            if (opType == 'run') {
              this.$router.push({ name: 'InspectHistory' })
            } else {
              this.$emit('success')
            }
          }
        })
        .finally((_) => {
          this.loading = false
          this.$emit('cancel')
        })
    },
    submit(opType) {
      let flag = false
      if (this.id && !this.data.id) {
        this.$message.error('常规巡检信息未获取/获取异常')
        flag = false
      } else {
        this.$refs.form.validate((valid) => {
          if (valid) {
            if (!this.data.hostGroupList.length) {
              this.$message.error('请创建资源组')
            } else {
              const data = {
                name: this.data.name,
                applicationName: this.data.applicationName,
                category: this.data.category,
                groups: []
              }
              for (const i of this.data.hostGroupList) {
                // 资源组
                const targetRef = this.$refs[`targetRef_${i.index}`][0]
                const targetRefJump = i.isJumpServer && this.$refs[`jumptargetRef_${i.index}`][0]
                // 资源数据
                const target = targetRef && targetRef.getPostData()
                // 跳板机数据
                const jumpServer = i.isJumpServer && targetRefJump && targetRefJump.getPostData()
                if (!target) {
                  flag = false
                  break
                }
                i.hostList = target.data
                if (!testGroupData(this, i)) {
                  flag = false
                  break
                }
                const group = {
                  executeType: i.executeType,
                  setType: i.setType,
                  name: i.name,
                  itemIds: i.itemIds,
                  target,
                  isJumpServer: i.isJumpServer,
                  jumpServer: {
                    data: i.executeType === 'agent' ? (jumpServer.jumpServer ? jumpServer?.jumpServer.hostList : []) : jumpServer?.hostList || []
                  },
                  customParams: i.customParams,
                  resourceType: i.resourceType
                }

                // 跳板机模式资源只有remote
                if (i.isJumpServer) {
                  group.target.authenMode = target.authenMode
                  group.target.sudo = target.sudo
                  group.target.identId = target.identId
                  if (i.executeType == 'remote') {
                    group.jumpServer.authenMode = jumpServer?.authenMode
                    group.jumpServer.sudo = jumpServer?.sudo
                    group.jumpServer.identId = jumpServer?.identId
                  } else {
                    group.jumpServer.account = jumpServer?.account
                  }
                } else {
                  if (i.executeType == 'remote') {
                    group.target.authenMode = target.authenMode
                    group.target.sudo = target.sudo
                    group.target.identId = target.identId
                  } else {
                    group.target.account = target.account
                  }
                }
                // group.target = JSON.stringify(group.target)
                data.groups.push(group)
                flag = true
              }
              if (flag) this.handleSubmit(opType, data)
            }
          } else {
            this.$message.error('请保证信息填写完整')
          }
        })
      }
      if (!flag) {
        this.$emit('cancel')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
// body#cmp .host-container .card-layout{
//   border-bottom: none !important;
// }
// body#cmp .noborder {
//   border: none !important;
// }
.host-container .card-layout {
  &:not(:first-child) {
    margin-top: 10px;
  }
  ::v-deep .el-card__header {
    background: #fafafa;
    line-height: 20px;
    span {
      cursor: pointer;
    }
    i {
      cursor: pointer;
      float: right;
      line-height: 20px;
    }
  }
  ::v-deep .el-card__body {
    padding: 0 !important;
  }
  .host-container__body {
    padding: 0 20px;
    border-bottom: 1px solid #dcdfe6;
  }
}
.inspect-footer {
  padding: 10px;
  text-align: right;
  border-top: 1px solid #e5e5e5;
}
.ag-table {
  ::v-deep .row-expand-cover {
    .el-checkbox__inner {
      display: none;
    }
    td {
      background: #fafafa;
    }
  }
}
.marL20 {
  margin-left: 20px;
}

.flex-c {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  .item {
    margin-left: 5px;
  }
}
</style>
