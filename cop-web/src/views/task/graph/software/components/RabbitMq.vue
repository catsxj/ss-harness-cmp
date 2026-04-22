<template>
  <basic-form :model="itemData" ref="form" :disabled="isPreview">
    <el-row>
      <el-alert  v-if="itemData.cluster_install" class="m-b-sm" type="warning" :closable="false"  title="注：支持集群（三节点）安装"></el-alert>
      <el-col :span="12">
        <basic-form-item label="部署方式：">
          <el-radio-group v-model="itemData.cluster_install" :disabled="isTaskInstance">
            <el-radio :label="false" :disabled="isPreview">单点</el-radio>
            <el-radio :label="true" :disabled="isPreview">集群</el-radio>
          </el-radio-group>
        </basic-form-item>
      </el-col>
      <el-col :span="12">
        <basic-form-item label="软件版本：" prop="version" validate="required">
          <el-select v-model="itemData.version" placeholder="版本">
            <el-option v-for="(row,index) in versionData" :key="index" :label="row.name" :value="row.value">
            </el-option>
          </el-select>
        </basic-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24" class="line"></el-col>
      <el-col :span="24" class="title">
        创建用户
        <el-button v-if="!isPreview" class="m-l" type="primary" size="mini" @click="addUser(itemData.rabbitmq_users)">新增</el-button>
      </el-col>
    </el-row>
    <div v-for="(item, index) in itemData.rabbitmq_users" :key="index" class="search-container">
      <el-button type="text" v-if="!isPreview" class="del_operate" @click="removeItem(itemData.rabbitmq_users, index, 'required')">
        <i class="el-icon-delete" />
      </el-button>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="用户：" :prop="'rabbitmq_users.'+index+'.user'"
                         validate="required">
            <el-input v-model="item.user"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="密码：" :prop="'rabbitmq_users.'+index+'.password'"
                         validate="required" required-message="请输入密码">
            <el-input type="password" v-model="item.password"  show-password></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="标签：" prop="tags">
            <el-input v-model="item.tags" auto-complete="off" :disabled="isPreview"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="配置权限：" prop="configure_priv">
            <el-input v-model="item.configure_priv" auto-complete="off" :disabled="isPreview"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="读权限：" prop="read_priv">
            <el-input v-model="item.read_priv" auto-complete="off" :disabled="isPreview"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="写权限：" prop="write_priv">
            <el-input v-model="item.write_priv" auto-complete="off" :disabled="isPreview"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="vhost：" prop="vhost">
            <el-input v-model="item.vhost"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
    </div>
    <el-row>
      <el-col :span="24" class="line"></el-col>
      <el-col :span="24" class="title">
        配置虚拟机
        <el-button v-if="!isPreview" class="m-l" type="primary" size="mini" @click="addVhosts(itemData.rabbitmq_vhosts)">新增</el-button>
      </el-col>
    </el-row>
    <div v-for="(item, index) in itemData.rabbitmq_vhosts" :key="'v' + index" class="search-container">
      <el-button type="text" v-if="!isPreview" class="del_operate" @click="removeItem(itemData.rabbitmq_vhosts, index)">
        <i class="el-icon-delete" />
      </el-button>
      <el-row :gutter="20">
        <el-col :span="12">
          <basic-form-item label="名称：" :prop="'rabbitmq_vhosts.'+index+'.name'"
                         validate="required">
            <el-input v-model="item.name"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="节点：" prop="node">
            <el-input v-model="item.node"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="跟踪：">
            <el-select class="search-item" v-model="item.tracing" :disabled="isPreview">
              <el-option v-for="item in yesData" :key="item.value" :label="item.name" :value="item.value">
              </el-option>
            </el-select>
          </basic-form-item>
        </el-col>
      </el-row>
    </div>
    <el-row>
      <el-col :span="24" class="line"></el-col>
      <el-col :span="24" class="title">
        插件安装
        <el-button v-if="!isPreview" class="m-l" type="primary" size="mini" @click="addItem(itemData.rabbitmq_plugins)">新增</el-button>
      </el-col>
    </el-row>
    <div v-for="(item, index) in itemData.rabbitmq_plugins" :key="'p' + index" class="search-container">
      <el-button v-if="!isPreview" type="text" class="del_operate" @click="removeItem(itemData.rabbitmq_plugins, index)">
        <i class="el-icon-delete" />
      </el-button>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="名称：" :prop="'rabbitmq_plugins.'+index+'.name'"
                         validate="required">
            <el-input v-model="item.name"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="URL地址：">
            <el-input v-model="item.url"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
    </div>
  </basic-form>
</template>
<script>
import { cloneDeep } from 'lodash-es'
import node from '../../mixins/index';
import show from '../../mixins/show';
import software from '../mixins/itemOperate';
import { handleArrAttribute } from '../tools.js'
import { getDictChildren } from 'services/system/dictionary'
import { encrypt, decrypt } from 'utils/crypto';
const yesData = [{ name: '否', value: false }, { name: '是', value: true }]
export default {
  mixins: [node, show, software],
  props: {
    itemData: {
      type: Object,
      default: function () {
        return {
          cluster_install: false,
          rabbitmq_users: [{
            user: '',
            password: '',
            tags: '',
            configure_priv: '.*',
            read_priv: '.*',
            write_priv: '.*',
            vhost: '/'
          }]
        }
      }
    }
  },
  data () {
    return {
      yesData,
      versionData: []
    }
  },
  created () {
    this.getVersion()
    handleArrAttribute(['rabbitmq_vhosts', 'rabbitmq_users', 'rabbitmq_plugins'], this);
    this.handleCrypto(this.itemData, decrypt)
  },
  methods: {
    // 加密解密处理
    handleCrypto(itemData, fun = encrypt) {
      const { rabbitmq_users } = itemData;
      rabbitmq_users.forEach(item => {
        if (item.password) {
          item.password = fun(item.password)
        }
      })
    },
    getVersion () {
      getDictChildren({ value: 'RABBITMQ-VERSION' }).then(data => {
        if (data.success) {
          this.versionData = data.data
        }
      })
    },
    // 新增虚拟机配置
    addVhosts (data) {
      data.push({
        name: '',
        node: 'rabbit',
        tracing: false
      })
    },
    // 新增用户
    addUser (data) {
      data.push({
        user: '',
        password: '',
        tags: '',
        configure_priv: '.*',
        read_priv: '.*',
        write_priv: '.*',
        vhost: '/'
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
  @import "index.scss";
</style>
