<template>
  <el-dialog :title="dialog.title" :visible.sync="dialog.visible" width="1000px">
    <div>
      <basic-form :model="formData" ref="formData" :rules="formDataRules">
        <el-form-item label="分摊规则：">
          <el-select class="w-lg" placeholder="请选择分摊规则" value-key="id" filterable v-model="formData.projectList" @change="handleChangeRules">
            <el-option v-for="item in rulesList" :key="item.id" :label="item.name" :value="item.projectList"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="'分摊' + $store.getters.systemConfig.projectConfigLabel + '：'" v-if="formData.projectList.length > 0"></el-form-item>
        <el-form-item label="" v-if="formData.projectList.length > 0">
          <div style="display: flex; padding: 0 100px" v-for="(item, ind) in formData.projectList" :key="ind">
            <el-col :span="12">
              <el-form-item label="" :prop="`projectList.${ind}.tenantId`" :rules="formDataRules.tenantId">
                <el-select style="width: 200px" filterable placeholder="选择租户" v-model="item.tenantId" @change="(value) => handleChnageTenantList(value, ind)">
                  <el-option v-for="item in tenantList" :key="item.id" :label="item.name" :value="item.id"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="" :prop="`projectList.${ind}.projectId`" :rules="formDataRules.projectId">
                <el-select style="width: 200px" filterable :placeholder="'选择' + $store.getters.systemConfig.projectConfigLabel" v-model="item.projectId" clearable>
                  <el-option v-for="item in formData.projectList[ind].projectBudgetList" :key="item.id" :label="item.name" :value="item.id" :disabled="formData.projectList.some((b) => b.projectId === item.id)"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="10">
              <el-form-item label="" :prop="`projectList.${ind}.allocationCoefficient`" :rules="formDataRules.allocationCoefficient">
                <span style="margin-right: 6px">
                  <el-tooltip effect="dark" :content="'分摊系数：预算' + $store.getters.systemConfig.projectConfigLabel + '分摊系数总和应为100'" placement="top">
                    <i class="el-icon-question" style="font-size: 16px"></i>
                  </el-tooltip>
                </span>
                <el-input-number v-model="item.allocationCoefficient" :min="0" :max="100" :step="0.01" :precision="2"></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-button type="danger" v-if="formData.projectList.length > 1" @click="removeBudgetItem(item, ind)">删除</el-button>
            </el-col>
          </div>
        </el-form-item>
      </basic-form>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click.native="dialog.visible = false">取 消</el-button>
      <el-button type="primary" @click="handleSure" :loading="loading">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getSplitRule, setSplitRule, setSplitRules } from 'services/services/bill'
import { getTenant } from 'services/system/tenant'
import { getProject } from 'services/system/project'
export default {
  props: {
    dialog: {
      type: Object
    }
  },
  data() {
    return {
      loading: false,
      formData: {
        projectList: []
      },
      formDataRules: {
        tenantId: [{ required: true, message: '租户不能为空', trigger: 'change' }],
        projectId: [{ required: true, message: this.$store.getters.systemConfig.projectConfigLabel + '不能为空', trigger: 'change' }],
        allocationCoefficient: [{ required: true, message: '分摊系数不能为空', trigger: 'blur' }]
      },
      projectBudgetList: [],
      detail: {},
      rulesList: [],
      tenantList: []
    }
  },
  created() {
    this.getRuleList()
    this.getTenantList()
  },
  methods: {
    handleSure() {
      this.$refs.formData.validate((valid) => {
        if (valid) {
          const totalCoefficient = this.formData.projectList.reduce((total, item) => total + Number(item.allocationCoefficient), 0)
          if (totalCoefficient !== 100) {
            const error = `当前设置好的系数总值为${totalCoefficient}，请重新调整分摊系数`
            this.$message.error(error)
          } else {
            this.loading = true
            let billIds = null
            let apiAction = null
            // 批量还是单独
            if (this.dialog.action === 'single') {
              // 执行保存操作
              billIds = this.dialog.data
              apiAction = setSplitRule
            } else {
              this.formData.billIds = this.dialog.data
              apiAction = setSplitRules
            }
            if (this.dialog.type === 'inside') {
              this.formData.type = 'inside'
            } else {
              this.formData.type = 'outside'
            }

            apiAction(this.formData, billIds)
              .then((res) => {
                if (res.success) {
                  this.$notify({
                    message: res.message,
                    type: 'success'
                  })
                  this.$emit('getList')
                }
              })
              .finally(() => {
                this.loading = false
              })
          }
        } else {
          return false
        }
      })
    },
    handleAdd(list) {
      console.log(list)
      const { tenantId, projectId } = list[0]
      this.formData.projectList.push({ tenantId: tenantId, projectId: projectId, allocationCoefficient: null })
    },
    removeBudgetItem(item, index) {
      if (this.formData.projectList.length > 1) {
        this.formData.projectList.splice(index, 1)
      }
    },

    getRuleList() {
      const params = {
        page: 1,
        rows: 99999
      }
      getSplitRule({ params: params }).then((res) => {
        if (res.success) {
          this.rulesList = res.data.rows.filter((item) => {
            return item.isAutoAllocate === false
          })
        }
      })
    },
    // 获取租户
    getTenantList() {
      getTenant({ params: { page: 1, rows: 9999 } }).then((res) => {
        if (res.success) {
          this.tenantList = res.data.rows
        }
      })
    },
    // 获取应用系统
    getProjectList(val, ind) {
      const params = {
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { tenantId: val }, sign: 'EQ' }])
      }
      getProject(params).then((res) => {
        const arr = res.data.rows.map((item) => {
          item.disabled = false
          return item
        })
        this.$nextTick(() => {
          // this.formData.projectList[ind].projectBudgetList = arr
          this.$set(this.formData.projectList[ind], 'projectBudgetList', arr)
        })
      })
    },
    handleChnageTenantList(val, ind) {
      this.$set(this.formData.projectList[ind], 'projectId', '')
      this.getProjectList(val, ind)
    },
    handleChangeRules(val) {
      console.log(val)
      const hasProjectId = val.some((item) => this.dialog.list.some((arrItem) => item.projectId === arrItem.projectId))
      console.log(hasProjectId, '....hasProjectId')
      if (!hasProjectId) {
        this.handleAdd(this.dialog.list)
      }
      val.forEach((item, ind) => {
        if (item.tenantId) {
          this.getProjectList(item.tenantId, ind)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-form-item__content {
  margin-left: 0 !important;
}
</style>
