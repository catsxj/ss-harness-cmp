<template>
  <el-row>
    <el-col :span="12" v-for="(item, index) in options" :key="index">
      <basic-form-item :label="`配置项${index + 1}：`" maxlength="5000">
        <el-input v-model="options[index]" :type="type" :placeholder="placeholder">
          <el-button slot="append" @click="removeItem(options, index)"><i class="el-icon-delete" /></el-button>
        </el-input>
        <i v-if="type === 'textarea' && !isPreview" class="el-icon-delete cur-pointer area-del" @click="removeItem(options, index)"></i>
      </basic-form-item>
    </el-col>
  </el-row>
</template>
<script>
import software from './mixins/itemOperate'
import show from '../mixins/show'
export default {
  mixins: [software, show],
  props: {
    options: {
      type: Array
    },
    type: {
      type: String,
      default: 'text'
    },
    placeholder: {
      type: String,
      default: '请输入内容'
    }
  },
  data() {
    return {}
  },
  created() {},
  methods: {}
}
</script>
<style scoped>
.area-del {
  position: absolute;
  right: 0;
  top: -15px;
  cursor: pointer;
  color: #2d8cf0;
}
</style>
