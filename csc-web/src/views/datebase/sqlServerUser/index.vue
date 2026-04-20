<template>
  <div>
    <el-form :inline="true">
      <el-form-item>
        <el-button type="primary" @click="add">创建账号</el-button>
      </el-form-item>
    </el-form>
    <basic-table :data="list" :params="params" :get-list="getList" :total="total">
      <el-table-column prop="username" label="用户" show-overflow-tooltip></el-table-column>
      <el-table-column prop="permission" label="账号权限" show-overflow-tooltip>
        <template slot-scope="scope">
          <div v-if="scope.row.permission">
            {{ scope.row.permission == 'premier' ? '高级账号' : '普通账号' }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="gmtCreate" label="创建时间" show-overflow-tooltip></el-table-column>
      <el-table-column prop="remark" label="描述" show-overflow-tooltip></el-table-column>
      <el-table-column label="操作" width="230px">
        <template slot-scope="scope">
          <el-button type="text" @click="resetPassword(scope.row)"> 重置密码 </el-button>
          <el-button type="text" @click="resetAccount(scope.row)"> 设置权限 </el-button>
          <el-button type="text" @click="remove(scope.row.id)"> 删除 </el-button>
        </template>
      </el-table-column>
    </basic-table>
    <add :add-data="addData" v-if="addData.dialog"></add>
    <reset-password :add-data="resetPasswordData" v-if="resetPasswordData.dialog"></reset-password>
    <reset-account :add-data="resetAccountData" v-if="resetAccountData.dialog"></reset-account>
  </div>
</template>

<script>
import add from './add.vue'
import resetPassword from './resetPassword.vue'
import resetAccount from './resetAccount.vue'
import { getRdsUsers, patchRdsUsers, removeRdsUsers } from 'services/resource/datebase'
export default {
  components: { add, resetPassword, resetAccount },
  props: {
    detail: {
      type: Object
    }
  },
  data() {
    return {
      list: [],
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
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    resetPassword(data) {
      this.resetPasswordData = {
        dialog: true,
        data: {
          id: data.id,
          rdsId: data.rdsId
        }
      }
    },
    resetAccount(data) {
      this.resetAccountData = {
        dialog: true,
        grantDbs: data.dbs ? data.dbs : '',
        data: {
          rdsId: data.rdsId,
          id: data.id,
          permission: data.permission ? data.permission : 'general'
        }
      }
    },
    add() {
      this.addData = {
        dialog: true,
        data: {
          rdsId: this.detail.id
        }
      }
    },
    backPermission(data) {
      this.$confirm('该操作将撤销账号权限?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        patchRdsUsers('revoke', { id: data.id }).then(data => {
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
      this.params.params = JSON.stringify([
        {
          param: {
            rdsId: this.detail.id
          },
          sign: 'EQ'
        }
      ])
      getRdsUsers(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          this.list.forEach(item => {
            const nowTime = new Date()
            const nowDate = nowTime.getTime()
            item.isExpired = false
            const expiredTimeDate = new Date(item.expiredTime).getTime()
            if (expiredTimeDate < nowDate) {
              item.isExpired = true
            }
          })
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
