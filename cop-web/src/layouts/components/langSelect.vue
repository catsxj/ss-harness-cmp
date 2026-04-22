<template>
  <el-dropdown trigger="click" class="pull-right" @command="handleSetLanguage">
    <span class="lang-dropdown-link">
    {{$t(`lang.${language}`)}}<i class="el-icon-arrow-down el-icon--right"></i>
    </span>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item  command="zh">{{$t('lang.zh')}}</el-dropdown-item>
      <el-dropdown-item command="en">{{$t('lang.en')}}</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  computed: {
    language () {
      return this.$store.state.app.language
    }
  },
  methods: {
    handleSetLanguage (lang) {
      this.$i18n.locale = lang
      this.$store.commit('SET_LANGUAGE', lang)
    }
  }
}
</script>
<style scoped lang="scss">
  .lang-dropdown-link{
    float: right;
    font-size: 14px;
    color: #409EFF;
    margin-right: 5px;
    cursor: pointer;
  }
</style>
