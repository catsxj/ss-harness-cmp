<template>
  <div>
    <el-form :inline="true">
      <template v-if="agentType === 'agent'">
        <el-form-item>
          <el-select clearable v-model="listQuery.webEnvironment" placeholder="网络环境" @change="changeQueryWebEnvironment">
            <el-option v-for="item in webEnvironment" :key="item.name" :label="item.name" :value="item.name">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select clearable v-model="listQuery.idc" placeholder="机房">
            <el-option v-for="item in queryIdc" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
        </el-form-item>
      </template>
      <template v-if="agentType === 'saltStack'">
        <el-form-item>
          <el-select clearable v-model="listQuery.masterId" placeholder="区域">
            <el-option v-for="item in area" :key="item.masterId" :label="item.masterName" :value="item.masterId">
            </el-option>
          </el-select>
        </el-form-item>
      </template>
      <el-form-item>
        <el-input placeholder="IP地址" v-model="listQuery.ip"></el-input>
      </el-form-item>
      <el-form-item>
        <el-input placeholder="操作系统" v-model="listQuery.os"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
      </el-form-item>
    </el-form>
    <tree-table :data2="list" class="ag-table" ref="serverTable" @select="handleSelectItem"
      @select-all="handleSelectAll" :row-class-name="getRowClass" :total="total" :params="params" :get-list="getList">
      <el-table-column type="selection" :selectable="checkSelectable" width="60"></el-table-column>
      <el-table-column label="IP地址" show-overflow-tooltip>
        <template slot-scope="scope" v-if="scope.row._level == 1">
          {{scope.row.ip}}
        </template>
      </el-table-column>
      <el-table-column label="agent名称" prop="name"></el-table-column>
      <el-table-column label="状态" prop="connectStatus" show-overflow-tooltip>
        <template slot-scope="scope" >
          <el-tag class="status-tag" type="info" v-if="scope.row.connectStatus == 'DISCONNECTED'">-</el-tag>
          <el-tag class="status-tag" type="success" v-else>{{scope.row.version}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作系统">
        <template slot-scope="scope" v-if="scope.row._level == 1">
          {{scope.row.os}}
        </template>
      </el-table-column>
    </tree-table>
  </div>
</template>

<script>
import { getJdAgents, getSaltAgents, getMasters, getWebEnvironment } from 'services/task/inspect'
export default {
  components: {
    treeTable: () => import('views/bsm-cache/treeTable/index')
  },
  props: {
    agentType: {
      type: String,
      required: true
    },
    selectData: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
      list: [],
      total: 0,
      listQuery: {},
      params: {
        page: 1,
        rows: 10
      },
      selectList: [],
      idList: [],
      area: [],
      queryIdc: [],
      hostList: [],
      webEnvironment: []
    }
  },
  mounted () {
    if (this.agentType === 'saltStack') {
      this.getArea()
    } else if (this.agentType === 'agent') {
      this.loadWebEnvironment()
    }
    this.getList()
    // 已选择数据
    this.selectData && this.selectData.forEach(item => {
      this.idList.push(item.id)
      this.selectList.push(item)
    })
  },
  methods: {
    checkSelectable (row) {
      return row._level == 1
    },
    getRowClass (row, index) {
      if (!row.row.children && row.row._level != 1) {
        return 'row-expand-cover'
      }
    },
    // 网络环境
    loadWebEnvironment () {
      getWebEnvironment().then(data => {
        if (data.success) {
          this.webEnvironment = data.data;
        }
      })
    },
    changeQueryWebEnvironment (value) {
      if (this.listQuery.idc) {
        delete this.listQuery.idc;
      }
      if (!value) {
        this.queryIdc = [];
        return;
      }
      for (let i = 0; i < this.webEnvironment.length; i++) {
        const item = this.webEnvironment[i];
        if (item.name == value) {
          this.queryIdc = item.value;
        }
      }
    },
    // 获取区域列表
    getArea () {
      getMasters().then(data => {
        if (data.success) {
          this.area = data.data;
        }
      })
    },
    getList () {
      const self = this
      const handleData = function (data) {
        data.forEach(function (item) {
          setTimeout(function () {
            if (self.idList.indexOf(item.id) > -1) self.$refs.serverTable.toggleRowSelection(item, true)
          })
        })
      }
      let http = getJdAgents
      if (this.agentType === 'saltStack') {
        http = getSaltAgents
      }
      http(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          handleData(this.list)
        }
      })
    },
    handleSearch () {
      this.params.page = 1
      let eqParam = {}
      if (this.agentType === 'agent') {
        eqParam = {
          webEnvironment: this.listQuery.webEnvironment,
          idc: this.listQuery.idc
        }
      } else if (this.agentType === 'saltStack') {
        eqParam = {
          area: this.listQuery.area
        }
      }
      this.params.params = this.$tools.handleSearchParam({
        'ip:lk': this.listQuery.ip,
        'os:lk': this.listQuery.os,
        ...eqParam
      })
      this.getList()
    },
    save () {
      return this.selectList
    },
    // 复选框点击
    handleSelectItem (selection, row) {
      this.moniCheckItem(selection, row)
    },
    // 全选
    handleSelectAll (selection) {
      // 选中
      if (selection?.length > 0) {
        selection.forEach(item => {
          if (this.idList.indexOf(item.id) === -1) {
            // 不存在
            this.idList.push(item.id)
            this.selectList.push(item)
          }
        })
      } else {
        const afterCancleList = [], hasDataList = []
        // 取消选中
        this.resourceList.forEach(item => {
          if (this.idList.indexOf(item.id) > -1) {
            // 待删除id列表
            hasDataList.push(item.id)
          }
        })
        for (const selItem of this.selectList) {
          if (hasDataList.indexOf(selItem.id) === -1) {
            afterCancleList.push(selItem)
          }
        }
        this.selectList = afterCancleList
      }
    },
    // 模拟单选点击复选框
    moniCheckItem (selection, row) {
      let isHas = false
      for (const item of selection) {
        if (item.id === row.id) {
          isHas = true
          break
        }
      }
      if (!isHas) {
        this.selectList.forEach((item, index) => {
          if (item.id === row.id) {
            this.selectList.splice(index, 1)
          }
        })
      } else {
        selection.forEach(item => {
          this.idList.push(item.id)
          let flag = false
          this.selectList.forEach(v => {
            if (v.id === item.id) {
              flag = true
            }
          })
          if (!flag) {
            this.selectList.push(item)
          }
        })
        this.idList = Array.from(new Set(this.idList))
      }
    }
  }
}
</script>
