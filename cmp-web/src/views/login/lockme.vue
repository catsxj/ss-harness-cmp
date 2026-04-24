<template>
  <div class="lock-wrapper" @click.stop="">
    <div class="lock-center">
      <img class="logo" :src="userData.portrait" />
      <p class="account">{{ userData.name }}</p>
      <el-form :model="loginForm" ref="loginFormRef" @keyup.enter.prevent="handleLogin" @submit.prevent>
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

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'utils/day'
// @ts-ignore
import crypto from 'utils/crypto'
import { setLoginData } from './tools'
import { login } from 'services/system'
import { useAppStore, usePermissionStore } from '@/stores'
import { resetRouter } from '@/router'

interface ILockData {
  isLock: boolean
  path: string
}

const router = useRouter()
const appStore = useAppStore()
const permissionStore = usePermissionStore()

const loginForm = reactive({ password: '' })
const loading = ref(false)
let timer: ReturnType<typeof setInterval> | null = null
const currentTime = ref<{ time?: string; date?: string }>({})
const lockData = ref<ILockData>({ isLock: false, path: '' })
const loginFormRef = ref<any>(null)

const userData = computed<any>(() => appStore.userData || {})

function getTime() {
  const t = dayjs()
  currentTime.value = {
    time: t.format('HH:mm:ss'),
    date: `${t.format('MM月DD日')}, ${t.format('dddd')}`
  }
}

function setTimer() {
  getTime()
  timer = setInterval(getTime, 1000)
}

function handleLogin() {
  loginFormRef.value?.validate?.((valid: boolean) => {
    if (!valid) return
    loading.value = true
    login({
      account: userData.value.account,
      password: crypto.encrypt(loginForm.password),
      isManager: true
    }).then((data: any) => {
      loading.value = false
      if (data.success) {
        setLoginData(data.data)
        router.replace(lockData.value.path)
        appStore.setOperateTime()
        localStorage.setItem(
          'lockData',
          JSON.stringify({ ...lockData.value, isLock: false })
        )
      }
    })
  })
}

function switchUser() {
  permissionStore.resetRoutes(router, resetRouter)
}

onMounted(() => {
  const stored = localStorage.getItem('lockData')
  if (stored) lockData.value = JSON.parse(stored)
  localStorage.setItem(
    'lockData',
    JSON.stringify({ ...lockData.value, isLock: true })
  )
  setTimer()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
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
