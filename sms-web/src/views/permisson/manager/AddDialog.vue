<template>
  <el-dialog :title="addData.id ? '编辑用户' : '新增用户'" :close-on-click-modal="false" :visible.sync="dialog.visible" width="900px">
    <basic-form ref="addFormRef" :model="addData" label-width="110px">
      <el-row>
        <el-col :span="12">
          <basic-form-item label="登录账号：" prop="account" validate="required" showOverflowTooltip>
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
              <el-radio-button :label="true">管理用户</el-radio-button>
              <el-radio-button :label="false">普通用户</el-radio-button>
            </el-radio-group>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="用户性别：" prop="sex">
            <el-radio-group v-model="addData.sex">
              <el-radio-button :label="true">男</el-radio-button>
              <el-radio-button :label="false">女</el-radio-button>
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
              <el-option v-for="item in tenantList" :key="item.id" :value="item.id" :label="item.name"></el-option>
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
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click.native="dialog.visible = false">取消</el-button>
      <el-button type="primary" @click.native="addSubmit" :loading="loading">确定</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { IUser } from '@/models/user'
import { ITenant } from '@/models/tenant'
import { createUser, modifyUser } from 'services/system/manager'
import { defineComponent, computed, reactive, ref, toRefs, Ref, onMounted } from '@vue/composition-api'
import { Message } from 'element-ui'
import crypto from 'utils/crypto'
import { getDepart } from 'services/system/depart'
import { IDepart } from '@/models/depart'

interface IAddUserProp {
  // eslint-disable-next-line no-undef
  dialog: Base.IDialog
  tenantList: ITenant[]
}
export default defineComponent({
  props: {
    dialog: {
      type: Object
    },
    tenantList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  setup(props: IAddUserProp, context: any) {
    // 获取部门列表
    const departList: Ref<IDepart[]> = ref([])
    ;(async function () {
      const res = await getDepart({ parentId: 0 })
      if (res.success) {
        departList.value = res.data
      }
    })()
    // 选择租户
    const selectTenant = (tenantId: number) => {
      let departIds = []
      if (tenantId) {
        const item = props.tenantList.find((item) => item.id === tenantId)
        departIds = JSON.parse((item as ITenant).departIds as string)
      }
      state.addData.departIds = departIds
    }
    const { record } = props.dialog
    const addData: IUser & { confirmPassword: string } = record.id ? { ...record, departIds: JSON.parse(record.departIds) } : { sex: true, isManager: true, departIds: [] }
    const state = reactive({
      addData
    })
    const addFormRef = ref(null)
    const loading = ref(false)
    function addSubmit() {
      const http = state.addData.id ? modifyUser : createUser
      const { password, confirmPassword, departIds = [], ...others } = state.addData
      // 代码容错处理
      const { validate } = (addFormRef.value || context.refs.addFormRef) as HTMLFormElement
      validate(async (valid: boolean) => {
        if (valid) {
          if (!others.id && password !== confirmPassword) return Message.error('两次密码输入不一致')
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
            Message({
              message: data.message,
              type: 'success'
            })
            context.emit('getData')
            // eslint-disable-next-line no-undef
            ;(props.dialog as Base.IDialog).visible = false
          }
        }
      })
    }
    const pwdRule = computed(() => context.root.$store.state.app.systemConfig.pwdStrength + ',pswNoSpace' + ',required')
    return {
      ...toRefs(state),
      pwdRule,
      departList,
      loading,
      pickerOptions: {
        disabledDate(time: any) {
          return time.getTime() <= Date.now()
        }
      },
      addFormRef,
      addSubmit,
      selectTenant
    }
  }
})
</script>
