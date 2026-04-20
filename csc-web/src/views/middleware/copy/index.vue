<template>
  <div>
    <el-form :inline="true">
      <!-- <el-form-item>
        <el-date-picker class="w-full" v-model="dateValue" type="datetimerange" start-placeholder="开始时间"
                      end-placeholder="结束时间">
        </el-date-picker>
      </el-form-item> -->
      <el-form-item>
        <!-- <el-button type="ghost" @click="handleSearch">搜索</el-button> -->
        <el-button type="primary" @click="add">创建数据库备份</el-button>
      </el-form-item>
    </el-form>
    <basic-table :data="list">
      <el-table-column prop="gmtCreate" label="备份时间" show-overflow-tooltip></el-table-column>
      <el-table-column prop="size" label="备份大小(GB)" show-overflow-tooltip></el-table-column>
      <el-table-column prop="name" label="备份名称" show-overflow-tooltip></el-table-column>
      <el-table-column prop="status" label="状态" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.status == 'AVAILABLE' ? '可用' : '不可用' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="230px">
        <template slot-scope="scope">
          <el-button type="text" @click="revert(scope.row.id)"> 恢复 </el-button>
          <el-button type="text" @click="remove(scope.row.id)"> 删除 </el-button>
        </template>
      </el-table-column>
      <div slot="pagination"></div>
    </basic-table>
  </div>
</template>

<script>
import { getCmsBackups, patchActionCms, removeCmsBackups } from 'services/resource/middleware'

export default {
  props: {
    detail: {
      type: Object
    },
    url: {
      type: String
    }
  },
  data() {
    return {
      list: null,
      total: null,
      params: {
        page: 1,
        rows: 10
      },
      addData: {
        dialog: false,
        data: {}
      },
      dateValue: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    add() {
      this.$confirm('你要立即备份实例嘛', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        patchActionCms('backup', { id: this.detail.id }).then(data => {
          if (data.success) {
            this.$message.success(data.message)
            this.getList()
          }
        })
      })
    },
    revert(id) {
      this.$confirm('请确认是否恢复该数据,在恢复的过程中数据库所在的云主机会有重启操作,请慎重进行恢复操作', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        patchActionCms('revert', { id: this.detail.id, snapshotId: id }).then(data => {
          if (data.success) {
            this.$message.success(data.message)
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
        removeCmsBackups(id).then(data => {
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
      getCmsBackups({ id: this.detail.id }).then(data => {
        if (data.success) {
          this.list = data.data
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
