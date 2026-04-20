<template>
  <ScreenWrapper>
    <iframe src="/#/screen/network_iframe?name=核心网络拓扑" frameborder="0" class="iframe"></iframe>
  </ScreenWrapper>
</template>

<script>
import ScreenWrapper from 'components/ScreenWrapper'

export default {
  components: { ScreenWrapper }
}
</script>
<style lang="scss">
.iframe{
  width: 100%;
  height: 100%;
}
</style>
