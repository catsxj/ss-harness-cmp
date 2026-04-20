/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <software-install ref="softRef" service="kvs.mongodb" version-key="MONGODB-VERSION" :configs="configs" :get-params="getParams" :item-data="itemData" v-bind="$attrs" @showData="handleShowData">
    <basic-form :model="manage_config" ref="addForm" label-position="left">
      <basic-form-item label="管理用户：" validate="required" prop="mongodb_root_admin_name">
        <el-input class="w" v-model="manage_config.mongodb_root_admin_name" placeholder="请输入管理用户"></el-input>
      </basic-form-item>
      <basic-form-item label="管理密码：" validate="required,datebasePasswords" prop="mongodb_root_admin_password">
        <el-input class="w" v-model="manage_config.mongodb_root_admin_password" placeholder="请输入密码" show-password></el-input>
      </basic-form-item>
      <basic-form-item label="确认密码：" validate="required,datebasePasswords" prop="confirm_password">
        <el-input class="w" v-model="manage_config.confirm_password" placeholder="请确认密码" show-password></el-input>
      </basic-form-item>
    </basic-form>
  </software-install>
</template>

<script>
import SoftwareInstall from './components/SoftwareInstall.vue'
import software_config from './data/mongodb'
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
      configs: {
        software_config
      },
      manage_config: {
        mongodb_root_admin_password: '',
        mongodb_root_admin_name: '',
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
        manage_config: { mongodb_root_admin_password, mongodb_root_admin_name }
      } = configs
      const p = crypto.decrypt(mongodb_root_admin_password)
      this.manage_config = {
        mongodb_root_admin_name,
        mongodb_root_admin_password: p,
        confirm_password: p
      }
    },
    // 数据校验+返回参数
    getParams() {
      let data = false
      this.$refs.addForm.validate(valid => {
        if (valid) {
          const { mongodb_root_admin_password, confirm_password, mongodb_root_admin_name } = this.manage_config
          if (mongodb_root_admin_password !== confirm_password) {
            this.$message.error('两次密码输入不一致')
            return false
          }
          data = {
            manage_config: { mongodb_root_admin_password: crypto.encrypt(mongodb_root_admin_password), mongodb_root_admin_name }
          }
        }
      })
      return data
    }
  }
}
</script>
