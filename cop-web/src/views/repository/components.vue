<template>
  <div class="wrapper-container">
    <el-row :gutter="10">
      <el-col :span="6" style="width: 286px">
        <el-card class="group">
          <div slot="header">
            <el-tooltip class="item" effect="dark" content="根节点" placement="top-start">
              <el-button type="primary" size="mini" @click="add('0')" icon="el-icon-plus"> </el-button>
            </el-tooltip>
            <!-- <el-tooltip class="item" effect="dark" content="子节点" placement="top-start">
              <el-button type="primary" size="mini" :disabled="!groupId" @click="add('1')">
                <i class="el-icon-plus"></i>
              </el-button>
            </el-tooltip> -->
            <el-tooltip class="item" effect="dark" content="编辑" placement="top-start">
              <el-button type="ghost" icon="el-icon-edit" size="mini" :disabled="!groupId || nodedata.internal" @click="add('2')"> </el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="删除" placement="top-start">
              <el-button type="ghost" icon="el-icon-delete" size="mini" :disabled="!groupId || nodedata.internal" @click="deleteGroup(groupId)"> </el-button>
            </el-tooltip>
          </div>
          <el-row>
            <el-col :span="24">
              <el-tree :data="treeData" ref="scriptTree" node-key="id" :props="defaultProps" @node-click="handleNodeClick" :highlight-current="true"></el-tree>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
      <el-col :span="18" style="width: calc(100% - 286px)">
        <el-card>
          <AdvanceTable :data="list" :searchConfigs="searchConfigs" :params="params" :total="total" :columns="columns" :get-list="getList" :loading="loading">
            <template #name="val, record">
              <span class="detail-href" @click="getDetail(record.id)">{{ record.name }}</span>
            </template>
            <template #status="status">
              <span>{{ status | moduleStatusFilter }}</span>
            </template>
          </AdvanceTable>
        </el-card>
      </el-col>
    </el-row>
    <common-detail v-if="detailVisible" :setting="{ type: 'host' }" :title="detailData.name" @goBack="detailVisible = false">
      <template v-slot:item_container>
        <common-detail-item label="模型名称">{{ detailData.name }}</common-detail-item>
        <common-detail-item label="模型编码">{{ detailData.code }}</common-detail-item>
        <common-detail-item label="操作状态">
          {{ detailData.status | moduleStatusFilter }}
        </common-detail-item>
        <common-detail-item label="上游约束">{{ detailData.preConstraints }}</common-detail-item>
        <common-detail-item label="下游约束">{{ detailData.postConstraints }}</common-detail-item>
        <common-detail-item label="模型描述">{{ detailData.remark }}</common-detail-item>
      </template>
    </common-detail>
    <!--新增编辑组件分组-->
    <el-dialog :title="textMap1[dialogStatus]" :close-on-click-modal="false" v-if="addComponentGroupVisible" :visible.sync="addComponentGroupVisible" width="35%">
      <basic-form :model="addComponentGroup" ref="addComponentGroup">
        <basic-form-item label="分组名称：" prop="name" validate="required">
          <el-input v-model="addComponentGroup.name" auto-complete="off"></el-input>
        </basic-form-item>
        <basic-form-item label="菜单图标：" prop="icon">
          <el-select clearable v-model="addComponentGroup.icon" placeholder="请选择图标">
            <el-option v-for="item in iconData" :key="item.value" :label="item.name" :value="item.value">
              <Icon :type="item.value"></Icon>
              {{ item.value }}
            </el-option>
          </el-select>
        </basic-form-item>
        <basic-form-item label="分组编码：" prop="code" validate="required">
          <el-input v-model="addComponentGroup.code" auto-complete="off"></el-input>
        </basic-form-item>

        <basic-form-item label="分组描述：" prop="remark">
          <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }" v-model="addComponentGroup.remark" auto-complete="off"></el-input>
        </basic-form-item>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addComponentGroupVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addComponentGroupSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getScript, getScriptBySimple } from 'services/task/script'
