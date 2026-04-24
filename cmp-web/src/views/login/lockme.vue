<template>
  <div class="lock-wrapper" @click.stop="">
    <div class="lock-center">
      <img class="logo" :src="userData.portrait" />
      <p class="account">{{ userData.name }}</p>
      <el-form :model="loginForm" ref="loginForm" @keyup.enter.prevent="handleLogin" @submit.prevent>
        <basic-form-item prop="password" validate="required" required-message="请输入密码">
          <el-input v-model="loginForm.password" placeholder="请输入密码" type="password">
            <template #append>
              <el-button type="primary" @click="handleLogin()" :loading="loading" icon="el-icon-right"> </el-button>
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

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import dayjs from 'utils/day'
import crypto from 'utils/crypto.js'
import { setLoginData } from './tools'
import { login } from 'services/system'

interface ILockData {
  isLock: boolean
  path: string
}
@Component
export default class Lock extends Vue {
  private loginForm = {
    password: ''
  }

  private loading: boolean = false
  private timer: number = 0
  private currentTime = {}
  private lockData: ILockData = {
    isLock: false,
    path: ''
  }

  get userData() {
    return this.$store.getters.userData
  }

  private created() {
    const lockData = localStorage.getItem('lockData')
    if (lockData) this.lockData = JSON.parse(lockData)
    // 处理通过路由进入锁屏
    localStorage.setItem(
      'lockData',
      JSON.stringify({
        ...this.lockData,
        isLock: true
      })
    )
    this.setTimer()
  }

  private destroyed() {
    clearInterval(this.timer)
  }

  private handleLogin() {
    ;(this.$refs.loginForm as any).validate((valid: boolean) => {
      if (valid) {
        this.loading = true
        login({
          account: this.userData.account,
          password: crypto.encrypt(this.loginForm.password),
          isManager: true
        }).then((data: any) => {
          this.loading = false
          if (data.success) {
            setLoginData(data.data)
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
  }

  private setTimer() {
    const getTime = () => {
      const time = dayjs()
      this.currentTime = {
        time: time.format('HH:mm:ss'),
        date: `${time.format('MM月DD日')}, ${time.format('dddd')}`
      }
    }
    getTime()
    this.timer = setInterval(() => {
      getTime()
    }, 1000)
  }

  private switchUser() {
    this.$store.dispatch('permission/ResetRoutes')
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
