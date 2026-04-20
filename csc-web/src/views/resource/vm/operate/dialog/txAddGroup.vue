<template>
  <div>
    <el-dialog title="加入安全组" width="70%" :close-on-click-modal="false" v-if="addData.dialog" :visible.sync="addData.dialog">
      <basic-form :model="addData.data" ref="joinSecurityData" label-width="120px">
        <el-row :gutter="10">
          <el-col :span="24">
            <basic-form-item label="安全组：" prop="instanceType">
              <el-form :inline="true">
                <basic-form-item>
                  <el-input placeholder="名称" v-model="searchData.name"></el-input>
                </basic-form-item>
                <basic-form-item>
                  <el-button type="primary" icon="el-icon-search" @click="handleSearchSpec">搜索</el-button>
                </basic-form-item>
              </el-form>
              <div class="table-container">
                <el-table :data="securityGroupData" highlight-current-row tooltip-effect="dark" stripe border fit>
                  <el-table-column label="Id">
                    <template slot-scope="scope">
                      <el-radio :label="scope.row.id" v-model="addData.data.groupId">
                        {{ scope.row.groupUuid }}
                      </el-radio>
                    </template>
                  </el-table-column>
                  <el-table-column label="名称" prop="name"> </el-table-column>
                  <el-table-column label="备注" prop="remark"> </el-table-column>
                </el-table>
                <div class="pagination-container">
                  <el-pagination @size-change="handleSizeChange" @current-change="getGroupsData" :current-page.sync="params.page" :page-sizes="[5, 10, 20, 30, 50]" :page-size="params.rows" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
                </div>
              </div>
            </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addData.dialog = false">取消</el-button>
        <el-button type="primary" @click.native="ok">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { getGroup, vmJoinGroup } from 'services/platform/index'
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
    },
    vendorId: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      securityGroupData: [],
      params: {
        page: 1,
        rows: 10
      },
      total: 0,
      searchData: {
        name: ''
      }
    }
  },
  methods: {
    ok() {
      if (this.addData.data.groupId) {
        vmJoinGroup(this.addData.data).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.addData.dialog = false
          }
        })
      } else return this.$message.error('请选择安全组')
    },
    handleSearchSpec() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        vendorId: this.addData.data.vendorId,
        regionId: this.addData.data.regionId,
        'name:lk': this.searchData.name
      })
      this.getGroupsData()
    },
    handleSizeChange(val) {
      this.params.rows = val
      this.getGroupsData()
    },
    getGroupsData() {
      getGroup(this.params).then(data => {
        if (data.success) {
          this.securityGroupData = data.data.rows
          this.total = data.data.total
        }
      })
    }
  },
  created() {
    this.handleSearchSpec()
  }
}
</script>

<style></style>
