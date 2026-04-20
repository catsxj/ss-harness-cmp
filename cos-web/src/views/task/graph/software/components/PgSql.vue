<template>
  <basic-form :model="itemData" ref="form" :disabled="isPreview">
    <el-row>
      <el-alert v-if="itemData.cluster_install" class="m-b-sm" type="warning" :closable="false" title="注：支持集群（三节点）安装，另需设置VIP，执行PostgreSQL节点前需执行网络VIP节点"></el-alert>
      <el-col :span="12">
        <basic-form-item label="部署方式：">
          <el-radio-group v-model="itemData.cluster_install" :disabled="isTaskInstance">
            <el-radio :label="false">单点</el-radio>
            <el-radio :label="true">集群</el-radio>
          </el-radio-group>
        </basic-form-item>
      </el-col>
      <el-col :span="12">
        <basic-form-item label="软件版本：" prop="version" validate="required">
          <el-select v-model="itemData.version" placeholder="版本">
            <el-option v-for="(row, index) in versionData" :key="index" :label="row.name" :value="row.value"> </el-option>
          </el-select>
        </basic-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24" class="line"></el-col>
      <el-col :span="24" class="title"> 新增数据库 <el-button v-if="!isPreview" class="m-l" type="primary" size="mini" @click="addDbItem">新增</el-button> </el-col>
    </el-row>
    <div v-for="(item, index) in itemData.postgresql_databases" :key="'db' + index" class="search-container">
      <el-button v-if="!isPreview" type="text" class="del_operate" @click="removeItem(itemData.postgresql_databases, index)">
        <i class="el-icon-delete" />
      </el-button>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="名称：" :prop="'postgresql_databases.' + index + '.name'" validate="required">
            <el-input v-model="item.name"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="编码方式：" prop="encoding">
            <el-input v-model="item.encoding" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="所有者：">
            <el-input v-model="item.owner"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="排序规则：" prop="lc_collate">
            <el-input v-model="item.lc_collate"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="字符集：" prop="lc_ctype">
            <el-input v-model="item.lc_ctype"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
    </div>
    <el-row>
      <el-col :span="24" class="line"></el-col>
      <el-col :span="24" class="title"> 创建用户 <el-button v-if="!isPreview" class="m-l" type="primary" size="mini" @click="addUserItem">新增</el-button> </el-col>
    </el-row>
    <div v-for="(item, index) in itemData.postgresql_users" :key="`u${index}`" class="search-container">
      <el-button v-if="!isPreview" type="text" class="del_operate" @click="removeItem(itemData.postgresql_users, index)">
        <i class="el-icon-delete" />
      </el-button>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="用户名：" :prop="'postgresql_users.' + index + '.name'" validate="required">
            <el-input v-model="item.name" auto-complete="off" :disabled="isPreview"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="密码：" :prop="'postgresql_users.' + index + '.pass'" validate="required">
            <el-input type="password" v-model="item.pass" auto-complete="off" :disabled="isPreview" show-password></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
    </div>
    <el-row>
      <el-col :span="24" class="line"></el-col>
      <el-col :span="24" class="title"> 权限设置 <el-button v-if="!isPreview" class="m-l" type="primary" size="mini" @click="addAuth()">新增</el-button> </el-col>
    </el-row>
    <div v-for="(item, index) in itemData.postgresql_privileges" :key="index" class="search-container">
      <el-button v-if="!isPreview" type="text" class="del_operate" @click="removeItem(itemData.postgresql_privileges, index)">
        <i class="el-icon-delete" />
      </el-button>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="用户名称：" :prop="'postgresql_privileges.' + index + '.name'" validate="required">
            <el-input v-model="item.name" auto-complete="off" :disabled="isPreview"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="数据库：" :prop="'postgresql_privileges.' + index + '.db'" validate="required">
            <el-input v-model="item.db" auto-complete="off" :disabled="isPreview"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="权限：" :prop="'postgresql_privileges.' + index + '.priv'" validate="required">
            <el-input v-model="item.priv" auto-complete="off" :disabled="isPreview"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="角色属性：" :prop="'postgresql_privileges.' + index + '.role_attr_flags'" validate="required" :rules="roleRules">
            <el-input v-model.trim="item.role_attr_flags" auto-complete="off" placeholder="权限之前以逗号隔开"></el-input>
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
import { handleArrAttribute } from '../tools.js'
import { getDictChildren } from 'services/system/dictionary'
import { encrypt, decrypt } from 'utils/crypto'
export default {
  mixins: [node, show],
  props: {
    module: {
      type: String
    },
    itemData: {
      type: Object,
      default: function () {
        return {
          cluster_install: false,
          version: '',
          postgresql_databases: [],
          postgresql_users: [],
          postgresql_privileges: []
        }
      }
    }
  },
  data() {
    return {
      versionData: [],
      roleRules: [
        {
          pattern: /^[^ ]*$/,
          message: '请不要输入空格'
        }
      ]
    }
  },
  created() {
    this.getVersion()
    handleArrAttribute(['postgresql_databases', 'postgresql_users', 'postgresql_privileges'], this)
    this.handleCrypto(this.itemData, decrypt)
  },
  methods: {
    // 加密解密处理
    handleCrypto(itemData, fun = encrypt) {
      const { postgresql_users } = itemData
      postgresql_users.forEach((item) => {
        if (item.pass) {
          item.pass = fun(item.pass)
        }
      })
    },
    getVersion() {
      getDictChildren({
        value: 'POSTGRESQL-VERSION'
      }).then((data) => {
        if (data.success) {
          this.versionData = data.data
        }
      })
    },
    // 新增数据库
    addDbItem() {
      this.itemData.postgresql_databases.push({
        name: '',
        owner: '',
        encoding: 'UTF-8',
        lc_collate: 'en_US.UTF-8',
        lc_ctype: 'en_US.UTF-8'
      })
    },
    // 新增用户
    addUserItem() {
      this.itemData.postgresql_users.push({})
    },
    // 新增权限
    addAuth() {
      this.itemData.postgresql_privileges.push({})
    },
    removeItem(data, index, required) {
      if (required && data.length === 1) {
        this.$message.error('至少存在一个该节点')
        return
      }
      data.splice(index, 1)
    },
    handlePostData() {
      const itemData = cloneDeep(this.itemData)
      this.handleCrypto(itemData, encrypt)
      return itemData
    },
    getPostData() {
      let data = false
      this.$refs.form.validate((valid) => {
        if (valid) {
          data = this.handlePostData()
        }
      })
      return data
    }
  }
}
</script>
<style lang="scss" scoped>
@import './index.scss';
</style>
