<template>
  <div class="lock-wrapper" @click.stop="">
    <div class="lock-center">
      <img class="logo" :src="userData?.portrait" />
      <p class="account">{{ userData?.name }}</p>
      <el-form :model="loginForm" ref="loginFormRef" @keyup.enter.prevent="handleLogin" @submit.prevent>
        <basic-form-item prop="password" validate="required" required-message="请输入密码">
          <el-input v-model="loginForm.password" placeholder="请输入密码" type="password">
            <template #append>
              <el-button type="primary" @click="handleLogin()" :loading="loading">
                <el-icon><Right /></el-icon>
              </el-button>
            </template>
          </el-input>
        </basic-form-item>
      </el-form>
      <el-button class="switch-button" type="text" @click="switchUser()">
        <el-icon><ArrowLeft /></el-icon>
        切换账户
      </el-button>
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
import type { FormInstance } from 'element-plus'
import { Right, ArrowLeft } from '@element-plus/icons-vue'
import dayjs from 'utils/day'
import crypto from 'utils/crypto'
import { setLoginData } from './tools'
import { login } from 'services/system'
import { useAppStore, usePermissionStore } from '@/stores'
import router, { resetRouter } from '@/router'

interface ILockData {
  isLock: boolean
  path: string
}

interface CurrentTime {
  time?: string
  date?: string
}

const routerInstance = useRouter()
const appStore = useAppStore()
const permissionStore = usePermissionStore()

const loginFormRef = ref<FormInstance>()
const loginForm = reactive({ password: '' })
const loading = ref(false)
const timer = ref<number>(0)
const currentTime = reactive<CurrentTime>({})
const lockData = ref<ILockData>({ isLock: false, path: '' })

const userData = computed(() => appStore.userData)

function init(): void {
  const raw = localStorage.getItem('lockData')
  if (raw) {
    try {
      lockData.value = JSON.parse(raw) as ILockData
    } catch {
      /* ignore */
    }
  }
  localStorage.setItem(
    'lockData',
    JSON.stringify({
      ...lockData.value,
      isLock: true
    })
  )
  setTimer()
}

function handleLogin(): void {
  if (!loginFormRef.value) return
  loginFormRef.value.validate((valid: boolean) => {
    if (valid) {
      loading.value = true
      login({
        account: (userData.value as any)?.account,
        password: crypto.encrypt(loginForm.password),
        isManager: true
      }).then((data: any) => {
        loading.value = false
        if (data.success) {
          setLoginData(data.data)
          routerInstance.replace(lockData.value.path)
          appStore.setOperateTime()
          localStorage.setItem(
            'lockData',
            JSON.stringify({
              ...lockData.value,
              isLock: false
            })
          )
        }
      })
    }
  })
}

function setTimer(): void {
  const getTime = () => {
    const time = dayjs()
    currentTime.time = time.format('HH:mm:ss')
    currentTime.date = `${time.format('MM月DD日')}, ${time.format('dddd')}`
  }
  getTime()
  timer.value = window.setInterval(() => {
    getTime()
  }, 1000)
}

function switchUser(): void {
  permissionStore.resetRoutes(router, resetRouter)
}

onMounted(init)

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = 0
  }
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
