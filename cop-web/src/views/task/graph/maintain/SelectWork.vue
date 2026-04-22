/**
* Created by Zhang Haijun on 2017/9/5.
*/
<template>
  <el-row :gutter="10">
    <el-col :span="24" v-if="!isPreview">
      <el-form-item label="worker集：" class="m-b-sm">
        <el-button type="primary" size="small" class="pull-left" @click="selectServer" icon="el-icon-monitor">
          选择worker
        </el-button>
        <el-button type="danger" size="small" class="pull-right" @click="clearServer" icon="el-icon-delete">
          清空worker
        </el-button>
      </el-form-item>
    </el-col>
    <el-col :span="24">
      <el-form-item :label="(isPreview?'worker：':'')">
        <smart-table :data="itemData.workers" class="target-table">
          <el-table-column label="实例" prop="instance"></el-table-column>
          <el-table-column label="所在分组" prop="groupName"></el-table-column>
          <el-table-column label="是否超级worker">
            <template slot-scope="scope">
              {{booleanFilter(scope.row.isSuper)}}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100px">
            <template slot-scope="scope">
              <el-button size="mini" type="danger" @click="delServer(scope.row.id)" :disabled="isPreview" icon="el-icon-delete">
                删除
              </el-button>
            </template>
          </el-table-column>
        </smart-table>
      </el-form-item>
    </el-col>
    <el-dialog title="worker列表" :close-on-click-modal="false" :visible.sync="dialogServerVisible" append-to-body width="60%">
      <el-form :inline="true">
        <el-form-item>
          <el-input placeholder="实例" v-model="listQuery.instance">
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
      <basic-table :data="list" :params="params" :get-list="getList" :total="total" ref="serverTable" @select="handleSelectItem" @select-all="handleSelectAll">
        <el-table-column type="selection" width="60">
        </el-table-column>
        <el-table-column label="实例" prop="instance"></el-table-column>
        <el-table-column label="所在分组" prop="groupName"></el-table-column>
        <el-table-column label="是否超级worker">
          <template slot-scope="scope">
            {{booleanFilter(scope.row.isSuper)}}
          </template>
        </el-table-column>
      </basic-table>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="dialogServerVisible = false">取消</el-button>
        <el-button type="primary" @click.native="ok">确定</el-button>
      </div>
    </el-dialog>
  </el-row>
</template>

<script>
// selection-change reserve-selection回现逻辑比较复杂，所以弃用
import show from '../mixins/show'
import { getWorkers } from 'services/task/resource'
import { booleanFilter } from '@/filters'

export default {
  mixins: [show],
  props: {
    itemData: {
      type: Object
    },
    osCategory: {
      type: String,
      default: ''
    }
  },
  setup() {
    return {
      booleanFilter
    }
  },
  data() {
    return {
      list: [],
      total: 0,
      listQuery: {
        name: '',
        sequenceId: '',
        allip: '',
        instance: ''
      },
      params: {
        page: 1,
        rows: 10
      },
      dialogServerVisible: false,
      selectList: [],
      idList: []
    }
  },
  created() {},
  methods: {
    selectServer() {
      // 初始化数据
      this.listQuery = {
        name: '',
        privateIps: '',
        vendorId: '',
        allip: '',
        instance: ''
      }
      this.params.page = 1
      this.selectList = []
      // 对数据进行格式化以适应后端的传参需求
      this.itemData.workers.forEach(data => {
        this.selectList.push(data)
      })
      this.dialogServerVisible = true
      this.handleSearch()
    },
    clearServer() {
      this.$confirm('您确定要清空所选主机吗?', '提示', {
        confirmButtonText: '清空',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        this.itemData.workers = []
      })
    },
    delServer(id) {
      for (let i = 0, len = this.itemData.workers.length; i < len; i++) {
        if (this.itemData.workers[i].id === id) {
          this.itemData.workers.splice(i, 1)
          break
        }
      }
    },
    handleSelectItem(selection, row) {
      this.refreshId()
      if (this.idList.indexOf(row.id) > -1) {
        for (let j = 0; j < this.selectList.length; j++) {
          const item = this.selectList[j]
          if (item.id === row.id) {
            this.selectList.splice(j, 1)
            break
          }
        }
      } else {
        this.selectList.push(row)
      }
    },
    handleSelectAll(selection) {
      this.refreshId()
      if (selection.length) {
        // 全选情况下
        this.list.forEach(item => {
          this.selectList.push(item)
        })
      } else {
        // 全不选情况下
        this.list.forEach(item => {
          if (this.idList.indexOf(item.id) > -1) {
            for (let j = 0; j < this.selectList.length; j++) {
              const row = this.selectList[j]
              if (item.id === row.id) {
                this.selectList.splice(j, 1)
                break
              }
            }
          }
        })
      }
    },
    refreshId() {
      this.idList = this.selectList.map(item => item.id)
    },
    getList() {
      const self = this
      this.refreshId()
      const handleData = function(data) {
        data.forEach(function(item) {
          // 代码容错处理，谨防后端返回格式不对
          try {
            item.privateIps = JSON.parse(item.privateIps) || [];
          } catch (error) {
            item.privateIps = []
          }
          setTimeout(function() {
            if (self.idList.indexOf(item.id) > -1) self.$refs.serverTable.toggleRowSelection(item, true)
          })
        })
      }
      getWorkers(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows;
          this.total = data.data.total
          handleData(this.list)
        }
      })
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        category: 'Ansible',
        isSuper: false,
        instance: this.listQuery.instance
      })
      this.getList()
    },
    ok() {
      this.itemData.workers = []
      this.selectList.forEach(data => {
        this.itemData.workers.push({
          id: data.id,
          instance: data.instance,
          groupName: data.groupName,
          isSuper: data.isSuper
        })
      })
      this.dialogServerVisible = false
    }
  }
}
</script>
<style scoped>
.target-table .el-form-item.is-error {
  margin-bottom: 15px !important;
}
</style>
