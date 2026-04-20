<template>
  <el-dialog width="40%" :visible.sync="billDialog.visible" :title="billDialog.type === 'edit' ? '编辑账单配置' : '新增账单配置'">
    <basic-form :model="billDialog.formData" ref="formRef">
      <basic-form-item label="账单名称：" prop="name" validate="required">
        <el-input class="w-lg" v-model="billDialog.formData.name"></el-input>
      </basic-form-item>
      <basic-form-item label="账单类别：" prop="type" validate="required">
        <el-select class="w-lg" v-model="billDialog.formData.type">
          <el-option v-for="(item, ind) in billType" :key="ind" :label="item.name" :value="item.value"></el-option>
        </el-select>
      </basic-form-item>
      <!-- 内部账单 -->
      <basic-form-item label="统计类目：" prop="resources" validate="required" v-if="billDialog.formData.type === 'inside'">
        <el-select class="w-lg" v-model="billDialog.formData.resources" filterable multiple>
          <el-option v-for="(item, ind) in insideList" :key="ind" :label="item.name" :value="item.value"></el-option>
        </el-select>
      </basic-form-item>
      <!-- 外部账单 -->
      <basic-form-item label="统计类目：" prop="resources" validate="required" v-if="billDialog.formData.type === 'outside'">
        <el-select class="w-lg" v-model="billDialog.formData.resources" filterable multiple>
          <el-option v-for="(item, ind) in outsideList" :key="ind" :label="item.name" :value="item.value"></el-option>
        </el-select>
      </basic-form-item>
      <basic-form-item label="结账时间：" prop="checkDay" validate="required">
        每月第
        <el-input-number v-model="billDialog.formData.checkDay" :min="1" :max="31" :step-strictly="true" :precision="0" label="请输入数字1-31"></el-input-number>
        天
      </basic-form-item>
      <basic-form-item label="出账时间：" prop="paymentDay" validate="required">
        <div>
          每月第
          <el-input-number v-model="billDialog.formData.paymentDay" :min="1" :max="31" label="请输入数字1-31"></el-input-number>
          天
        </div>
        <div>
          <el-switch v-model="billDialog.formData.isAuto" active-text="自动出账"> </el-switch>
        </div>
      </basic-form-item>
    </basic-form>
    <template #footer>
      <el-button type="default" @click="handleCancle">取消</el-button>
      <el-button type="primary" @click="confirm" :loading="loading">确定</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { postConfiguration, putConfiguration } from '@/services/services/bill'

const outsideList = [
  {
    name: '云平台',
    value: 'vendor'
  },
  {
    name: '资源类型',
    value: 'serviceType'
  }
]
const billType = [
  {
    name: '内部账单',
    value: 'inside'
  },
  {
    name: '外部账单',
    value: 'outside'
  }
]
export default {
  props: {
    billDialog: { type: Object }
  },
  data() {
    return {
      insideList: [
        {
          name: '资源池',
          value: 'pool'
        },
        {
          name: '资源类型',
          value: 'serviceType'
        },
        {
          name: '所属租户',
          value: 'tenant'
        },
        {
          name: this.$store.getters.systemConfig.projectConfigLabel,
          value: 'project'
        },
        {
          name: '所属用户',
          value: 'user'
        }
      ],
      outsideList,
      billType,
      loading: false
    }
  },
  created() {
    this.initData()
  },
  methods: {
    initData() {
      if (this.billDialog.type === 'edit') {
        this.billDialog.formData = { ...this.billDialog.data }
      }
    },
    handleCancle() {
      this.$refs.formRef.resetFields()
      this.billDialog.formData.isAuto = false
      this.billDialog.visible = false
    },
    confirm() {
      this.$refs.formRef.validate((validate) => {
        if (!validate) return
        this.loading = true
        if (this.billDialog.type === 'add') {
          postConfiguration(this.billDialog.formData)
            .then((res) => {
              if (res.success) {
                this.$message.success('新增成功')
                this.$refs.formRef.resetFields()
                this.billDialog.formData.isAuto = false
                this.$emit('getList')
              }
            })
            .finally(() => {
              this.loading = false
            })
        } else {
          putConfiguration(this.billDialog.formData, this.billDialog.data.id)
            .then((res) => {
              if (res.success) {
                this.$message.success('修改成功')
                this.$refs.formRef.resetFields()
                this.billDialog.formData.isAuto = false
                this.$emit('getList')
              }
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    }
  }
}
</script>
