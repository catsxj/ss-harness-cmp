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
        <AdvanceTable title="网段列表" :data="list" :searchConfigs="searchConfigs" :params="params" :total="total" :columns="columns" :get-list="getList" :loading="loading">
          <template v-slot:action>
            <el-button @click="handleCreate(null, 1)" type="primary" icon="el-icon-plus">新增 </el-button>
          </template>
          <template #level="level">
            <status-icon :type="level | levelFilter('color')">{{ level | levelFilter('name') }} </status-icon>
          </template>
          <template #status="status">
            <status-icon :type="status | applyStatus('color')">
              {{ status | applyStatus('name') }}
            </status-icon>
          </template>
          <template #operate="val, record">
            <el-button icon="el-icon-edit" type="text" @click="handleCreate(record.id, 4)" :disabled="record.status === 'APPROVING'"> 编辑 </el-button>
            <div class="action-divider"></div>
            <el-button icon="el-icon-delete" type="text" @click="handleDelete(record.id)" :disabled="record.status == 'APPROVING'"> 删除 </el-button>
            <!-- <div class="action-divider"></div>
            <el-button icon="el-icon-setting" type="text" @click="handleSegments(record)" :disabled="record.status == 'APPROVING'"> 纳管巡检 </el-button> -->
            <!-- <div class="action-divider"></div>
            <el-dropdown trigger="click">
              <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="apply(record.id)" :disabled="record.status != 'UNAPPLY' && record.status != 'CREATED'">
                  配置
                </el-dropdown-item>
                <el-dropdown-item @click.native="handleCreate(record.id, 3)">
                  主机管理
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown> -->
          </template>
        </AdvanceTable>
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
    <el-dialog :title="textMap2[dialogStatus]" :close-on-click-modal="false" v-if="addScriptVisible" :visible.sync="addScriptVisible" width="35%">
      <basic-form :model="addScript" ref="addScript">
        <basic-form-item label="名称：" prop="name" validate="required,cidr">
          <el-input v-model="addScript.name" auto-complete="off"></el-input>
        </basic-form-item>
        <basic-form-item label="分组：" prop="groupIds" validate="required">
          <el-select clearable v-model="addScript.groupIds" placeholder="请选择分组" filterable="" @change="$forceUpdate()">
            <el-option v-for="item in treeData" :key="item.id" :label="item.name" :value="item.id"> </el-option>
          </el-select>
        </basic-form-item>
        <basic-form-item label="描述：" prop="remark">
          <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }" v-model="addScript.remark" auto-complete="off"></el-input>
        </basic-form-item>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addScriptVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addScriptSubmit">确定</el-button>
      </div>
    </el-dialog>
    <!--纳管巡检-->
    <el-dialog title="纳管巡检" :close-on-click-modal="false" v-if="segmentsData.dialog" :visible.sync="segmentsData.dialog" width="35%">
      <basic-form :model="segmentsData.data" ref="segmentsDataRef">
        <basic-form-item label="网段名称：">
          {{ segmentsData.name }}
        </basic-form-item>
        <basic-form-item label="主机数量：">
          {{ segmentsData.count }}
        </basic-form-item>
        <basic-form-item label="巡检范围：">
          <el-input v-model.number="segmentsData.data.start" auto-complete="off" @blur="blurStart" @input="changeStart" style="width: 120px"></el-input> -
          <el-input v-model.number="segmentsData.data.end" auto-complete="off" @blur="blurEnd" style="width: 120px"></el-input>
        </basic-form-item>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="segmentsData.dialog = false">取消</el-button>
        <el-button type="primary" @click.native="addSegmentsDataSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deleteBsmHostNetwork, getBsmHostGroup, getBsmHostNetwork, getBsmHostNetworkDetail, createBsmHostNetwork, updateBsmHostNetwork, updateBsmHostGroup, createBsmHostGroup, deleteBsmHostGroup, getBsmNetworkSegmentsHostsCount, setBsmNetworkSegmentsInspect } from '@/services/task/resource'
