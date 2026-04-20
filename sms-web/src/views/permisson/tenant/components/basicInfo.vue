/** * Created by HaijunZhang on 2019/8/30. */
<template>
  <basic-form :model="addData" ref="addData" label-width="120px" width="100%">
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

<script>
import crypto from 'utils/crypto'
import { checkedTenant } from 'services/system/tenant'
import { getDepart } from 'services/system/depart'

export default {
  props: {
    infoData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      addData: {
        discount: '1.00'
      },
      userList: [],
      provinceList: [],
      townList: [],
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() <= Date.now()
        }
      },
      departmentList: [],
      departProps: {
        value: 'id',
        label: 'name',
        checkStrictly: true
      }
    }
  },
  computed: {
    pwdRule() {
      return this.$store.state.app.systemConfig.pwdStrength + ',pswNoSpace'
    }
  },
  created() {
    this.getDepartList()
    if (this.infoData.departIds && this.infoData.departIds.length) {
      this.infoData.departIds = JSON.parse(this.infoData.departIds)
    }
    this.addData = Object.assign({}, this.addData, this.infoData)
  },
  methods: {
    async getDepartList() {
      const res = await getDepart({ parentId: 0 })
      if (res.success) {
        this.departmentList = res.data
      }
    },
    async checkedAccount() {
      const reg = /^[a-zA-Z0-9]*$/
      if (!reg.test(this.addData.account)) return
      const res = await checkedTenant(this.addData.account)
    },
    async getPostData() {
      let data = false
      this.$refs.addData.validate((valid) => {
        if (valid) {
          const { password, confirmPassword, id, departIds } = this.addData
          if (departIds && departIds.length) {
            this.addData.departId = this.addData.departIds[this.addData.departIds.length - 1]
          } else if (departIds && !departIds.length) {
            this.addData.departId = null
          }
          if (id) {
            data = this.addData
          } else {
            if (password !== confirmPassword) return this.$message.error('两次密码输入不一致')
            const { confirmPassword: p, ...other } = this.addData
            data = {
              ...other,
              password: crypto.encrypt(password)
            }
          }
        }
      })
      if (data && !data.id) {
        // 数据校验通过且创建界面 检查租户账号是否存在
        const result = await checkedTenant(this.addData.account)
        if (!result.success) {
          data = false
        }
      }
      return data
    }
  }
}
</script>

<style scoped></style>
