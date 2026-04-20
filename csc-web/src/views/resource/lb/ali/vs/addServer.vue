<template>
  <el-dialog title="我的服务器" :visible.sync="addData.dialog" width="70%">
    <el-steps :active="active" finish-status="success">
      <el-step title="选择服务器"></el-step>
      <el-step title="配置端口和权重"></el-step>
    </el-steps>
    <div class="box" v-show="active === 0">
      <basic-form :model="searchData" label-width="150px" :inline="true">
        <basic-form-item label="选择后端服务器类型: ">
          <el-select v-model="searchData.type">
            <el-option v-for="(item, index) in typeList" :key="index" :label="item.name" :value="item.value"></el-option>
          </el-select>
        </basic-form-item>
        <basic-form-item>
          <el-input placeholder="名称" v-model="searchData.name"></el-input>
        </basic-form-item>
        <basic-form-item>
          <el-input placeholder="云主机IP" v-model="searchData.privateIps"></el-input>
        </basic-form-item>
        <basic-form-item>
          <el-button type="ghost" @click="handleSearch">搜索</el-button>
        </basic-form-item>
      </basic-form>
      <basic-table :data="tableData" :get-list="getData" :params="params" :total="total" ref="table" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column label="云服务器ID/名称" prop="name" show-overflow-tooltip> </el-table-column>
        <el-table-column label="可用区" prop="zoneName" show-overflow-tooltip> </el-table-column>
        <el-table-column label="私网IP" prop="address" show-overflow-tooltip> </el-table-column>
        <el-table-column label="公网IP/专有网络属性" prop="vpcUuid" show-overflow-tooltip>
          <template slot-scope="scope"> {{ scope.row.vpcUuid }} / {{ scope.row.subnetUuid }} </template>
        </el-table-column>
        <el-table-column label="状态" prop="status">
          <template slot-scope="scope">
            <status-icon :type="scope.row.status | vmStatusColor">{{ scope.row.status | openstackServer }}</status-icon>
          </template>
        </el-table-column>
      </basic-table>
    </div>
    <basic-form v-show="active === 1" :model="data" ref="data" class="ss">
      <el-table :data="data.list">
        <el-table-column label="云服务器ID/名称" prop="name" show-overflow-tooltip> </el-table-column>
        <el-table-column label="可用区" prop="zoneName" show-overflow-tooltip> </el-table-column>
        <el-table-column label="私网IP" prop="address" show-overflow-tooltip> </el-table-column>
        <el-table-column label="端口">
          <template slot-scope="scope">
            <basic-form-item label="" label-width="0px" :prop="`list.${scope.$index}.port`" validate="required">
              <el-input-number v-model="scope.row.port" :min="1" :max="65535"></el-input-number>
            </basic-form-item>
          </template>
        </el-table-column>
        <el-table-column label="权重">
          <template slot-scope="scope">
            <basic-form-item label="" label-width="0px" :prop="`list.${scope.$index}.weight`" validate="required">
              <el-input-number v-model="scope.row.weight" :min="0" :max="100"></el-input-number>
            </basic-form-item>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="text" @click="add(scope)" v-if="scope.row.flag">添加端口</el-button>
            <el-button type="text" @click="del(scope)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </basic-form>
    <div slot="footer">
      <el-button type="ghost" v-if="active === 1" @click="next(1)">上一步</el-button>
      <el-button type="ghost" v-if="active === 0" @click="next(0)">下一步</el-button>
      <el-button type="primary" v-if="active === 1" @click="ok">确定</el-button>
      <el-button type="primary" @click="addData.dialog = false">取消</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { getVm, createLbMembers } from 'services/platform/index'
