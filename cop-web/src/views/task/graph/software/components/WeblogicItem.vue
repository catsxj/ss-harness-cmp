<template>
  <basic-form :model="itemData" ref="form" :disabled="isPreview">
    <el-row>
      <el-col :span="12">
        <basic-form-item label="版本：" prop="version" validate="required">
          <el-select v-model="itemData.version" placeholder="版本">
            <el-option v-for="(row,index) in versionData" :key="index" :label="row.name" :value="row.value">
            </el-option>
          </el-select>
        </basic-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="12">
        <basic-form-item label="管理用户：" prop="manage_config.admin_user" validate="required">
          <el-input v-model="itemData.manage_config.admin_user"></el-input>
        </basic-form-item>
      </el-col>
      <el-col :span="12">
        <basic-form-item label="管理密码：" prop="manage_config.admin_password" validate="required,datebasePassword">
          <el-input type="password" v-model="itemData.manage_config.admin_password" placeholder="密码设置" show-password></el-input>
        </basic-form-item>
      </el-col>
    </el-row>
  </basic-form>
</template>
<script>
import node from '../../mixins/index'
import show from '../../mixins/show'
import { getDictChildren } from 'services/system/dictionary'
import { encrypt, decrypt } from 'utils/crypto'
import { cloneDeep } from 'lodash-es'
export default {
  mixins: [node, show],
  props: {
    itemData: {
      type: Object,
      default: function () {
        return {
          manage_config: {
            admin_password: '',
            admin_user: ''
          }
        }
      }
    }
  },
  data() {
    return {
      versionData: []
    }
  },
  created() {
    this.getVersion()
    const {
      manage_config: { admin_password }
    } = this.itemData
    if (admin_password) {
      this.itemData.manage_config.admin_password = decrypt(admin_password)
    }
  },
  methods: {
    getVersion() {
      getDictChildren({ value: 'WEBLOGIC-VERSION' }).then((data) => {
        if (data.success) {
          this.versionData = data.data
        }
      })
    },
    getPostData() {
      let data = false
      this.$refs.form.validate((valid) => {
        if (valid) {
          const itemData = cloneDeep(this.itemData)
          const {
            manage_config: { admin_password }
          } = itemData
          if (admin_password) {
            itemData.manage_config.admin_password = encrypt(admin_password)
          }
          data = itemData
        }
      })
      return data
    }
  }
}
</script>
<style>
</style>
