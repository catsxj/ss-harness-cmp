<template>
  <el-dialog :title="dialog.title" :visible.sync="dialog.visible" width="1000px">
    <div>
      <basic-form :model="formData" ref="formData" :rules="formDataRules">
        <el-form-item label="规则名称：" prop="name" :rules="formDataRules.name">
          <el-input v-model="formData.name" class="w-lg"></el-input>
        </el-form-item>
        <el-form-item label="自动分摊：" prop="isAutoAllocate" :rules="formDataRules.isAutoAllocate">
          <span style="margin-right: 6px">
            <el-tooltip effect="dark" placement="top">
              <i class="el-icon-question" style="font-size: 16px"></i>
              <div slot="content">选择自动分摊后，系统自动根据<br />资源ID将账单中相应的资源实例<br />分摊到下方预置的分摊{{ $store.getters.systemConfig.projectConfigLabel }}中</div>
            </el-tooltip>
          </span>
          <el-radio-group v-model="formData.isAutoAllocate">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="资源类型：" prop="serviceCode" :rules="formDataRules.serviceCode" v-if="formData.isAutoAllocate">
          <el-select filterable placeholder="" v-model="formData.serviceCode" class="w-lg">
            <el-option v-for="item in serviceList" :key="item.id" :label="item.name" :value="item.code"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="资源ID：" prop="resourceId" :rules="formDataRules.resourceId" v-if="formData.isAutoAllocate">
          <el-input v-model="formData.resourceId" class="w-lg"></el-input>
        </el-form-item>
        <el-form-item :label="'分摊' + $store.getters.systemConfig.projectConfigLabel + '：'">
          <el-button type="primary" @click="handleAdd" style="margin-bottom: 15px">新增分摊{{ $store.getters.systemConfig.projectConfigLabel }}</el-button>
        </el-form-item>
        <div style="display: flex" v-for="(item, ind) in formData.projectList" :key="ind">
          <el-col :span="6">
            <el-form-item label="" :prop="`projectList.${ind}.tenantId`" :rules="formDataRules.tenantId">
              <el-select style="width: 200px" filterable placeholder="选择租户" v-model="item.tenantId" @change="(value) => handleChnageTenantList(value, ind)">
                <el-option v-for="item in tenantList" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="" :prop="`projectList.${ind}.projectId`" :rules="formDataRules.projectId">
              <el-select style="width: 200px" filterable:placeholder="'请选择' + $store.getters.systemConfig.projectConfigLabel" v-model="item.projectId" clearable>
                <el-option v-for="item in projectBudgetList" :key="item.id" :label="item.name" :value="item.id" :disabled="formData.projectList.some((b) => b.projectId === item.id)"></el-option>
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
          <el-col :span="6">
            <el-button type="danger" v-if="formData.projectList.length > 1" @click="removeBudgetItem(item, ind)">删除</el-button>
          </el-col>
        </div>
      </basic-form>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click.native="dialog.visible = false">取 消</el-button>
      <el-button type="primary" @click="handleSure" :loading="loading">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { addBudget, editSplitRule } from 'services/services/bill'
import { getService } from 'services/services/service'
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
        name: '',
        isAutoAllocate: false,
        projectList: [{ tenantId: null, projectId: null, allocationCoefficient: null }],
        serviceCode: null,
        resourceId: null
      },
      formDataRules: {
        name: [{ required: true, message: '分摊规则名称不能为空', trigger: 'blur' }],
        tenantId: [{ required: true, message: '租户不能为空', trigger: 'change' }],
        projectId: [{ required: true, message: this.$store.getters.systemConfig.projectConfigLabel + '不能为空', trigger: 'change' }],
        isAutoAllocate: [{ required: true, message: '自动分摊不能为空', trigger: 'change' }],
        serviceCode: [{ required: true, message: '资源类型不能为空', trigger: 'change' }],
        resourceId: [{ required: true, message: '资源ID不能为空', trigger: 'blur' }],
        allocationCoefficient: [{ required: true, message: '分摊系数不能为空', trigger: 'blur' }]
      },
      projectBudgetList: [],
      detail: {},
      serviceList: [],
      tenantList: []
    }
  },
  created() {
    this.getDetail()
    this.getServiceList()
    this.getTenantList()
  },
  computed: {},
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
            if (this.dialog.type === 'add') {
              if (!this.formData.isAutoAllocate) {
                delete this.formData.serviceCode
                delete this.formData.resourceId
              }
              // 执行保存操作
              addBudget(this.formData)
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
            } else {
              const id = this.detail.id
              this.formData.id = id
              if (!this.formData.isAutoAllocate) {
                delete this.formData.serviceCode
                delete this.formData.resourceId
              }
              editSplitRule(id, this.formData)
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
          }
        } else {
          return false
        }
      })
    },
    handleAdd() {
      this.formData.projectList.push({ tenantId: null, projectId: null, allocationCoefficient: null })
    },
    removeBudgetItem(item, index) {
      if (this.formData.projectList.length > 1) {
        this.formData.projectList.splice(index, 1)
      }
    },
    getProjectList(val) {
      const params = {
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { tenantId: val }, sign: 'EQ' }])
      }
      getProject(params).then((res) => {
        this.projectBudgetList = res.data.rows.map((item) => {
          item.disabled = false
          return item
        })
      })
    },
    // 获取资源类型
    getServiceList() {
      getService({ page: 1, rows: 9999 }).then((res) => {
        if (res.success) {
          this.serviceList = res.data.rows
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
    handleChnageTenantList(val, ind) {
      this.getProjectList(val)
    },
    getDetail() {
      if (this.dialog.type === 'edit') {
        this.detail = this.dialog.data
        this.formData.projectList = this.detail.projectList
        this.formData.name = this.detail.name
        this.formData.isAutoAllocate = this.detail.isAutoAllocate
        this.formData.serviceCode = this.detail.serviceCode
        this.formData.resourceId = this.detail.resourceId
        this.formData.projectList.forEach((item) => {
          if (item.tenantId) {
            this.getProjectList(item.tenantId)
          }
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
// ::v-deep .el-form-item__content {
//   margin-left: 0 !important;
// }

.el-form-item--small .el-form-item__content {
  line-height: 40px;
}
</style>
