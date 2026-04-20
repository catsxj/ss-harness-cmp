<template>
  <div class="user-info">
    <el-dropdown trigger="click">
      <div class="user-content">
        <el-tooltip>
          <div slot="content">
            <div class="info-cell">用户账号：{{ userData.account }}</div>
            <div class="info-cell">用户姓名：{{ userData.name }}</div>
            <div class="info-cell">用户邮箱：{{ userData.email }}</div>
          </div>
          <img :src="userData.portrait" class="head-portrait" />
        </el-tooltip>
      </div>
      <el-dropdown-menu slot="dropdown" class="user-dropdown">
        <el-dropdown-item @click.native="openInfoDialog"><i class="el-icon-user"></i> 个人信息</el-dropdown-item>
        <el-dropdown-item @click.native="openPwdDialog"><i class="el-icon-lock"></i> 修改密码</el-dropdown-item>
        <el-dropdown-item @click.native="logout()"><i class="el-icon-back"></i> 退出系统</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <el-dialog title="修改密码" :close-on-click-modal="false" width="30%" v-if="pwdDialogVisible" :visible.sync="pwdDialogVisible" append-to-body>
      <basic-form :model="pwdData" ref="pwdData">
        <basic-form-item label="原密码：" prop="oldPassword" validate="required">
          <el-input v-model="pwdData.oldPassword" type="password" auto-complete="off"></el-input>
        </basic-form-item>
        <basic-form-item label="新密码：" prop="newPassword" :validate="pwdRule">
          <el-input type="password" v-model="pwdData.newPassword" auto-complete="off"></el-input>
        </basic-form-item>
        <basic-form-item label="确认密码：" prop="confirmPassword" :validate="pwdRule">
          <el-input type="password" v-model="pwdData.confirmPassword" auto-complete="off"></el-input>
        </basic-form-item>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="pwdDialogVisible = false">取消</el-button>
        <el-button type="primary" @click.native="modifySubmit">确定</el-button>
      </div>
    </el-dialog>
    <InfoDialog ref="infoDialog" :data="userData"></InfoDialog>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import crypto from 'utils/crypto.js'
import { changePassword } from 'services/system/manager'
import { logout } from 'services/system'
import InfoDialog from './InfoDialog.vue'

@Component({
  components: { InfoDialog }
})
export default class Personal extends Vue {
  private pwdData: any = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  }

  private infoDialogVisible: boolean = false

  private pwdDialogVisible: boolean = false
  get userData() {
    return this.$store.getters.userData || {}
  }

  get pwdRule() {
    return this.$store.state.app.systemConfig.pwdStrength
  }

  private checkPassword() {
    if (this.pwdData.newPassword === this.pwdData.oldPassword) {
      this.$message({
        message: '新密码不能与原密码相同',
        type: 'error'
      })
      return false
    }
    if (this.pwdData.confirmPassword !== this.pwdData.newPassword) {
      this.$message({
        message: '确认密码与新密码不一致',
        type: 'error'
      })
      return false
    }

    return true
  }

  private logout() {
    this.$confirm('您确定要退出该系统吗?', '提示', {
      type: 'warning'
    }).then(() => {
      logout().then((data: any) => {
        if (data.success) {
          this.$store.dispatch('permission/ResetRoutes')
        }
      })
    })
  }

  private openPwdDialog() {
    this.pwdDialogVisible = true
    this.pwdData = {}
  }

  private modifySubmit() {
    ;(this.$refs.pwdData as any).validate((valid: boolean) => {
      if (valid && this.checkPassword()) {
        changePassword(this.userData.id, {
          password: crypto.encrypt(this.pwdData.newPassword),
          oldPassword: crypto.encrypt(this.pwdData.oldPassword)
        }).then((data: any) => {
          if (data.success) {
            this.pwdDialogVisible = false
            this.$message({
              message: data.message,
              type: 'success'
            })
            this.$store.dispatch('permission/ResetRoutes')
          }
        })
      }
    })
  }

  private switchLayout() {
    const layput = this.$store.state.app.layout
    this.$store.commit('SET_LAYOUT', layput === 'sidemenu' ? 'topmenu' : 'sidemenu')
  }

  private openInfoDialog() {
    ;(this.$refs.infoDialog as any).open()
  }
}
</script>
<style lang="scss" scoped>
.user-info {
  margin-right: 10px;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: initial;
  .user-content {
    position: relative;
    display: flex;
    align-items: center;
    padding-left: 30px;
    cursor: pointer;
    .head-portrait {
      display: inline-block;
      width: 24px;
      height: 24px;
      border-radius: 50%;
    }
  }
}
.info-cell {
  margin-bottom: 5px;
}
.user-dropdown {
  background: #2c2e3b;
  border-color: #2c2e3b;
  ::v-deep {
    .popper__arrow {
      display: none;
    }
    .el-dropdown-menu__item {
      color: #ccc;
      &:hover {
        background: #2d8cf0;
        color: #fff;
      }
    }
  }
}
</style>
