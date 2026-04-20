<template>
  <el-card class="wrapper">
    <basic-form ref="data" :model="data" label-width="140px" class="ss">
      <basic-form-item label="虚拟服务器组名称: " prop="name" validate="required">
        <el-input v-model="data.name" :disabled="$route.params.source === 'read'"></el-input>
      </basic-form-item>
      <p>
        <basic-form-item label="已添加服务器: ">
          <el-button type="primary" @click="add" :disabled="$route.params.source === 'edit'">添加</el-button>
          <el-button type="ghost" @click="batchDel" :disabled="$route.params.source === 'edit' || multipleSelection.length <= 0">批量删除</el-button>
        </basic-form-item>
      </p>
      <template v-if="$route.params.source === 'add' || $route.params.source === 'edit'">
        <el-table :data="data.members" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55"> </el-table-column>
          <el-table-column label="云服务器ID/名称" prop="name" show-overflow-tooltip> </el-table-column>
          <el-table-column label="可用区" prop="zoneName" show-overflow-tooltip> </el-table-column>
          <el-table-column label="私网IP" prop="address" show-overflow-tooltip> </el-table-column>
          <el-table-column label="端口">
            <template slot-scope="scope">
              <basic-form-item label="" label-width="0px" :prop="`members.${scope.$index}.port`" validate="required">
                <el-input-number v-model="scope.row.port" :min="1" :max="65535" :disabled="$route.params.source === 'edit' || $route.params.source === 'read'"></el-input-number>
              </basic-form-item>
            </template>
          </el-table-column>
          <el-table-column label="权重">
            <template slot-scope="scope">
              <basic-form-item label="" label-width="0px" :prop="`members.${scope.$index}.weight`" validate="required">
                <el-input-number v-model="scope.row.weight" :min="0" :max="100" :disabled="$route.params.source === 'read'"></el-input-number>
              </basic-form-item>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="text" @click="del(scope, scope.$index)" :disabled="$route.params.source === 'edit'">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <template v-if="$route.params.source === 'read'">
        <basic-table :data="data.members" :get-list="getMembers" :params="params" :total="total" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55"> </el-table-column>
          <el-table-column label="云服务器ID/名称" prop="name" show-overflow-tooltip> </el-table-column>
          <el-table-column label="可用区" prop="zoneName" show-overflow-tooltip> </el-table-column>
          <el-table-column label="私网IP" prop="address" show-overflow-tooltip> </el-table-column>
          <el-table-column label="端口">
            <template slot-scope="scope">
              <basic-form-item label="" label-width="0px" :prop="`members.${scope.$index}.port`" validate="required">
                <el-input-number v-model="scope.row.port" :min="1" :max="65535" :disabled="$route.params.source === 'edit' || $route.params.source === 'read'"></el-input-number>
              </basic-form-item>
            </template>
          </el-table-column>
          <el-table-column label="权重">
            <template slot-scope="scope">
              <basic-form-item label="" label-width="0px" :prop="`members.${scope.$index}.weight`" validate="required">
                <el-input-number v-model="scope.row.weight" :min="0" :max="100" :disabled="$route.params.source === 'read'"></el-input-number>
              </basic-form-item>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="text" @click="del(scope, scope.$index)" :disabled="$route.params.source === 'edit'">移除</el-button>
            </template>
          </el-table-column>
        </basic-table>
      </template>
    </basic-form>
    <div style="margin-top: 16px">
      <el-button type="primary" @click="ok" v-if="$route.params.source === 'add' || $route.params.source === 'edit'">保存</el-button>
      <el-button type="ghost" @click="cancel">取消</el-button>
    </div>
    <add-server :add-data="addData" v-if="addData.dialog" @back="getServer"></add-server>
  </el-card>
