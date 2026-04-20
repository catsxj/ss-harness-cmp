<template>
  <div>
    <basic-table :data="list">
      <el-table-column prop="name" label="参数名" show-overflow-tooltip></el-table-column>
      <el-table-column prop="default" label="参数默认值" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.default }}
        </template>
      </el-table-column>
      <el-table-column prop="value" label="运行参数值" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.value }}
        </template>
      </el-table-column>
      <!-- <el-table-column prop="remark" label="是否重启" show-overflow-tooltip></el-table-column> -->
      <el-table-column prop="reference" label="可修改参数值" show-overflow-tooltip></el-table-column>
      <!-- <el-table-column prop="remark" label="描述" show-overflow-tooltip></el-table-column> -->
      <el-table-column label="操作" width="230px">
        <template slot-scope="scope">
          <el-button type="text" @click="modify(scope.row)"> 修改参数 </el-button>
          <el-button type="text" @click="history(scope.row)"> 修改历史 </el-button>
        </template>
      </el-table-column>
      <div slot="pagination"></div>
    </basic-table>
    <add :add-data="addData" v-if="addData.dialog" :url="url" :type="type"></add>
    <history :add-data="historyData" v-if="historyData.dialog" :url="url"></history>
  </div>
</template>

<script>
import add from './add.vue'
import history from './history.vue'
import { getRdsParameters, getKvsParameters } from 'services/resource/datebase'
export default {
  components: { add, history },
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
      historyData: {
        dialog: false,
        data: {}
      },
      type: 'number'
    }
  },
  created() {
    this.getList()
  },
  methods: {
    history(data) {
      this.historyData = {
        dialog: true,
        data: {
          id: this.detail.id,
          name: data.name
        }
      }
    },
    add() {
      this.addData = {
        dialog: true,
        title: '新增',
        data: {
          id: this.detail.id
        }
      }
    },
    modify(data) {
      this.type = data.type
      this.addData = {
        dialog: true,
        title: '编辑',
        data: {
          id: this.detail.id,
          name: data.name,
          oldValue: data.value
        }
      }
    },
    remove(id) {
      this.$confirm('请确认是否删除该数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http({
          url: '/shopping/cart/remove',
          method: 'POST',
          data: { id: id }
        }).then(data => {
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
      const getList = this.url == 'rds' ? getRdsParameters : getKvsParameters
      getList({
        id: this.detail.id
      }).then(data => {
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
