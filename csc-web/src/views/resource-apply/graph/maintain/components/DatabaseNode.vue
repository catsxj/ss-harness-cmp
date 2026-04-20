<template>
  <basic-form ref="form" :model="itemData" :disabled="isPreview" label-width="110px">
    <el-row :gutter="10">
      <el-col :span="12">
        <basic-form-item label="数据库路径：" prop="jdbcUrl" validate="required">
          <el-input v-model="itemData.jdbcUrl" placeholder="192.168.2.216:3306/bsm"></el-input>
        </basic-form-item>
      </el-col>
      <el-col :span="12">
        <basic-form-item label="数据库类型：" prop="database" validate="required">
          <el-select filterable v-model="itemData.database" placeholder="请选择">
            <el-option v-for="item in dbListData" :key="item.value" :label="item.name" :value="item.name"> </el-option>
          </el-select>
        </basic-form-item>
      </el-col>
      <el-col :span="12">
        <basic-form-item label="账号：" prop="username" validate="required" required-message="请输入账号">
          <el-input v-model="itemData.username"></el-input>
        </basic-form-item>
      </el-col>
      <el-col :span="12">
        <basic-form-item label="密码：" prop="password" validate="required" required-message="请输入密码">
          <el-input v-model="itemData.password" show-password></el-input>
        </basic-form-item>
      </el-col>
    </el-row>
    <select-script-item :script-item="itemData"><span v-if="isPreview || isTaskInstance"></span> </select-script-item>
  </basic-form>
</template>
<script>
import { cloneDeep } from 'lodash-es'
import node from '../../mixins/index'
import show from '../../mixins/show'
import SelectScriptItem from '../SelectScript.vue'
import { getDictChildren } from 'services/system/dictionary'
import { encrypt, decrypt } from 'utils/crypto'
export default {
  mixins: [node, show],
  props: {
    itemData: {
      type: Object,
      default: function () {
        return {
          jdbcUrl: '',
          category: 'SQL',
          database: '',
          content: '',
          scriptId: '',
          groupId: [],
          username: '',
          password: ''
        }
      }
    }
  },
  components: {
    SelectScriptItem
  },
  data() {
    return {
      dbListData: [],
      dbData: {}
    }
  },
  created() {
    this.getDbList()
    this.handleCrypto(this.itemData, decrypt)
  },
  methods: {
    // 加密解密处理
    handleCrypto(itemData, fun = encrypt) {
      const { password } = itemData
      if (password) {
        itemData.password = fun(password)
      }
    },
    getDbList() {
      getDictChildren({ value: 'DATABASE_DRIVER_CATEGORY' }).then((data) => {
        if (data.success) {
          this.dbListData = data.data
        }
      })
    },
    getPostData() {
      let data = false
      this.$refs.form.validate((valid) => {
        if (valid) {
          const itemData = cloneDeep(this.itemData)
          this.handleCrypto(itemData, encrypt)
          data = itemData
        }
      })
      return data
    }
  }
}
</script>
<style></style>