import { getModule, getModuleDetail, createGroup, modifyGroup, removeModule, getGroup, removeGroup, getGroupDetail } from 'services/task/node'
import { getDictChildren } from 'services/system/dictionary'
const moduleStatusFilter = function(value) {
  const obj = {
    AVAILABLE: '可用的'
  }
  return obj[value]
}
export default {
  filters: {
    moduleStatusFilter
  },
  data() {
    return {
      searchConfigs: [{ label: '模型名称', value: 'name', type: 'Input' }],
      loading: false,
      columns: [
        { label: '模型名称', prop: 'name' },
        { label: '模型编码', prop: 'code' },
        { label: '图标编码', prop: 'icon' },
        { label: '操作状态', prop: 'status', scopedSlots: { customRender: 'status' } },
        { label: '模型描述', prop: 'remark', minWidth: '110px' }
      ],
      list: [],
      total: null,
      params: {
        page: 1,
        rows: 10
      },
      listQuery: {
        name: ''
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
      // 详情
      detailVisible: false,
      detailData: [],
      // 新增编辑组件分组
      dialogStatus: '',
      textMap1: {
        update: '编辑组件分组',
        create: '新增组件分组'
      },
      addComponentGroup: {},
      addComponentGroupVisible: false,
      // 新增编辑组件
      textMap2: {
        update: '编辑组件',
        create: '新增组件'
      },
      props: {
        value: 'id',
        children: 'childrenList',
        label: 'name'
      },
      source: '1',
      scriptListData: [],
      scriptItem: {},
      addScript: {
        name: ''
      },
      addComponentVisible: false,
      scriptTypeData: [
        { name: 'shell', value: 'SHELL' },
        { name: 'bat', value: 'BAT' },
        { name: 'perl', value: 'PERL' },
        { name: 'python', value: 'PYTHON' },
        { name: 'playbook', value: 'PLAYBOOK' },
        { name: 'powershell', value: 'POWERSHELL' },
        { name: 'sql', value: 'SQL' }
      ],
      flag: null,
      iconData: []
    }
  },
  created() {
    this.getTreeData()
    this.getList()
  },
  methods: {
    getTreeData() {
      const that = this
      getGroup({
        parentId: 0
      }).then(data => {
        if (data.success) {
          that.treeData = data.data
          setTimeout(function() {
            if (that.groupId) {
              that.$refs.scriptTree.setCurrentKey(that.groupId)
            }
          }, 10)
        }
      })
    },
    getList() {
      this.loading = true
      getModule(this.params)
        .then(data => {
          if (data.success) {
            this.list = data.data.rows
            this.total = data.data.total
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleNodeClick(node) {
      this.groupId = node.id
      this.nodedata = node
      this.handleSearch()
    },
    handleReset() {
      this.groupId = null
      this.getTreeData()
      this.listQuery = {}
      this.handleSearch()
    },
    // 查询
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        groupId: this.groupId || 0,
        'name:LK': this.listQuery.name
      })
      this.getList()
    },
    // 删除组件
    handleDelete(id) {
      this.$confirm('您确定要删除该组件吗？', '提示', {
        type: 'warning'
      })
        .then(() => {
          removeModule({ id: id }).then(data => {
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
    // 新增组件分组
    add(flag) {
      this.flag = flag
      if (flag === '2') {
        this.addComponentGroup = Object.assign({}, this.nodedata)
        this.dialogStatus = 'update'
      } else {
        this.addComponentGroup = {}
        this.dialogStatus = 'create'
      }
      if (flag === '0') {
        this.parentId = '0'
      } else {
        this.parentId = null
      }
      getDictChildren({ value: 'AUTH_ICON' }).then(data => {
        if (data.success) {
          this.iconData = data.data
        }
      })
      this.addComponentGroupVisible = true
    },
    // 保存新增的组件分组
    addComponentGroupSubmit() {
      const that = this
      this.$refs.addComponentGroup.validate(valid => {
        if (valid) {
          const editObj = ['name', 'code', 'remark', 'icon']
          const param = {}
          for (const a in editObj) {
            const attr = editObj[a]
            param[attr] = that.addComponentGroup[attr]
          }
          if (that.dialogStatus === 'update') {
            param.id = this.groupId
            modifyGroup(param).then(data => {
              if (data.success) {
                that.$notify({
                  message: data.message,
                  type: 'success'
                })
                that.addComponentGroupVisible = false
                if (that.flag == '2') {
                  that.nodedata = param
                }
                that.getTreeData()
              }
            })
          } else {
            param.parentId = that.parentId || that.groupId
            createGroup(param).then(data => {
              if (data.success) {
                that.$notify({
                  message: data.message,
                  type: 'success'
                })
                that.addComponentGroupVisible = false
                if (that.flag == '2') {
                  that.nodedata = param
                }
                that.getTreeData()
              }
            })
          }
        }
      })
    },
    // 删除分组
    deleteGroup(id) {
      this.$confirm('您确定要删除该分组吗?', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      })
        .then(() => {
          removeGroup(id).then(data => {
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
    // 获取组件列表
    async getScriptLst() {
      const data = await getScriptBySimple()
      if (data.success) {
        this.scriptListData = data.data.rows
      }
    },
    getScriptValue(id) {
      const that = this
      getGroupDetail(id).then(data => {
        if (data.success) {
          that.addScript.content = data.data.content
          that.addScript.category = data.data.category
        }
      })
    },
    handleFileChange(event) {
      const self = this
      const data = event.target.files[0]
      // 对文件大小和类型进行过滤
      const arr = data.name.split('.')
      if (['txt', 'sh', 'py', 'bat', 'pl', 'sql', 'yaml', 'yml'].indexOf(arr[arr.length - 1]) === -1) {
        self.$message({
          message: '请上传组件类型的文件，【.txt，.sh，.py，.bat，.pl，.sql，.yaml，.yml】',
          type: 'error'
        })
        return
      }
      if (data.size > 1024 * 1024) {
        self.$message({
          message: '文件大小超过1M',
          type: 'error'
        })
        return
      }
      if (data) {
        arr.pop()
        self.addScript.name = `${arr.join('')}${self.$tools.makeTimeStamp()}`
        self.addScript.filename = data.name
        // 将文件进行转码，转换为text
        const reader = new FileReader()
        reader.readAsText(data)
        reader.onload = function(f) {
          self.addScript.content = this.result
        }
      }
    },
    // 详情
    getDetail(id) {
      getModuleDetail(id).then(data => {
        if (data.success) {
          this.detailData = Object.assign({}, data.data)
          this.detailVisible = true
        }
      })
    },
    goBack() {
      this.detailVisible = false
    },
    // 获取手动输入的组件内容
    getContent(value) {
      this.addScript.content = value
    }
  }
}
</script>

<style>
.wrapper-container {
  padding: 0 !important;
}
.wrapper-container .el-card__body {
  padding: 0 !important;
}

.group .el-card__header {
  padding: 10px !important;
}

.code-type {
  height: 35px;
  padding-left: 15px;
  background: #f6f8f8;
  line-height: 35px;
  border: 1px solid #ddd;
}

.group .el-button--mini {
  padding: 3px !important;
}
</style>
