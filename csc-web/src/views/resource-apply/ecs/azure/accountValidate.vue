<template>
  <div>
    <el-popover ref="popover" placement="right" trigger="hover">
      <div>用户名只能包含字母.数字.连字符和下划线，且不能以连字符或数字开头</div>
      <div>
        用户名不包含保留字
        <el-tooltip class="item" effect="dark" placement="top-start">
          <div slot="content">
            不允许的值："administrator"、"admin"、"user"、"user1"、"test"、"用户 2"、"test1"、"user3"、<br />"admin1"、"1"、"123"、"a"、"actuser"、"adm"、"管理员 2"、"aspnet"、"备份"、"控制台"、<br />"david"、"guest"、"john"、"owner"、"root"、"server"、"sql"、"support"、<br />"support_388945a0"、"sys"、"test2"、"test3"、"user4"、"user5"。
          </div>
          <i class="el-icon-question"></i>
        </el-tooltip>
      </div>
      <div>长度为1到64位</div>
    </el-popover>
    <el-form-item label="管理员账户：" prop="account" :rules="rules">
      <el-input v-model="addData.account" v-popover:popover style="width: 280px"></el-input>
    </el-form-item>
  </div>
</template>
<script>
var validate = (rule, value, callback) => {
  const reg = /^[a-zA-Z_][a-zA-Z0-9-_]*$/
  const reserved = [
    'administrator',
    'admin',
    'user',
    'user1',
    'test',
    '用户 2',
    'test1',
    'user3',
    'admin1',
    '1',
    '123',
    'a',
    'actuser',
    'adm',
    '管理员 2',
    'aspnet',
    '备份',
    '控制台',
    'david',
    'guest',
    'john',
    'owner',
    'root',
    'server',
    'sql',
    'support',
    'support_388945a0',
    'sys',
    'test2',
    'test3',
    'user4',
    'user5'
  ]
  if (reg.test(value) && reserved.indexOf(value.toLowerCase()) == -1 && value.length >= 1 && value.length <= 64) {
    callback()
  } else {
    callback(new Error(' '))
  }
}
export default {
  props: {
    addData: {
      type: Object
    }
  },
  data() {
    return {
      popoverObj: {
        length: true,
        intension: true,
        reserved: true
      },
      rules: [{ required: true, message: ' ', trigger: 'blur' }, { validator: validate }]
    }
  },
  watch: {
    'addData.account'() {
      const reg = /^[a-zA-Z_][a-zA-Z0-9-_]*$/
      const reserved = [
        'administrator',
        'admin',
        'user',
        'user1',
        'test',
        '用户 2',
        'test1',
        'user3',
        'admin1',
        '1',
        '123',
        'a',
        'actuser',
        'adm',
        '管理员 2',
        'aspnet',
        '备份',
        '控制台',
        'david',
        'guest',
        'john',
        'owner',
        'root',
        'server',
        'sql',
        'support',
        'support_388945a0',
        'sys',
        'test2',
        'test3',
        'user4',
        'user5'
      ]
      this.popoverObj = {
        length: this.addData.account.length >= 1 && this.addData.account.length <= 64,
        intension: reg.test(this.addData.account),
        reserved: reserved.indexOf(this.addData.account.toLowerCase()) == -1
      }
    }
  },
  created() {},
  methods: {}
}
</script>
<style scoped lang="scss"></style>