</template>
<script>
import { createLbPools, editLbPools, getLbMembers, deleteLbMembers } from 'services/platform/index'
import addServer from './addServer.vue'
export default {
  components: { addServer },
  data() {
    return {
      data: {
        name: '',
        members: []
      },
      addData: {
        dialog: false,
        data: {}
      },
      multipleSelection: [],
      params: {
        page: 1,
        rows: 10
      },
      total: 0
    }
  },
  created() {
    console.log(this.$route.params)
    if (this.$route.params.source === 'edit') {
      this.getEditData()
    }
    if (this.$route.params.source === 'read') {
      this.readSearch()
    }
  },
  methods: {
    getEditData() {
      const data = JSON.parse(sessionStorage.getItem('editRow'))
      this.data = { ...data }
      this.readSearch()
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    add() {
      const tempArr = []
      this.data.members.forEach(item => {
        tempArr.push({
          port: item.port,
          name: item.name
        })
      })
      this.addData = {
        dialog: true,
        data: {
          ports: tempArr
        }
      }
    },
    getServer(data) {
      if (this.$route.params.source === 'add') {
        const members = this.data.members
        this.data.members = [...members, ...data]
      } else if (this.$route.params.source === 'read') {
        this.getMembers()
      }
    },
    readSearch() {
      this.params.page = 1
      this.params.condition = 'ALIYUN'
      const data = JSON.parse(sessionStorage.getItem('editRow'))
      this.data.name = data.name
      this.params.params = this.$tools.handleSearchParam({
        regionId: sessionStorage.getItem('regionId'),
        poolId: sessionStorage.getItem('editId'),
        vendorId: this.$route.params.vendorId
      })
      this.getMembers()
    },
    getMembers() {
      getLbMembers(this.params).then(data => {
        if (data.success) {
          this.data.members = data.data.rows
          this.total = data.data.total
        }
      })
    },
    batchDel() {
      if (this.$route.params.source === 'add') {
        this.multipleSelection.forEach((item, index) => {
          const idx = this.data.members.findIndex(row => JSON.stringify(row) == JSON.stringify(item))
          this.data.members.splice(idx, 1)
        })
      } else if (this.$route.params.source === 'read') {
        this.$confirm('此操作将删除这些数据, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const params = {
            vendorId: this.$route.params.vendorId,
            delObject: this.multipleSelection
          }
          deleteLbMembers(sessionStorage.getItem('editId'), params).then(data => {
            const type = data.success ? 'success' : 'error'
            this.$message[type](data.message)
            if (data.success) {
              this.getMembers()
            }
          })
        })
      }
    },
    del(scope, index) {
      if (this.$route.params.source === 'add') {
        this.data.members.splice(index, 1)
      } else if (this.$route.params.source === 'read') {
        this.$confirm('此操作将删除该数据, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const params = {
            vendorId: this.$route.params.vendorId,
            delObject: [scope.row]
          }
          deleteLbMembers(sessionStorage.getItem('editId'), params).then(data => {
            const type = data.success ? 'success' : 'error'
            this.$message[type](data.message)
            if (data.success) {
              this.getMembers()
            }
          })
        })
      }
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          if (this.data.members && this.data.members.length > 0) {
            let flag = true
            const tempArr = []
            this.data.members.forEach(item => {
              tempArr.forEach(x => {
                if (x.name == item.name && x.port == item.port) {
                  flag = false
                }
              })
              tempArr.push({
                name: item.name,
                port: item.port
              })
            })
            if (!flag) {
              return this.$message.error('存在相同的端口号')
            }
            const arr = []
            this.data.members.forEach(item => {
              arr.push({
                ...item,
                serverId: item.id,
                type: 'ecs'
              })
            })
            const lbrow = JSON.parse(sessionStorage.getItem('lbRow'))
            const params = {
              lbUuid: lbrow.lbUuid,
              vendorId: this.$route.params.vendorId,
              name: this.data.name,
              members: [...arr]
            }
            let http
            if (this.$route.params.source === 'add') http = createLbPools(params)
            if (this.$route.params.source === 'edit') http = editLbPools(sessionStorage.getItem('editId'), params)
            http.then(data => {
              const type = data.success ? 'success' : 'error'
              this.$message[type](data.message)
              if (data.success) {
                this.$router.push({
                  name: 'Balancer',
                  params: {
                    source: 'vs'
                  }
                })
              }
            })
          } else {
            this.$message.error('请添加服务器！')
          }
        }
      })
    },
    cancel() {
      this.$router.push({
        name: 'Balancer',
        params: {
          source: 'vs'
        }
      })
    }
  }
}
</script>
<style scoped>
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
