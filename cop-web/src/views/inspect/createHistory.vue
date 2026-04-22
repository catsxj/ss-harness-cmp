<template>
  <el-dialog title="巡检记录填写" :close-on-click-modal="false" visible @close="goBack()"
      width="800px" append-to-body>
    <basic-form :model="data" ref="form" labelWidth="130px">
      <basic-form-item label="巡检名称：" prop="name" validate="required" required-message="请输入巡检名称">
        <el-input placeholder="请输入巡检名称" v-model="data.name"/>
      </basic-form-item>
      <basic-form-item label="告警状态：">
        <el-radio-group v-model="data.status" disabled size="mini">
          <el-radio-button :label="false">正常</el-radio-button>
          <el-radio-button :label="true">告警</el-radio-button>
        </el-radio-group>
      </basic-form-item>
      <basic-form-item label="执行详情：">
        <div class="table-container">
          <el-table :data="formData" stripe fit header-cell-class-name="custom-header">
            <el-table-column prop="ip" show-overflow-tooltip>
              <template slot="header">
                主机ip<span style="color: red">*</span>
              </template>
              <template slot-scope="scope">
                <el-input v-if="['update', 'create'].includes(scope.row.type)" v-model="scope.row.obj.ip"></el-input>
                <span v-else>{{scope.row.ip}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="name" show-overflow-tooltip>
              <template slot="header">
                巡检项目名称<span style="color: red">*</span>
                <i class="iconfont icon-jinggao" title="巡检的项目的名称，如CPU占用率"></i>
              </template>
              <template slot-scope="scope">
                <el-input v-if="['update', 'create'].includes(scope.row.type)" v-model="scope.row.obj.name"></el-input>
                <span v-else>{{scope.row.name}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="value" show-overflow-tooltip>
              <template slot="header">
                巡检结果<span style="color: red">*</span>
                <i class="iconfont icon-jinggao" title="巡检项目对应的查询结果，如80%"></i>
              </template>
              <template slot-scope="scope">
                <el-input v-if="['update', 'create'].includes(scope.row.type)" v-model="scope.row.obj.value"></el-input>
                <span v-else>{{scope.row.value}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="warning" show-overflow-tooltip>
              <template slot="header">
                告警描述
                <i class="iconfont icon-jinggao" title="巡检项目对应的告警信息，如CPU占用率过高，如无告警，请勿输入"></i>
              </template>
              <template slot-scope="scope">
                <el-input v-if="['update', 'create'].includes(scope.row.type)" v-model="scope.row.obj.warning"></el-input>
                <span v-else>{{scope.row.warning}}</span>
              </template>
            </el-table-column>
            <el-table-column>
              <template slot-scope="scope">
                <el-button type="text" v-if="scope.row.type == 'saved'" @click="update(scope.row)">编辑</el-button>
                <el-button type="text" v-if="scope.row.type != 'saved'" @click="save(scope.row)">保存</el-button>
                <el-button type="text" v-if="scope.row.type == 'update'" @click="cancel(scope.row)">取消</el-button>
                <el-button type="text" v-if="scope.row.type != 'create'" @click="del(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </basic-form-item>
    </basic-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click.native="goBack()">取消</el-button>
      <el-button type="primary" @click.native="create" :loading="loading">提交</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { createRecords } from 'services/task/inspect'
export default {
  data () {
    return {
      loading: false,
      data: {
        status: false,
        name: '',
        execute: []
      }
    }
  },
  computed: {
    formData () {
      return [
        { type: 'create', obj: {} },
        ...this.data.execute
      ]
    }
  },
  methods: {
    goBack (val) {
      this.$emit('goBack', val)
    },
    create () {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.data.execute.length <= 0) {
            return this.$message.error('执行详情不能为空')
          }
          this.loading = true
          const params = {
            name: this.data.name,
            warning: this.data.status,
            recordItems: this.data.execute
          }
          createRecords(params).then(data => {
            this.loading = false
            if (data.success) {
              this.goBack(true)
            }
          })
        }
      })
    },
    update (row) {
      row.type = 'update'
      row.obj = {
        ip: row.ip,
        name: row.name,
        value: row.value,
        warning: row.warning
      }
    },
    cancel (row) {
      row.obj = {}
      row.type = 'saved'
    },
    save (row) {
      if (!row.obj.ip) {
        return this.$message.error('请输入主机ip')
      }
      if (!row.obj.name) {
        return this.$message.error('请输入巡检项目名称')
      }
      if (!row.obj.value) {
        return this.$message.error('请输入巡检结果')
      }
      if (row.type == 'create') {
        this.data.execute.push({
          ip: row.obj.ip,
          name: row.obj.name,
          value: row.obj.value,
          warning: row.obj.warning,
          obj: {},
          type: 'saved'
        })
      } else if (row.type == 'update') {
        row.type = 'saved'
        row.ip = row.obj.ip
        row.name = row.obj.ip
        row.value = row.obj.value
        row.warning = row.obj.warning
        row.obj = {}
      }
      this.checkWarning()
    },
    del (index) {
      this.data.execute.splice(index - 1, 1)
      this.checkWarning()
    },
    checkWarning () {
      for (const i of this.data.execute) {
        if (i.warning) {
          this.data.status = true
          return
        }
      }
      this.data.status = false
    }
  }
}
</script>
