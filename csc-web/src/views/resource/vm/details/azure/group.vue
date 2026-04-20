<template>
  <div>
    <el-card class="m-t" :body-style="{ padding: 0 }">
      <div slot="header" class="clearfix">
        <span>安全组</span>
        <span class="pull-right add-btn"><el-button type="text" @click="add">新增</el-button></span>
      </div>
      <basic-table :data="list" style="margin: 10px">
        <el-table-column prop="name" label="名称" show-overflow-tooltip>
          <template slot-scope="scope">
            <div v-if="scope.row.flag">
              <el-select v-model="scope.row.groupId">
                <el-option v-for="(item, index) in groups" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </div>
            <div v-else>{{ scope.row.name }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="所属网卡" show-overflow-tooltip>
          <template slot-scope="scope">
            <div v-if="scope.row.flag">
              <el-select v-model="scope.row.nicId">
                <el-option v-for="(item, index) in nicList" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </div>
            <div v-else>{{ scope.row.serverBindCardName }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="操作" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-button v-if="scope.row.flag" type="text" @click="ok(scope.row)">确定</el-button>
            <el-button v-if="scope.row.flag" type="text" @click="list.splice(list.length - 1, 1)">取消</el-button>
            <el-button v-else type="text" @click="remove(scope.row)">移除</el-button>
          </template>
        </el-table-column>
        <div slot="pagination"></div>
      </basic-table>
    </el-card>
  </div>
</template>

<script>
import { getVmGroup, vmDeleteGroup, vmJoinGroup } from 'services/platform/index'
import { getNics, patchNics } from 'services/platform/azure'
import '../index.scss'
import webSocket from '@/common/mixins/getGlobalSocket'
export default {
  mixins: [webSocket],
  props: {
    detail: {
      type: Object,
      default: function () {
        return {}
      }
    },
    operate: {
      type: Boolean,
      default: true
    }
  },
  computed: {},
  data() {
    return {
      list: [],
      flag: false,
      groups: [],
      nicList: []
    }
  },
  created() {
    this.getVmGroup()
  },
  watch: {
    detial() {
      this.getVmGroup()
    }
  },
  methods: {
    onmessage(data) {
      if (data.operate.indexOf('azure.nics') > -1) {
        this.getVmGroup()
      }
    },
    getNic() {
      getNics({
        page: 1,
        rows: 9999,
        params: JSON.stringify([
          { param: { serverId: this.detail.id }, sign: 'EQ' },
          { param: { securityGroupId: 'null' }, sign: 'NUL' }
        ])
      }).then(data => {
        if (data.success) {
          this.nicList = data.data.rows
        }
      })
    },
    add() {
      this.getNic()
      getVmGroup(this.detail.id, { action: 'unbind', id: this.detail.id }).then(data => {
        if (data.success) {
          this.groups = data.data
          this.list.push({ groupId: '', flag: true })
        }
      })
    },
    getVmGroup() {
      getVmGroup(this.detail.id, { action: 'listsgroup', id: this.detail.id }).then(data => {
        if (data.success) {
          this.list = data.data
        }
      })
    },
    remove(data) {
      this.$confirm('此操作将移除该安全组, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        patchNics('detachGroup', {
          id: data.serverBindCardId,
          groupId: data.id
        }).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.getVmGroup()
          }
        })
      })
    },
    ok(data) {
      if (!data.nicId || !data.groupId) return this.$message.error('请选择安全组或网卡')
      this.$confirm('此操作将新增安全组, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        patchNics('attachGroup', {
          vendorId: this.detail.vendorId,
          regionId: this.detail.regionId,
          id: data.nicId,
          groupId: data.groupId
        }).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.getVmGroup()
          }
        })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.add-btn {
  position: relative;
  top: -7px;
}
</style>
