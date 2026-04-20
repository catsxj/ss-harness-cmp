import { reactive, toRefs, onUnmounted, ref, computed } from '@vue/composition-api'
import moment from 'moment'
import 'moment/locale/zh-cn'
import { enableFullScreen, disableFullScreen } from './tools'
import { getSystemConfigs } from 'services/system'

export default function (store, code) {
  const title = computed(() => {
    return store.getters.screenConfigs[code]
  })
  const state = reactive({
    currentTime: ''
  })
  let timer = null
  onUnmounted(() => {
    clearInterval(timer)
    timer = null
  })
  function setTimer() {
    const getTime = () => {
      const time = moment()
      state.currentTime = `${time.format('YYYY年MM月DD日 dddd HH:mm:ss')}`;
    }
    getTime()
    timer = setInterval(() => {
      getTime()
    }, 1000)
  }
  setTimer();
  let isFull = false;
  function operateScreen() {
    if (isFull) {
      disableFullScreen()
    } else {
      enableFullScreen()
    }
    isFull = !isFull;
  }
  // 获取logo
  const logo = ref('');
  async function getLogo () {
    const data = await getSystemConfigs({ codes: 'loginLogo' });
    if (data.success) {
      logo.value = data.data.loginLogo;
    }
  }
  if (window.configs?.showLogo) getLogo()
  return {
    ...toRefs(state),
    logo,
    title,
    operateScreen
  }
}
