<template>
  <div>
    <AdvanceTable title="角色列表" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
      <template v-slot:action>
        <el-button type="primary" @click="handleCreate()" slot="operate" icon="el-icon-plus">新增</el-button>
      </template>
      <template #status="status">
        <status-icon :type="generalStatusFilter(status, 'color')">
          {{ generalStatusFilter(status, 'status') }}
        </status-icon>
      </template>
      <template #diskDelShow="val, record">
        <el-switch v-model="record.diskDelShow" @change="handleDiskDelShow(record)" active-text="展示" inactive-text="隐藏"></el-switch>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="handleCreate(record)"><i class="el-icon-edit"></i> 编辑</el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="handleDelete(record.id)"><i class="el-icon-delete"></i> 删除</el-button>
        <div class="action-divider"></div>
        <el-dropdown trigger="click">
          <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="handleGrant(record.id)"> 命令授权 </el-dropdown-item>
            <el-dropdown-item @click.native="handleAuth(record.id)"> 菜单授权 </el-dropdown-item>
            <el-dropdown-item @click.native="handleApi(record)"> 功能授权 </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </AdvanceTable>
    <!--新增编辑界面-->
    <el-dialog :title="textMap[dialogStatus]" :close-on-click-modal="false" v-if="adddialogFormVisible" :visible.sync="adddialogFormVisible" width="800px">
      <basic-form :model="addData" ref="addData" label-width="280px">
        <basic-form-item label="角色名称：" prop="name" validate="required">
          <el-input v-model="addData.name" auto-complete="off"></el-input>
        </basic-form-item>
        <el-form-item label="角色描述：" prop="remark">
          <el-input type="textarea" v-model="addData.remark" auto-complete="off"></el-input>
        </el-form-item>
        <!-- <el-form-item label="展示自服务端云主机详情-磁盘删除按钮：" prop="diskDelShow">
          <el-switch v-model="addData.diskDelShow" active-text="展示" inactive-text="隐藏"></el-switch>
        </el-form-item> -->
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="adddialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit" :loading="loading">确定</el-button>
      </div>
    </el-dialog>
    <!--菜单授权-->
    <el-dialog title="菜单授权" :close-on-click-modal="false" v-if="authGrantVisible" :visible.sync="authGrantVisible" width="70%">
      <el-row :gutter="10">
        <el-col :span="8">
          <el-tree :expand-on-click-node="false" ref="tree" :data="treelist" node-key="id" :props="props" show-checkbox @check-change="changeCheck" @node-click="handleNodeClick" highlight-current> </el-tree>
        </el-col>
        <el-col :span="16">
          <el-card>
            <div slot="header">按钮列表</div>
            <el-table :data="buttonList" ref="buttonListTable" tooltip-effect="dark" @selection-change="SelectionChange" stripe fit>
              <el-table-column show-overflow-tooltip type="selection"> </el-table-column>
              <el-table-column show-overflow-tooltip label="名称" prop="name"> </el-table-column>
              <el-table-column show-overflow-tooltip label="编码" prop="meta"> </el-table-column>
            </el-table>
          </el-card>
          <el-card class="m-t">
            <div slot="header">API列表</div>
            <el-table :data="apiList" ref="apiListTable" tooltip-effect="dark" @selection-change="SelectionChange" stripe fit>
              <el-table-column show-overflow-tooltip type="selection"> </el-table-column>
              <el-table-column show-overflow-tooltip label="名称" prop="name"> </el-table-column>
              <el-table-column show-overflow-tooltip label="路径" prop="path"> </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="authGrantVisible = false">取消</el-button>
        <el-button type="primary" @click.native="authGrantSubmit" :loading="loading">确定</el-button>
      </div>
    </el-dialog>
    <!--命令授权-->
    <el-dialog title="命令授权" :visible.sync="grantdialogVisible" width="35%">
      <el-table :data="commandlist" ref="commandTable" tooltip-effect="dark" @selection-change="handleSelectionChange" stripe border fit>
        <el-table-column show-overflow-tooltip type="selection"> </el-table-column>
        <el-table-column show-overflow-tooltip label="名称" prop="name"> </el-table-column>
        <el-table-column show-overflow-tooltip label="级别">
          <template slot-scope="scope">
            <status-icon :type="levelFilter(scope.row.level, 'color')">
              {{ levelFilter(scope.row.level) }}
            </status-icon>
          </template>
        </el-table-column>
        <el-table-column show-overflow-tooltip label="内容" prop="content"> </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="grantdialogVisible = false">取消</el-button>
        <el-button type="primary" @click.native="comGrantSubmit" :loading="loading">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="功能授权" :close-on-click-modal="false" v-if="apiGrantVisible" :visible.sync="apiGrantVisible" width="70%">
      <basic-form>
        <el-row class="m-t" :gutter="10" v-loading="loading">
          <el-col :span="12">
            <el-checkbox v-model="apiGrantData.selectAll" @change="selectAll">全选</el-checkbox>
            <el-tree ref="apitree" :expand-on-click-node="false" :data="modulesData" node-key="tag" :props="{ label: 'label', children: 'value' }" show-checkbox @check-change="changeCheckApi">
              <span slot-scope="{ node }">
                <span :class="node.label.indexOf(':') > -1 ? 'custom-tree-node' : ''">{{ node.label.split(':')[0] }}</span
                ><span>: {{ node.label.split(':')[1] }}</span>
              </span>
            </el-tree>
          </el-col>
        </el-row>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="apiGrantVisible = false">取消</el-button>
        <el-button type="primary" @click.native="apiGrantSubmit" :loading="loading">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getAuthByCategory } from 'services/system/auth'
