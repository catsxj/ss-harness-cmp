<template>
  <div class="login-container" :style="{background: `url(${configs.loginBg || 'static/img/bg_login.png'})`}">
    <div class="login-logo">
      <img :src="configs.loginLogo" alt="">
    </div>
    <div class="login-center">
      <div class="desc-content">
        <span class="desc-title">{{configs.promotionalTitle}}</span>
        <span class="desc-remark">{{configs.promotionalContent}}</span>
      </div>
      <el-form :model="loginForm" ref="loginFormRef" label-position="left" label-width="0px" class="card-box login-form" @keyup.enter="handleLogin" status-icon>
        <div class="login-title">账号登录</div>
        <el-form-item class="login-form-item" prop="account" required>
          <el-input v-model="loginForm.account" autocomplete="on" placeholder="登录账户">
            <template #prepend><el-icon><User /></el-icon></template>
          </el-input>
        </el-form-item>
        <el-tooltip v-model:visible="capsTooltip" content="大写锁定已打开" placement="right" :manual="true">
          <el-form-item class="login-form-item" prop="password" required>
            <el-input name="password" v-model="loginForm.password" placeholder="密码" show-password @blur="capsTooltip = false" @keyup="checkCapslock">
              <template #prepend><el-icon><Lock /></el-icon></template>
            </el-input>
          </el-form-item>
        </el-tooltip>
        <el-form-item>
          <div class="operate-region">
            <span class="remember">
              <el-switch v-model="remember"></el-switch>
              <span class="m-l-xs">记住密码</span>
            </span>
            <a :href="`mailto:${configs.helpInformationLink}`" type="text" class="text-info pull-right help-info" :title="configs.helpInformationContent">{{configs.helpInformationContent}}</a>
          </div>
        </el-form-item>
        <el-button class="login-btn" type="primary" size="default" :loading="loading" @click="handleLogin">
          登录
        </el-button>
      </el-form>
    </div>
    <div class="copyright-info">{{configs.copyrightInformation}}</div>
  </div>
</template>

<script setup lang="ts">
import crypto from 'utils/crypto.js'
import { login, getSystemConfigs } from 'services/system'
import { setLoginData } from './tools'
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'

const router = useRouter()
const route = useRoute()

const remember = ref(false)
const loginForm = reactive({
  account: '',
  password: ''
})
const loading = ref(false)
const capsTooltip = ref(false)

// 登录界面配置
interface LoginConfigs {
  loginBg?: string
  loginLogo?: string
  promotionalTitle?: string
  promotionalContent?: string
  helpInformationLink?: string
  helpInformationContent?: string
  copyrightInformation?: string
}
const configs = ref<LoginConfigs>({})

async function getConfigs() {
  const data = await getSystemConfigs({ category: '界面配置' })
  if (data.success) {
    configs.value = data.data
  }
}
getConfigs()

const loginFormRef = ref<FormInstance | null>(null)

const init = () => {
  const local = localStorage.getItem('screenLoginData')
  if (local) {
    const obj = JSON.parse(local)
    loginForm.account = obj.account
    loginForm.password = crypto.decrypt(obj.password)
    remember.value = true
  }
}
init()

function goLogin(data: Record<string, string>) {
  setLoginData(data)
  if (remember.value) {
    const obj = {
      account: loginForm.account,
      password: crypto.encrypt(loginForm.password)
    }
    localStorage.setItem('screenLoginData', JSON.stringify(obj))
  } else {
    localStorage.removeItem('screenLoginData')
  }
  let path = '/screen/list'
  const redirect = route.query.redirect as string | undefined
  if (redirect) {
    path = redirect.split('/#')[1]
  }
  router.replace(path)
  localStorage.removeItem('lockData')
}

function handleLogin() {
  loginFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      loading.value = true
      const { account, password } = loginForm
      login({
        account,
        password: crypto.encrypt(password),
        isManager: true
      })
        .then((data) => {
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

function checkCapslock({ shiftKey, key }: KeyboardEvent) {
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
  background: url('/scr-web/static/img/bg_login.png') #2d3a4b no-repeat;
  background-size: cover;
  .login-logo {
    border-bottom: 1px solid #8b91a1;
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
      width: 380px;
      height: 400px;
      padding: 40px;
      border-radius: 10px;
      background: #fff;
      border-radius: 10px;
      text-align: center;
      font-size: 17px;
      .login-title {
        font-size: 32px;
        color: #333;
        margin-bottom: 41px;
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
        :deep() {
          .el-input-group__prepend {
            background-color: #fff;
            padding: 0 15px;
            font-size: 25px;
            font-weight: bold;
            border-right: none;
          }
          .el-input__inner {
            height: 48px;
            line-height: 48px;
          }
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
