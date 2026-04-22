<template>
  <el-card :class="{ noborder: dialogData.complianceType != 1 }">
    <basic-form v-loading="dataLoading" element-loading-text="拼命加载中" element-loading-spinner="el-icon-loading" :model="addData" ref="form" labelWidth="100px" :disabled="dialogData.type === 4">
      <basic-form-item label="任务名称：" prop="name" validate="required" required-message="请输入任务名称">
        <el-input placeholder="请输入任务名称" v-model.trim="addData.name" />
      </basic-form-item>
      <!-- <basic-form-item label="任务类型：" prop="type" validate="required" required-message="请选择类型">
        <el-select v-model="addData.type" filterable>
          <el-option v-for="item in typeList" :key="item.code" :label="item.name" :value="item.code"> </el-option>
        </el-select>
      </basic-form-item> -->
      <basic-form-item label="执行模板：" prop="executeTemplate" validate="required" required-message="请选择执行模板">
        <el-select v-model="addData.executeTemplate" filterable @change="getTemplateNodes">
          <el-option v-for="item in tempList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
        </el-select>
      </basic-form-item>
      <!-- <basic-form-item label="执行方式：">
        <el-radio-group v-model="addData.executeType" @change="executeChange(addData)">
          <el-radio-button label="remote">Remote</el-radio-button> -->
          <!-- <el-radio-button label="agent">agent</el-radio-button> -->
          <!-- <el-radio-button label="saltStack">SaltStack</el-radio-button>
        </el-radio-group>
      </basic-form-item> -->
      <CardLayout title="资源选择">
        <target-server v-if="addData.executeType == 'remote' || addData.executeType == 'saltStack'" :disable="dialogData.type === 4" ref="targetRef" :itemData="addData"> </target-server>
        <agent-server v-else ref="targetRef" :disable="dialogData.type === 4" :itemData="addData"> </agent-server>
      </CardLayout>
      <basic-form-item label="选择补丁：" v-if="isPatch">
        <el-cascader :options="treeData" v-model="addData.groupIds" :props="props" @change="getFileList"  change-on-select> </el-cascader>
      </basic-form-item>
      <basic-form-item label="" disabled v-if="isPatch">
        <el-transfer v-model="addData.patchTarget" :data="fileList" :titles="['补丁列表', '已选补丁列表']" :props="{ key: 'id', label: 'name' }" filterable>
          <span slot-scope="{ option }">
            <el-tooltip :content="option.name" placement="top" effect="light" :open-delay="500">
              <span>{{ option.name }}</span>
            </el-tooltip>
          </span>
        </el-transfer>
      </basic-form-item>
      <CardLayout title="高级设置">
        <CardLayout title="输入参数">
          <param-set :itemData="addData" :nodeList="nodeList" :inputParams="inputParams"></param-set>
        </CardLayout>
      </CardLayout>
    </basic-form>
  </el-card>
</template>

