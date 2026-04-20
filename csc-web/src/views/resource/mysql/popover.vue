<template>
  <div>
    <el-popover ref="popover" placement="right" trigger="hover">
      <div>
        <span v-if="addData.administratorName">
          <Icon type="icon-ok" style="color: #0fd59d" v-if="popoverObj.length" />
          <Icon type="icon-icon-31" style="color: #d35e5c" v-else />
        </span>
        长度为1到16位
      </div>
      <div>
        <span v-if="addData.administratorName">
          <Icon type="icon-ok" style="color: #0fd59d" v-if="popoverObj.intension" />
          <Icon type="icon-icon-31" style="color: #d35e5c" v-else />
        </span>
        仅支持数字和大小写字母,不能以数字开头
      </div>
      <div>
        <span v-if="addData.administratorName">
          <Icon type="icon-ok" style="color: #0fd59d" v-if="popoverObj.indexOf" />
          <Icon type="icon-icon-31" style="color: #d35e5c" v-else />
        </span>
        用户名不可含有保留字
      </div>
    </el-popover>
    <el-popover ref="popover1" placement="right" trigger="hover">
      <div>
        <span v-if="addData.administratorPassword">
          <Icon type="icon-ok" style="color: #0fd59d" v-if="popover1Obj.length" />
          <Icon type="icon-icon-31" style="color: #d35e5c" v-else />
        </span>
        长度为8到128位
      </div>
      <div>
        <span v-if="addData.administratorPassword">
          <Icon type="icon-ok" style="color: #0fd59d" v-if="popover1Obj.intension" />
          <Icon type="icon-icon-31" style="color: #d35e5c" v-else />
        </span>
        大小写字母,数字及特殊字符需包含三种
      </div>
      <!-- <div>
        <span v-if="addData.administratorPassword">
          <Icon type="icon-ok" style="color:#0fd59d" v-if="popover1Obj.indexOf" />
          <Icon type="icon-icon-31" style="color:#d35e5c" v-else />
        </span>
        不可与登录名一致
      </div> -->
    </el-popover>
    <el-col :span="12">
      <el-form-item label="用户名：" prop="administratorName" :rules="rules">
        <el-input v-model="addData.administratorName" v-popover:popover></el-input>
      </el-form-item>
    </el-col>
    <el-col :span="12">
      <el-form-item label="密码：" prop="administratorPassword" :rules="rules1">
        <el-input type="password" v-model="addData.administratorPassword" v-popover:popover1 show-password></el-input>
      </el-form-item>
    </el-col>
  </div>
</template>
<script>
var validate = (rule, value, callback) => {
  const reg = /^[a-zA-Z][a-zA-Z0-9]*$/
  const reserved = ['azure_superuser', 'admin', 'administrator', 'root', 'guest', 'public']
  if (reg.test(value) && reserved.indexOf(value.toLowerCase()) == -1 && value.length >= 1 && value.length <= 16) {
    callback()
  } else {
    callback(new Error(' '))
  }
}
var validate1 = (rule, value, callback) => {
  const reg = new RegExp('^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-z_!@#$%^&*`~()-+=]+$)(?![0-9_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9_!@#$%^&*`~()-+=]{8,30}$')
  if (reg.test(value) && value.length >= 8 && value.length <= 128) {
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
        indexOf: true
      },
      popover1Obj: {
        length: true,
        intension: true,
        indexOf: true
      },
      rules: [{ required: true, message: ' ', trigger: 'blur' }, { validator: validate }],
      rules1: [{ required: true, message: ' ', trigger: 'blur' }, { validator: validate1 }]
    }
  },
  watch: {
    'addData.administratorName'() {
      const reg = /^[a-zA-Z][a-zA-Z0-9]*$/
      const indexOfs = ['azure_superuser', 'admin', 'administrator', 'root', 'guest', 'public']
      this.popoverObj = {
        length: this.addData.administratorName.length >= 1 && this.addData.administratorName.length <= 16,
        intension: reg.test(this.addData.administratorName),
        indexOf: indexOfs.indexOf(this.addData.administratorName) == -1
      }
    },
    'addData.administratorPassword'() {
      const reg = new RegExp('^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-z_!@#$%^&*`~()-+=]+$)(?![0-9_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9_!@#$%^&*`~()-+=]{8,30}$')
      this.popover1Obj = {
        length: this.addData.administratorPassword.length >= 8 && this.addData.administratorPassword.length <= 128,
        intension: reg.test(this.addData.administratorPassword),
        indexOf: this.addData.administratorPassword != this.addData.administratorName
      }
    }
  },
  created() {},
  methods: {
    validate() {
      let flag = true
      if (this.addData.administratorPassword != this.addData.administratorName) flag = false
      return flag
    }
  }
}
</script>
<style scoped lang="scss"></style>
