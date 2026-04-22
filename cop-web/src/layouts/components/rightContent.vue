/**
* Created by HaijunZhang on 2019/12/18.
*/
<template>
  <div class="right-container">
    <LockScreen></LockScreen>
    <!-- <theme :themeData="themeData" style="margin-right: 20px"></theme> -->
    <process></process>
    <site-message></site-message>
    <personal></personal>
    <!-- <LangSelect></LangSelect> -->
  </div>
</template>

<script>
import Personal from './personal/index.vue'
import Process from './process.vue'
import SiteMessage from './SiteMessage.vue'
import LockScreen from './lockScreen.vue'
// import LangSelect from './langSelect'

export default {
  components: {
    Personal,
    Process,
    SiteMessage,
    LockScreen
  },
  data() {
    return {
    }
  }
}
</script>

<style lang="scss">
.right-container {
  display: flex;
}
</style>
