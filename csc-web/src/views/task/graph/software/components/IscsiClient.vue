<template>
  <basic-form :model="itemData" ref="form" :disabled="isPreview">
    <el-row>
      <el-alert class="m-b-sm" type="warning" :closable="false" title="注：只能选择两个主机，注意【IQN名称】保持与服务端一致"></el-alert>
      <el-col :span="12">
        <basic-form-item label="IQN名称：" prop="iscsi_config.iqn_name" validate="required">
          <el-input v-model="itemData.iscsi_config.iqn_name"></el-input>
        </basic-form-item>
      </el-col>
      <el-col :span="12">
        <basic-form-item label="服务地址：" prop="iscsi_config.server_host" validate="required,ip">
          <el-input v-model="itemData.iscsi_config.server_host"></el-input>
        </basic-form-item>
      </el-col>
      <el-col :span="12">
        <basic-form-item label="用户：" prop="iscsi_config.iscsi_username" validate="required">
          <el-input v-model="itemData.iscsi_config.iscsi_username"></el-input>
        </basic-form-item>
      </el-col>
      <el-col :span="12">
        <basic-form-item label="密码：" prop="iscsi_config.iscsi_password" validate="required">
          <el-input type="password" v-model="itemData.iscsi_config.iscsi_password" placeholder="密码设置" show-password></el-input>
        </basic-form-item>
      </el-col>
    </el-row>
  </basic-form>
</template>
<script>
import { cloneDeep } from 'lodash-es'
import node from '../../mixins/index'
import show from '../../mixins/show'
import { encrypt, decrypt } from 'utils/crypto'
export default {
  mixins: [node, show],
  props: {
    itemData: {
      type: Object,
      default: function () {
        return {
          iscsi_config: {
            server_host: '',
            iqn_name: '',
            iscsi_username: '',
            iscsi_password: ''
          }
        }
      }
    }
  },
  data() {
    return {}
  },
  created() {
    const {
      iscsi_config: { iscsi_password }
    } = this.itemData
    if (iscsi_password) {
      this.itemData.iscsi_config.iscsi_password = decrypt(iscsi_password)
    }
  },
  methods: {
    getPostData() {
      let data = false
      this.$refs.form.validate(valid => {
        if (valid) {
          const itemData = cloneDeep(this.itemData)
          const {
            iscsi_config: { iscsi_password }
          } = itemData
          if (iscsi_password) {
            itemData.iscsi_config.iscsi_password = encrypt(iscsi_password)
          }
          data = itemData
        }
      })
      return data
    }
  }
}
</script>
<style></style>
