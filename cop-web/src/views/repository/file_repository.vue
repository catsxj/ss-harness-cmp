<template>
  <div class="wrapper-container">
    <el-row :gutter="10">
      <el-col :span="6" style="width: 286px">
        <el-card class="group">
          <div slot="header">
            文件分类
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
                      <dot-dropdown :events="dropMenuEvents" :data="{node,data}" @addNode="addNode" @editNode="editNode" @removeNode="removeNode" />
                    </span>
                  </div>
                </span>
              </el-tree>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
      <el-col :span="18" style="width: calc(100% - 286px)">
        <AdvanceTable title="文件列表" :data="list" :searchConfigs="searchConfigs" :params="params" :total="total" :columns="columns" :get-list="getList" :loading="loading">
          <template v-slot:action>
            <el-button @click="handleCreate" type="primary" icon="el-icon-plus">新增 </el-button>
          </template>
          <template #name="val, record">
            <span class="detail-href" @click="getDetail(record)">{{ record.name }}</span>
          </template>
          <template #status="status">
            <status-icon :type="applyStatusFilter(status, 'color')">
              {{ applyStatusFilter(status, 'name') }}
            </status-icon>
          </template>
          <template #operate="val,record">
            <el-button type="text" icon="el-icon-edit" @click="handleCreate(record)" :disabled="record.status == 'APPROVING' || record.status == 'APPROVED'">
              编辑
            </el-button>
            <div class="action-divider"></div>
            <el-button type="text" icon="el-icon-delete" @click="handleDelete(record.id)" :disabled="record.status == 'APPROVING'||record.status === 'APPROVED'">
              删除
            </el-button>
            <div class="action-divider"></div>
            <el-dropdown trigger="click">
              <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="handleDownload(record)">
                  下载
                </el-dropdown-item>
                <el-dropdown-item @click.native="handleRelease(record)" v-if="record.status === 'DEVELOPING'">
                  发布
                </el-dropdown-item>
                <el-dropdown-item @click.native="handleRecall(record, 'recall')" v-if="record.status === 'APPROVED'">
                  下架
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </AdvanceTable>
      </el-col>
    </el-row>
    <common-detail v-if="detailFlag" :setting="{ type: 'software' }" :title="detailSoft.name" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="文件名称">{{ detailSoft.name }}</common-detail-item>
        <common-detail-item label="文件状态">
          <status-icon :type="applyStatusFilter(detailSoft.status, 'color')">
            {{ applyStatusFilter(detailSoft.status, 'name') }}
          </status-icon>
        </common-detail-item>
        <common-detail-item label="文件分组">{{ detailSoft.groupName }}</common-detail-item>
        <common-detail-item label="文件路径">{{ detailSoft.path }}</common-detail-item>
        <common-detail-item label="其他属性">{{ detailSoft.moreProp }}</common-detail-item>
        <common-detail-item label="文件描述">{{ detailSoft.remark }}</common-detail-item>
      </template>
    </common-detail>
    <!--新增编辑脚本分组-->
    <el-dialog :title="textMap1[dialogStatus]" :close-on-click-modal="false" v-if="addScriptGroupVisible" :visible.sync="addScriptGroupVisible">
      <basic-form :model="addScriptGroup" ref="addScriptGroup">
        <basic-form-item label="分组名称：" prop="name" validate="required">
          <el-input v-model="addScriptGroup.name" auto-complete="off"></el-input>
        </basic-form-item>

        <basic-form-item label="分组编码：" prop="code" validate="required">
          <el-input v-model="addScriptGroup.code" auto-complete="off"></el-input>
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
    <!--新增编辑文件-->
    <el-dialog :title="textMap2[dialogStatus]" :close-on-click-modal="false" v-if="addSoftVisible" :visible.sync="addSoftVisible" width="600px">
      <basic-form :model="addSoft" ref="addSoft">
        <el-row :gutter="20">
          <el-col :span="24">
            <basic-form-item label="文件名称：" prop="name" validate="required">
              <el-input v-model="addSoft.name" auto-complete="off"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="文件分组：" prop="groupIds" validate="required" required-message="请选择文件分组">
              <el-cascader :options="treeData" v-model="addSoft.groupIds" :props="props" change-on-select> </el-cascader>
            </basic-form-item>
          </el-col>
          <el-col :span="24" v-if="dialogStatus == 'create'">
            <ws-upload-file ref="imageUpload"></ws-upload-file>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="描述：" prop="remark">
              <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }" v-model="addSoft.remark" auto-complete="off"></el-input>
            </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addSoftVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addScriptSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { applyStatusFilter } from '@/filters/index'
