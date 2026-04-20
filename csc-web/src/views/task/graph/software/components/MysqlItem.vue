<template>
  <basic-form :model="itemData" ref="form" :disabled="isPreview">
    <el-alert v-if="module === 'cluster'" class="m-b-sm" type="warning" :closable="false" title="注：主备、MHA和MGR单主集群安装时，需设置VIP，执行MySQL节点前需执行网络VIP节点，MGR多主安装时主机数量必须为：3、5、7"></el-alert>
    <el-row>
      <el-col :span="12">
        <basic-form-item label="软件版本：" prop="version" validate="required">
          <el-select v-model="itemData.version" placeholder="版本">
            <el-option v-for="(row, index) in versionData" :key="index" :label="row.name" :value="row.value"> </el-option>
          </el-select>
        </basic-form-item>
      </el-col>
      <el-col :span="12" v-if="module === 'cluster'">
        <basic-form-item label="集群模式：" prop="cluster_type" validate="required">
          <el-select v-model="itemData.cluster_type" @change="handleTargetServer" :disabled="isTaskInstance">
            <el-option v-for="item in clusterTypeList" :key="item.value" :label="item.name" :value="item.value"> </el-option>
          </el-select>
        </basic-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24" class="line"></el-col>
      <el-col :span="24" class="title"> 新增数据库 <el-button v-if="!isPreview" class="m-l" type="primary" size="mini" @click="addDbItem">新增</el-button> </el-col>
    </el-row>
    <div v-for="(item, index) in itemData.mysql_databases" :key="'db' + index" class="search-container">
      <el-button v-if="!isPreview" type="text" class="del_operate" @click="removeItem(itemData.mysql_databases, index)">
        <i class="el-icon-delete" />
      </el-button>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="名称：" :prop="'mysql_databases.' + index + '.name'" validate="required">
            <el-input v-model="item.name"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="字符集：" prop="encoding">
            <el-input v-model="item.encoding" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="排序规则：" prop="collation">
            <el-input v-model="item.collation"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="副本数：" prop="replicate">
            <el-input v-model="item.replicate" type="number"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
    </div>
    <el-row>
      <el-col :span="24" class="line"></el-col>
      <el-col :span="24" class="title"> 创建用户 <el-button v-if="!isPreview" class="m-l" type="primary" size="mini" @click="addUserItem">新增</el-button> </el-col>
    </el-row>
    <div v-for="(item, index) in itemData.mysql_users" :key="index" class="search-container">
      <el-button v-if="!isPreview" type="text" class="del_operate" @click="removeItem(itemData.mysql_users, index)">
        <i class="el-icon-delete" />
      </el-button>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="用户名：" :prop="'mysql_users.' + index + '.name'" validate="required">
            <el-input v-model="item.name" auto-complete="off" :disabled="isPreview"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="主机：" prop="host">
            <el-input v-model="item.host" auto-complete="off" :disabled="isPreview"></el-input>
            <span class="tip">主机一次仅支持设置单个</span>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="密码：" :prop="'mysql_users.' + index + '.password'" validate="datebasePassword">
            <el-input v-model="item.password" auto-complete="off" :disabled="isPreview" show-password></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="权限：" :prop="'mysql_users.' + index + '.priv'" validate="required" maxlength="128">
            <el-input v-model="item.priv"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row v-if="module === 'cluster'">
        <el-col :span="12">
          <basic-form-item>
            <el-checkbox v-model="item.isReUser" @change="changeReUser(item)"> 是否是复制用户 </el-checkbox>
          </basic-form-item>
        </el-col>
      </el-row>
    </div>
  </basic-form>
</template>
<script>
import { encrypt, decrypt } from 'utils/crypto'
import node from '../../mixins/index'
import show from '../../mixins/show'
import { handleArrAttribute } from '../tools.js'
import { getDictChildren } from 'services/system/dictionary'
import { clusterTypeList } from '../data'
export default {
  mixins: [node, show],
  props: {
    module: {
      type: String
    },
    itemData: {
      type: Object,
      default: function () {
        return {}
      }
    },
    specialConfig: {
      type: Object
    }
  },
  data() {
    return {
      versionData: [],
      clusterTypeList
    }
  },
  created() {
    handleArrAttribute(['mysql_databases', 'mysql_users'], this)
    this.getVersion()
    const { mysql_replication_user: { name } = {}, cluster_type } = this.itemData
    this.itemData.mysql_users.forEach(item => {
      const { password } = item
      if (password) {
        item.password = decrypt(password)
      }
      if (item.name === name) {
        this.$set(item, 'isReUser', true)
      }
    })
    if (cluster_type) {
      this.handleTargetServer(cluster_type)
    }
  },
  watch: {
    module() {
      if (this.module === 'standalone') {
        this.itemData.mysql_users.forEach(item => {
          item.isReUser = false
          item.priv = '*.*:USAGE'
        })
      }
    }
  },
  methods: {
    // 目标机器显示处理
    handleTargetServer(value) {
      if (value === 'mgr.multi') {
        this.specialConfig.showTarget = true
      } else {
        this.specialConfig.showTarget = false
      }
    },
    getVersion() {
      getDictChildren({ value: 'MYSQL-VERSION' }).then(data => {
        if (data.success) {
          this.versionData = data.data
        }
      })
    },
    // 新增数据库
    addDbItem() {
      this.itemData.mysql_databases.push({
        name: '',
        encoding: 'utf8',
        collation: 'utf8_general_ci',
        replicate: 1
      })
    },
    // 新增用户
    addUserItem() {
      this.itemData.mysql_users.push({
        name: '',
        host: '%',
        priv: '*.*:USAGE',
        password: '',
        isReUser: false
      })
    },
    removeItem(data, index, required) {
      if (required && data.length === 1) {
        this.$message.error('至少存在一个该节点')
        return
      }
      data.splice(index, 1)
    },
    changeReUser(item) {
      if (item.isReUser) {
        item.priv = '*.*:REPLICATION SLAVE,REPLICATION CLIENT'
      } else {
        item.priv = '*.*:USAGE'
      }
    },
    handlePostData() {
      const { mysql_users: users, mysql_databases, version, cluster_type } = this.itemData
      const mysql_users = []
      let mysql_replication_user = {}
      if (this.module === 'cluster' && !users.length) {
        this.$message.error('集群部署模式下要求必须新增用户')
        return false
      }
      // 是否是复制用户数据组合
      let count = 0
      let reFlag = true
      for (const a of users) {
        const { name, host, priv, password: p } = a
        const password = encrypt(p)
        if (name === 'root') {
          this.$message.error('不能使用root用户')
          reFlag = false
          return false
        }
        if (a.isReUser && this.module === 'cluster') {
          ++count
          if (count > 1) {
            this.$message({
              message: '只允许增加一个复制用户',
              type: 'error'
            })
            reFlag = false
            return false
          }
          mysql_replication_user = { name, host, password }
        }
        mysql_users.push({ name, host, priv, password })
      }
      if (!reFlag) return false
      if (count === 0 && this.module === 'cluster') {
        this.$message.error('集群部署模式下要求必须存在复制用户')
        return false
      }
      const returnData = { mysql_databases, mysql_users, version, cluster_type }
      if (mysql_replication_user.name) {
        returnData.mysql_replication_user = mysql_replication_user
      }
      return returnData
    },
    getPostData() {
      let data = false
      this.$refs.form.validate(valid => {
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
