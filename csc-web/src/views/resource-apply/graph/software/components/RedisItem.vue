<template>
  <basic-form :model="itemData" ref="form" :disabled="isPreview">
    <el-row>
      <el-col :span="12">
        <basic-form-item label="软件版本：" prop="version" validate="required">
          <el-select filterable v-model="itemData.version" placeholder="版本">
            <el-option v-for="(row, index) in versionData" :key="index" :label="row.name" :value="row.value"> </el-option>
          </el-select>
        </basic-form-item>
      </el-col>
      <el-col :span="12">
        <basic-form-item label="密码设置：" prop="manage_config.redis_password" validate="required">
          <el-input type="password" v-model="itemData.manage_config.redis_password" placeholder="密码设置" show-password></el-input>
        </basic-form-item>
      </el-col>
      <el-col :span="12" v-if="module === 'cluster'">
        <basic-form-item label="集群模式：" prop="cluster_type" validate="required" :disabled="isTaskInstance">
          <el-select filterable v-model="itemData.cluster_type">
            <el-option v-for="item in redisClusterTypeList" :key="item.value" :label="item.name" :value="item.value"> </el-option>
          </el-select>
        </basic-form-item>
      </el-col>
    </el-row>
  </basic-form>
</template>
<script>
import { cloneDeep } from 'lodash-es'
import node from '../../mixins/index'
import show from '../../mixins/show'
import { getDictChildren } from 'services/system/dictionary'
import { encrypt, decrypt } from 'utils/crypto'
import { redisClusterTypeList } from '../data'
export default {
  mixins: [node, show],
  props: {
    module: {
      type: String
    },
    itemData: {
      type: Object,
      default: function () {
        return {
          version: '',
          manage_config: {
            redis_password: '',
            sentinel_install: false
          }
        }
      }
    }
  },
  data() {
    return {
      versionData: [],
      redisClusterTypeList
    }
  },
  created() {
    this.getVersion()
    const {
      manage_config: { redis_password }
    } = this.itemData
    if (redis_password) {
      this.itemData.manage_config.redis_password = decrypt(redis_password)
    }
  },
  methods: {
    getVersion() {
      getDictChildren({ value: 'REDIS-VERSION' }).then((data) => {
        if (data.success) {
          this.versionData = data.data
        }
      })
    },
    getPostData() {
      let data = false
      this.$refs.form.validate((valid) => {
        if (valid) {
          const itemData = cloneDeep(this.itemData)
          const {
            manage_config: { redis_password },
            cluster_type
          } = itemData
          if (redis_password) {
            itemData.manage_config.redis_password = encrypt(redis_password)
          }
          // 哨兵安装
          if (cluster_type === 'omtsts') itemData.manage_config.sentinel_install = true
          data = itemData
        }
      })
      return data
    }
  }
}
</script>
<style></style>
