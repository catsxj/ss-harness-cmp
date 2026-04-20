<template>
  <CardLayout title="审批人设置">
    <el-row :gutter="10">
      <el-col :span="12">
        <el-card style="height: 408px">
          <div slot="header">
            <span>审批人列表</span>
            <el-button type="primary" class="pull-right" size="mini" :disabled="leftSlection.length === 0" @click="addUser">移入<i class="el-icon-arrow-right"></i></el-button>
          </div>
          <el-form :inline="true">
            <el-form-item>
              <el-input placeholder="用户姓名" v-model="listQuery.name"> </el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
            </el-form-item>
          </el-form>
          <basic-table ref="userTable" :small="true" :data="list" :params="params" :get-list="getList" :total="total" @selection-change="selectionChange">
            <el-table-column type="selection" :selectable="selectAble" width="60"> </el-table-column>
            <el-table-column show-overflow-tooltip label="用户姓名" prop="name"> </el-table-column>
            <el-table-column show-overflow-tooltip label="用户邮箱" prop="email"> </el-table-column>
            <el-table-column show-overflow-tooltip label="所属组织" prop="departmentName"> </el-table-column>
            <el-pagination class="pull-right m-t-sm" slot="pagination" background :page-size="params.rows" layout="prev, pager, next" @current-change="getList" :current-page.sync="params.page" :total="total"> </el-pagination>
          </basic-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card style="height: 408px">
          <div slot="header">
            <span class="pull-right">已选审批人</span>
            <el-button type="danger" size="mini" @click="removeUser" :disabled="rightSlection.length === 0"><i class="el-icon-arrow-left"></i> 移除</el-button>
          </div>
          <smart-table :data="selectUserList" :rows="5" @selection-change="selectionChangeCheck">
            <el-table-column type="selection" width="60"> </el-table-column>
            <el-table-column show-overflow-tooltip label="用户姓名" prop="name"> </el-table-column>
            <el-table-column show-overflow-tooltip label="用户邮箱" prop="email"> </el-table-column>
          </smart-table>
        </el-card>
      </el-col>
    </el-row>
  </CardLayout>
</template>
<script>
import { getUser, getUserDetail } from 'services/system/manager'

export default {
  props: {
    assignee: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  data() {
    return {
      list: [],
      total: 0,
      listQuery: {
        name: ''
      },
      params: {
        page: 1,
        rows: 5
      },
      leftSlection: [],
      rightSlection: [],
      selectUserList: []
    }
  },
  computed: {
    userIds() {
      const ids = []
      for (const a of this.selectUserList) {
        ids.push(a.id)
      }
      return ids
    }
  },
  created() {
    this.getSelectUser()
  },
  methods: {
    getSelectUser() {
      this.assignee.forEach((item) => {
        this.getUserDetail(item)
      })
      this.handleSearch()
    },
    getUserDetail(id) {
      getUserDetail(id).then((data) => {
        if (data.success) {
          this.selectUserList.push(data.data)
        }
      })
    },
    getList() {
      getUser(this.params).then((data) => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          // 选中反选
          this.$nextTick(() => {
            this.list.forEach((item) => {
              if (this.userIds.indexOf(item.id) > -1) this.$refs.userTable.toggleRowSelection(item, true)
            })
          })
        }
      })
    },
    // 查询用户
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        status: 'NORMAL',
        isManager: true,
        'name:LK': this.listQuery.name
      })
      this.getList()
    },
    selectionChange(selection) {
      this.leftSlection = selection
    },
    selectionChangeCheck(selection) {
      this.rightSlection = selection
    },
    selectAble(row) {
      return !this.userIds.includes(row.id)
    },
    addUser() {
      const users = this.leftSlection.filter((item) => {
        return !this.userIds.includes(item.id)
      })
      this.selectUserList.unshift(...users)
    },
    removeUser() {
      const ids = []
      this.rightSlection.forEach((item) => {
        ids.push(item.id)
      })
      for (let i = 0; i < this.selectUserList.length; i++) {
        const item = this.selectUserList[i]
        if (ids.includes(item.id)) {
          this.selectUserList.splice(i, 1)
          i--
        }
      }
    }
  }
}
</script>
<style></style>
