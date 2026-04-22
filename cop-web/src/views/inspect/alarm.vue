<template>
  <div>
    <AdvanceTable title="告警设置列表" :data="list" :params="params" :total="total" :columns="inspectAlarmColumns" :get-list="getList" :loading="loading">
      <template #action>
        <el-button style="margin-bottom: 10px" type="primary" @click="add" icon="el-icon-plus">
          新增
        </el-button>
      </template>
      <template #color="color">
        <div class="color" :style="`background: ${color}`">&nbsp;&nbsp;</div>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="edit(record)">
          <i class="el-icon-edit"></i>
          编辑
        </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="del(record)">
          <i class="el-icon-delete"></i>
          删除
        </el-button>
      </template>
    </AdvanceTable>
    <el-dialog :title="title" :close-on-click-modal="false" :before-close="back" :visible.sync="show" width="600px" append-to-body>
      <basic-form :model="addData" ref="form" labelWidth="100px">
        <basic-form-item label="告警级别：" prop="warnLevel1" validate="required" required-message="请输入告警级别">
          <el-input-number v-model="addData.warnLevel1" :min="1" :max="10"></el-input-number>
        </basic-form-item>
        <basic-form-item label="告警颜色：" validate="required" required-message="请选择告警颜色">
          <el-color-picker v-model="addData.color"></el-color-picker>
        </basic-form-item>
        <basic-form-item label="告警描述：">
          <el-input v-model="addData.remark" />
        </basic-form-item>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="back">取消</el-button>
        <el-button type="primary" @click.native="save" :loading="loading">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getWarns, removeWarns, createWarns, modifyWarns } from 'services/task/inspect'
import { inspectAlarmColumns } from './config'

export default {
  data() {
    return {
      inspectAlarmColumns,
      loading: false,
      list: [],
      paramt: {
        page: 1,
        rows: 10
      },
      total: 0,
      params: {
        page: 1,
        rows: 10
      },
      addData: {
        warnLevel1: 1,
        color: '#409EFF',
        remark: ''
      },
      show: false,
      title: ''
    }
  },
  created() {
    this.getList()
  },
  methods: {
    back() {
      this.show = false
    },
    getList(data) {
      getWarns(this.params).then((data) => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    },
    del(row) {
      this.$confirm(`是否确认删除级别【${row.warnLevel}】`, '操作确认', {
        confirmButtonText: '确定',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        removeWarns(row.id).then((data) => {
          if (data.success) {
            this.$message.success(data.message)
            this.getList()
          }
        })
      })
    },
    // 新增
    add(data) {
      this.show = true
      this.title = '新增告警'
      this.status = 'add'
      this.addData = {
        warnLevel1: 1,
        color: '#409EFF',
        remark: ''
      }
    },
    edit(data) {
      this.show = true
      this.addData = {
        ...data,
        warnLevel1: data.warnLevel
      }
      this.title = '编辑告警'
      this.status = 'edit'
    },
    save() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.loading = true
          let http = createWarns
          if (this.status === 'edit') {
            // 编辑提交
            http = modifyWarns
          }
          this.addData.warnLevel = this.addData.warnLevel1
          http(this.addData)
            .then((data) => {
              if (data.success) {
                this.back()
                this.$message.success(data.message)
                this.getList()
              }
            })
            .finally((_) => {
              this.loading = false
            })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.color {
  display: inline-block;
  width: 40px;
  height: 14px;
}
</style>
