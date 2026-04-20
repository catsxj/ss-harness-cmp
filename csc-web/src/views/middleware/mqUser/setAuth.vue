<template>
  <div>
    <el-dialog title="设置权限" :visible.sync="addData.dialog" width="50%" append-to-body @close="cancle">
      <el-row>
        <el-row>
          <basic-table :data="list">
            <el-table-column prop="vhost" label="Virtual host" show-overflow-tooltip></el-table-column>
            <el-table-column prop="configure" label="Configure regexp" show-overflow-tooltip></el-table-column>
            <el-table-column prop="write" label="Write regexp" show-overflow-tooltip></el-table-column>
            <el-table-column prop="read" label="Read regexp" show-overflow-tooltip></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="text" @click="remove(scope.row)">删除</el-button>
              </template>
            </el-table-column>
            <div slot="pagination"></div>
          </basic-table>
        </el-row>
        <el-row class="m-t-md">
          <el-col :span="18">
            <el-form label-width="140px" :model="data" ref="data">
              <el-col :span="24">
                <basic-form-item label="Virtual Host:" prop="vhost" validate="required">
                  <el-select v-model="data.vhost">
                    <el-option v-for="(item, index) in vhostList" :key="index" :label="item.name" :value="item.name"></el-option>
                  </el-select>
                </basic-form-item>
              </el-col>
              <el-col :span="24">
                <basic-form-item label="Configure regexp:" prop="configure" validate="required">
                  <el-input v-model="data.configure"></el-input>
                </basic-form-item>
              </el-col>
              <el-col :span="24">
                <basic-form-item label="Write regexp:" prop="write" validate="required">
                  <el-input v-model="data.write"></el-input>
                </basic-form-item>
              </el-col>
              <el-col :span="24">
                <basic-form-item label="Read regexp:" prop="read" validate="required">
                  <el-input v-model="data.read"></el-input>
                </basic-form-item>
              </el-col>
            </el-form>
            <el-button class="pull-right" type="primary" @click="ok">添加</el-button>
          </el-col>
        </el-row>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="cancle">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { createMqVhosts, getMqUserPermissions, removeMqUserPermissions, getCmsVhosts, createMqUserPermissions } from 'services/resource/middleware'
export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          data: {
            labelIds: []
          },
          dialog: false
        }
      }
    }
  },
  data() {
    return {
      list: [],
      vhostList: [],
      data: {
        configure: '.*',
        write: '.*',
        read: '.*'
      }
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          createMqUserPermissions({
            ...this.addData.data,
            ...this.data
          }).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.getList()
              this.data = {
                configure: '.*',
                write: '.*',
                read: '.*'
              }
            }
          })
        }
      })
    },
    cancle() {
      this.addData.dialog = false
      this.$emit('back')
    },
    remove(data) {
      this.$confirm('是否确认删除该权限?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeMqUserPermissions({
          id: this.addData.data.id,
          name: this.addData.data.name,
          vhost: data.vhost
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
      getMqUserPermissions({
        id: this.addData.data.id,
        name: this.addData.data.name
      }).then(data => {
        if (data.success) {
          this.list = data.data
        }
      })
    },
    getVhosts() {
      getCmsVhosts(this.addData.data.id, { page: 1, rows: 9999 }).then(data => {
        if (data.success) {
          this.vhostList = data.data.rows
        }
      })
    }
  },
  created() {
    this.getList()
    this.getVhosts()
  }
}
</script>

<style scoped>
.mine-text {
  color: darkgray;
  font-size: 12px;
  cursor: pointer;
}
</style>
