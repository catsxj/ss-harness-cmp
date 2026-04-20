<template>
  <basic-form :model="itemData" ref="form" :disabled="isPreview">
    <el-row>
      <el-alert v-if="module === 'cluster'" class="m-b-sm" type="warning" :closable="false" title="注：支持集群（一主两从一仲裁）安装"></el-alert>
      <el-col :span="12">
        <basic-form-item label="软件版本：" prop="version" validate="required">
          <el-select v-model="itemData.version" placeholder="版本">
            <el-option v-for="(row, index) in versionData" :key="index" :label="row.name" :value="row.value"> </el-option>
          </el-select>
        </basic-form-item>
      </el-col>
    </el-row>
    <basic-form :model="itemData.manage_config" label-width="110px" ref="manage_config" :disabled="isPreview">
      <el-row>
        <!-- <el-col :span="24" v-if="module === 'cluster'">
          <el-col :span="12">
            <basic-form-item label="启用复本：">
              <el-radio-group v-model="isCopy">
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>
            </basic-form-item>
          </el-col>
          <el-col :span="8" v-if="isCopy">
            <basic-form-item label="复本名称：" prop="mongodb_replication_replset" validate="required">
              <el-input class="el_input" v-model="itemData.manage_config.mongodb_replication_replset"></el-input>
            </basic-form-item>
          </el-col>
        </el-col> -->
        <el-col :span="12">
          <basic-form-item label="管理员用户：" prop="mongodb_user_admin_name" validate="required">
            <el-input class="el_input" v-model="itemData.manage_config.mongodb_user_admin_name"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="密码：" prop="mongodb_user_admin_password" validate="required">
            <el-input type="password" class="el_input" v-model="itemData.manage_config.mongodb_user_admin_password" show-password></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="根用户：" prop="mongodb_root_admin_name" validate="required">
            <el-input class="el_input" v-model="itemData.manage_config.mongodb_root_admin_name"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="密码：" prop="mongodb_root_admin_password" validate="required">
            <el-input type="password" class="el_input" v-model="itemData.manage_config.mongodb_root_admin_password" show-password></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="备份用户：" prop="mongodb_root_backup_name" validate="required">
            <el-input class="el_input" v-model="itemData.manage_config.mongodb_root_backup_name"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="密码：" prop="mongodb_root_backup_password" validate="required">
            <el-input type="password" class="el_input" v-model="itemData.manage_config.mongodb_root_backup_password" :disabled="isPreview" show-password></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
    </basic-form>
    <el-row>
      <el-col :span="24" class="line"></el-col>
      <el-col :span="24" class="title"> 创建用户 <el-button class="m-l" type="primary" size="mini" @click="addUserItem(itemData.mongodb_users)">新增</el-button> </el-col>
    </el-row>
    <div v-for="(item, index) in itemData.mongodb_users" :key="index" class="search-container">
      <el-button type="text" class="del_operate" @click="removeItem(itemData.mongodb_users, index)">
        <i class="el-icon-delete" />
      </el-button>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="用户名：" :prop="'mongodb_users.' + index + '.name'" validate="required">
            <el-input v-model="item.name"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="密码：" :prop="'mongodb_users.' + index + '.password'" validate="required">
            <el-input type="password" v-model="item.password" auto-complete="off" :disabled="isPreview" show-password></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="权限：" :prop="'mongodb_users.' + index + '.roles'" validate="required">
            <el-input v-model="item.roles" auto-complete="off" :disabled="isPreview"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="数据库名：" :prop="'mongodb_users.' + index + '.database'" validate="required">
            <el-input v-model="item.database" auto-complete="off" :disabled="isPreview"></el-input>
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
import { encrypt, decrypt } from 'utils/crypto'
export default {
  mixins: [node, show, software],
  props: {
    itemData: {
      type: Object,
      default: function () {
        return {
          mongodb_users: [],
          manage_config: {
            mongodb_user_admin_name: 'siteUserAdmin',
            mongodb_user_admin_password: '',
            mongodb_root_admin_name: 'siteRootAdmin',
            mongodb_root_admin_password: '',
            mongodb_root_backup_name: 'backupuser',
            mongodb_root_backup_password: ''
          }
        }
      }
    },
    module: {
      type: String
    }
  },
  data() {
    return {
      isCopy: false,
      versionData: []
    }
  },
  created() {
    this.getVersion('MONGODB-VERSION')
    handleArrAttribute(['mongodb_users'], this)
    if (this.itemData.manage_config.mongodb_replication_replset) {
      this.isCopy = true
    }
    this.handleCrypto(this.itemData, decrypt)
  },
  methods: {
    getVersion(value) {
      getDictChildren({ value: value }).then((data) => {
        if (data.success) {
          this.versionData = data.data
        }
      })
    },
    // 加密解密处理
    handleCrypto(itemData, fun = encrypt) {
      const { mongodb_users, manage_config } = itemData
      mongodb_users.forEach((item) => {
        item.password = fun(item.password)
      })
      Object.keys(manage_config).forEach((item) => {
        const value = manage_config[item]
        if (item.includes('password') && value) {
          manage_config[item] = fun(value)
        }
      })
    },
    // 新增用户
    addUserItem(data) {
      data.push({
        name: '',
        database: '',
        roles: 'readWrite',
        password: ''
      })
    },
    validateValue() {
      const nameMap = {}
      let flag = true
      for (const item of this.itemData.mongodb_users) {
        if (nameMap[item.name]) {
          this.$message.error(`用户名${item.name}被设置了两次，请检查`)
          flag = false
          break
        }
        nameMap[item.name] = true
      }
      return flag
    },
    getPostData() {
      let data = false
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$refs.manage_config.validate((valid) => {
            if (valid && this.validateValue()) {
              if (this.module !== 'cluster' || !this.isCopy) delete this.itemData.manage_config.mongodb_replication_replset
              const itemData = cloneDeep(this.itemData)
              this.handleCrypto(itemData, encrypt)
              data = itemData
            }
          })
        }
      })
      return data
    }
  }
}
</script>
<style scoped lang="scss">
@import 'index.scss';
</style>