import DotDropdown from 'views/repository/component/dotDropdown.vue'
function open(value) {
  const obj = {
    true: '公有',
    false: '私有'
  }
  return obj[value]
}
const chartSetting = {
  series: {
    initialTreeDepth: 2
  }
}
export default {
  components: {
    DotDropdown
  },
  data() {
    return {
      loading: false,
      searchConfigs: [{ label: '网段名称', value: 'name', type: 'Input' }],
      columns: [
        { label: '网段名称', prop: 'name', scopedSlots: { customRender: 'name' } },
        { label: '分组', prop: 'groupName' },
        { label: '描述', prop: 'remark' },
        { label: '创建时间', prop: 'gmtCreate' },
        { label: '操作', disabled: true, width: '230px', scopedSlots: { customRender: 'operate' } }
      ],
      chartSetting,
      list: [],
      total: null,
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
      // 新增编辑脚本分组
      dialogStatus: '',
      textMap1: {
        update: '编辑分组',
        create: '新增分组'
      },
      addScriptGroup: {},
      addScriptGroupVisible: false,
      // 新增编辑脚本
      textMap2: {
        update: '网段修改',
        create: '新增网段'
      },
      props: {
        value: 'id',
        children: 'childrenList',
        label: 'name',
        checkStrictly: true
      },
      source: '1',
      scriptListData: [],
      scriptItem: {},
      addScript: {
        name: ''
      },
      addScriptVisible: false,
      flag: null,
      // 树
      operate: false,
      chartObject: {},
      segmentsData: {
        dialog: false,
        data: {}
      }
    }
  },
  created() {
    this.getTreeData()
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
    async getTreeData() {
      const that = this
      const data = await getBsmHostGroup({ page: 1, rows: 20 })
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
      const data = await getBsmHostNetwork(this.params)
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
      this.params.params = this.$tools.handleSearchParam({
        groupId: this.groupId || 0,
        name: this.listQuery.name
      })
      this.getList()
    },
    // 删除脚本
    handleDelete(id) {
      this.$confirm('您确定要删除该网段吗？', '提示', {
        type: 'warning'
      })
        .then(() => {
          deleteBsmHostNetwork(id).then((data) => {
            if (data.success) {
              this.$message.success({
                message: data.message,
                type: 'success'
              })
              this.getList()
            }
          })
        })
        .catch(() => {})
    },
    async handleSegments(row) {
      this.segmentsData = {
        dialog: true,
        ...row,
        count: 0,
        data: {
          start: '',
          end: ''
        }
      }
      const data = await getBsmNetworkSegmentsHostsCount(row.id)
      if (data.success) this.segmentsData.count = data.data
    },
    changeStart() {
      this.segmentsData.data.start = this.segmentsData.data.start < 1 ? 1 : this.segmentsData.data.start
    },
    blurStart() {
      if (this.segmentsData.data.end) this.blurEnd()
    },
    blurEnd() {
      this.segmentsData.data.end = this.segmentsData.data.end < this.segmentsData.data.start ? this.segmentsData.data.start + 1 : this.segmentsData.data.end
    },
    async addSegmentsDataSubmit() {
      const { id, data } = this.segmentsData
      const { start, end } = data
      const params = { id, start, end }
      const res = await setBsmNetworkSegmentsInspect(params)
      if (res.success) {
        this.$notify({
          message: res.message,
          type: 'success'
        })
        this.segmentsData.dialog = false
        this.getList()
      }
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
    // 新增编辑脚本
    handleCreate(id, flag) {
      this.addScript = {
        content: ''
      }
      this.source = '1'
      switch (flag) {
        case 1:
          this.dialogStatus = 'create'
          this.addScript = {
            open: true,
            name: '',
            category: 'SHELL',
            content: ''
          }
          break
        case 3:
          break
        case 4:
          this.dialogStatus = 'update'
          this.addScript.content = ''
          getBsmHostNetworkDetail(id).then((data) => {
            if (data.success) {
              this.addScript = Object.assign({}, data.data)
              this.addScript.groupIds = this.addScript.groupId
            }
          })
          break
      }
      // this.getScriptLst()
      this.addScriptVisible = true
    },
    // 保存脚本
    addScriptSubmit() {
      const that = this
      this.$refs.addScript.validate((valid) => {
        if (valid) {
          let service
          switch (this.dialogStatus) {
            case 'create':
              service = createBsmHostNetwork
              break
            case 'update':
              service = updateBsmHostNetwork
              break
          }
          const length = that.addScript.groupIds.length
          that.addScript.groupId = that.addScript.groupIds
          service(this.addScript).then((data) => {
            if (data.success) {
              this.$message({
                message: data.message,
                type: 'success'
              })
              that.addScriptVisible = false
              that.getList()
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
