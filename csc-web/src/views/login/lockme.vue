<template>
  <div class="lock-wrapper" @click.stop="">
    <canvas id="canvas" width="100vw" height="100vh"></canvas>
    <div class="lock-center">
      <img class="logo" :src="userData.portrait" />
      <p class="account">{{ userData.name }}</p>
      <el-form :model="loginForm" ref="loginForm" @keyup.enter.native.prevent="handleLogin" @submit.native.prevent>
        <basic-form-item prop="password" validate="required" required-message="请输入密码">
          <el-input v-model="loginForm.password" placeholder="请输入密码" type="password">
            <template slot="append">
              <el-button type="primary" @click="handleLogin()" :loading="loading">
                <Icon type="icon-jiantou"></Icon>
              </el-button>
            </template>
          </el-input>
        </basic-form-item>
      </el-form>
      <el-button class="switch-button" type="text" @click="switchUser()"><i class="el-icon-arrow-left"></i>切换账户</el-button>
    </div>
    <div class="date-time">
      <div class="time">{{ currentTime.time }}</div>
      <div class="date">{{ currentTime.date }}</div>
    </div>
  </div>
</template>

<script>
import dayjs from 'utils/day'
import crypto from 'utils/crypto.js'
import { login, logout, loginByTenant, logoutByTenant } from 'services/system/csc_login'

export default {
  name: 'login',
  data() {
    return {
      loginForm: {
        password: ''
      },
      loading: false,
      timer: '',
      currentTime: {},
      lockData: ''
    }
  },
  computed: {
    userData() {
      return this.$store.state.app.userData
    }
  },
  created() {
    this.$store.dispatch('GetUserInfo')
    this.lockData = JSON.parse(localStorage.getItem('lockData'))
    // 处理通过路由进入锁屏
    localStorage.setItem(
      'lockData',
      JSON.stringify({
        ...this.lockData,
        isLock: true
      })
    )
    this.setTimer()
  },
  mounted() {},
  destroyed() {
    clearInterval(this.timer)
  },
  methods: {
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          const http = this.userData.accountCategory === 'Tenant' ? loginByTenant : login
          http({
            account: this.userData.account,
            password: crypto.encrypt(this.loginForm.password)
          }).then(data => {
            this.loading = false
            if (data.success) {
              this.$router.replace(this.lockData.path)
              this.$store.commit('SET_OPERATETIME')
              localStorage.setItem(
                'lockData',
                JSON.stringify({
                  ...this.lockData,
                  isLock: false
                })
              )
            }
          })
        }
      })
    },
    setTimer() {
      const getTime = () => {
        const time = dayjs()
        this.currentTime = {
          time: time.format('HH:mm:ss'),
          date: `${time.format('MMMDo')}, ${time.format('dddd')}`
        }
      }
      getTime()
      this.timer = setInterval(() => {
        getTime()
      }, 1000)
    },
    switchUser() {
      const http = this.userData.accountCategory === 'Tenant' ? logoutByTenant : logout
      http().then(data => {
        if (data.success) {
          this.$store.dispatch('permission/ResetRoutes')
        }
      })
    }
  }
}
</script>

<style lang="scss">
.lock-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('/web-common-resource/img/lock_wrapper.jpg') #1c2b36 no-repeat;
  background-size: 100%;
  .lock-center {
    position: absolute;
    text-align: center;
    top: 40%;
    left: 50%;
    width: 300px;
    margin: -150px 0 0 -150px;
    .logo {
      display: inline-block;
      width: 160px;
      height: 160px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.5);
      overflow: hidden;
    }
    .account {
      font-size: 45px;
      font-weight: 500;
      color: #fff;
      margin: 15px 0 25px 0;
    }
    .el-input-group__append {
      border: none;
      background: #6b7485;
      color: #fff;
    }
  }
  .date-time {
    position: absolute;
    left: 30px;
    bottom: 60px;
    color: #fff;
    .time {
      font-size: 80px;
    }
    .date {
      font-size: 50px;
    }
  }
  .switch-button {
    font-size: 14px;
    color: #fff;
  }
}
</style>