const typeList = [
  {
    name: '云服务器ECS/弹性网卡ENI',
    value: 'ecs'
  }
  // {
  //   name: '弹性容器实例ECI',
  //   value: 'eci'
  // }
]
export default {
  props: {
    addData: {
      type: Object
    }
  },
  data() {
    return {
      typeList,
      tableData: [],
      params: {
        page: 1,
        rows: 10
      },
      total: 0,
      active: 0,
      searchData: {
        type: 'ecs'
      },
      multipleSelection: [],
      data: {
        list: []
      }
    }
  },
  created() {
    this.handleSearch()
  },
  mounted() {},
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (!valid) {
          return false
        }
        let flag = true
        this.data.list.forEach(item => {
          this.addData.data.ports.forEach(x => {
            if (item.port == x.port && item.name == x.name) {
              flag = false
            }
          })
        })
        if (!flag) {
          return this.$message.error('存在相同的端口号')
        }
        const arr = []
        this.data.list.forEach((item, index) => {
          if (!item.flag) {
            const row = this.data.list.find(c => c.flag && c.serverId === item.serverId)
            arr.push({ ...row, memberUuid: row.instanceId, port: item.port, weight: item.weight })
          } else {
            arr.push({ ...item, memberUuid: item.instanceId })
          }
        })
        if (this.$route.params.source === 'read') {
          const params = {
            vendorId: this.$route.params.vendorId,
            addObject: [...arr]
          }
          createLbMembers(sessionStorage.getItem('editId'), params).then(data => {
            const type = data.success ? 'success' : 'error'
            this.$message[type](data.message)
            if (data.success) {
              this.addData.dialog = false
              this.$emit('back')
            }
          })
        } else {
          this.$emit('back', arr)
          this.addData.dialog = false
        }
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        vendorId: this.$route.params.vendorId,
        regionId: sessionStorage.getItem('regionId'),
        'status:ueq': 'EXCEPTION',
        vpcUuid: this.$route.query.vpcUuid,
        'privateIps:lk': this.searchData.privateIps,
        'name:lk': this.searchData.name
      })
      this.getData()
    },
    next(num) {
      if (num === 0) {
        if (this.multipleSelection.length == 0) {
          return this.$message.error('请选择服务器')
        }
        this.active = 1
        const data = []
        this.multipleSelection.forEach((item, index) => {
          data.push({
            ...item,
            flag: true,
            port: null,
            weight: 100,
            serverId: item.id,
            type: 'ecs'
          })
        })
        // 初始化我的服务器，设置端口和权重
        this.data.list = data
      }
      if (num === 1) this.active = 0
    },
    getData() {
      getVm(this.params).then(data => {
        this.tableData = data.data.rows.map(item => {
          return {
            ...item,
            address: item.privateIps ? JSON.parse(item.privateIps)[0] : ''
          }
        })
        this.total = data.data.total
      })
    },
    sliceData(name, row) {
      const list = this.data.list
      const index = list.findIndex(item => item.serverId === row.row.serverId)
      //   console.log('位置:', index)
      const arr = list.filter(item => item.serverId === row.row.serverId)
      //   console.log('位移偏移:', arr)
      const a = list.slice(0, index + arr.length)
      if (name === 'del') a.pop()
      //   console.log('前半段:', a)
      const b = list.slice(index + arr.length)
      //   console.log('后半段:', b)
      return { a, b }
    },
    add(row) {
      // console.log(row.$index)
      // 获取带入参数切割数据
      const { a, b } = this.sliceData('add', row)
      // 截取该条数据下已动态添加的数据
      const d = [
        ...a,
        {
          serverId: row.row.serverId,
          port: null,
          weight: 100,
          type: 'ecs'
        },
        ...b
      ]
      this.data.list = d
    },
    del(scope) {
      if (scope.row.flag) {
        const { a, b } = this.sliceData('del', scope)
        this.data.list = [...a, ...b]
      } else {
        this.data.list.splice(scope.$index, 1)
      }
    }
  }
}
</script>
<style scoped>
.box {
  padding: 16px;
}
body#cmp .ss .basic-form-item--mini.basic-form-item,
body#cmp .ss .basic-form-item--small.basic-form-item {
  margin-bottom: 0;
}
</style>
<style>
.ss .basic-form-item__error {
  position: relative;
}
</style>
