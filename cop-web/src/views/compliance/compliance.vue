<template>
  <el-card :class="{ noborder: complianceType != 1 }">
    <basic-form :model="data" ref="form" labelWidth="120px" :disabled="complianceType == 4">
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <basic-form-item label="合规分类：" prop="category" validate="required" required-message="请选择类别">
            <el-select v-model="data.category" filterable @change="handleComplianceCategory">
              <el-option v-for="item in complianceTypeList" :key="item.code" :label="item.name" :value="item.code"> </el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <basic-form-item label="合规名称：" prop="name" validate="required" required-message="请输入合规名称">
            <el-input placeholder="请输入合规名称" v-model.trim="data.name"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <basic-form-item label="合规设置：" class="host-container">
        <el-button type="primary" @click="addHostGroup" v-if="complianceType != 4">添加资源组</el-button>
        <el-card class="m-b card-layout" v-for="(item, index) in data.hostGroupList" :key="index">
          <div slot="header">
            <span @click="toggleShowStatus(item)" style="display: inline-block; width: calc(100% - 20px)">{{ item.name }}</span>
            <i class="el-icon-close" @click="delGroup(index, item)" v-if="complianceType != 4"></i>
          </div>
          <el-collapse-transition>
            <div class="host-container__body" v-show="item.show">
              <div style="height: 5px"></div>
              <CardLayout title="资源设置">
                <div style="padding: 20px">
                  <basic-form-item label="资源组名称：">
                    <el-input placeholder="请输入资源组名称" v-model.trim="item.name" @change="changeHostname(item)" />
                  </basic-form-item>
                  <!-- <basic-form-item label="执行方式：">
                    <el-radio-group v-model="item.executeType" @change="executeChange(item)">
                      <el-radio-button label="remote" v-if="showTabList.includes('hasRemote')">Remote</el-radio-button>
                      <el-radio-button label="saltStack" v-if="showTabList.includes('hasAgent') && !item.isJumpServer">SaltStack</el-radio-button>
                    </el-radio-group> -->
                    <!-- remote模式存在跳板机 -->
                    <!-- <el-checkbox
                      v-if="showTabList.includes('hasJump')"
                      class="marL20"
                      v-model="item.isJumpServer"
                      :disabled="data.category === 'NETWORK'"
                      @change="setExecuteType(item)"
                      >跳板机</el-checkbox> -->
                  <!-- </basic-form-item> -->
                </div>
              </CardLayout>
              <!-- <CardLayout title="跳板机模块" v-if="item.isJumpServer">
                <div style="padding: 20px">
                  <target-server-jump
                    v-if="item.executeType == 'remote'"
                    :disable="complianceType == 4"
                    :ref="`jumptargetRef_${item.index}`"
                    :itemData="item">
                  </target-server-jump>
                  <agent-server-jump
                    v-else
                    :ref="`jumptargetRef_${item.index}`"
                    :disable="complianceType == 4"
                    :itemData="item">
                  </agent-server-jump>
                </div>
              </CardLayout> -->
              <CardLayout title="资源选择">
                <div style="padding: 20px">
                  <target-server v-if="item.executeType == 'remote' || item.executeType == 'saltStack'" :disabled="complianceType == 4" :hide-auth-way="item.executeType === 'saltStack'" :ref="`targetRef_${item.index}`" :item-data="item.target" @host-change="data => hostChange(item, data)"> </target-server>
                  <agent-server v-else :ref="`targetRef_${item.index}`" :disable="complianceType == 4" :agentType="item.executeType" :itemData="item"> </agent-server>
                </div>
              </CardLayout>
              <CardLayout title="合规项设置">
                <div style="padding: 20px">
                  <basic-form-item label="设置分类：">
                    <el-radio-group v-model="item.setType" @change="clearcomplianceItemIds(index)">
                      <el-radio label="hand">手工设置</el-radio>
                      <el-radio label="temp">选择模板</el-radio>
                    </el-radio-group>
                  </basic-form-item>
                  <basic-form-item label="基线分类：" v-if="item.setType === 'hand'">
                    <el-select v-model="item.normType" filterable @change="getcomplianceItemByType(item.normType)">
                      <el-option v-for="item in normListAll" :key="item.id" :label="item.name" :value="item.code"> </el-option>
                    </el-select>
                  </basic-form-item>
                  <basic-form-item label="合规模板：" v-if="item.setType === 'temp'">
                    <el-select v-model="item.tempId" filterable @change="getTempDetail(index, item.tempId)">
                      <el-option v-for="item in tempList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
                    </el-select>
                  </basic-form-item>
                  <basic-form-item label="合规项：" disabled>
                    <el-transfer v-model="item.itemIds" :data="complianceItem" :titles="['合规项列表', '已选合规项']" :props="{ key: 'id', label: 'name' }" filterable @change="clearCustomParams(item)">
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
                <param-set style="padding: 20px" :itemData="item" :itemIndex="index" :complianceItem="complianceItem"></param-set>
              </CardLayout>
            </div>
          </el-collapse-transition>
        </el-card>
      </basic-form-item>
    </basic-form>
    <div class="compliance-footer" v-if="complianceType == '1'">
      <el-button type="primary" @click="submit('run')" :loading="loading">执行</el-button>
    </div>
  </el-card>
