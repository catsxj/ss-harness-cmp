<template>
  <div>
    <el-dialog title="设置权限" :visible.sync="addData.dialog" width="60%" append-to-body>
      <el-row>
        <el-form label-width="120px" :model="addData.data" ref="data">
          <el-col :span="24">
            <basic-form-item label="账号类型：" prop="permission">
              <el-radio-group v-model="addData.data.permission">
                <el-radio :label="item.value" v-for="(item, index) in typeList" :key="index">{{ item.name }}</el-radio>
              </el-radio-group>
            </basic-form-item>
          </el-col>
          <el-col :span="24" v-if="addData.data.permission == 'general'">
            <basic-form-item label="授权数据库：">
              <el-transfer style="text-align: left; display: inline-block" v-model="dbsUserList" filterable :props="{ key: 'id', label: 'name' }" :titles="['未授权数据库', '已授权数据库']" :button-texts="['移除', '授权']" :data="dbsList"> </el-transfer>
            </basic-form-item>
          </el-col>
        </el-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { patchRdsUsers, getRdsDbs } from 'services/resource/datebase'
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
      typeList: [
        { name: '高级账号', value: 'premier' },
        { name: '普通账号', value: 'general' }
      ],
      dbsList: [],
      dbsUserList: []
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          if (this.addData.data.permission == 'general') {
            this.addData.data.grantDbs = []
            this.dbsList.forEach(item => {
              if (this.dbsUserList.indexOf(item.id) > -1) {
                this.addData.data.grantDbs.push({
                  name: item.name,
                  id: item.id
                })
              }
            })
          }
          patchRdsUsers('grant', this.addData.data).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$parent.getList()
            }
          })
        }
      })
    }
  },
  created() {
    if (this.addData.grantDbs) {
      this.dbsUserList = []
      const ary = this.addData.grantDbs.split(',')
      ary.forEach(item => {
        this.dbsUserList.push(Number(item))
      })
    }
    const params = {
      page: 1,
      rows: 9999,
      params: JSON.stringify([
        {
          param: {
            rdsId: this.addData.data.rdsId
          },
          sign: 'EQ'
        }
      ])
    }
    getRdsDbs(params).then(data => {
      if (data.success) {
        this.dbsList = data.data.rows
      }
    })
  }
}
</script>

<style>
.text_mine {
  font-size: 10px;
  color: #999;
}
</style>