import { getScriptDetail } from 'services/task/script'
import { getGroup, createGroup, modifyGroup, removeGroup, getSoftwares, getSoftwaresDetail, createSoftwares, modifySoftwares, removeSoftwares, getFileExists, getSoftwaresCheck, exportSoftwares, releaseRoutine, recallRoutine } from 'services/task/soft'
import dotDropdown from './component/dotDropdown.vue'
export default {
  components: {
    dotDropdown
  },
  data() {
    return {
      applyStatusFilter,
      loading: false,
      list: [],
      total: null,
      params: {
        page: 1,
        rows: 10
      },
      searchConfigs: [
        { label: '文件名称', value: 'name', type: 'Input' },
        {
          label: '文件路径',
          value: 'path',
          type: 'Input'
        }
      ],
      columns: [
        { label: '文件名称', prop: 'name', scopedSlots: { customRender: 'name' } },
        { label: '文件状态', prop: 'status', scopedSlots: { customRender: 'status' } },
        { label: '文件路径', prop: 'path' },
        { label: '操作', disabled: true, width: '220px', scopedSlots: { customRender: 'operate' } }
      ],
      listQuery: {
        name: '',
        path: ''
      },
      groupId: null,
      parentId: null,
      // 树形菜单
      treeData: [],
      defaultProps: {
        children: 'childrenList',
        label: 'name'
      },
      dropMenuEvents: [
        { label: '编辑', funcName: 'editNode' },
        { label: '删除', funcName: 'removeNode' },
        { label: '新建子节点', funcName: 'addNode' }
      ],
      // 详情
      detailFlag: false,
      detailData: [],
      // 新增编辑文件分组
      dialogStatus: '',
      textMap1: {
        update: '编辑文件分组',
        create: '新增文件分组'
      },
      addScriptGroup: {},
      addScriptGroupVisible: false,
      // 新增编辑文件
      textMap2: {
        update: '编辑文件',
        create: '新增文件'
      },
      props: {
        value: 'id',
        children: 'childrenList',
        label: 'name'
      },
      source: '1',
      scriptListData: [],
      scriptItem: {},
      addSoft: {},
      addSoftVisible: false,
      flag: null,
      detailSoft: {}
    }
  },
  created() {
    this.getTreeData()
    this.getList()
  },
  methods: {
    handleRelease(data) {
      this.$confirm(`您确定要发布该模板【${data.name}】吗?`, '提示', {
        confirmButtonText: '确定',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        releaseRoutine(data.id).then((data) => {
          if (data.success) {
            this.$message({
              message: data.message,
              type: 'success'
            })
            this.getList()
          }
        })
      })
    },
    handleRecall(data) {
      this.$confirm(`您确定要下架该模板【${data.name}】吗?`, '提示', {
        confirmButtonText: '确定',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        recallRoutine(data.id).then((data) => {
          if (data.success) {
            this.$message({
              message: data.message,
              type: 'success'
            })
            this.getList()
          }
        })
      })
    },
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
          removeGroup(data.id).then((data) => {
            if (data.success) {
              this.$message.success({
                message: data.message,
                type: 'success'
              })
              this.getTreeData()
            }
          })
        })
        .catch(() => {})
    },
    getTreeData() {
      getGroup({ parentId: 0 }).then((data) => {
        if (data.success) {
          this.treeData = data.data
          setTimeout(() => {
            if (this.groupId) {
              this.$refs.scriptTree.setCurrentKey(this.groupId)
            }
          }, 10)
        }
      })
    },
    getList() {
      this.loading = true
      getSoftwares(this.params)
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
    handleNodeClick(node) {
      this.groupId = node.id
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
        'name:LK': this.listQuery.name,
        'path:LK': this.listQuery.path
      })
      this.getList()
    },
    // 删除文件
    handleDelete(id) {
      this.$confirm('您确定要删除该文件吗？', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      })
        .then(() => {
          removeSoftwares(id).then((data) => {
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
          if (that.dialogStatus == 'update') {
            param.id = this.addScriptGroup.id
            modifyGroup(param).then((data) => {
              if (data.success) {
                that.$notify({
                  message: data.message,
                  type: 'success'
                })
                that.addScriptGroupVisible = false
                that.getTreeData()
              }
            })
          } else {
            param.parentId = that.parentId
            createGroup(param).then((data) => {
              if (data.success) {
                that.$notify({
                  message: data.message,
                  type: 'success'
                })
                that.addScriptGroupVisible = false
                that.getTreeData()
              }
            })
          }
        }
      })
    },
    // 新增编辑脚本
    handleCreate(row) {
      this.dialogStatus = 'create'
      this.addSoft = {}
      if (row.id) {
        this.dialogStatus = 'update'
        this.addSoft = Object.assign({}, row)
        this.addSoft.groupIds = JSON.parse(this.addSoft.groupIds)
      }

      this.addSoftVisible = true
    },
    async getScriptValue(id) {
      const data = await getScriptDetail(id || this.scriptItem.selected)
      if (data.success) {
        this.addScript.content = data.data.content || ''
      }
    },
    handleFileChange(event) {
      const self = this
      const data = event.target.files[0]
      // 对文件大小和类型进行过滤
      const arr = data.name.split('.')
      if (['txt', 'sh', 'py', 'bat', 'pl', 'sql', 'yaml', 'yml'].indexOf(arr[arr.length - 1]) == -1) {
        self.$message({
          message: '请上传脚本类型的文件，【.txt，.sh，.py，.bat，.pl，.sql，.yaml，.yml】',
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
      const makeName = function (name) {
        // 对时间进行格式化
        const format = function (value) {
          if (value / 1 < 10) value = '0' + value
          return value
        }
        const date = new Date()
        self.addScript.name = name + '-' + date.getFullYear() + format(date.getMonth() + 1) + format(date.getDate()) + format(date.getHours()) + format(date.getMinutes()) + format(date.getSeconds())
      }
      if (data) {
        self.addScript.filename = data.name
        arr.pop()
        makeName(arr.join(''))
        // 将文件进行转码，转换为text
        const reader = new FileReader()
        reader.readAsText(data)
        reader.onload = function (f) {
          self.addScript.content = this.result
        }
      }
    },
    // 保存文件
    addScriptSubmit() {
      const that = this
      this.$refs.addSoft.validate((valid) => {
        if (valid) {
          if (that.dialogStatus == 'update') {
            const length = that.addSoft.groupIds.length
            that.addSoft.groupId = that.addSoft.groupIds[length - 1]
            const edit = ['id', 'name', 'groupId', 'groupIds', 'remark', 'path']
            const addData = {}
            edit.forEach(function (attr) {
              addData[attr] = that.addSoft[attr]
            })
            modifySoftwares(addData).then((data) => {
              if (data.success) {
                that.$notify({
                  message: data.message,
                  type: 'success'
                })
                that.addSoftVisible = false
                that.getList()
              }
            })
          } else {
            console.log('@@@上传文件信息', this.$refs.imageUpload)
            if (this.$refs.imageUpload.file?.filePath) {
              this.addSoft.path = this.$refs.imageUpload.file.filePath
            } else {
              return this.$message.error('请先上传文件！')
            }
            const length = that.addSoft.groupIds.length
            that.addSoft.groupId = that.addSoft.groupIds[length - 1]
            const edit = ['id', 'name', 'groupId', 'groupIds', 'remark', 'path']
            const addData = {}
            edit.forEach(function (attr) {
              addData[attr] = that.addSoft[attr]
            })
            createSoftwares(addData).then((data) => {
              if (data.success) {
                that.$notify({
                  message: data.message,
                  type: 'success'
                })
                that.addSoftVisible = false
                that.getList()
              }
            })
          }
        }
      })
    },
    // 导出
    handleDownload(row) {
      getSoftwaresCheck({
        path: row.path
      }).then((data) => {
        if (data.success) {
          const params = JSON.stringify({ path: row.path })
          exportSoftwares(row.path).then((data) => {
            if (data.success) {
              this.$notify({
                message: data.message,
                type: 'success'
              })
            }
          })
        }
      })
    },
    // 详情
    getDetail(row) {
      getSoftwaresDetail(row.id).then((data) => {
        if (data.success) {
          this.detailSoft = data.data
          this.detailFlag = true
        }
      })
    },
    goBack() {
      this.detailFlag = false
    }
  }
}
</script>

<style scoped="scoped" lang="scss">
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
