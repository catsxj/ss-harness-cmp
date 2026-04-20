<template>
  <el-dialog title="编辑IPV6 CIDR" :visible.sync="addData.dialog" width="40%">
    <el-card header="IPV6 CIDR">
      <el-table :data="IPV6">
        <el-table-column label="CIDR" prop="cidrBlock" show-overflow-tooltip width="300px">
          <template slot-scope="scope">
            <el-row v-if="scope.row.index != 0">
              <el-col :span="9" style="text-align: right; line-height: 32px">{{ scope.row.pre }}</el-col>
              <el-col :span="6">
                <basic-form label-width="0px" :model="scope.row" class="ss">
                  <basic-form-item label-width="4px" prop="middle" maxlength="2" validate="required,ipV6CidrCustomize">
                    <el-input v-model="scope.row.middle"></el-input>
                  </basic-form-item>
                </basic-form>
              </el-col>
              <el-col :span="9" style="line-height: 32px">{{ scope.row.back }}</el-col>
            </el-row>
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
            <el-button type="text" @click="del('disassociate', IPV6, scope.row)"> <i class="el-icon-delete"></i> 移除 </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-button type="ghost" icon="el-icon-circle-plus-outline" :disabled="!!+IPV6.length" @click="add('IPV6')" style="margin-top: 16px">添加新的IPV6 CIDR</el-button>
    </el-card>
    <span slot="footer" class="dialog-footer">
      <el-button type="ghost" @click="close">关闭</el-button>
      <el-button type="primary" @click="ok('IPV6', 'associateIpv6')">保存</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { getIpvs, operationSubIpvs } from 'services/platform/aws'
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
    },
    addRow: {
      type: Object
    }
  },
  data() {
    return {
      params: {
        page: 1,
        rows: 10
      },
      total: 0,
      ipv6cidr: [],
      IPV6: []
    }
  },
  created() {
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
          console.log(this[type])
        }
      })
    },
    add(val) {
      const arr = this.addRow.ipv6Cidr.split('::')
      this[val].push({
        ...this.addRow,
        pre: arr[0].slice(0, -2),
        middle: '',
        back: '::/64'
      })
    },
    del(action, rows, row) {
      if (row.index == null) {
        // 如果是动态新增的，移除无接口
        rows.splice(rows.length - 1, 1)
      } else {
        // 如果是请求到的数据，移除需要接口
        operationSubIpvs(this.addData.data.id, {
          action,
          id: row.id
        }).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.getIpvData('IPV6')
          }
        })
      }
    },
    ok(tp, action) {
      const row = this[tp][0]
      operationSubIpvs(this.addData.data.id, {
        action,
        ipv6Cidr: row.pre + row.middle + row.back
      }).then(data => {
        if (data.success) {
          this.$message({
            type: 'success',
            message: data.message
          })
          this.getIpvData(tp)
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
