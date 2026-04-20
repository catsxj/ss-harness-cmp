<template>
  <div>
    <el-form :inline="true">
      <el-form-item>
        <el-button type="primary" @click="add">创建数据库</el-button>
      </el-form-item>
    </el-form>
    <basic-table :data="list" :params="params" :get-list="getList" :total="total">
      <el-table-column prop="name" label="名称" show-overflow-tooltip></el-table-column>
      <el-table-column prop="characterSet" label="字符集" show-overflow-tooltip></el-table-column>
      <el-table-column prop="collation" label="排序规则" show-overflow-tooltip></el-table-column>
      <el-table-column prop="remark" label="描述" show-overflow-tooltip></el-table-column>
      <el-table-column label="操作" width="230px">
        <template slot-scope="scope">
          <el-button type="text" @click="remove(scope.row.id)"> 删除 </el-button>
        </template>
      </el-table-column>
    </basic-table>
    <add :add-data="addData" v-if="addData.dialog" :detail="detail"></add>
  </div>
</template>

<script>
import add from './add.vue'
import { getRdsDbs, removeRdsDbs } from 'services/resource/datebase'

export default {
  components: { add },
  props: {
    detail: {
      type: Object
    }
  },
  data() {
    return {
      list: [],
      total: 0,
      params: {
        page: 1,
        rows: 10
      },
      addData: {
        dialog: false,
        data: {}
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    add() {
      const software_config = JSON.parse(this.detail.inventory).configs.software_config
      this.addData = {
        dialog: true,
        data: {
          rdsId: this.detail.id,
          characterSet: software_config.postgresql_encoding,
          collation: software_config.postgresql_locale,
          collctype: software_config.postgresql_ctype
        }
      }
    },
    remove(id) {
      this.$confirm('请确认是否删除该数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeRdsDbs(id).then(data => {
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
      getRdsDbs(this.params).then(data => {
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
