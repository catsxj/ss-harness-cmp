<template>
  <div class="lock-wrapper" @click.stop>
    <div class="lock-center">
      <img class="logo" :src="userData.portrait" />
      <p class="account">{{ userData.name }}</p>
      <a-form :model="loginForm" ref="loginFormRef" @keyup.enter.prevent="handleLogin" @submit.prevent>
        <a-form-item name="password" :rules="[{ ...required, message: '请输入密码' }]">
          <a-input-password v-model:value="loginForm.password" placeholder="请输入密码">
            <template #addonAfter>
              <a-button class="text-white login-btn" @click="handleLogin()" :loading="loading">
                <template #icon>
                  <ArrowRightOutlined />
                </template>
              </a-button>
            </template>
          </a-input-password>
        </a-form-item>
      </a-form>
      <a-button class="switch-button" type="text" @click="switchUser()">
        <template #icon>
          <LeftOutlined />
        </template>
        切换账户
      </a-button>
    </div>
    <div class="date-time">
      <div class="time">{{ currentTime.time }}</div>
      <div class="date">{{ currentTime.date }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import dayjs from 'utils/day'
import { encrypt } from 'utils/crypto'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { login } from 'services'
import { computed, defineComponent, onMounted, onUnmounted, reactive, ref, toRefs } from 'vue'
import setLoginData from './tools'
import { required } from '@/validate'
import { ArrowRightOutlined, LeftOutlined } from '@ant-design/icons-vue'

export default defineComponent({
  components: { ArrowRightOutlined, LeftOutlined },
  setup() {
    const state = reactive({
      loginForm: {
        password: '',
      },
      loading: false,
    })
    let timer: any = 0
    const store = useStore()
    const userData = computed(() => store.getters.userData || {})
    // 当前时间设置
    const currentTime = ref({
      time: '',
      date: '',
    })
    function setTimer() {
      const getTime = () => {
        const time = dayjs()
        currentTime.value = {
          time: time.format('HH:mm:ss'),
          date: `${time.format('MM月DD日')}, ${time.format('dddd')}`,
        }
      }
      getTime()
      timer = setInterval(() => {
        getTime()
      }, 1000)
    }
    let lockData = {
      isLock: false,
      path: '',
    }
    onMounted(() => {
      const lockDataItem = localStorage.getItem('lockData')
      if (lockDataItem) lockData = JSON.parse(lockDataItem)
      // 处理通过路由进入锁屏
      localStorage.setItem(
        'lockData',
        JSON.stringify({
          ...lockData,
          isLock: true,
        })
      )
      setTimer()
    })
    onUnmounted(() => {
      clearInterval(timer)
    })
    function switchUser() {
      store.dispatch('permission/ResetRoutes')
    }
    const loginFormRef = ref()
    const router = useRouter()
    async function handleLogin() {
      try {
        const values = await loginFormRef.value.validate()
        state.loading = true
        const res = await login({
          account: userData.value.account,
          password: encrypt(values.password),
          isManager: true,
        })
        if (res.success) {
          setLoginData(res.data)
          router.replace(lockData.path)
          store.commit('SET_OPERATETIME')
          localStorage.setItem(
            'lockData',
            JSON.stringify({
              ...lockData,
              isLock: false,
            })
          )
        }
      } catch (error) {
        console.log(error)
      }
      state.loading = false
    }
    return {
      ...toRefs(state),
      currentTime,
      userData,
      loginFormRef,
      required,
      switchUser,
      handleLogin,
    }
  },
})
</script>

<style lang="scss" scoped>
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
    .login-btn {
      background: #6b7485;
      border: none;
      width: 48px;
    }
    ::v-deep(.ant-input-group-addon) {
      border: none;
      padding: 0;
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
