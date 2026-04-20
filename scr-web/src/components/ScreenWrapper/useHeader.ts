import { reactive, toRefs, onUnmounted, ref, computed } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { enableFullScreen, disableFullScreen } from './tools'
import { getSystemConfigs } from 'services/system'
import { useAppStore } from '@/stores/app'

dayjs.locale('zh-cn')

const weekMap: Record<number, string> = {
  0: '星期日',
  1: '星期一',
  2: '星期二',
  3: '星期三',
  4: '星期四',
  5: '星期五',
  6: '星期六',
}

export default function useHeader(code: string) {
  const store = useAppStore()

  const title = computed(() => {
    return store.screenConfigs[code]
  })

  const state = reactive({
    currentTime: '',
  })

  let timer: ReturnType<typeof setInterval> | null = null

  onUnmounted(() => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  })

  function setTimer() {
    const getTime = () => {
      const time = dayjs()
      const weekDay = weekMap[time.day()]
      state.currentTime = `${time.format('YYYY年MM月DD日')} ${weekDay} ${time.format('HH:mm:ss')}`
    }
    getTime()
    timer = setInterval(() => {
      getTime()
    }, 1000)
  }
  setTimer()

  let isFull = false
  function operateScreen() {
    if (isFull) {
      disableFullScreen()
    } else {
      enableFullScreen()
    }
    isFull = !isFull
  }

  const logo = ref('')
  async function getLogo() {
    const data = await getSystemConfigs({ codes: 'loginLogo' })
    if (data.success) {
      logo.value = data.data.loginLogo
    }
  }
  if ((window as unknown as Record<string, Record<string, unknown>>).configs?.showLogo) getLogo()

  return {
    ...toRefs(state),
    logo,
    title,
    operateScreen,
  }
}
