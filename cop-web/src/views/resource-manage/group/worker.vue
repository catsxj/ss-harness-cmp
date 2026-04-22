<template>
  <div class="wrapper-container">
    <el-row :gutter="10">
      <el-col :span="6" style="width: 286px">
        <el-card class="group">
          <div slot="header">
            分组管理
            <el-tooltip class="item" effect="dark" content="添加根节点" placement="top-start">
              <el-button class="pull-right" type="text" @click="add('0')" icon="el-icon-plus"></el-button>
            </el-tooltip>
          </div>
          <el-row>
            <el-col :span="24">
              <el-tree :data="treeData" ref="scriptTree" node-key="id" :props="defaultProps" :highlight-current="true" :check-on-click-node="true" @node-click="handleNodeClick">
                <span class="custom-tree-node" slot-scope="{ node, data }">
                  <div class="custom-tree-node-wrapper">
                    <span class="custom-tree-node-label">
                      {{ node.label }}
                    </span>
                    <span class="operate-btns">
                      <dot-dropdown :events="dropMenuEvents" :data="{ node, data }" @addNode="addNode" @editNode="editNode" @removeNode="removeNode" />
                    </span>
                  </div>
                </span>
              </el-tree>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
      <el-col :span="18" style="width: calc(100% - 286px)">
        <el-card>
          <el-tabs v-model="typeName" @tab-click="handleSearch">
            <el-tab-pane name="Ansible" label="Ansible">
              <AdvanceTable :data="list" :card-border="false" :searchConfigs="searchConfigs" :params="params" :total="total" :columns="columns" :get-list="getList" :loading="loading">
                <template #name="val, record">
                  <span class="detail-href" @click="getDetail(record.id)">{{ val }}</span>
                </template>
                <template #isSuper="val">
                  {{ val == null ? '--' : val ? '是' : '否' }}
                </template>
                <template #level="level">
                  <status-icon :type="level | levelFilter('color')">{{ level | levelFilter('name') }} </status-icon>
                </template>
                <template #operate="val, record">
                  <el-button type="text" @click.native="setting(record)"> 配置 </el-button>
                </template>
              </AdvanceTable>
            </el-tab-pane>
            <!-- <el-tab-pane name="SaltMaster" label="SaltMaster">
              <AdvanceTable :data="saltMasterList" :searchConfigs="saltMasterSearchConfigs" :params="paramt" :total="saltMasterTotal" :columns="columns" :get-list="getSaltMasterList" :loading="saltMasterLoading">
                <template #action>
                  <el-button @click="handleCreate(null, 1)" type="primary" icon="el-icon-plus">新增 </el-button>
                </template>
                <template #name="val, record">
                  <span class="detail-href" @click="getDetail(record.id)">{{ val }}</span>
                </template>
                <template #isSuper="val">
                  {{ val == null ? '--' : val ? '是' : '否' }}
                </template>
                <template #level="level">
                  <status-icon :type="level | levelFilter('color')">{{ level | levelFilter('name') }} </status-icon>
                </template>
                <template #operate="val, record">
                  <el-button icon="el-icon-edit" type="text" @click="handleCreate(record, 2)"> 编辑 </el-button>
                  <div class="action-divider"></div>
                  <el-button icon="el-icon-delete" type="text" @click="handleDelete(record.id)"> 删除 </el-button>
                  <div class="action-divider"></div>
                  <el-button type="text" @click.native="setting(record)"> 配置 </el-button>
                </template>
              </AdvanceTable>
            </el-tab-pane> -->
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
    <!--新增编辑脚本分组-->
    <el-dialog :title="textMap1[dialogStatus]" :close-on-click-modal="false" v-if="addScriptGroupVisible" :visible.sync="addScriptGroupVisible" width="35%">
      <basic-form :model="addScriptGroup" ref="addScriptGroup">
        <basic-form-item label="分组名称：" prop="name" validate="required">
          <el-input v-model="addScriptGroup.name" auto-complete="off"></el-input>
        </basic-form-item>
        <basic-form-item label="分组描述：" prop="remark">
          <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }" v-model="addScriptGroup.remark" auto-complete="off"></el-input>
        </basic-form-item>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addScriptGroupVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addScriptGroupSubmit">确定</el-button>
      </div>
    </el-dialog>
    <!--新增编辑脚本-->
    <el-dialog :title="textMap2[dialogStatus]" :close-on-click-modal="false" v-if="addWorkerVisible" :visible.sync="addWorkerVisible" width="35%">
      <basic-form :model="addWorkerData" ref="addWorkerData" label-width="150px">
        <basic-form-item label="SaltMaster地址：" prop="instance" validate="required">
          <el-input v-model="addWorkerData.instance" auto-complete="off"></el-input>
        </basic-form-item>
        <basic-form-item label="协议类型：" prop="protocol" validate="required">
          <el-input v-model="addWorkerData.protocol" auto-complete="off"></el-input>
        </basic-form-item>
        <basic-form-item label="用户名：" prop="username" validate="required">
          <el-input v-model="addWorkerData.username"></el-input>
        </basic-form-item>
        <basic-form-item label="密码：" prop="password" validate="required">
          <el-input v-model="addWorkerData.password" show-password auto-complete="new-password"></el-input>
        </basic-form-item>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addWorkerVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addWorkerSubmit">确定</el-button>
      </div>
    </el-dialog>
    <set-group :set-data="setData" v-if="setData.dialog" @setOk="handleSearch"></set-group>
  </div>