import { getRole, createRole, modifyRole, removeRole, getRoleAuth, accreditRole, getApiById, updateApi } from 'services/system/role'
import { getRoleCommand, accreditCommand } from 'services/task/command'
import { generalStatusFilter } from '@/filters/common'

const searchConfigs = [{ label: '角色名称', value: 'name', type: 'Input' }]
const columns = [
  {
    label: '名称',
    prop: 'name'
  },
  {
    label: '状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  // {
  //   label: '展示自服务端云主机详情-磁盘删除按钮',
  //   prop: 'diskDelShow',
  //   width: '240px',
  //   scopedSlots: { customRender: 'diskDelShow' }
  // },
  {
    label: '描述',
    prop: 'remark'
  },
  {
    label: '操作',
    disabled: true,
    prop: 'id',
    width: '220px',
    scopedSlots: { customRender: 'operate' }
  }
]
function levelFilter(level, name = 'name') {
  const levelMap = {
    DEADLY: {
      name: '致命',
      color: 'danger'
    },
    HIGH: {
      name: '严重',
      color: 'warning'
    },
    SERIOUS: {
      name: '高危',
      color: 'normal'
    },
    MEDIUM: {
      name: '中等',
      color: 'primary'
    },
    COMMON: {
      name: '普通',
      color: 'success'
    }
  }
  return levelMap[level][name]
}
export default {
  data() {
    return {
      generalStatusFilter,
      columns,
      value: false,
      loading: false,
      searchConfigs,
      list: null,
      treelist: [],
      commandlist: null,
      params1: null,
      total: null,
      params: {
        page: 1,
        rows: 10
      },
      adddialogFormVisible: false,
      authGrantVisible: false,
      grantdialogVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑角色',
        create: '创建角色'
      },
      // 新增界面数据
      addData: {
        name: '',
        remark: '',
        props: []
      },
      props: {
        label: 'name',
        children: 'childs',
        isLeaf: 'leaf'
      },
      departData: [],
      // 权限授权
      authGrantData: {
        button: false
      },
      arr: [],
      // 权限授权
      grantData: {},
      multipleSelection: [],
      // 授权
      buttonList: [],
      apiList: [],
      nodeData: {},
      checkedList: [],
      nowChecked: [],
      nowUnchecked: [],
      apiGrantVisible: false,
      apiGrantData: {
        apis: []
      },
      modulesData: [], // 服务列表
      apisById: [] // 当前角色已授权api
    }
  },
  computed: {
    ...mapState({
      userData: (state) => state.app.userData
    })
  },
  methods: {
    levelFilter,
    async getList() {
      this.loading = true
      const data = await getRole(this.params)
      this.loading = false
      if (data.success) {
        this.list = data.data.rows
        this.total = data.data.total
      }
    },
    // 新增编辑按钮
    handleCreate(data) {
      if (data) {
        this.addData = Object.assign({}, data)
        if (this.addData.props === '[]') {
          this.value = false
        } else {
          this.value = true
        }
        this.dialogStatus = 'update'
        this.adddialogFormVisible = true
      } else {
        this.value = false
        this.addData = { props: [] }
        this.dialogStatus = 'create'
        this.adddialogFormVisible = true
      }
    },
    // 删除角色
    handleDelete(id) {
      this.$confirm('您确定要删除该角色吗?', '提示', {
        type: 'warning'
      })
        .then(() => {
          removeRole(id).then((data) => {
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
    // 命令授权
    handleGrant(id) {
      this.grantData.id = id
      getRoleCommand({
        roleId: id,
        parentId: 0
      }).then((data) => {
        if (data.success) {
          this.commandlist = data.data
          this.grantdialogVisible = true
          setTimeout(function () {
            this.commandlist.forEach(function (item, index) {
              if (item.checked) {
                this.$refs.commandTable.toggleRowSelection(item)
              }
            })
          }, 10)
        }
      })
    },
    // 获取多选的id
    getSelectedIds() {
      let ids = ''
      this.multipleSelection.map((item) => {
        ids += item.id + ','
      })
      return ids
    },
    // 命令授权保存
    comGrantSubmit() {
      this.loading = true
      accreditCommand({
        roleId: this.grantData.id,
        commands: this.getSelectedIds()
      }).then((data) => {
        if (data.success) {
          this.$message({
            message: data.message,
            type: 'success'
          })
          this.grantdialogVisible = false
          this.getList()
        }
        this.loading = false
      })
    },
    handleAuth(id) {
      this.authGrantVisible = true
      this.authGrantData.id = id
      this.treelist = []
      this.arr = []
      this.apiList = []
      this.buttonList = []
      this.getTreeList()
      this.getCheckedList(id)
    },
    handleApi(data) {
      this.apiGrantVisible = true
      this.apiGrantData = {
        id: data.id,
        apis: [],
        selectAll: false
      }
      if (data.props == 'tenantAPi') {
        this.apiGrantData.tags = 'CSC'
      }
      this.getModules()
    },
    handleDiskDelShow(record) {
      const params = record
      modifyRole(params).then((data) => {
        if (data.success) {
          this.$notify({
            message: data.message,
            type: 'success'
          })
          this.getList()
        }
      })
    },
    //      新增/编辑角色保存
    addSubmit() {
      if (this.value == false) {
        this.addData.props = []
      }
      const http = this.addData.id ? modifyRole : createRole
      this.$refs.addData.validate((valid) => {
        if (valid) {
          this.loading = true
          http(this.addData).then((data) => {
            if (data.success) {
              this.$notify({
                message: data.message,
                type: 'success'
              })
              this.adddialogFormVisible = false
              this.getList()
            }
            this.loading = false
          })
        }
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    changeCheck(obj, isChecked, data3) {
      if (isChecked) {
        this.arr.push(obj.id)
      } else {
        const index = this.arr.indexOf(obj.id)
        if (index != -1) {
          this.arr.splice(index, 1)
        }
      }
    },
    recursion(data) {
      data.forEach((item) => {
        if (item.checked) {
          this.arr.push(item.id)
        }
        if (item.childs) {
          this.recursion(item.childs)
        }
      })
    },
    getTreeList() {
      this.params1 = { id: this.authGrantData.id, parentId: 0, button: false }
      getRoleAuth(this.authGrantData.id, {
        menu: true,
        tenant: false
      }).then((data) => {
        if (data.success) {
          data.data.forEach((item) => {
            if (item.checked) {
              this.arr.push(item.id)
            }
            if (item.childs) {
              this.recursion(item.childs)
            }
          })
          this.treelist = this.packTreeData([...data.data])
          console.log(this.treelist)
          this.$refs.tree.setCheckedKeys(this.arr)
        }
      })
    },
    packTreeData(nodes) {
      if (!nodes?.length) {
        return []
      }
      const arr = []
      for (const node of nodes) {
        if (node.category != 'button') {
          arr.push(node)
          node.childs = this.packTreeData(node.childs)
        }
      }
      return arr
    },
    //      权限授权保存
    authGrantSubmit() {
      const auths = []
      const ids = this.$refs.tree.getCheckedNodes()
      ids.forEach(function (item) {
        auths.push(item.id)
      })
      this.checkedList.forEach((item) => {
        auths.push(item.id)
      })
      const { id } = this.authGrantData
      this.loading = true
      accreditRole(id, auths).then((data) => {
        if (data.success) {
          this.$message({
            message: data.message,
            type: 'success'
          })
          this.authGrantVisible = false
          // 更新路由
          this.$store.dispatch('permission/ChangeRoutes')
          this.getList()
        }
        this.loading = false
      })
    },
    handleNodeClick(node) {
      this.nodeData = node
      this.nowChecked = []
      this.nowUnchecked = []
      this.getButtonList()
      this.getApiList()
    },
    async getButtonList() {
      const data = await getAuthByCategory({
        parentId: this.nodeData.id,
        category: 'button'
      })
      if (data.success) {
        this.buttonList = data.data
        this.$nextTick(() => {
          console.log(JSON.parse(JSON.stringify(this.checkedList)))
          this.buttonList.forEach((item) => {
            if (this.checkedList.findIndex(({ id }) => id === item.id) > -1) {
              this.nowChecked.push(item)
              this.$refs.buttonListTable.toggleRowSelection(item)
            } else {
              this.nowUnchecked.push(item)
            }
          })
        })
      }
    },
    async getApiList() {
      const data = await getAuthByCategory({
        parentId: this.nodeData.id,
        category: 'api'
      })
      if (data.success) {
        this.apiList = data.data
        this.$nextTick(() => {
          this.apiList.forEach((item) => {
            if (this.checkedList.findIndex(({ id }) => id === item.id) > -1) {
              this.nowChecked.push(item)
              this.$refs.apiListTable.toggleRowSelection(item)
            } else {
              this.nowUnchecked.push(item)
            }
          })
        })
      }
    },
    getCheckedList(id) {
      getRoleAuth(id, { menu: false }).then((data) => {
        if (data.success) {
          // this.apiList = data.data
          const { api, button } = data.data
          this.checkedList = [...api, ...button].filter(({ checked }) => checked)
        }
      })
    },
    SelectionChange(selection) {
      const selectionIds = selection.map(({ id }) => id)
      this.nowChecked.forEach((item) => {
        if (selectionIds.findIndex((id) => id === item.id) === -1) {
          const index = this.checkedList.findIndex(({ id }) => id === item.id)
          this.checkedList.splice(index, 1)
        }
      })
      this.nowUnchecked.forEach((item) => {
        if (selectionIds.findIndex((id) => id === item.id) > -1) {
          this.checkedList.push(item)
        }
      })
    },
    async getModules(value) {
      this.apiGrantData.selectAll = false
      this.apiGrantData.apis = []
      this.loading = true
      const data = await getApiById(this.apiGrantData.id, this.apiGrantData.tags)
      if (data.success) {
        this.loading = false
        this.modulesData = data.data
        data.data.forEach((item) => {
          item.label = item.name
          item.value.forEach((a) => {
            a.label = a.name
            a.value.forEach((b) => {
              b.label = `${b.method}: ${b.operation} (${b.url})`
              b.tag = `${b.service}:${b.pattern}`
              if (b.check) {
                this.apisById.push(b.tag)
              }
            })
          })
        })
      }
      this.$refs.apitree.setCheckedKeys(this.apisById)
    },
    changeCheckApi(obj, isChecked, data3) {
      if (isChecked) {
        this.apiGrantData.apis.push(obj)
      } else {
        const index = this.apiGrantData.apis.indexOf(obj.pattern)
        if (index != -1) {
          this.apiGrantData.apis.splice(index, 1)
        }
      }
    },
    selectAll(value) {
      const arr = []
      if (value) {
        this.modulesData.forEach((item) => {
          item.value.forEach((a) => {
            a.value.forEach((b) => {
              arr.push(b.tag)
            })
          })
        })
      }
      this.$refs.apitree.setCheckedKeys(arr)
    },
    apiGrantSubmit() {
      const nodes = this.$refs.apitree.getCheckedNodes()
      const { id, module } = this.apiGrantData
      const apis = []
      nodes.forEach((item) => {
        if (!item.value) {
          apis.push(item)
        }
      })
      this.loading = true
      updateApi(id, apis).then((data) => {
        if (data.success) {
          this.$message({
            message: data.message,
            type: 'success'
          })
          this.apiGrantVisible = false
          // 更新路由
          this.$store.dispatch('permission/ChangeRoutes')
          this.getList()
        }
        this.loading = false
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.menu {
  display: inline-block;
  width: 30%;
  overflow-x: auto;
}

.button {
  display: inline-block;
  width: 70%;
}
</style>
<style scoped>
.custom-tree-node {
  color: #409eff;
}
</style>