</template>

<script>
import { decrypt } from 'utils/crypto'
import TargetServer from 'views/task/graph/targetServer/TargetServer.vue'
import AgentServer from 'views/bsm-cache/cmdbServer/agentServer'
// import TargetServerJump from '../inspect/jumpServer/targetServerJump'
// import AgentServerJump from '../inspect/jumpServer/agentServerJump'
import ParamSet from './components/paramSet'
import { normListAll, complianceTypeList } from './utils/index'
import { getTabAuthor } from '../inspect/utils/methods'
import { createTemplate, getBaseLineList, getAllBaseLineList, getTemplateList, getTemplateDetail, getRoutineDetail, complianceOperate, createRoutine, modifyRoutine } from 'services/task/compliance'
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
    complianceType: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      normListAll,
      complianceTypeList, // 合规类别
      showTabList: ['hasRemote', 'hasAgent', 'hasJump', 'hasCmdb', 'hasNetwork', 'hasSafety'],
      title: {
        1: '快速合规',
        2: '新建',
        3: '编辑',
        4: '查看',
        5: '克隆'
      },
      hostList: [],
      index: 1,
      data: {
        name: '',
        category: '',
        hostGroupList: []
      },
      opList: [
        { id: 1, name: 'Linux' },
        { id: 2, name: 'Windows' },
        { id: 3, name: 'AIX' }
      ],
      complianceItem: [],
      tempList: [],
      dialogVisible: false,
      loading: false
    }
  },
  created() {
    this.getTempList()
    this.loadAllcomplianceItem().then(() => {
      if (this.id) {
        this.getComplianceById(this.id)
      } else {
        this.addHostGroup()
      }
    })
  },
  methods: {
    hostChange(item, data) {
      item.hostList = data;
      this.clearCustomParams(item)
    },
    setExecuteType(item) {
      item.executeType = 'remote'
    },
    /**
     * // 根据不同合规类型实现不同菜单控制
     */
    handleComplianceCategory() {
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
        if (!this.showTabList.includes('hasAgent')) {
          item.executeType = 'remote'
        }
      })
    },
    // 切换合规项选择方式时清空已选合规项
    clearcomplianceItemIds(index) {
      this.data.hostGroupList[index].itemIds = []
    },
    // 合规项改变时清空资源
    clearCustomParams(item) {
      item.customParams = []
    },
    // 保存模板
    saveTemp(data) {
      if (!data.itemIds?.length > 0) {
        this.$message.error('请选择合规项')
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
      createTemplate(params)
        .then((data) => {
          if (data.success) {
            this.$notify.success(data.message)
          }
        })
        .finally((_) => {
          this.loading = false
        })
    },
    // 获取合规分类
    getcomplianceItemByType(data) {
      if (data === 'all') {
        this.loadAllcomplianceItem()
        return
      }
      const params = {
        page: 1,
        rows: 999
      }
      params.params = JSON.stringify([
        {
          param: {
            itemType: data
          },
          sign: 'EQ'
        }
      ])
      getBaseLineList(params).then((data) => {
        if (data.success) {
          this.complianceItem = data.data.rows
        }
      })
    },
    // 获取合规模板
    getTempList() {
      const params = {
        page: 1,
        rows: 999
      }
      getTemplateList(params).then((data) => {
        if (data.success) {
          this.tempList = data.data.rows
        }
      })
    },
    // 获取合规模板详情
    getTempDetail(index, id) {
      getTemplateDetail(id).then((data) => {
        if (data.success) {
          const ids = []
          data.data.forEach((item) => {
            this.$nextTick(() => {
              ids.push(item.id)
            })
          })
          this.data.hostGroupList[index].itemIds = ids
        }
      })
    },
    getComplianceById(id) {
      const that = this
      getRoutineDetail(id).then((data) => {
        if (data.success) {
          this.data.name = data.data.name
          this.data.category = data.data.category
          if (this.complianceType == 5) {
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
                jItem.pasd = decrypt(jItem.pasd)
              })
              jumpServer.hostList = jumpServer.data
              delete jumpServer.data
            }
            const index = this.index++
            const rList = (target.data || []).slice()
            const obj = {
              index: index,
              name: item.name,
              show: index == firIndex,
              hostList: target.data,
              resourceList: rList,
              isJumpServer: item.isJumpServer,
              jumpServer: jumpServer,
              customParams: [],
              itemIds: item.itemIds,
              executeType: item.executeType || 'remote',
              setType: item.setType || 'hand',
              authenMode: target.authenMode || 'SINGLE',
              sudo: target.sudo || true,
              identId: target.identId || '',
              account: target.account || 'root',
              target
            }
            this.data.hostGroupList.push(obj)
            setTimeout(() => {
              obj.customParams = JSON.parse(item.customParams)
            })
          })
        }
      })
    },
    executeChange(item) {
      const targetRef = this.$refs[`targetRef_${item.index}`][0]
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
    loadAllcomplianceItem() {
      return getAllBaseLineList().then((data) => {
        if (data.success) {
          this.complianceItem = data.data
        }
      })
    },
    osTypeChange(item) {
      let osTypeString = ''
      switch (item.osType) {
        case 1:
          item.itemList = this.complianceItem.linux || []
          osTypeString = 'linux'
          break
        case 2:
          item.itemList = this.complianceItem.windows || []
          osTypeString = 'windows'
          break
        case 3:
          item.itemList = this.complianceItem.aix || []
          osTypeString = 'aix'
          break
      }
      if (!item.itemList.length) {
        this.$message.error(`【${osTypeString}】操作系统无可用指标，请在【指标管理】-【合规指标】页面添加`)
      }
    },
    testGroupData(item) {
      if (!item.name) {
        this.$message.error(`资源组名称不能为空【${item.name}】`)
        return false
      }
      // if (item.name.match(/^\s+|\s+$/g)) {
      //   this.$message.error(`资源组名称首尾不能包含空格【${item.name}】`)
      //   return false
      // }
      if (!item.hostList.length) {
        this.$message.error(`资源组服务器列表不能为空【${item.name}】`)
        return false
      }
      if (!item.itemIds.length) {
        this.$message.error(`资源组合规项不能为空【${item.name}】`)
        return false
      }
      return true
    },
    handleSubmit(opType, data) {
      let http,
        action = ''
      if (opType == 'run') {
        this.loading = true
        http = complianceOperate
        action = 'run'
      } else if (opType == 'create') {
        if (this.data.id && this.complianceType != 5) {
          http = modifyRoutine
          data.id = this.data.id
        } else {
          http = createRoutine
        }
      }
      http(data, action)
        .then((data) => {
          if (data.success) {
            if (opType == 'run') {
              this.$router.push({ name: 'complianceHistory' })
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
        this.$message.error('常规合规信息未获取/获取异常')
        flag = false
      } else {
        this.$refs.form.validate((valid) => {
          if (valid) {
            if (!this.data.hostGroupList.length) {
              this.$message.error('请创建资源组')
            } else {
              const data = {
                name: this.data.name,
                category: this.data.category,
                groups: []
              }
              for (const i of this.data.hostGroupList) {
                const targetRef = this.$refs[`targetRef_${i.index}`][0]
                const targetRefJump = i.isJumpServer && this.$refs[`jumptargetRef_${i.index}`][0]
                const target = targetRef && targetRef.getPostData()
                // 跳板机数据
                const jumpServer = i.isJumpServer && targetRefJump && targetRefJump.getPostData()
                if (!target) {
                  flag = false
                  break
                }
                i.hostList = target.data
                if (!this.testGroupData(i)) {
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
                    data: jumpServer?.hostList || []
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
                group.target = JSON.stringify(group.target)
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
.compliance-footer {
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