</template>

<script>
import SetGroup from '@/views/resource-manage/components/setGroup'
import { createBsmHostGroup, deleteBsmHostGroup, getBsmHostGroup, getWorkers, getWorkerDetail, updateBsmHostGroup, createBsmHostWorker, updateBsmHostWorker, deleteBsmHostWorker } from '@/services/task/resource'
import DotDropdown from 'views/repository/component/dotDropdown.vue'
import crypto from 'utils/crypto.js'

export default {
  components: {
    SetGroup,
    DotDropdown
  },
  data() {
    return {
      loading: false,
      searchConfigs: [
        { label: '实例', value: 'instance', type: 'Input' },
        { value: 'category', initValue: 'Ansible', type: 'Const' }
      ],
      saltMasterSearchConfigs: [
        { label: '实例', value: 'instance', type: 'Input' },
        { value: 'category', initValue: 'SaltMaster', type: 'Const' }
      ],
      columns: [
        { label: '实例', prop: 'instance', scopedSlots: { customRender: 'instance' } },
        { label: '类型', prop: 'category' },
        { label: '协议类型', prop: 'protocol' },
        { label: '超级worker', prop: 'isSuper', scopedSlots: { customRender: 'isSuper' } },
        { label: '所属分组', prop: 'groupName' },
        { label: '操作', disabled: true, width: '230px', scopedSlots: { customRender: 'operate' } }
      ],
      list: [],
      saltMasterList: [],
      saltMasterLoading: false,
      total: null,
      saltMasterTotal: null,
      paramt: {
        page: 1,
        rows: 20
      },
      params: {
        page: 1,
        rows: 20
      },
      listQuery: {
        name: '',
        version: ''
      },
      groupId: null,
      parentId: null,
      nodedata: {},
      // 树形菜单
      treeData: [],
      defaultProps: {
        children: 'childrenList',
        label: 'name'
      },
      dropMenuEvents: [
        { label: '编辑', funcName: 'editNode' },
        { label: '删除', funcName: 'removeNode' }
        // { label: '新建子节点', funcName: 'addNode' }
      ],
      // 详情
      detailFlag: false,
      detailData: [],
      // 新增编辑脚本分组
      dialogStatus: '',
      textMap1: {
        update: '编辑分组',
        create: '新增分组'
      },
      addScriptGroup: {},
      addScriptGroupVisible: false,
      props: {
        value: 'id',
        children: 'childrenList',
        label: 'name',
        checkStrictly: true
      },
      addScript: {
        name: ''
      },
      flag: null,
      // 树
      operate: false,
      chartObject: {},
      setData: {
        dialog: false,
        data: {}
      },
      // 新增编辑脚本
      textMap2: {
        update: '网段修改',
        create: '新增网段'
      },
      addWorkerVisible: false,
      addWorkerData: {},
      typeName: 'Ansible'
    }
  },
  created() {
    this.getTreeData()
    // this.handleSearch()
  },
  methods: {
    addNode({ node, data }) {
      this.addScriptGroup = {}
      this.dialogStatus = 'create'
      this.parentId = data.id
      this.addScriptGroupVisible = true
    },
    editNode({ node, data }) {
      this.addScriptGroup = Object.assign({}, data)
      this.dialogStatus = 'update'
      this.addScriptGroupVisible = true
    },
    removeNode({ node, data }) {
      this.$confirm('您确定要删除该分组吗?', '提示', {
        type: 'warning'
      })
        .then(() => {
          deleteBsmHostGroup(data.id).then((data) => {
            if (data.success) {
              this.$message.success({
                message: data.message,
                type: 'success'
              })
              this.getTreeData()
              this.groupId = null
            }
          })
        })
        .catch(() => {})
    },
    setting(row) {
      this.setData = {
        dialog: true,
        data: {
          ...row
        }
      }
    },
    async getTreeData() {
      const that = this
      const data = await getBsmHostGroup({ parentId: 0 })
      if (data.success) {
        that.treeData = data.data
        setTimeout(function () {
          if (that.groupId) {
            that.$refs.scriptTree.setCurrentKey(that.groupId)
          }
        }, 10)
      }
    },
    async getList() {
      this.loading = true
      const data = await getWorkers(this.params)
      if (data.success) {
        this.list = data.data.rows
        this.total = data.data.total
        this.loading = false
      }
    },
    handleNodeClick(node) {
      this.groupId = node.id
      this.nodedata = node
      this.handleSearch()
    },
    handleReset() {
      this.groupId = null
      this.getTreeData()
      this.listQuery = {
        name: '',
        version: ''
      }
      this.handleSearch()
    },
    // 查询
    handleSearch(params) {
      this.params.page = 1
      // this.params.params = params
      const param = {
        groupId: this.groupId || null,
        name: this.listQuery.name,
        category: this.typeName
      }
      this.params.params = this.$tools.handleSearchParam(param)
      this.paramt.params = this.$tools.handleSearchParam(param)
      if (this.typeName == 'Ansible') this.getList()
      else this.getSaltMasterList()
    },
    // 新增脚本分组
    add(flag) {
      this.flag = flag
      this.addScriptGroup = {}
      this.dialogStatus = 'create'
      this.parentId = '0'
      this.addScriptGroupVisible = true
    },
    // 保存新增的脚本分组
    addScriptGroupSubmit() {
      const that = this
      this.$refs.addScriptGroup.validate((valid) => {
        if (valid) {
          const editObj = ['name', 'code', 'remark']
          const param = {}
          for (const a in editObj) {
            const attr = editObj[a]
            param[attr] = that.addScriptGroup[attr]
          }
          let service = ''
          if (that.dialogStatus === 'update') {
            service = updateBsmHostGroup
            param.id = this.groupId
          } else {
            service = createBsmHostGroup
            param.parentId = that.parentId || that.groupId
          }
          service(param).then((data) => {
            if (data.success) {
              that.$notify({
                message: data.message,
                type: 'success'
              })
              that.addScriptGroupVisible = false
              if (that.flag === '2') {
                that.nodedata = param
              }
              that.getTreeData()
            }
          })
        }
      })
    },
    // 详情
    getDetail(id) {
      this.listQuery.version = ''
      this.activeName = 'storage'
      getWorkerDetail(id).then((data) => {
        if (data.success) {
          this.addScript = Object.assign({}, data.data)
          this.addScript.id = id
          this.addScript.groupIds = [this.addScript.groupIds]
          this.detailFlag = true
        }
      })
    },
    goBack() {
      this.detailFlag = false
    },
    async getSaltMasterList() {
      this.saltMasterLoading = true
      const data = await getWorkers(this.paramt)
      if (data.success) {
        this.saltMasterList = data.data.rows
        this.saltMasterTotal = data.data.total
        this.saltMasterLoading = false
      }
    },
    // 新增编辑
    handleCreate(row, flag) {
      this.addWorkerData = {
        content: ''
      }
      this.source = '1'
      switch (flag) {
        case 1:
          this.dialogStatus = 'create'
          this.addWorkerData = {
            instance: '',
            category: 'SaltMaster',
            protocol: '',
            username: '',
            password: ''
          }
          break
        case 2:
          this.dialogStatus = 'update'
          this.addWorkerData = row
          this.addWorkerData.password = crypto.decrypt(this.addWorkerData.password)
          break
      }
      this.addWorkerVisible = true
    },
    handleDelete(id) {
      this.$confirm('您确定要删除该网段吗？', '提示', {
        type: 'warning'
      })
        .then(() => {
          deleteBsmHostWorker(id).then((data) => {
            if (data.success) {
              this.$message.success({
                message: data.message,
                type: 'success'
              })
              this.getSaltMasterList()
            }
          })
        })
        .catch(() => {})
    },
    // 保存worker
    addWorkerSubmit() {
      const that = this
      this.$refs.addWorkerData.validate((valid) => {
        if (valid) {
          this.addWorkerData.password = crypto.encrypt(this.addWorkerData.password)
          let service
          switch (this.dialogStatus) {
            case 'create':
              service = createBsmHostWorker
              break
            case 'update':
              service = updateBsmHostWorker
              break
          }
          service(this.addWorkerData).then((data) => {
            if (data.success) {
              this.$message({
                message: data.message,
                type: 'success'
              })
              that.addWorkerVisible = false
              that.getSaltMasterList()
            }
          })
        }
      })
    }
  }
}
</script>

<style scoped="scoped" lang="scss">
.code-type {
  height: 35px;
  padding-left: 15px;
  line-height: 35px;
  border: 1px solid #ddd;
}
.operate {
  position: absolute !important;
  z-index: 99;
}
.content {
  font-size: 14px;
  border: 1px solid #cccccc;
  min-height: 50px;
  max-height: 300px;
  padding: 10px;
  overflow: auto;
}
.item {
  color: rgb(64 158 255);
  font-size: 16px;
}
::v-deep .tree .el-tree-node__expand-icon.expanded {
  -webkit-transform: rotate(0deg);
  transform: rotate(0deg);
}
::v-deep .el-icon-caret-right:before {
  content: '\e6e0';
  font-size: 14px;
}
::v-deep .el-tree-node__content {
  position: relative;
  height: 32px;
  line-height: 32px;
  .operate-btns {
    position: absolute;
    right: 2px;
    display: none;
  }
  // 鼠标悬停时，展示
  &:hover,
  :focus-within {
    .operate-btns {
      display: inline;
    }
  }
}
</style>