<script>
import { decrypt, encrypt } from 'utils/crypto'
import TargetServer from './targetServer'
import AgentServer from 'views/bsm-cache/cmdbServer/agentServer'
import ParamSet from './paramSet'
import { typeList } from '../utils/index'
import { getGroup } from 'services/task/soft'
import { getPatchsoftwares, getTaskTemplates, getTemplatesDetail, getPatchDetail, createPatch, modifyPatch } from 'services/task/patch'
export default {
  components: {
    TargetServer,
    AgentServer,
    ParamSet
  },
  props: {
    dialogData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      typeList, // 类别
      title: {
        2: '新建',
        3: '编辑',
        4: '查看'
      },
      props: {
        value: 'id',
        children: 'childrenList',
        label: 'name'
      },
      patchTargetSort: [],
      nodeList: [],
      inputParams: {},
      addData: {},
      treeData: [],
      complianceItem: [],
      tempList: [],
      fileList: [],
      fileListCache: {},
      dialogVisible: false,
      loading: false,
      dataLoading: false,
      isPatch: true // 是否显示选择补丁
    }
  },
  created() {
    this.getTreeData()
    this.getTempList()
    if (this.dialogData.id) {
      this.dataLoading = true
      this.addData.executeTemplate = this.dialogData.executeTemplate
      this.getTemplateNodes()
      this.getPatchById(this.dialogData.id)
    } else {
      this.addHostGroup()
    }
  },
  methods: {
    afterOrder(data) {
      this.patchTargetSort = data
    },
    // 补丁分组
    getTreeData() {
      const that = this
      getGroup().then((data) => {
        if (data.success) {
          that.treeData = data.data
        }
      })
    },
    // 根据分组查询文件
    getFileList() {
      const groupId = this.addData.groupIds[this.addData.groupIds?.length - 1]
      // // 对与获取过的数据缓存起来
      // if (this.fileListCache[groupId]) {
      //   this.fileList = this.fileListCache[groupId]
      //   return
      // }
      const params = {
        groupId
      }
      getPatchsoftwares(params).then((data) => {
        if (data.success) {
          this.fileList = data.data?.map((item) => {
            return {
              id: item.id,
              name: item.name
            }
          })
          this.fileListCache[groupId] = this.fileList
        }
      })
    },
    // 获取补丁模板
    getTempList() {
      getTaskTemplates().then((data) => {
        if (data.success) {
          this.tempList = data.data
        }
      })
    },
    // 获取节点列表
    getTemplateNodes() {
      this.addData.param = []
      getTemplatesDetail(this.addData.executeTemplate).then((res) => {
        const nodeList = JSON.parse(res.data.graph)?.nodes || [],
          inputParams = {},
          useNodeList = []
        const node = nodeList.find((item) => item.code === 'task.maintain.upload')
        if (node) {
          this.isPatch = true
        } else {
          this.isPatch = false
        }
        nodeList.forEach((item) => {
          if (item.code !== 'ctrl.stop' && item.code !== 'ctrl.start') {
            let inputParam = {}
            item.selfCode = `${item.code}&&&${item?.config?.id}`
            // 排查开始和结束节点
            if (item.code === 'task.maintain.upload') {
              this.isPatch = true
              inputParam = [
                {
                  name: '目标路径'
                }
              ]
            } else {
              inputParam = item?.input?.fronts?.inputParams
            }
            inputParams[item.selfCode] = inputParam
            useNodeList.push(item)
          }
        })
        this.nodeList = useNodeList
        this.inputParams = inputParams
      })
    },
    // 将返回数据中的key变为驼峰命名
    handleKey(data) {
      const firstParamToupperCase = (data) => {
        const paramAf = data.slice(1)
        let result = data[0]
        paramAf.forEach((p) => {
          result += p[0].toUpperCase() + p.slice(1)
        })

        return result
      }
      Object.keys(data).forEach((item) => {
        if (item.includes('_')) {
          const oldItem = item
          const param = item.split('_')

          item = firstParamToupperCase(param)
          data[item] = data[oldItem]
          delete data[oldItem]
        }
      })
      return data
    },
    getPatchById(id) {
      const that = this
      getPatchDetail(id)
        .then((data) => {
          if (data.success) {
            const target = this.handleKey(data.data)
            const patchTarget = JSON.parse(target.patchTarget),
              addPatchTarget = [],
              paramData = JSON.parse(target.param)
            patchTarget.forEach((item) => {
              addPatchTarget.push(item.id)
            })
            paramData.forEach((item) => {
              item.code = item.id
            })
            const hostList = JSON.parse(target.data)
            if (hostList && hostList?.length > 0) {
              hostList.forEach((tItem) => {
                tItem.pasd = decrypt(tItem.pasd)
              })
            }
            this.addData = {
              id: target.id,
              name: target.name,
              type: target.type,
              hostList: hostList,
              executeTemplate: target.executeTemplate,
              param: paramData,
              executeType: target.executeType || 'remote',
              authenMode: target.authenMode || 'SINGLE',
              patchTarget: addPatchTarget,
              sudo: target.sudo || true,
              identId: target.identId || '',
              account: target.account || 'root'
            }
            this.addData.groupIds = JSON.parse(target.choosePatchPath)
            this.groupId = parseInt(target.choosePatch, 10)
            this.getFileList()
          }
        })
        .finally((_) => {
          this.dataLoading = false
        })
    },
    executeChange(item) {
      if (item.executeType == 'remote') {
        item.authenMode = 'SINGLE'
        item.sudo = true
      } else {
        item.authenMode = 'TRUST'
        item.sudo = false
      }
      item.identId = ''
      item.account = 'root'
      // item.hostList.splice(0, item.hostList.length)
      if (item.executeType === 'agent') {
        item.resourceType = 'AGENT'
      }
    },
    addHostGroup() {
      this.addData = {
        name: '',
        type: '',
        executeType: 'remote',
        executeTemplate: '', // 执行模板
        hostList: [], // 主机列表
        param: [], // 输入参数
        choosePatch: '', // 选择补丁
        patchTarget: [], // 补丁列表
        authenMode: 'SINGLE',
        sudo: true,
        identId: '',
        account: 'root'
      }
    },
    handleTagClose(item, index) {
      item.hostList.splice(index, 1)
    },
    handleSubmit(data) {
      let http = createPatch
      if (this.addData.id && this.dialogData.complianceType != 5) {
        http = modifyPatch
      }
      http(data)
        .then((data) => {
          if (data.success) {
            this.$emit('success')
          }
        })
        .finally((_) => {
          this.$emit('cancel')
        })
    },
    submit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          try {
            if (this.addData.hostList?.length < 1) {
              this.$emit('cancel')
              return this.$message.error('服务器集列表不能为空')
            }
            if (this.addData.patchTarget?.length < 1) {
              this.$emit('cancel')
              return this.$message.error('已选补丁列表不能为空')
            }
            let index = 0
            const copyData = Object.assign({}, this.addData)
            const patchTargetSort = this.patchTargetSort?.length > 0 ? this.patchTargetSort : this.addData.patchTarget
            const patchTarget = patchTargetSort.map((item) => {
              return {
                id: item,
                order: ++index
              }
            })
            const paramData = copyData.param.map((item) => {
              item.id = item.code
              item.code = item.code.split('&&&')[0]
              return item
            })
            const { authenMode, identId } = this.addData
            this.addData.hostList.forEach((item) => {
              item.pasd = encrypt(item.pasd)
              if (authenMode == 'BATCH' && this.$refs.targetRef) {
                const obj = this.$refs.targetRef.accountOptions.find(item => item.id == identId)
                item.pasd = obj.password
              }
            })
            const data = Object.assign(copyData, {
              data: this.addData.hostList,
              status: this.dialogData.status,
              patchTarget: patchTarget || [],
              choosePatch: this.addData.groupIds?.length > 0 ? this.addData.groupIds[this.addData.groupIds?.length - 1] : null,
              choosePatchPath: this.addData.groupIds || [],
              param: paramData
            })
            this.handleSubmit(data)
          } catch (error) {
            this.$emit('cancel')
          }
        } else {
          this.$emit('cancel')
        }
      })
    }
  }
}
</script>
