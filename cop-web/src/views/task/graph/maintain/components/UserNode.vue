<template>
  <basic-form :model="itemData" ref="form" :disabled="isPreview">
    <el-row>
      <el-col :span="24">
        <basic-form-item label="操作系统：">
          <el-radio-group v-model="itemData.osCategory" :disabled="isTaskInstance"  @change="changeCategory">
            <el-radio label="Windows">Windows</el-radio>
            <el-radio label="Linux">Linux</el-radio>
          </el-radio-group>
        </basic-form-item>
      </el-col>
      <el-col :span="24">
        <basic-form-item label="操作类型：">
          <el-radio-group v-model="itemData.operate" :disabled="isTaskInstance" @change="resetData">
            <template v-for="item in typeData">
              <el-radio :label="item.value" :key="item.value" v-if="isShowView(item.value)">{{item.name}}</el-radio>
            </template>
          </el-radio-group>
        </basic-form-item>
      </el-col>
    </el-row>
    <div  v-if="itemData.operate === 'add' || itemData.operate === 'modify'">
      <el-row>
        <el-col :span="12">
          <basic-form-item label="用户名称：" prop="users.0.name" validate="required">
            <el-input v-model="itemData.users[0].name" :maxlength="32" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="用户描述：" prop="users.0.comment">
            <el-input v-model="itemData.users[0].comment" auto-complete="off"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="密码：" prop="users.0.password" validate="required">
            <el-input type="password" v-model="itemData.users[0].password" auto-complete="off" show-password></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="24" v-if="osCategory == 'AIX'">
          <el-col :span="12">
            <el-form-item label="加密方式：" prop="crypted_type">
              <el-select v-model="itemData.crypted_type" placeholder="加密方式">
                <el-option v-for="(item,key) in cryptedType" :key="key" :label="item" :value="key">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-col>
        <el-col :span="12">
          <el-form-item label="用户组：" prop="users.0.group">
            <el-input v-model="itemData.users[0].group" auto-complete="off"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="过期时间：" prop="users.0.expires">
            <el-date-picker style="width:100%;" v-model="itemData.users[0].expires" type="date" placeholder="选择日期"
                            format="yyyy/MM/dd" value-format="yyyy/MM/dd">
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="itemData.osCategory === 'Linux'">
          <el-form-item label="shell设置：" prop="users.0.shell">
            <el-input v-model="itemData.users[0].shell" auto-complete="off"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="itemData.osCategory === 'Linux' && itemData.operate === 'add'">
          <el-form-item>
            <el-checkbox  v-model="isSudo" @change="changeSudo">是否SUDO
            </el-checkbox>
          </el-form-item>
        </el-col>
      </el-row>
      <div v-if="isSudo">
        <el-row>
          <el-col :span="12">
            <el-form-item label="主机名：" prop="sudo.hosts">
              <el-input v-model="itemData.sudo.hosts" auto-complete="off"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作者：" prop="sudo.operators">
              <el-input v-model="itemData.sudo.operators" auto-complete="off"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="命令：" prop="sudo.commands">
              <el-input v-model="itemData.sudo.commands" auto-complete="off"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="标签：" prop="sudo.tags">
              <el-select clearable v-model="itemData.sudo.tags" placeholder="请选择标签">
                <el-option v-for="(item,index) in tagsData" :key="index" :label="item"
                           :value="item"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <basic-form-item label="注释：" prop="sudo.comment" :rules="[notChinese]">
            <el-input type="textarea" v-model="itemData.sudo.comment" auto-complete="off"></el-input>
          </basic-form-item>
        </el-row>
      </div>
    </div>
    <el-row v-else-if="itemData.operate === 'delete'">
      <el-col :span="12">
        <el-form-item label="用户名称：" prop="users.0.name" validate="required">
          <el-input v-model="itemData.users[0].name" :maxlength="32" auto-complete="off"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="12" v-if="itemData.osCategory === 'Linux'">
        <el-form-item>
          <el-checkbox v-model="itemData.users[0].force">强制删除</el-checkbox>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row v-else-if="itemData.operate.indexOf('view') > -1">
      <el-row >
        <el-col :span="24">
          <el-form-item label="用户名称：" prop="sudo.name"
                        :rules="{ pattern:/^[\w%\-+._]{1,}$/, message: '不能输入中文和除.+=_外的其他特殊字符', trigger: 'blur' }">
            <el-input class="width-90" v-model="itemData.sudo.name"
                      placeholder="如果是一个用户组名称，请在名称前增加%。例如：%groupname"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item>
            <el-tag type="info">如果是一个用户组名称，请在名称前增加%。例如：%groupname</el-tag>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="itemData.operate === 'addview'">
        <el-col :span="24">
          <el-col :span="12">
            <el-form-item label="主机名：" prop="sudo.hosts">
              <el-input v-model="itemData.sudo.hosts" auto-complete="off"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作者：" prop="sudo.operators">
              <el-input v-model="itemData.sudo.operators" auto-complete="off"></el-input>
            </el-form-item>
          </el-col>
        </el-col>
        <el-col :span="24">
          <el-col :span="12">
            <el-form-item label="命令：" prop="sudo.commands">
              <el-input v-model="itemData.sudo.commands" auto-complete="off"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="标签：" prop="sudo.tags">
              <el-select clearable v-model="itemData.sudo.tags" placeholder="请选择标签">
                <el-option v-for="(item,index) in tagsData" :key="index" :label="item"
                           :value="item"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-col>
        <el-col :span="24">
          <basic-form-item label="注释：" prop="sudo.comment" :rules="[notChinese]">
            <el-input type="textarea" v-model="itemData.sudo.comment" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
    </el-row>
  </basic-form>
