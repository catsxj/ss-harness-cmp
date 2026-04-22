<template>
  <el-dialog :title="addData.id ? '编辑用户' : '新增用户'" :close-on-click-modal="false" v-model="props.dialog.visible" width="900px">
    <!-- TODO: cmp-element basic-form -->
    <basic-form ref="addFormRef" :model="addData" label-width="110px">
      <el-row>
        <el-col :span="12">
          <basic-form-item label="登录账号：" prop="account" validate="required" show-overflow-tooltip>
            <el-input :disabled="!!addData.id" v-model="addData.account" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="用户姓名：" prop="name" validate="required">
            <el-input v-model="addData.name" autocomplete="off"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="用户类型：" prop="isManager" validate="required">
            <el-radio-group v-model="addData.isManager">
              <el-radio-button :value="true">管理用户</el-radio-button>
              <el-radio-button :value="false">普通用户</el-radio-button>
            </el-radio-group>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="用户性别：" prop="sex">
            <el-radio-group v-model="addData.sex">
              <el-radio-button :value="true">男</el-radio-button>
              <el-radio-button :value="false">女</el-radio-button>
            </el-radio-group>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row v-if="!addData.id">
        <el-col :span="12">
          <basic-form-item label="登录密码：" prop="password" :validate="pwdRule">
            <el-input v-model="addData.password" autocomplete="new-password" show-password></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="确认密码：" prop="confirmPassword" validate="required">
            <el-input v-model="addData.confirmPassword" auto-complete="off" show-password></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="电子邮箱：" prop="email">
            <el-input v-model="addData.email" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="联系方式：" prop="mobile" validate="required,mobile">
            <el-input v-model="addData.mobile" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="钉钉账号：">
            <el-input v-model="addData.dingtalk" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="微信账号：">
            <el-input v-model="addData.wechat" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="公司名称：" prop="company">
            <el-input v-model="addData.company" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="用户工号：" prop="jobNumber">
            <el-input v-model="addData.jobNumber" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="所属租户：" prop="tenantId">
            <el-select v-model="addData.tenantId" filterable clearable @change="selectTenant">
              <el-option v-for="item in props.tenantList" :key="item.id" :value="item.id" :label="item.name"></el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="组织机构：">
            <el-cascader :disabled="!!addData.tenantId" v-model="addData.departIds" :props="{ label: 'name', value: 'id', checkStrictly: true }" :options="departList" clearable filterable></el-cascader>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <basic-form-item label="用户描述：" prop="remark">
            <el-input type="textarea" v-model="addData.remark" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
    </basic-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="props.dialog.visible = false">取消</el-button>
        <el-button type="primary" @click="addSubmit" :loading="loading">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { IUser } from '@/models/user'
import type { ITenant } from '@/models/tenant'
import type { IDepart } from '@/models/depart'
import { createUser, modifyUser } from 'services/system/manager'
import crypto from 'utils/crypto'
import { getDepart } from 'services/system/depart'
import { useAppStore } from '@/stores'

interface DialogItem {
  visible: boolean
  record: any
}

const props = defineProps<{
  dialog: DialogItem
  tenantList: ITenant[]
}>()
const emit = defineEmits<{ getData: [] }>()

const appStore = useAppStore()

const departList = ref<IDepart[]>([])
;(async function () {
  const res = await getDepart({ parentId: 0 })
  if (res.success) {
    departList.value = res.data
  }
})()

const { record } = props.dialog
const initial: any = record.id
  ? { ...record, departIds: JSON.parse(record.departIds) }
  : { sex: true, isManager: true, departIds: [] }
const addData = reactive<IUser & { confirmPassword?: string }>(initial)
const addFormRef = ref<any>(null)
const loading = ref(false)

function selectTenant(tenantId: number) {
  let departIds: number[] = []
  if (tenantId) {
    const item = props.tenantList.find((i) => i.id === tenantId)
    departIds = JSON.parse((item as ITenant).departIds as string)
  }
  addData.departIds = departIds as any
}

function addSubmit() {
  const http = addData.id ? modifyUser : createUser
  const { password, confirmPassword, departIds = [], ...others } = addData as any
  addFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      if (!others.id && password !== confirmPassword) {
        ElMessage.error('两次密码输入不一致')
        return
      }
      const params: IUser = {
        ...others,
        departIds,
        departId: [...(departIds || [])].pop(),
        password
      }
      if (!others.id) {
        params.password = crypto.encrypt(password)
      }
      loading.value = true
      const data = await http(params)
      loading.value = false
      if (data.success) {
        ElMessage.success(data.message)
        emit('getData')
        props.dialog.visible = false
      }
    }
  })
}

const pwdRule = computed(() => (appStore.systemConfig as any).pwdStrength + ',pswNoSpace' + ',required')

// 日期 picker 相关（原代码保留）
const pickerOptions = {
  disabledDate(time: Date) {
    return time.getTime() <= Date.now()
  }
}
</script>
