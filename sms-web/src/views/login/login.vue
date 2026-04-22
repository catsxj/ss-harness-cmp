<template>
  <div class="login-container" :style="{ backgroundImage: `url(${configs.loginBg || '/web-common-resource/img/bg_login.png'})` }">
    <div class="login-logo">
      <img :src="configs.loginLogo" alt="" />
    </div>
    <div class="login-center">
      <div class="desc-content">
        <span class="desc-title">{{ configs.promotionalTitle }}</span>
        <span class="desc-remark">{{ configs.promotionalContent }}</span>
      </div>
      <el-form :model="loginForm" ref="loginFormRef" label-position="left" label-width="0px" class="card-box login-form" @keyup.enter="handleLogin" status-icon>
        <div class="login-title">账号登录</div>
        <basic-form-item class="login-form-item" prop="account" validate="required" required-message="请输入用户名">
          <el-input v-model="loginForm.account" autocomplete="on" placeholder="登录账号">
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </basic-form-item>
        <el-tooltip v-model:visible="capsTooltip" content="大写锁定已打开" placement="right" manual>
          <basic-form-item class="login-form-item" prop="password" validate="required" required-message="请输入密码">
            <el-input name="password" v-model="loginForm.password" placeholder="密码" show-password @blur="capsTooltip = false" @keyup="checkCapslock">
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </basic-form-item>
        </el-tooltip>
        <basic-form-item class="login-form-item">
          <div class="operate-region">
            <span class="remember">
              <el-switch v-model="remember"></el-switch>
              <span class="m-l-xs">记住密码</span>
            </span>
            <a :href="`mailto:${configs.helpInformationLink}`" class="text-info pull-right help-info" :title="configs.helpInformationContent">{{ configs.helpInformationContent }}</a>
          </div>
        </basic-form-item>
        <el-button class="login-btn" type="primary" size="default" :loading="loading" @click="handleLogin"> 登录 </el-button>
      </el-form>
    </div>
    <div class="copyright-info">{{ configs.copyrightInformation }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { FormInstance } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import crypto from 'utils/crypto'
import { login } from 'services/system'
import { setLoginData } from './tools'
import { useAppStore, usePermissionStore } from '@/stores'
import router, { asyncRouterMap } from '@/router'

interface LoginForm {
  account: string
  password: string
}

const route = useRoute()
const appStore = useAppStore()
const permissionStore = usePermissionStore()

const loginFormRef = ref<FormInstance>()
const remember = ref(false)
const loading = ref(false)
const capsTooltip = ref(false)
const loginForm = reactive<LoginForm>({
  account: '',
  password: ''
})

// TODO: type - pageConfig 形状需要在 store 中补充明确接口
const configs = computed<Record<string, string>>(() => (appStore.pageConfig || {}) as Record<string, string>)

function init(): void {
  const local = localStorage.getItem('cmcLoginData')
  if (local) {
    try {
      const obj = JSON.parse(local) as { account: string; password: string }
      loginForm.account = obj.account
      loginForm.password = crypto.decrypt(obj.password)
      remember.value = true
    } catch {
      /* ignore */
    }
  }
}
init()

async function goLogin(data: any): Promise<void> {
  setLoginData(data)
  if (remember.value) {
    const obj = {
      account: loginForm.account,
      password: crypto.encrypt(loginForm.password)
    }
    localStorage.setItem('cmcLoginData', JSON.stringify(obj))
  } else {
    localStorage.removeItem('cmcLoginData')
  }
  await permissionStore.generateRoutes(asyncRouterMap, router)
  let path = '/auth/tenants'
  const redirect = route.query.redirect as string | undefined
  if (redirect) {
    path = redirect.split('/#')[1] || path
  }
  router.replace(path)
  localStorage.removeItem('lockData')
}

function handleLogin(): void {
  if (!loginFormRef.value) return
  loginFormRef.value.validate((valid: boolean) => {
    if (valid) {
      loading.value = true
      const { account, password } = loginForm
      login({
        account,
        password: crypto.encrypt(password),
        isManager: true
      })
        .then((data: any) => {
          if (data.success) {
            goLogin(data.data)
          }
        })
        .finally(() => {
          loading.value = false
        })
    }
  })
}

function checkCapslock(event: KeyboardEvent): void {
  const { shiftKey, key } = event
  if (key && key.length === 1) {
    if ((shiftKey && key >= 'a' && key <= 'z') || (!shiftKey && key >= 'A' && key <= 'Z')) {
      capsTooltip.value = true
    } else {
      capsTooltip.value = false
    }
  }
  if (key === 'CapsLock' && capsTooltip.value === true) {
    capsTooltip.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: url('/web-common-resource/img/bg_login.png') #2d3a4b no-repeat;
  background-size: cover;
  .login-logo {
    padding: 5px 40px;
    img {
      height: 40px;
    }
  }
  .login-center {
    display: flex;
    flex: 1;
    justify-content: space-around;
    align-items: center;
    .desc-content {
      color: #fff;
      display: flex;
      flex-direction: column;
      margin-top: -150x;
      width: 600px;
      .desc-title {
        font-weight: 700;
        font-style: normal;
        font-size: 38px;
        color: #ffffff;
        margin-bottom: 56px;
      }
      .desc-remark {
        line-height: 40px;
        font-weight: 400;
        font-style: normal;
        font-size: 22px;
        color: #ffffff;
      }
    }
    .login-form {
      box-sizing: border-box;
      width: 462px;
      padding: 50px 30px;
      background: #fff;
      text-align: center;
      font-size: 17px;
      .login-title {
        font-size: 32px;
        color: #333;
        margin-bottom: 50px;
      }
      .operate-region {
        display: flex;
        align-items: center;
        .remember {
          flex: 1;
          text-align: left;
        }
      }
      .login-btn {
        margin-top: 20px;
        padding: 17px 20px;
        width: 100%;
      }
      .help-info {
        max-width: 130px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .login-form-item {
        margin-bottom: 20px;
        :deep(.el-input--prefix .el-input__inner) {
          padding-left: 50px;
        }
        :deep(.el-input__prefix) {
          font-size: 20px;
          padding: 0 10px;
        }
        :deep(.el-input__inner) {
          height: 60px;
          line-height: 60px;
        }
      }
    }
  }
  .copyright-info {
    padding: 10px 0;
    text-align: center;
    background: rgba(10, 37, 68, 0.6);
    color: #bbbbbb;
  }
}
</style>