</template>
<script>
import { cloneDeep } from 'lodash-es'
import { encrypt, decrypt } from 'utils/crypto';
import node from '../../mixins/index';
import show from '../../mixins/show';
const tagsData = ['NOPASSWD', 'PASSWD', 'NOEXEC', 'EXEC', 'SETENV', 'NOSETENV', 'LOG_INPUT', 'NOLOG_INPUT', 'LOG_OUTPUT', 'NOLOG_OUTPUT']
const typeData = [{ name: '新增用户', value: 'add' }, { name: '删除用户', value: 'delete' }, { name: '修改用户', value: 'modify' }, { name: '查看权限', value: 'view' }, { name: '新增权限', value: 'addview' }, { name: '删除权限', value: 'deleteview' }]
// 非中文
const notChinese = {
  validator: (rule, value, callback) => {
    const reg = /[\u4e00-\u9fa5]/
    if (value && reg.test(value)) {
      callback(new Error('不支持中文字符'))
    } else {
      callback()
    }
  }
}
export default {
  mixins: [node, show],
  props: {
    itemData: {
      type: Object,
      default: function () {
        return {
          operate: 'add',
          osCategory: 'Linux',
          users: [{}],
          sudo: {}
        }
      }
    }
  },
  data () {
    return {
      notChinese,
      tagsData,
      typeData,
      osCategory: '',
      isSudo: false
    }
  },
  created () {
    if (this.itemData.operate === 'add' && this.itemData.sudo.hosts) this.isSudo = true;
    this.handleCrypto(this.itemData, decrypt)
  },
  methods: {
    // 加密解密处理
    handleCrypto(itemData, fun = encrypt) {
      const password = itemData.users[0].password;
      if (password) {
        itemData.users[0].password = fun(password)
      }
    },
    changeCategory () {
      this.itemData.operate = 'add';
      this.resetData();
    },
    isShowView (value) {
      return !(this.itemData.osCategory === 'Windows' && value.includes('view'))
    },
    resetData (value) {
      this.itemData.users = [{}];
      this.itemData.sudo = {};
      this.isSudo = false;
      if (value === 'addview') this.changeSudo(1);
    },
    changeSudo (flag) {
      if (flag) {
        this.itemData.sudo = {
          hosts: 'ALL',
          operators: 'ALL',
          commands: 'ALL',
          tags: 'NOPASSWD',
          comment: ''
        }
      } else {
        this.itemData.sudo = {};
      }
    },
    handleData () {
      const itemData = cloneDeep(this.itemData);
      itemData.type = itemData.operate;
      const map = {
        addview: 'add',
        deleteview: 'delete',
        view: 'view'
      };
      if (itemData.operate === 'add' && this.isSudo) itemData.sudo.name = itemData.users[0].name;
      if (itemData.operate.includes('view')) {
        itemData.type = map[itemData.operate];
      }
      this.handleCrypto(itemData)
      return itemData;
    },
    getPostData () {
      let data = false;
      this.$refs.form.validate(valid => {
        if (valid) {
          data = this.handleData(this.itemData)
        }
      });
      return data;
    }
  }
}
</script>
<style>
</style>
