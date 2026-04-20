<template>
  <div>
    <el-popover ref="popover" placement="right" trigger="hover">
      <div>
        <span v-if="addData.password">
          <Icon type="icon-ok" style="color: #0fd59d" v-if="popoverObj.length" />
          <Icon type="icon-icon-31" style="color: #d35e5c" v-else />
        </span>
        长度为12到36位
      </div>
      <div>
        <span>
          <Icon type="icon-ok" style="color: #0fd59d" v-if="popoverObj.reserved" />
          <Icon type="icon-icon-31" style="color: #d35e5c" v-else />
        </span>
        密码不包含保留字
        <el-tooltip class="item" effect="dark" placement="top-start">
          <div slot="content">不允许的值：" abc@123 "、"P@ $ $w 0rd"、" P@ssw0rd "、" P@ssword123 "、"Pa $ $word"、" pass@word1 "、"Password！"、"Password1"、"Password22"、"iloveyou！"</div>
          <i class="el-icon-question"></i>
        </el-tooltip>
      </div>
      <div>
        <span v-if="addData.password">
          <Icon type="icon-ok" style="color: #0fd59d" v-if="popoverObj.intension" />
          <Icon type="icon-icon-31" style="color: #d35e5c" v-else />
        </span>
        大小写字母、数字及特殊字符需包含三种
      </div>
    </el-popover>
    <el-popover ref="popover1" placement="right" trigger="hover">
      <div v-if="addData.confirm_password != addData.password">两次密码输入不一致</div>
      <div v-else>
        <div>
          <span v-if="addData.confirm_password">
            <Icon type="icon-ok" style="color: #0fd59d" v-if="popover1Obj.length" />
            <Icon type="icon-icon-31" style="color: #d35e5c" v-else />
          </span>
          长度为12到36位
        </div>
        <div>
          <span>
            <Icon type="icon-ok" style="color: #0fd59d" v-if="popover1Obj.reserved" />
            <Icon type="icon-icon-31" style="color: #d35e5c" v-else />
          </span>
          密码不包含保留字
          <el-tooltip class="item" effect="dark" placement="top-start">
            <div slot="content">不允许的值：" abc@123 "、"P@ $ $w 0rd"、" P@ssw0rd "、" P@ssword123 "、"Pa $ $word"、" pass@word1 "、"Password！"、"Password1"、"Password22"、"iloveyou！"</div>
            <i class="el-icon-question"></i>
          </el-tooltip>
        </div>
        <div>
          <span v-if="addData.confirm_password">
            <Icon type="icon-ok" style="color: #0fd59d" v-if="popover1Obj.intension" />
            <Icon type="icon-icon-31" style="color: #d35e5c" v-else />
          </span>
          大小写字母、数字及特殊字符需包含三种
        </div>
      </div>
    </el-popover>
    <el-col :span="12">
      <cmp-form-item label="登录密码：" prop="password" validate="required,vmPassword" required-message="该字段为必填字段">
        <el-input type="password" v-model="addData.password" v-popover:popover show-password></el-input>
      </cmp-form-item>
    </el-col>
    <el-col :span="12">
      <cmp-form-item label="确认密码：" prop="confirm_password" validate="required,vmPassword" required-message="该字段为必填字段">
        <el-input type="password" v-model="addData.confirm_password" v-popover:popover1 show-password></el-input>
      </cmp-form-item>
    </el-col>
  </div>
</template>
<script>
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
      popover1Obj: {
        length: true,
        intension: true,
        reserved: true
      },
      reserved: ['abc@123', 'P@$$w0rd', 'P@ssw0rd', 'P@ssword123', 'Pa$$word', 'pass@word1', 'Password', 'Password1', 'Password22', 'iloveyou']
    }
  },
  watch: {
    'addData.password'() {
      const reg = new RegExp('^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-z_!@#$%^&*`~()-+=]+$)(?![0-9_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9_!@#$%^&*`~()-+=]{8,30}$')
      this.popoverObj = {
        length: this.addData.password.length >= 12 && this.addData.password.length <= 36,
        intension: reg.test(this.addData.password),
        reserved: this.reserved.indexOf(this.addData.password.toLowerCase()) == -1
      }
    },
    'addData.confirm_password'() {
      const reg = new RegExp('^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-z_!@#$%^&*`~()-+=]+$)(?![0-9_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9_!@#$%^&*`~()-+=]{8,30}$')
      this.popover1Obj = {
        length: this.addData.confirm_password.length >= 12 && this.addData.confirm_password.length <= 36,
        intension: reg.test(this.addData.confirm_password),
        reserved: this.reserved.indexOf(this.addData.confirm_password.toLowerCase()) == -1
      }
    }
  },
  created() {},
  methods: {}
}
</script>
<style scoped lang="scss">
::v-deep .el-input {
  width: 280px;
}
</style>
