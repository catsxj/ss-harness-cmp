<template>
  <el-dialog title="编辑CIDR" :visible.sync="addData.dialog" width="40%">
    <el-card header="IPV4 CIDR">
      <el-table :data="IPV4">
        <el-table-column label="CIDR" prop="cidrBlock" show-overflow-tooltip>
          <template slot-scope="scope">
            <basic-form label-width="0px" :model="scope.row" v-if="!!!+scope.row.index && scope.row.index !== 0" class="ss">
              <basic-form-item prop="cidr" validate="required,cidr">
                <el-input v-model="scope.row.cidr" size="mini"></el-input>
              </basic-form-item>
            </basic-form>
            <span v-else>{{ scope.row.cidrBlock }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" show-overflow-tooltip>
          <template slot-scope="scope">
            <span v-if="scope.row.cidrBlockState == null">-</span>
            <span v-if="scope.row.cidrBlockState == 'associated'" style="color: #1d8102"><i class="el-icon-circle-check"></i>associated</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-button type="text" @click="del('disassociate', IPV4, scope.row, 'IPV4')" :disabled="scope.row.index === 0"> <i class="el-icon-delete"></i> 移除 </el-button>
            <div class="action-divider" v-if="scope.row.index == null"></div>
            <el-button type="text" @click="ok('IPV4', 'associate', scope.row.cidr)" v-if="scope.row.index == null"> <i class="el-icon-circle-check"></i> 保存 </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-button type="ghost" icon="el-icon-circle-plus-outline" @click="add('IPV4')" style="margin-top: 16px">添加新的IPV4 CIDR</el-button>
    </el-card>
    <el-card header="IPV6 CIDR" style="margin-top: 20px">
      <el-table :data="IPV6">
        <el-table-column label="CIDR" prop="cidrBlock" show-overflow-tooltip></el-table-column>
        <el-table-column label="状态" show-overflow-tooltip>
          <template slot-scope="scope">
            <span v-if="scope.row.cidrBlockState == null">-</span>
            <span v-if="scope.row.cidrBlockState == 'associated'" style="color: #1d8102"><i class="el-icon-circle-check"></i>associated</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-button type="text" @click="del('disassociate', IPV6, scope.row, 'IPV6')"> <i class="el-icon-delete"></i> 移除 </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-button type="ghost" icon="el-icon-circle-plus-outline" @click="ok('IPV6', 'associateIpv6')" style="margin-top: 16px" :disabled="IPV6.length > 0">添加新的IPV6 CIDR</el-button>
    </el-card>
    <span slot="footer" class="dialog-footer">
      <el-button type="ghost" @click="close">关闭</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { getIpvs, operationIpvs } from 'services/platform/aws'
export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          data: {},
          dialog: false
        }
      }
    }
  },
  data() {
    return {
      params: {
        page: 1,
        rows: 10
      },
      total: 0,
      IPV4: [],
      IPV6: []
    }
  },
  created() {
    this.getIpvData('IPV4')
    this.getIpvData('IPV6')
  },
  mounted() {},
  methods: {
    getIpvData(type) {
      const params = {}
      params.params = JSON.stringify([
        {
          param: {
            type,
            targetId: this.addData.data.targetId,
            vendorId: this.addData.data.vendorId
          },
          sign: 'EQ'
        }
      ])
      getIpvs(params).then(data => {
        if (data.success) {
          const arr = data.data.rows
          arr.forEach((item, index) => {
            item.index = index
          })
          this[type] = data.data.rows
        }
      })
    },
    add(val) {
      this[val].push({
        cidr: ''
      })
    },
    del(action, rows, row, tp) {
      if (row.index == null) {
        // 如果是动态新增的，移除无接口
        rows.splice(rows.length - 1, 1)
      } else {
        // 如果是请求到的数据，移除需要接口
        operationIpvs(this.addData.data.id, {
          action,
          id: row.id
        }).then(data => {
          if (data.success) {
            const type = data.success ? 'success' : 'error'
            this.$message({
              type,
              message: data.message
            })
            if (data.success) this.getIpvData(tp)
          }
        })
      }
    },
    ok(tp, action, cidr) {
      var params = {
        action
      }
      if (cidr != null) {
        params = {
          action,
          cidr
        }
      }
      operationIpvs(this.addData.data.id, params).then(data => {
        if (data.success) {
          const type = data.success ? 'success' : 'error'
          this.$message({
            type,
            message: data.message
          })
          if (data.success) this.getIpvData(tp)
        }
      })
    },
    close() {
      this.addData.dialog = false
      this.$emit('goBack')
    }
  }
}
</script>
<style scoped>
body#cmp .ss .el-form-item--mini.el-form-item,
body#cmp .ss .el-form-item--small.el-form-item {
  margin-bottom: 0;
}
</style>
<style>
.ss .el-form-item__error {
  position: relative;
}
</style>
