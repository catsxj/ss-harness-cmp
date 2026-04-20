/** * Created by HaijunZhang on 2019/12/18. */
<template>
  <div class="right-container">
    <LockScreen></LockScreen>
    <process-item></process-item>
    <HelpItem v-if="userData" />
    <site-message></site-message>
    <personal-info></personal-info>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import PersonalInfo from './personal/index.vue'
import ProcessItem from './process.vue'
import SiteMessage from './SiteMessage.vue'
import LockScreen from './lockScreen.vue'
import HelpItem from './Help.vue'
import { useStore } from 'vuex'

const store = useStore()
const userData = computed(() => store.getters.userData)
</script>

<style lang="scss">
.right-container {
  display: flex;
  font-size: 18px;
}
</style>
