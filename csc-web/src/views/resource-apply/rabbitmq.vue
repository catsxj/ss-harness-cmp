/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <software-install ref="softRef" service="cms.rabbitmq" version-key="RABBITMQ-VERSION" :configs="configs" :get-params="getParams" :item-data="itemData" v-bind="$attrs" @showData="handleShowData">
    <basic-form :model="manage_config" ref="addForm" label-position="left">
      <basic-form-item label="管理用户：" validate="required" prop="username">
        <el-input class="w" v-model="manage_config.username" placeholder="请输入管理用户"></el-input>
      </basic-form-item>
      <basic-form-item label="管理密码：" validate="required,datebasePasswords" prop="password">
        <el-input class="w" v-model="manage_config.password" placeholder="请输入密码" show-password></el-input>
      </basic-form-item>
      <basic-form-item label="确认密码：" validate="required,datebasePasswords" prop="confirm_password">
        <el-input class="w" v-model="manage_config.confirm_password" placeholder="请确认密码" show-password></el-input>
      </basic-form-item>
    </basic-form>
  </software-install>
</template>

<script>
import SoftwareInstall from './components/SoftwareInstall.vue'
import crypto from 'utils/crypto'

export default {
  components: { SoftwareInstall },
  props: {
    itemData: {
      type: Object
    }
  },
  data() {
    return {
      configs: {},
      manage_config: {
        password: '',
        username: '',
        confirm_password: ''
      }
    }
  },
  methods: {
    getApplyData() {
      return this.$refs.softRef.getPostData()
    },
    handleShowData(configs) {
      const {
        manage_config: { username, password }
      } = configs
      const p = crypto.decrypt(password)
      this.manage_config = {
        username,
        password: p,
        confirm_password: p
      }
    },
    // 数据校验+返回参数
    getParams() {
      let data = false
      this.$refs.addForm.validate(valid => {
        if (valid) {
          const { password, confirm_password, username } = this.manage_config
          if (password !== confirm_password) {
            this.$message.error('两次密码输入不一致')
            return false
          }
          data = {
            manage_config: { password: crypto.encrypt(password), username }
          }
        }
      })
      return data
    }
  }
}
</script>
