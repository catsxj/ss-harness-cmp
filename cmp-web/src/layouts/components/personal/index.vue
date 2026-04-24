<template>
  <div class="user-info">
    <el-dropdown trigger="click">
      <div class="user-content">
        <el-tooltip>
          <template #content>
            <div class="info-cell">用户账号：{{ userData.account }}</div>
            <div class="info-cell">用户姓名：{{ userData.name }}</div>
            <div class="info-cell">用户邮箱：{{ userData.email }}</div>
          </template>
          <img :src="userData.portrait" class="head-portrait" />
        </el-tooltip>
      </div>
      <template #dropdown>
        <el-dropdown-menu class="user-dropdown">
          <el-dropdown-item @click="openInfoDialog"><i class="el-icon-user"></i> 个人信息</el-dropdown-item>
          <el-dropdown-item @click="openPwdDialog"><i class="el-icon-lock"></i> 修改密码</el-dropdown-item>
          <el-dropdown-item @click="handleLogout"><i class="el-icon-back"></i> 退出系统</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-dialog title="修改密码" :close-on-click-modal="false" width="30%" v-if="pwdDialogVisible" v-model="pwdDialogVisible" append-to-body>
      <basic-form :model="pwdData" ref="pwdFormRef">
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
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="pwdDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="modifySubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>
    <InfoDialog ref="infoDialogRef" :data="userData"></InfoDialog>
  </div>
</template>
<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
// @ts-ignore
import crypto from 'utils/crypto'
import { changePassword } from 'services/system/manager'
import { logout as logoutApi } from 'services/system'
import InfoDialog from './InfoDialog.vue'
import { useAppStore, usePermissionStore } from '@/stores'
import { resetRouter } from '@/router'

const router = useRouter()
const appStore = useAppStore()
const permissionStore = usePermissionStore()

const pwdData = reactive<any>({ oldPassword: '', newPassword: '', confirmPassword: '' })
const pwdDialogVisible = ref(false)
const pwdFormRef = ref<any>(null)
const infoDialogRef = ref<any>(null)

const userData = computed<any>(() => appStore.userData || {})
const pwdRule = computed(() => (appStore.systemConfig as any)?.pwdStrength)

function checkPassword() {
  if (pwdData.newPassword === pwdData.oldPassword) {
    ElMessage({ message: '新密码不能与原密码相同', type: 'error' })
    return false
  }
  if (pwdData.confirmPassword !== pwdData.newPassword) {
    ElMessage({ message: '确认密码与新密码不一致', type: 'error' })
    return false
  }
  return true
}

function handleLogout() {
  ElMessageBox.confirm('您确定要退出该系统吗?', '提示', { type: 'warning' }).then(() => {
    logoutApi().then((data: any) => {
      if (data.success) permissionStore.resetRoutes(router, resetRouter)
    })
  })
}

function openPwdDialog() {
  pwdDialogVisible.value = true
  Object.assign(pwdData, { oldPassword: '', newPassword: '', confirmPassword: '' })
}

function modifySubmit() {
  pwdFormRef.value?.validate?.((valid: boolean) => {
    if (valid && checkPassword()) {
      changePassword(userData.value.id, {
        password: crypto.encrypt(pwdData.newPassword),
        oldPassword: crypto.encrypt(pwdData.oldPassword)
      }).then((data: any) => {
        if (data.success) {
          pwdDialogVisible.value = false
          ElMessage({ message: data.message, type: 'success' })
          permissionStore.resetRoutes(router, resetRouter)
        }
      })
    }
  })
}

function openInfoDialog() {
  infoDialogRef.value?.open?.()
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
