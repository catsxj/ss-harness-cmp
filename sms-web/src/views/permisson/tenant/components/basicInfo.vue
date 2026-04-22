<template>
  <!-- TODO: cmp-element basic-form -->
  <basic-form :model="addData" ref="addDataRef" label-width="120px" width="100%">
    <el-row :gutter="10">
      <el-col :span="12">
        <basic-form-item label="租户名称：" prop="name" validate="required">
          <el-input v-model="addData.name" auto-complete="off" clearable></el-input>
        </basic-form-item>
      </el-col>
      <el-col :span="12">
        <basic-form-item label="登录账号：" prop="account" validate="required,code">
          <el-input v-model="addData.account" auto-complete="off" :disabled="!!addData.id" @change="checkedAccount" clearable></el-input>
        </basic-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="10" v-if="!addData.id">
      <el-col :span="12">
        <basic-form-item label="登录密码：" prop="password" :validate="pwdRule">
          <el-input v-model="addData.password" autocomplete="new-password" show-password clearable></el-input>
        </basic-form-item>
      </el-col>
      <el-col :span="12" v-if="!addData.id">
        <basic-form-item label="确认密码：" prop="confirmPassword" validate="required">
          <el-input v-model="addData.confirmPassword" auto-complete="off" show-password clearable></el-input>
        </basic-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :span="12">
        <basic-form-item label="所属组织：">
          <el-cascader v-model="addData.departIds" :options="departmentList" :props="departProps" clearable></el-cascader>
        </basic-form-item>
      </el-col>
      <el-col :span="12">
        <basic-form-item label="折扣系数：">
          <el-input-number v-model="addData.discount" :precision="2" :step="0.05" :max="1" :min="0"></el-input-number>
        </basic-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :span="12">
        <basic-form-item label="集团编码：" prop="groupCode" validate="code">
          <el-input v-model="addData.groupCode" auto-complete="off" clearable></el-input>
        </basic-form-item>
      </el-col>
      <el-col :span="12">
        <basic-form-item label="联系人姓名：">
          <el-input v-model="addData.contactName" auto-complete="off" clearable></el-input>
        </basic-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :span="12">
        <basic-form-item label="联系人电话：" prop="contactPhone" validate="mobile">
          <el-input v-model="addData.contactPhone" auto-complete="off" clearable></el-input>
        </basic-form-item>
      </el-col>
      <el-col :span="12">
        <basic-form-item label="联系人邮箱：" prop="contactEmail" validate="email">
          <el-input v-model="addData.contactEmail" auto-complete="off" clearable></el-input>
        </basic-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :span="24">
        <el-form-item label="备注信息：" prop="remark">
          <el-input type="textarea" v-model="addData.remark" auto-complete="off" clearable></el-input>
        </el-form-item>
      </el-col>
    </el-row>
  </basic-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import crypto from 'utils/crypto'
import { checkedTenant } from 'services/system/tenant'
import { getDepart } from 'services/system/depart'
import { useAppStore } from '@/stores'

const props = defineProps<{
  infoData?: Record<string, any>
}>()

const appStore = useAppStore()

const addData = reactive<any>({ discount: 1 })
const departmentList = ref<any[]>([])
const departProps = {
  value: 'id',
  label: 'name',
  checkStrictly: true
}
const addDataRef = ref<any>(null)

const pwdRule = computed(() => (appStore.systemConfig as any).pwdStrength + ',pswNoSpace')

onMounted(() => {
  getDepartList()
  const info = props.infoData || {}
  if (info.departIds && info.departIds.length) {
    info.departIds = JSON.parse(info.departIds)
  }
  Object.assign(addData, info)
})

async function getDepartList() {
  const res = await getDepart({ parentId: 0 })
  if (res.success) departmentList.value = res.data
}

async function checkedAccount() {
  const reg = /^[a-zA-Z0-9]*$/
  if (!reg.test(addData.account)) return
  await checkedTenant(addData.account)
}

async function getPostData(): Promise<any> {
  let data: any = false
  await new Promise<void>((resolve) => {
    addDataRef.value?.validate((valid: boolean) => {
      if (valid) {
        const { password, confirmPassword, id, departIds } = addData
        if (departIds && departIds.length) {
          addData.departId = addData.departIds[addData.departIds.length - 1]
        } else if (departIds && !departIds.length) {
          addData.departId = null
        }
        if (id) {
          data = addData
        } else {
          if (password !== confirmPassword) {
            ElMessage.error('两次密码输入不一致')
            resolve()
            return
          }
          const { confirmPassword: _p, ...other } = addData
          data = {
            ...other,
            password: crypto.encrypt(password)
          }
        }
      }
      resolve()
    })
  })
  if (data && !data.id) {
    const result = await checkedTenant(addData.account)
    if (!result.success) data = false
  }
  return data
}

defineExpose({ getPostData })
</script>
