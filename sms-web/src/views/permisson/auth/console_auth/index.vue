<template>
  <el-row :gutter="10">
    <el-col :span="24" class="m-b">
      <el-alert title="警告" type="error" show-icon :closable="false" description="非专业人士请勿操作或者在专业人士指导下进行设置，操作时应再三思考，您的一次小改动可能导致影响整个控制台的瘫痪，我们已对您的操作做了相应记录，并会以此追究您的责任"></el-alert>
    </el-col>
    <el-col :span="6" style="width: 286px">
      <el-card class="service-menu">
        <div slot="header">
          <el-button type="primary" style="width: 100%" size="mini" icon="el-icon-plus" @click="handleCreate()"> 添加根节点</el-button>
        </div>
        <el-row>
          <el-col :span="24">
            <el-tree highlight-current node-key="id" :data="dataSource" :props="{ label: 'name' }" @node-click="handleNodeClick" :accordion="true" @node-drop="handleDrop" @node-expand="handleExpand" @node-collapse="handleCollapse" :default-expanded-keys="expandenKeys" ref="authTree" draggable>
              <span class="custom-tree-node" slot-scope="{ node, data }">
                <div class="custom-tree-node-wrapper">
                  <span class="custom-tree-node-label">
                    {{ node.label }}
                  </span>
                  <span class="operate-btns">
                    <el-dropdown trigger="hover" class="custom-tree-menu" size="small">
                      <i class="el-icon-more rotate" />
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item @click.native="handleCreate('update', data.id)"> 编辑 </el-dropdown-item>
                        <el-dropdown-item v-if="data.id" @click.native="remove(data.id)"> 删除 </el-dropdown-item>
                        <el-dropdown-item v-if="data.id && data.category !== 'button'" @click.native="handleCreate('create', data.id)"> 新增子节点 </el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
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
        <div slot="header">权限详情</div>
        <span :title="nodeData.name" class="authDetail">菜单名称：{{ nodeData.name }}</span>
        <span :title="nodeData.router" class="authDetail">路由名称：{{ nodeData.router }}</span>
        <span :title="nodeData.component" class="authDetail">组件名称：{{ nodeData.component }}</span>
        <span :title="nodeData.path" class="authDetail">路由地址：{{ nodeData.path }}</span>
        <span :title="nodeData.redirect" class="authDetail">重定向地址：{{ nodeData.redirect }}</span>
      </el-card>
      <AuthAddDialog :dialog="addData" v-if="addData.visible" :authtype="type" @getData="getList" @getButtonList="getButtonList" @getApiList="getApiList"></AuthAddDialog>
    </el-col>
  </el-row>
</template>

<script>
import { cloneDeep } from 'lodash-es'
import AuthAddDialog from './AddDialog.vue'
import { getAuth, getAuthByCategory, removeAuth, modifyAuth } from 'services/system/auth'

export default {
  components: {
    AuthAddDialog
  },
  data() {
    return {
      dataSource: [],
      addData: {},
      nodeData: {},
      expandenKeys: [],
      buttonList: [],
      apiList: [],
      type: '',
      isLeaf: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    handleNodeClick(node) {
      this.nodeData = node
      if (this.nodeData.childs) {
        this.isLeaf = false
      } else {
        this.isLeaf = true
      }
      this.getButtonList()
      this.getApiList()
    },
    handleDrop(draggingNode, dropNode, dropType) {
      const dragNode = cloneDeep(draggingNode.data)
      const dropNodes = cloneDeep(dropNode.data)
      switch (dropType) {
        case 'after':
          dragNode.parentId = dropNodes.parentId
          dragNode.priority = ++dropNodes.priority
          break
        case 'before':
          dragNode.parentId = dropNodes.parentId
          const priority = --dropNodes.priority
          dragNode.priority = priority > 0 ? priority : 1
          break
        case 'inner':
          dragNode.parentId = dropNodes.id
          break
      }
      this.updateMenu(dragNode)
    },
    updateMenu(data) {
      modifyAuth(data).then((data) => {
        if (data.success) {
          this.$message({
            message: data.message,
            type: 'success'
          })
          this.getList()
        }
      })
    },
    remove(id, index) {
      this.$confirm('您确定要删除该权限吗？', '提示', {
        type: 'warning'
      }).then(() => {
        removeAuth(id).then((data) => {
          if (data.success) {
            this.$message.success({
              message: data.message,
              type: 'success'
            })
            if (!index) {
              this.nodeData = {}
              this.getList()
            } else {
              this.getButtonList()
              this.getApiList()
            }
          }
        })
      })
    },
    async getList() {
      const data = await getAuth({ parentId: null, tenant: true })
      if (data.success) {
        this.dataSource = data.data
        this.$nextTick(() => {
          if (this.nodeData.id) {
            this.$refs.authTree.setCurrentKey(this.nodeData.id)
          }
        })
      }
    },
    async getButtonList() {
      const data = await getAuthByCategory({
        parentId: this.nodeData.id,
        category: 'button'
      })
      if (data.success) {
        this.buttonList = data.data
      }
    },
    async getApiList() {
      const data = await getAuthByCategory({
        parentId: this.nodeData.id,
        category: 'api'
      })
      if (data.success) {
        this.apiList = data.data
      }
    },
    handleCreate(type = 'create', id, category) {
      this.addData = {
        visible: true,
        id: id,
        type: type
      }
      if (category) {
        switch (category) {
          case 'button':
            this.type = 'button'
            break
          case 'api':
            this.type = 'api'
            break
        }
      } else {
        this.type = 'menu'
      }
    },
    handleExpand(data) {
      this.expandenKeys.push(data.id)
    },
    handleCollapse(data) {
      const index = this.expandenKeys.indexOf(data.id)
      this.expandenKeys.splice(index, 1)
    }
  }
}
</script>
<style lang="scss" scoped>
.authDetail {
  display: inline-block;
  width: calc(100% / 3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
      color: #000;
      .rotate {
        cursor: pointer;
        margin-left: 5px;
        transform: rotate(90deg);
        color: rgb(64 158 255);
      }
    }
  }
}
</style>
