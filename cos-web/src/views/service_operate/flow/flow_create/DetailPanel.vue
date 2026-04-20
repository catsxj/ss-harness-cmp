<template>
  <div id="detailpannel">
    <div class="panel-title">节点属性</div>
    <div class="panel-body">
      <el-form v-if="nodeData.label" label-position="top">
        <basic-form-item label="节点名称：">
          <el-input v-model="nodeData.label" disabled></el-input>
        </basic-form-item>
        <div v-if="nodeData.code === 'auditTask'">
          <basic-form-item label="审批人员：" v-if="nodeData.assignee.length">
            <el-tag class="m-r-xs" v-for="item in selectUserList" :key="item.id">{{ item.name }}</el-tag>
          </basic-form-item>
          <basic-form-item label="审批角色：" v-if="nodeData.assigneeRole.length">
            <el-tag class="m-r-xs" v-for="item in selectRoleList" :key="item.id">{{ item.name }}</el-tag>
          </basic-form-item>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import { getRoleDetail } from 'services/system/role'
import { getUserDetail } from 'services/system/manager'

export default {
  props: {
    nodeData: {
      type: Object
    }
  },
  data() {
    return {
      selectUserList: [],
      selectRoleList: []
    }
  },
  watch: {
    nodeData() {
      if (this.nodeData.code === 'auditTask') {
        this.getSelectUser()
        this.getSelectRole()
      }
    }
  },
  methods: {
    getSelectUser() {
      this.selectUserList = []
      this.nodeData.assignee.forEach((item) => {
        this.getUserDetail(item)
      })
    },
    getUserDetail(id) {
      getUserDetail(id).then((data) => {
        if (data.success) {
          this.selectUserList.push(data.data)
        }
      })
    },
    getSelectRole() {
      this.selectRoleList = []
      this.nodeData.assigneeRole.forEach((item) => {
        this.getRoleDetail(item)
      })
    },
    async getRoleDetail(id) {
      const data = await getRoleDetail(id)
      if (data.success) {
        this.selectRoleList.push(data.data)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
#detailpannel {
  height: calc(100% - 182px);
  position: absolute;
  overflow: auto;
  right: 0;
  top: 0;
  z-index: 2;
  background: #f7f9fb;
  width: 200px;
  border-left: 1px solid #e6e9ed;
  .panel-title {
    height: 32px;
    border-top: 1px solid #dce3e8;
    border-bottom: 1px solid #dce3e8;
    background: #ebeef2;
    color: #000;
    line-height: 28px;
    padding-left: 12px;
  }
  .panel-body {
    padding: 10px;
  }
}
</style>
