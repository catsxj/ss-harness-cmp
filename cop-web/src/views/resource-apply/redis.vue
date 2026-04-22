/**
* Created by HaijunZhang on 2019/4/28.
*/
<template>
  <software-install ref="softRef" service="kvs.redis" version-key="REDIS-VERSION" :configs="configs" :get-params="getParams"  :item-data="itemData"  @showData="handleShowData" v-bind="$attrs">
    <basic-form :model="manage_config" ref="addForm" label-position="left">
      <basic-form-item label="密码设置：" validate="required,datebasePasswords" prop="redis_password">
        <el-input class="w" v-model="manage_config.redis_password" placeholder="请输入密码" show-password></el-input>
      </basic-form-item>
      <basic-form-item label="确认密码：" validate="required,datebasePasswords" prop="confirm_redis_password">
        <el-input class="w" v-model="manage_config.confirm_redis_password" placeholder="请确认密码" show-password></el-input>
      </basic-form-item>
    </basic-form>
  </software-install>
</template>

<script>
import SoftwareInstall from './components/SoftwareInstall.vue'
import software_config from './data/redis'
import crypto from 'utils/crypto'

export default {
  components: { SoftwareInstall },
  props: {
    itemData: {
      type: Object
    }
  },
  data () {
    return {
      configs: {
        software_config
      },
      manage_config: {
        redis_password: '',
        confirm_redis_password: '',
        sentinel_install: false
      }
    }
  },
  methods: {
    getApplyData() {
      return this.$refs.softRef.getPostData();
    },
    handleShowData(configs) {
      const {
        manage_config: { sentinel_install, redis_password }
      } = configs
      const p = crypto.decrypt(redis_password)
      this.manage_config = {
        sentinel_install,
        redis_password: p,
        confirm_redis_password: p
      }
    },
    // 数据校验+返回参数
    getParams () {
      let data = false;
      this.$refs.addForm.validate(valid => {
        if (valid) {
          const { redis_password, confirm_redis_password, sentinel_install } = this.manage_config;
          if (redis_password !== confirm_redis_password) {
            this.$message.error('两次密码输入不一致');
            return false
          }
          data = {
            manage_config: { redis_password: crypto.encrypt(redis_password), sentinel_install }
          };
        }
      });
      return data;
    }
  }
}
</script>
