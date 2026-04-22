<template>
  <basic-form :model="itemData" ref="form">
    <el-row>
      <el-col :span="12">
        <basic-form-item label="软件版本：" prop="version" validate="required">
          <el-select v-model="itemData.version" placeholder="版本" :disabled="isPreview">
            <el-option v-for="(row,index) in versionData" :key="index" :label="row.name" :value="row.value">
            </el-option>
          </el-select>
        </basic-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24" class="line"></el-col>
      <el-col :span="24" class="title">
        创建管理用户
        <el-button class="m-l" v-if="!isPreview" type="primary" size="mini" @click="addItem(itemData.activemq_admin_user)">新增</el-button>
      </el-col>
    </el-row>
    <div v-for="(item, index) in itemData.activemq_admin_user" :key="index" class="search-container">
      <el-button type="text" class="del_operate" @click="removeItem(itemData.activemq_admin_user, index)">
        <i class="el-icon-delete"></i>
      </el-button>
      <el-row :gutter="20">
        <el-col :span="12">
          <basic-form-item label="管理用户：" :prop="'activemq_admin_user.'+index+'.username'" validate="required">
            <el-input v-model="item.username"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="管理密码：" prop="password">
            <el-input type="password" v-model="item.password" show-password></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
    </div>
  </basic-form>
</template>
<script>
import { cloneDeep } from 'lodash-es'
import node from '../../mixins/index'
import show from '../../mixins/show'
import software from '../mixins/itemOperate'
import { handleArrAttribute } from '../tools.js'
import { getDictChildren } from 'services/system/dictionary'
import { encrypt, decrypt } from 'utils/crypto';
export default {
  mixins: [node, show, software],
  props: {
    itemData: {
      type: Object,
      default: function() {
        return {
          activemq_admin_user: []
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
    handleArrAttribute(['activemq_admin_user'], this)
    this.handleCrypto(this.itemData, decrypt)
  },
  methods: {
    // 加密解密处理
    handleCrypto(itemData, fun = encrypt) {
      const { activemq_admin_user } = itemData;
      activemq_admin_user.forEach(item => {
        if (item.password) {
          item.password = fun(item.password)
        }
      })
    },
    getVersion() {
      getDictChildren({ value: 'ACTIVEMQ-VERSION' }).then(data => {
        if (data.success) {
          this.versionData = data.data
        }
      })
    },
    getPostData () {
      let data = false;
      this.$refs.form.validate(valid => {
        if (valid) {
          const itemData = cloneDeep(this.itemData);
          this.handleCrypto(itemData, encrypt)
          data = itemData
        }
      });
      return data;
    }
  }
}
</script>
<style scoped lang="scss">
@import 'index';
</style>
