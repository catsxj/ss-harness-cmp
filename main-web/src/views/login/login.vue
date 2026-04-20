<template>
  <div class="login-container" :style="{ backgroundImage: `url(${configs.loginBg || '/web-common-resource/img/bg_login.png'})` }">
    <div class="login-logo">
      <img :src="configs.loginLogo" alt />
    </div>
    <div class="login-center">
      <div class="desc-content">
        <span class="desc-title">{{ configs.promotionalTitle }}</span>
        <span class="desc-remark">{{ configs.promotionalContent }}</span>
      </div>
      <a-form :model="loginForm" ref="loginFormRef" label-position="left" label-width="0px" class="card-box login-form" @keyup.enter="handleLogin">
        <div class="login-title">账号登录</div>
        <a-form-item class="login-form-item" name="account" :rules="[{ ...required, message: '请输入用户名' }]">
          <a-input v-model:value="loginForm.account" autocomplete="off" placeholder="登录账户">
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>
        <a-tooltip v-model="capsTooltip" content="大写锁定已打开" placement="right" manual>
          <a-form-item class="login-form-item" name="password" :rules="[{ ...required, message: '请输入密码' }]">
            <a-input-password name="password" prefix-icon="el-icon-lock" v-model:value="loginForm.password" placeholder="密码" autocomplete="false" @blur="capsTooltip = false" @keyup="checkCapslock">
              <template #prefix>
                <LockOutlined />
              </template>
            </a-input-password>
          </a-form-item>
        </a-tooltip>
        <a-form-item class="login-form-item">
          <div class="operate-region">
            <span class="remember">
              <a-switch v-model:checked="remember"></a-switch>
              <span class="m-l-xs">记住密码</span>
            </span>
            <a :href="`mailto:${configs.helpInformationLink}`" type="text" class="text-info pull-right help-info" :title="configs.helpInformationContent">{{ configs.helpInformationContent }}</a>
          </div>
        </a-form-item>
        <a-button class="login-btn" type="primary" size="medium" :loading="loading" @click="handleLogin">登录</a-button>
      </a-form>
    </div>
    <div class="copyright-info">{{ configs.copyrightInformation }}</div>
  </div>
</template>

<script>
import { decrypt, encrypt } from 'utils/crypto'
import { login } from 'services'
import { reactive, toRefs, ref, computed } from 'vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import setLoginData from './tools'
import { required } from '@/validate'

export default {
  components: { UserOutlined, LockOutlined },
  setup() {
    const state = reactive({
      remember: false,
      loginForm: {
        account: '',
        password: '',
      },
      loading: false,
      capsTooltip: false,
    })
    const store = useStore()
    const configs = computed(() => store.getters.pageConfig)
    const loginFormRef = ref(null)
    const init = () => {
      const local = localStorage.getItem('cmcLoginData')
      if (local) {
        const obj = JSON.parse(local)
        state.loginForm.account = obj.account
        state.loginForm.password = decrypt(obj.password)
        state.remember = true
      }
    }
    init()
    const router = useRouter()
    const route = useRoute()
    function goLogin(data) {
      setLoginData(data)
      if (state.remember) {
        const obj = {
          account: state.loginForm.account,
          password: encrypt(state.loginForm.password),
        }
        localStorage.setItem('cmcLoginData', JSON.stringify(obj))
      } else {
        localStorage.removeItem('cmcLoginData')
      }
      const { redirect } = route.query
      const path = redirect ? redirect.split('/#')[1] : '/sms-web/resource_dashboard'
      router.replace(path)
      localStorage.removeItem('lockData')
    }

    async function handleLogin() {
      try {
        state.loading = true
        const values = await loginFormRef.value.validate()
        const { account, password } = values
        const res = await login({
          account,
          password: encrypt(password),
          isManager: true,
        })
        if (res.success) {
          goLogin(res.data)
        }
      } catch (error) {}
      state.loading = false
    }

    function checkCapslock({ shiftKey, key } = {}) {
      if (key && key.length === 1) {
        if ((shiftKey && key >= 'a' && key <= 'z') || (!shiftKey && key >= 'A' && key <= 'Z')) {
          state.capsTooltip = true
        } else {
          state.capsTooltip = false
        }
      }
      if (key === 'CapsLock' && this.capsTooltip === true) {
        state.capsTooltip = false
      }
    }
    return {
      ...toRefs(state),
      required,
      configs,
      loginFormRef,
      handleLogin,
      checkCapslock,
    }
  },
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
      font-size: 17px;
      .login-title {
        font-size: 32px;
        text-align: center;
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
        height: 60px;
        width: 100%;
      }
      .help-info {
        max-width: 130px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .login-form-item {
        ::v-deep(.ant-input-affix-wrapper) {
          height: 60px;
          line-height: 60px;
        }
        ::v-deep(.ant-input-prefix) {
          padding-left: 50px;
        }
        ::v-deep {
          .a-input__icon {
            height: 100%;
          }
          .ant-input-prefix {
            font-size: 20px;
            padding: 0 10px;
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
