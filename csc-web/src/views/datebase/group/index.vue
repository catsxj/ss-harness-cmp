<template>
  <div>
    <!-- <el-form :inline="true">
      <el-form-item>
        <el-button type="primary" @click="add">添加安全组</el-button>
      </el-form-item>
    </el-form> -->
    <el-table :data="list" @expand-change="expandChange" ref="table" :row-key="getRowKeys" :expand-row-keys="expands">
      <el-table-column type="expand">
        <template slot-scope="scope">
          <div v-if="false">
            {{ scope.row }}
          </div>
          <basic-table :data="ruleList" :params="params" :get-list="getRule" :total="total">
            <el-table-column prop="protocol" label="IP协议" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.protocol | secruityProtocol }}
              </template>
            </el-table-column>
            <el-table-column label="方向" show-overflow-tooltip>
              <template slot-scope="scope">
                <el-tag>{{ directionData[scope.row.direction] }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="etherType" label="以太网类型" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.etherType || '任何' }}
              </template>
            </el-table-column>
            <el-table-column prop="portMin" label="起始端口" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.portMin || 'Any' }}
              </template>
            </el-table-column>
            <el-table-column prop="portMax" label="结束端口" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.portMax || 'Any' }}
              </template>
            </el-table-column>
            <el-table-column prop="remoteIpPrefix" label="远端IP前缀" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.remoteIpPrefix || (scope.row.etherType == 'IPv6' ? '::/0' : '0.0.0.0/0') }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160px">
              <template slot-scope="scope">
                <el-button type="text" @click="ruleRemove(scope.row)"><i class="el-icon-deconste"></i> 删除</el-button>
              </template>
            </el-table-column>
          </basic-table>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称" show-overflow-tooltip></el-table-column>
      <el-table-column prop="remark" label="描述" show-overflow-tooltip></el-table-column>
      <!-- <el-table-column label="操作" width="230px">
        <template slot-scope="scope">
          <el-button type="text" @click="modify(scope.row)">
            编辑
          </el-button>
          <el-button type="text" @click="remove(scope.row.id)">
            删除
          </el-button>
          <el-button type="text" @click="addRule(scope.row)">添加规则</el-button>
        </template>
      </el-table-column> -->
      <!-- <div slot="pagination"></div> -->
    </el-table>
    <add :add-data="addData" v-if="addData.dialog"></add>
    <add-rule :add-data="addRuleData" v-if="addRuleData.dialog" @back="getRule"></add-rule>
  </div>
</template>

<script>
import add from './add.vue'
import addRule from './addRule'
import { getRdsSecuritiess, getKvsSecuritiess } from 'services/resource/datebase'

export default {
  components: { add, addRule },
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
      directionData: {
        // 'ingress': '入口',
        // 'egress': '出口'
      },
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
      ruleList: [],
      ruleId: '',
      addRuleData: {
        dialog: false,
        data: {}
      },
      expands: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getRowKeys(row) {
      return row.id
    },
    addRule(data) {
      this.addRuleData = {
        dialog: true,
        data: {
          remoteIpPrefix: '0.0.0.0/0',
          portMin: '',
          portMax: '',
          direction: 'ingress',
          protocol: 'TCP',
          groupId: data.id
        }
      }
    },
    add() {
      const data = {}
      if (this.url == 'rds') data.rdsId = this.detail.id
      else data.kvsId = this.detail.id
      this.addData = {
        dialog: true,
        title: '新增',
        url: `/security/group/${this.url}/create`,
        data: data
      }
    },
    modify(data) {
      this.addData = {
        dialog: true,
        title: '编辑',
        url: '/security/group/modify',
        data: {
          id: data.id,
          name: data.name,
          remark: data.remark
        }
      }
    },
    ruleRemove(data) {
      this.$confirm('此操作将永久删除该规则, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http({
          url: '/security/group/rule/remove',
          method: 'POST',
          data: {
            id: data.id
          }
        }).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.getRule()
          }
        })
      })
    },
    expandChange(row, expandedRows) {
      if (expandedRows.length) {
        this.expands = []
        if (row) {
          this.expands.push(row.id)
          this.ruleId = row.id
          this.getRule()
        }
      } else {
        this.expands = []
      }
    },
    remove(id) {
      this.$confirm('请确认是否删除该数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const data = {
          sgId: id
        }
        if (this.url == 'rds') data.rdsId = this.detail.id
        else data.kvsId = this.detail.id
        this.$http({
          url: `/security/group/${this.url}/remove`,
          method: 'POST',
          data: data
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
      const getList = this.url == 'rds' ? getRdsSecuritiess : getKvsSecuritiess
      getList({
        id: this.detail.id
      }).then(data => {
        if (data.success) {
          this.list = data.data
        }
      })
    },
    getRule(page) {
      this.params.page = page || this.params.page
      this.params.params = JSON.stringify([{ param: { groupId: this.ruleId }, sign: 'EQ' }])
      this.$http({
        url: '/security/group/rule/list',
        method: 'POST',
        data: this.params,
        options: {
          noParam: true
        }
      }).then(data => {
        if (data.success) {
          this.ruleList = data.data.rows
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
