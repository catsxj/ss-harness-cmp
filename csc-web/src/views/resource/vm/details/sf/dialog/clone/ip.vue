<template>
  <div>
    <el-dialog title="选择IP" :visible.sync="addData.dialog" width="60%" v-if="addData.dialog" append-to-body>
      <div>
      <el-form :inline="true">
        <el-form-item>
          <el-input placeholder="IP" v-model="listQuery.ip"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
        <el-checkbox-group v-model="checkList">
          <basic-table :data="list" :params="params" :get-list="getList" :total="total">
            <el-table-column show-overflow-tooltip label="IP" prop="ip">
              <template slot-scope="scope">
                <el-checkbox :label="scope.row.ip" :disabled="(checkList.length >= parentData.count && checkList.indexOf(scope.row.ip) == -1) || ip.indexOf(scope.row.ip) > -1">{{scope.row.ip}}</el-checkbox>
              </template>
            </el-table-column>
            <el-table-column show-overflow-tooltip label="DNS" prop="dns"></el-table-column>
          </basic-table>
        </el-checkbox-group>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { getIp } from 'services/platform/index'

export default {
  props: {
    addData: {
      type: Object
    },
    parentData: {
      type: Object
    },
    lists: {
      type: Array
    }
  },
  computed: {
    ip () {
      const ary = []
      this.lists.forEach((item, index) => {
        if (item.address && this.addData.index != index) {
          item.address.forEach(item1 => {
            ary.push(item1)
          })
        }
        if (item.ipv6Address && this.addData.index != index) {
          item.ipv6Address.forEach(item1 => {
            ary.push(item1)
          })
        }
      })
      return ary
    }
  },
  data () {
    return {
      list: null,
      total: null,
      listQuery: {
        ip: ''
      },
      params: {
        page: 1,
        rows: 10
      },
      checkList: []
    }
  },
  methods: {
    getList () {
      getIp(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    },
    handleSearch () {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        poolId: this.addData.key == 'address' ? this.addData.data.ipv4PoolId : this.addData.data.ipv6PoolId,
        status: 'free',
        'ip:LK': this.listQuery.ip
      })
      this.getList()
    },
    ok () {
      console.log(this.parentData)
      if (this.checkList.length == this.parentData.count || this.checkList.length == 0) {
        this.$set(this.addData.data, this.addData.key, this.checkList)
        this.addData.dialog = false
      } else {
        this.$message.error('所选IP数量不满足申请云主机数量')
      }
    }
  },
  created () {
    this.handleSearch()
    if (this.addData.data[this.addData.key]) this.checkList = this.addData.data[this.addData.key]
  }
}
</script>

<style>

</style>
