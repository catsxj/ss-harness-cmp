<template>
  <div>
    <el-form :inline="true">
      <el-form-item>
        <el-button type="primary" @click="add">创建账号</el-button>
      </el-form-item>
    </el-form>
    <basic-table :data="list" :params="params" :get-list="getList" :total="total">
      <el-table-column prop="name" label="账户" show-overflow-tooltip></el-table-column>
      <el-table-column prop="name" label="类型" show-overflow-tooltip></el-table-column>
      <el-table-column label="状态" show-overflow-tooltip>
        <template slot-scope="scope">
          <status-icon :type="scope.row.status | vmStatusColor">{{ scope.row.status | openstackServer }} </status-icon>
        </template>
      </el-table-column>
      <el-table-column prop="characterSet" label="权限" show-overflow-tooltip></el-table-column>
      <el-table-column prop="remark" label="描述" show-overflow-tooltip></el-table-column>
      <el-table-column label="操作" width="230px">
        <template slot-scope="scope">
          <el-button type="text" @click="resetPassword(scope.row)"> 重置密码 </el-button>
          <el-button type="text" @click="resetAccount(scope.row)"> 重置账号权限 </el-button>
          <el-button type="text" @click="modify(scope.row)"> 修改描述 </el-button>
          <el-button type="text" @click="remove(scope.row.id)"> 删除 </el-button>
        </template>
      </el-table-column>
    </basic-table>
    <add :add-data="addData" v-if="addData.dialog"></add>
    <modify :add-data="addData" v-if="addData.dialog"></modify>
    <reset-password :add-data="resetPasswordData" v-if="resetPasswordData.dialog"></reset-password>
    <reset-account :add-data="resetAccountData" v-if="resetAccountData.dialog"></reset-account>
  </div>
</template>

<script>
import add from './add.vue'
import resetPassword from './resetPassword.vue'
import resetAccount from './resetAccount.vue'
import modify from './modify.vue'
import { getRdsUsers, patchRdsUsers, removeRdsUsers } from 'services/resource/datebase'
export default {
  components: { add, resetPassword, resetAccount, modify },
  props: {
    detail: {
      type: Object
    }
  },
  data() {
    return {
      list: [{ name: 111 }],
      total: null,
      params: {
        page: 1,
        rows: 10
      },
      addData: {
        dialog: false,
        data: {}
      },
      resetPasswordData: {
        dialog: false,
        data: {}
      },
      resetAccountData: {
        dialog: false,
        data: {}
      },
      modifyData: {
        dialog: false,
        data: {}
      }
    }
  },
  created() {
    // this.getList()
  },
  methods: {
    modify(data) {
      this.modifyData = {
        dialog: true,
        data: {
          remark: data.remark,
          id: data.id
        }
      }
    },
    resetPassword(data) {
      this.resetPasswordData = {
        dialog: true,
        data: {}
      }
    },
    resetAccount(data) {
      this.resetAccountData = {
        dialog: true,
        data: {}
      }
    },
    add() {
      this.addData = {
        dialog: true,
        data: {
          id: this.detail.id,
          characterSet: 'UTF-8',
          user: 'default'
        }
      }
    },
    remove(id) {
      this.$confirm('请确认是否删除该数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeRdsUsers(id).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.getList()
          }
        })
      })
    },
    getList() {
      this.$http({
        method: 'post',
        url: '/volumebackup/list',
        options: {
          noParam: true
        },
        data: this.params
      }).then(data => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    }
  }
}
</script>
<style scoped>
.detail_icon {
  font-size: 25px;
  margin: 10px;
  color: #409eff;
}
</style>
