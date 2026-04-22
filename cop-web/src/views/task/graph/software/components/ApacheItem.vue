<template>
  <basic-form :model="itemData" ref="form" :disabled="isPreview">
    <el-row>
      <el-col :span="24">
        <basic-form-item label="实例配置：">
          <el-button v-if="!isPreview" type="primary" size="mini"  @click="addInstance(itemData.apache_vhosts)">新增</el-button>
        </basic-form-item>
      </el-col>
    </el-row>
    <div v-for="(item, index) in itemData.apache_vhosts" :key="index" class="search-container">
      <el-button  v-if="!isPreview" type="text" class="del_operate"  @click="removeItem(itemData.apache_vhosts, index)">
        <i class="el-icon-delete" />
      </el-button>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="域名：" :prop="'apache_vhosts.'+index+'.servername'" validate="required">
            <el-input v-model="item.servername" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="控制选项：" prop="options">
            <el-input v-model="item.options" auto-complete="off" :disabled="isPreview"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="文档目录：" :prop="'apache_vhosts.'+index+'.documentroot'" validate="required">
            <el-input v-model="item.documentroot" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="管理员邮箱：" prop="serveradmin">
            <el-input v-model="item.serveradmin" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="允许重写：" prop="allow_override">
            <el-input v-model="item.allow_override" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="别名：" prop="serveralias">
            <el-input v-model="item.serveralias" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <basic-form-item label="附加参数：" prop="extra_parameters">
            <el-input type="textarea" v-model="item.extra_parameters" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
    </div>
  </basic-form>
</template>
<script>
import node from '../../mixins/index';
import show from '../../mixins/show'
import software from '../mixins/itemOperate';
import { handleArrAttribute } from '../tools.js'

export default {
  mixins: [node, show, software],
  props: {
    itemData: {
      type: Object,
      default: function () {
        return {
          apache_vhosts: []
        }
      }
    }
  },
  data () {
    return {
    }
  },
  created () {
    handleArrAttribute(['apache_vhosts'], this);
  },
  methods: {
    // 新增实例
    addInstance (data) {
      data.push({
        servername: '',
        documentroot: '',
        allow_override: 'All',
        options: '-Indexes +FollowSymLinks',
        serveradmin: '',
        serveralias: '',
        extra_parameters: ''
      })
    }
  }
}
</script>
<style scoped lang="scss">
  @import "./index";
</style>
