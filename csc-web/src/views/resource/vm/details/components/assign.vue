<template>
  <div>
    <el-dialog title="分配云主机" :close-on-click-modal="false" v-if="addData.dialog" :visible.sync="addData.dialog">
      <el-form :model="addData.data" label-width="100px" ref="authData" :rules="rule1">
        <el-form-item label="使用时长：" prop="months" required required-message="请输入使用时长">
          <el-input type="number" v-model.number="addData.data.months" auto-complete="off">
            <template slot="append">月</template>
          </el-input>
        </el-form-item>
        <el-form-item label="租户用户：" prop="userId" required required-message="请选择租户用户">
          <el-select v-model="addData.data.userId" @change="handleSearchProject">
            <el-option v-for="(item, index) in userList" :key="index" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$store.getters.systemConfig.projectConfigLabel + '列表：'" v-if="projectList.length != 0" prop="projectId">
          <el-select clearable v-model="addData.data.projectId" placeholder="请选择">
            <el-option v-for="item in projectList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addData.dialog = false">取消</el-button>
        <el-button type="primary" @click.native="authSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { getProject } from 'services/system/project'
import { getUser } from 'services/system/manager'
import { vmUsers } from 'services/platform/index'

export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          data: {
            months: 1,
            userId: '',
            projectId: ''
          },
          dialog: false
        }
      }
    }
  },
  data() {
    return {
      rule1: {
        months: [{ required: true, message: '请输入使用时长', trigger: 'blur' }],
        userId: [{ required: true, message: '请选择租户用户', trigger: 'blur,change' }],
        projectId: [{ required: true, message: '请选择' + this.$store.getters.systemConfig.projectConfigLabel }]
      },
      userList: [],
      projectList: []
    }
  },
  methods: {
    authSubmit() {
      this.$refs.authData.validate(valid => {
        if (valid) {
          if (this.projectList.length != 0) {
            this.projectList.forEach(item => {
              if (item.id == this.addData.data.projectId) {
                this.addData.data.tenantId = item.tenantId
              }
            })
          } else {
            delete this.addData.data.tenantId
            delete this.addData.data.projectId
          }
          vmUsers(this.addData.data).then(data => {
            if (data.success) {
              this.$message.success(data.message)
              this.addData.dialog = false
              this.$parent.getData()
            }
          })
        }
      })
    },
    // 获取租户
    getTenantData(value) {
      const params = JSON.stringify([{ param: { tenantId: 0 }, sign: 'GT' }])
      getUser({
        simple: true,
        params: params
      }).then(data => {
        if (data.success) {
          this.userList = data.data.rows
        }
      })
    },
    handleSearchProject() {
      getProject({
        simple: true,
        params: this.$tools.handleSearchParam({
          userId: this.addData.data.userId
        })
      }).then(data => {
        if (data.success) {
          this.projectList = data.data
        }
      })
    }
  },
  created() {
    this.projectList = []
    this.userList = []
    this.getTenantData()
  }
}
</script>

<style></style>
