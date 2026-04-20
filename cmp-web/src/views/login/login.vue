<template>
  <div class="login-container" :style="{ backgroundImage: `url(${configs.loginBg || '/web-common-resource/img/bg_login.png'})` }">
    <div class="login-content">
      <!-- 左侧蓝色面板 -->
      <div class="left-panel">
        <span class="title-text">多云管理平台</span>
      </div>

      <!-- 右侧白色登录表单 -->
      <div class="right-panel">
        <div class="right-panel-content">
          <div class="login-title">欢迎登录</div>
          <el-form :model="loginForm" ref="loginFormRef" label-position="top" class="login-form" @keyup.enter.native="handleLogin" status-icon>
            <basic-form-item class="login-form-item" prop="account" validate="required" required-message="请输入用户名">
              <el-input v-model="loginForm.account" autoComplete="on" placeholder="登录账户" prefix-icon="el-icon-user" size="large"> </el-input>
            </basic-form-item>
            <el-tooltip v-model="capsTooltip" content="大写锁定已打开" placement="right" manual>
              <basic-form-item class="login-form-item" prop="password" validate="required" required-message="请输入密码">
                <el-input name="password" prefix-icon="el-icon-lock" v-model="loginForm.password" placeholder="密码" show-password size="large" @blur="capsTooltip = false" @keyup.native="checkCapslock"> </el-input>
              </basic-form-item>
            </el-tooltip>

            <basic-form-item class="login-form-item">
              <div class="form-options">
                <div class="remember-password">
                  <el-switch v-model="remember"></el-switch>
                  <span class="m-l-xs">记住密码</span>
                </div>
                <a :href="`mailto:${configs.helpInformationLink}`" class="help-link">{{ configs.helpInformationContent || '获取帮助' }}</a>
              </div>
            </basic-form-item>

            <el-button class="login-btn" type="primary" size="large" :loading="loading" @click="handleLogin">登录</el-button>
          </el-form>
        </div>
      </div>
    </div>
    <div class="copyright-info">{{ configs.copyrightInformation }}</div>
  </div>
</template>

<script>
import crypto from 'utils/crypto.js'
import { login } from 'services/system'
import { setLoginData } from './tools'
import { reactive, toRefs, ref, computed } from '@vue/composition-api'
export default {
  setup(props, context) {
    const state = reactive({
      remember: false,
      loginForm: {
        account: '',
        password: ''
      },
      loading: false,
      capsTooltip: false
    })
    const configs = computed(() => context.root.$store.getters.pageConfig)
    const loginFormRef = ref(null)
    const init = () => {
      const local = localStorage.getItem('cmcLoginData')
      if (local) {
        const obj = JSON.parse(local)
        state.loginForm.account = obj.account
        state.loginForm.password = crypto.decrypt(obj.password)
        state.remember = true
      }
    }
    init()
    function goLogin(data) {
      // const callback = this.$route.query.callback
      // if (callback) {
      //   location.href = `${this.ssoUrl}/upmsapi/sso/redirect?token=${data.token}&redirect=${callback}`
      //   return
      // }
      setLoginData(data)
      if (state.remember) {
        const obj = {
          account: state.loginForm.account,
          password: crypto.encrypt(state.loginForm.password)
        }
        localStorage.setItem('cmcLoginData', JSON.stringify(obj))
      } else {
        localStorage.removeItem('cmcLoginData')
      }
      let path = '/dashboard'
      const { $route, $router } = context.root
      const redirect = $route.query.redirect
      if (redirect) {
        path = redirect.split('/#')[1]
      }
      $router.replace(path)
      localStorage.removeItem('lockData')
    }

    function handleLogin() {
      loginFormRef.value.validate((valid) => {
        if (valid) {
          state.loading = true
          const { account, password } = state.loginForm
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
              state.loading = false
            })
        }
      })
    }

    function checkCapslock({ shiftKey, key } = {}) {
      if (key && key.length === 1) {
        if ((shiftKey && key >= 'a' && key <= 'z') || (!shiftKey && key >= 'A' && key <= 'Z')) {
          state.capsTooltip = true
        } else {
          state.capsTooltip = false
        }
      }
      if (key === 'CapsLock' && state.capsTooltip === true) {
        state.capsTooltip = false
      }
    }
    return {
      ...toRefs(state),
      configs,
      loginFormRef,
      handleLogin,
      checkCapslock
    }
  }
}
</script>

<style lang="scss" scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.login-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
  background: url('/web-common-resource/img/bg_login.png') #2d3a4b no-repeat;
  background-size: cover;
  .login-content {
    display: flex;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 1200px;
    z-index: 1;
    align-items: center;
    justify-content: center;
    min-height: 600px;

    // 左侧蓝色面板
    .left-panel {
      flex: 1;
      height: 100%;
      min-height: 700px;
      background: rgba(4, 121, 231, 0.463); // 半透明蓝色
      display: flex;
      align-items: center;
      justify-content: center;
      // backdrop-filter: blur(1px);
      padding: 60px 50px;

      .title-text {
        width: 80%;
        font-size: 28px;
        font-weight: 700;
        color: #ffffff;
        position: absolute;
        top: 5%;
        left: 5%;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }
    }

    // 右侧白色面板
    .right-panel {
      flex: 1;
      height: 100%;
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px 50px;
      .right-panel-content {
        width: 83%;
        min-height: 580px;
      }
      .login-title {
        font-size: 30px;
        font-weight: 600;
        color: #1890ff;
        text-align: center;
        margin-bottom: 40px;
        text-align: left;
        line-height: 130px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }

      .login-form {
        width: 100%;
        max-width: 400px;

        // 用户类型选择器
        .user-type-selector {
          display: flex;
          margin-bottom: 30px;
          background: #f5f5f5;
          border-radius: 8px;
          padding: 4px;
          gap: 4px;

          .type-item {
            flex: 1;
            text-align: center;
            padding: 12px 20px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 16px;
            color: #666;
            background: transparent;

            &:hover {
              background: rgba(24, 144, 255, 0.1);
            }

            &.active {
              background: #595959;
              color: #ffffff;
              font-weight: 500;
            }
          }
        }

        .login-form-item {
          margin-bottom: 24px;

          ::v-deep(.el-form-item__label) {
            padding-bottom: 8px;
            font-size: 14px;
            color: #333;
            font-weight: 500;
          }

          ::v-deep(.el-input__wrapper) {
            min-height: 48px;
            border-radius: 4px;

            .el-input__inner {
              height: 48px;
              line-height: 48px;
              font-size: 14px;
            }

            &:hover {
              box-shadow: 0 0 0 1px #40a9ff inset;
            }

            &.is-focus {
              box-shadow: 0 0 0 1px #1890ff inset;
            }
          }
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;

          .remember-password {
            display: flex;
            align-items: center;
            font-size: 14px;
            color: #666;

            .m-l-xs {
              margin-left: 8px;
            }
          }

          .help-link {
            color: #1890ff;
            font-size: 14px;
            text-decoration: none;
            cursor: pointer;

            &:hover {
              color: #40a9ff;
              text-decoration: underline;
            }
          }
        }

        .login-btn {
          width: 100%;
          height: 48px;
          font-size: 16px;
          font-weight: 500;
          border-radius: 4px;
        }
      }
    }
  }

  .copyright-info {
    width: 100%;
    padding: 10px 0;
    text-align: center;
    background: rgba(10, 37, 68, 0.6);
    color: #bbbbbb;
    position: fixed;
    z-index: 1;
    font-size: 12px;
    bottom: 0;
  }
}
</style>
