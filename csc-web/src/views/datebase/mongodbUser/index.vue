<template>
  <div>
    <basic-table :data="list" :params="params" :get-list="getList" :total="total">
      <el-table-column prop="name" label="账户" show-overflow-tooltip></el-table-column>
      <el-table-column prop="name" label="类型" show-overflow-tooltip></el-table-column>
      <el-table-column label="状态" show-overflow-tooltip>
        <template slot-scope="scope">
          <status-icon :type="scope.row.status | vmStatusColor">{{ scope.row.status | openstackServer }} </status-icon>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="描述" show-overflow-tooltip></el-table-column>
      <el-table-column label="操作" width="230px">
        <template slot-scope="scope">
          <el-button type="text" @click="resetPassword(scope.row)"> 重置密码 </el-button>
        </template>
      </el-table-column>
    </basic-table>
    <reset-password :add-data="resetPasswordData" v-if="resetPasswordData.dialog"></reset-password>
  </div>
</template>

<script>
import resetPassword from './resetPassword.vue'
import { getRdsUsers, patchRdsUsers, removeRdsUsers } from 'services/resource/datebase'
export default {
  components: { resetPassword },
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
    resetPassword(data) {
      this.resetPasswordData = {
        dialog: true,
        data: {}
      }
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
