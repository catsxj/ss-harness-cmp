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
          <el-dropdown-item @click="openInfoDialog">
            <el-icon><User /></el-icon>
            个人信息
          </el-dropdown-item>
          <el-dropdown-item @click="openPwdDialog">
            <el-icon><Lock /></el-icon>
            修改密码
          </el-dropdown-item>
          <el-dropdown-item @click="logoutHandler()">
            <el-icon><Back /></el-icon>
            退出系统
          </el-dropdown-item>
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
    <InfoDialog ref="infoDialog" :data="userData"></InfoDialog>
  </div>
</template>
<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Lock, Back } from '@element-plus/icons-vue'
import crypto from 'utils/crypto'
import { changePassword } from 'services/system/manager'
import { logout } from 'services/system'
import { useAppStore, usePermissionStore } from '@/stores'
import router, { resetRouter } from '@/router'
import InfoDialog from './InfoDialog.vue'

interface PwdData {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

// TODO: type - basic-form 组件实例无公开类型
const pwdFormRef = ref<any>(null)
// TODO: type - InfoDialog 通过 defineExpose 暴露 open
const infoDialog = ref<InstanceType<typeof InfoDialog> | null>(null)

const pwdData = reactive<PwdData>({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const pwdDialogVisible = ref(false)

const appStore = useAppStore()
const permissionStore = usePermissionStore()

const userData = computed<Record<string, any>>(() => (appStore.userData as Record<string, any>) || {})
const pwdRule = computed(() => (appStore.systemConfig as any)?.pwdStrength)

const checkPassword = () => {
  if (pwdData.newPassword === pwdData.oldPassword) {
    ElMessage({
      message: '新密码不能与原密码相同',
      type: 'error'
    })
    return false
  }
  if (pwdData.confirmPassword !== pwdData.newPassword) {
    ElMessage({
      message: '确认密码与新密码不一致',
      type: 'error'
    })
    return false
  }

  return true
}

const logoutHandler = () => {
  ElMessageBox.confirm('您确定要退出该系统吗?', '提示', {
    type: 'warning'
  }).then(() => {
    logout().then((data: any) => {
      if (data.success) {
        permissionStore.resetRoutes(router, resetRouter, true)
      }
    })
  })
}

const openPwdDialog = () => {
  pwdDialogVisible.value = true
  pwdData.oldPassword = ''
  pwdData.newPassword = ''
  pwdData.confirmPassword = ''
}

const modifySubmit = () => {
  pwdFormRef.value?.validate((valid: boolean) => {
    if (valid && checkPassword()) {
      changePassword(userData.value.id, {
        password: crypto.encrypt(pwdData.newPassword),
        oldPassword: crypto.encrypt(pwdData.oldPassword)
      }).then((data: any) => {
        if (data.success) {
          pwdDialogVisible.value = false
          ElMessage({
            message: data.message,
            type: 'success'
          })
          permissionStore.resetRoutes(router, resetRouter, true)
        }
      })
    }
  })
}

// TODO: 未使用的 switchLayout 保留兼容（原 Options 版本）
const _switchLayout = () => {
  const current = appStore.layout
  appStore.setLayout(current === 'sidemenu' ? 'topmenu' : 'sidemenu')
}

const openInfoDialog = () => {
  ;(infoDialog.value as any)?.open()
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
  ::v-deep(.popper__arrow) {
    display: none;
  }
  ::v-deep(.el-dropdown-menu__item) {
    color: #ccc;
    &:hover {
      background: #2d8cf0;
      color: #fff;
    }
  }
}
</style>
