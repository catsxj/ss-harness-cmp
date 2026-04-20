<template>
  <div>
    <el-dialog title="DNS服务器" :visible.sync="addData.dialog" width="50%" v-if="addData.dialog">
      <el-row>
        <el-form ref="data" :model="addData.data" :status-icon="true" label-width="100px">
          <!-- <smart-table :data="addData.data.dnsServer" class="m-t-md">
            <el-table-column label="DNS：" show-overflow-tooltip>
              <template slot-scope="scope">
                {{scope.row}}
              </template>
            </el-table-column>
            <el-table-column label="操作" show-overflow-tooltip>
              <template slot-scope="scope">
                <el-button class="pull-right" type="text" @click="remove(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </smart-table> -->
          <el-col :span="24" v-for="(item, index) in addData.data.dnsServer" :key="index">
            <cmp-form-item label="DNS：">
              <span>{{ item.dns }}</span>
              <el-button class="pull-right" type="text" @click="remove(item)" :loading="item.loading">删除</el-button>
            </cmp-form-item>
          </el-col>
          <el-col :span="20">
            <cmp-form-item label="新增DNS：" prop="newDnsServer" validate="ip">
              <el-input v-model="addData.data.newDnsServer"></el-input>
            </cmp-form-item>
          </el-col>
          <el-col :span="4">
            <el-button class="pull-right" type="text" @click="add()" :loading="loading">新增</el-button>
          </el-col>
        </el-form>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="close">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { createNicsDns, removeNicsDns, detailNics } from 'services/platform/azure'
/* global $ */
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
      loading: false
    }
  },
  created() {},
  methods: {
    getDetail() {
      detailNics(this.addData.data.id).then(data => {
        if (data.success) {
          this.addData.data.dnsServer = []
          const dnsServer = data.data.dnsServer ? JSON.parse(data.data.dnsServer) : []
          if (dnsServer.length > 0) {
            dnsServer.forEach(item => {
              const data = {
                dns: item,
                loading: false
              }
              this.addData.data.dnsServer.push(data)
            })
          }
        }
      })
    },
    remove(row) {
      this.$confirm('确定删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$set(row, 'loading', true)
        removeNicsDns(this.addData.data.id, {
          dnsServer: row.dns
        }).then(data => {
          this.$set(row, 'loading', false)
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.getDetail()
          }
        })
      })
    },
    add() {
      this.$refs.data.validate(valid => {
        if (valid) {
          this.loading = true
          createNicsDns(this.addData.data.id, {
            dnsServer: this.addData.data.newDnsServer
          }).then(data => {
            this.loading = false
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.getDetail()
              this.addData.data.newDnsServer = ''
            }
          })
        }
      })
    },
    close() {
      this.addData.dialog = false
      this.$emit('back')
    }
  }
}
</script>

<style></style>
