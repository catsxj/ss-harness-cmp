<template>
  <basic-form :model="itemData" ref="form" :disabled="isPreview">
    <el-row>
      <el-col :span="12">
        <basic-form-item label="软件版本：" prop="version" validate="required">
          <el-select v-model="itemData.version" placeholder="软件版本" >
            <el-option v-for="(row,index) in versionData" :key="index" :label="row.name" :value="row.value">
            </el-option>
          </el-select>
        </basic-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <basic-form-item label="新增实例：">
          <el-button type="primary" v-if="!isPreview" size="mini"  @click="addInstance(itemData.tomcat_instances)">新增</el-button>
        </basic-form-item>
      </el-col>
    </el-row>
    <div v-for="(item, index) in itemData.tomcat_instances" :key="index" class="search-container">
      <el-button  v-if="!isPreview" type="text" class="del_operate"  @click="removeItem(itemData.tomcat_instances, index)">
        <i class="el-icon-delete" />
      </el-button>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="名称：" :prop="'tomcat_instances.'+index+'.name'" validate="required">
            <el-input v-model="item.name"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="AJP端口：" prop="port_ajp">
            <el-input v-model="item.port_ajp" auto-complete="off" :disabled="isPreview"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="连接端口：" prop="port_connector">
            <el-input v-model="item.port_connector" auto-complete="off" :disabled="isPreview"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="重定向端口：" prop="port_redirect">
            <el-input v-model="item.port_redirect" auto-complete="off" :disabled="isPreview"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="关闭端口：" prop="port_shutdown">
            <el-input v-model="item.port_shutdown" auto-complete="off" :disabled="isPreview"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="路径：" prop="path">
            <el-input v-model="item.path" auto-complete="off" :disabled="isPreview"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="用户：" prop="user">
            <el-input v-model="item.user" auto-complete="off" :disabled="isPreview"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="用户组：" prop="group">
            <el-input v-model="item.group" auto-complete="off" :disabled="isPreview"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="根目录：" prop="home">
            <el-input v-model="item.home" auto-complete="off" :disabled="isPreview"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="Catalina参数：" prop="catalina_opts" label-width="130px">
            <el-input v-model="item.catalina_opts" auto-complete="off" :disabled="isPreview"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="URI编码：" prop="override_uri_encoding">
            <el-input v-model="item.override_uri_encoding" auto-complete="off" :disabled="isPreview"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
    </div>
  </basic-form>
</template>
<script>
import node from '../../mixins/index';
import show from '../../mixins/show';
import software from '../mixins/itemOperate'
import { handleArrAttribute } from '../tools.js'
import { getDictChildren } from 'services/system/dictionary'
export default {
  mixins: [node, show, software],
  props: {
    itemData: {
      type: Object,
      default: function () {
        return {
          version: '',
          tomcat_instances: []
        }
      }
    }
  },
  data () {
    return {
      versionData: []
    }
  },
  created () {
    this.getVersion()
    handleArrAttribute(['tomcat_instances'], this)
  },
  methods: {
    getVersion () {
      getDictChildren({ value: 'TOMCAT-VERSION' }).then(data => {
        if (data.success) {
          this.versionData = data.data
        }
      })
    },
    // 新增实例
    addInstance (data) {
      data.push({
        user: 'tomcat',
        home: '/srv/tomcat',
        group: 'tomcat',
        port_ajp: 8009,
        path: '/srv/tomcat',
        port_redirect: 8443,
        port_connector: 8080,
        catalina_opts: '',
        port_shutdown: 8005,
        override_uri_encoding: ''
      })
    }
  }
}
</script>
<style lang="scss" scoped>
  @import "./index";
</style>
