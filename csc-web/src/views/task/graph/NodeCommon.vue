<template>
  <CardLayout title="基本信息">
    <el-switch slot="operate" class="advance-setting" v-model="showAdvance" active-text="高级设置" v-if="!isHideOperate"></el-switch>
    <basic-form :model="itemData" ref="form" :disabled="isPreview">
      <el-row :gutter="10">
        <el-col :span="12">
          <basic-form-item validate="required" required-message="请输入节点名称" prop="label" label="节点名称：" :rule="nameRule">
            <el-input v-model="itemData.label" :disabled="isPreview || currentNode.ignore"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item validate="required" required-message="请输入超时时间" prop="timeout" label="超时时间：">
            <el-input type="number" v-model="itemData.timeout" @blur="validateNumber(itemData, 'timeout', 600, maxTimeout)" :min="1" :max="maxTimeout">
              <template slot="append">秒</template>
            </el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="10" v-if="showAdvance">
        <el-col :span="12">
          <basic-form-item label="节点操作：">
            <el-checkbox v-model="itemData.suspensible" v-show="!hideSuspend">成功暂停</el-checkbox>
            <el-checkbox v-model="itemData.skippable" :disabled="isPreview">失败跳过</el-checkbox>
            <el-checkbox v-model="itemData.failover" :disabled="isPreview">失败重试</el-checkbox>
          </basic-form-item>
        </el-col>
        <template v-if="itemData.failover">
          <el-col :span="12">
            <el-form-item label="重试次数：">
              <el-input type="number" v-model.number="itemData.retryTime" @blur="validateNumber(itemData, 'retryTime', 3, 10)" :min="1" :max="10"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="重试时间：">
              <el-input type="number" v-model.number="itemData.intervals" @blur="validateNumber(itemData, 'intervals', 10, maxTimeout)" :min="1" :max="maxTimeout">
                <template slot="append">秒</template>
              </el-input>
            </el-form-item>
          </el-col>
        </template>
        <el-col :span="12" v-if="itemData.suspensible">
          <el-form-item label="暂停描述：">
            <el-input v-model="itemData.suspendMsg"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </basic-form>
  </CardLayout>
</template>
<script>
import { computed, reactive, ref } from '@vue/composition-api'
import node from './mixins/index'
import show from './mixins/show'

const defaultControl = {
  suspensible: false,
  skippable: false,
  failover: false,
  timeout: 60 * 30,
  retryTime: 3,
  intervals: 10,
  suspendMsg: ''
}
export default {
  mixins: [node, show],
  props: {
    currentNode: {
      type: Object
    }
  },
  setup(props) {
    const { label, control = defaultControl } = props.currentNode
    const itemData = reactive({
      label,
      ...control
    })
    // 高级设置回现，当这三个属性有值时，说明打开了高级设置
    const showAdvance = ref(control.suspensible || control.skippable || control.failover)
    const isHideOperate = computed(() => props.currentNode.code.indexOf('task.resource') > -1)
    const maxTimeout = 60 * 60 * 24
    function validateNumber(data, item, defaultValue, maxTime = maxTimeout) {
      if (!data[item]) {
        data[item] = defaultValue
        return
      }
      const second = Math.abs(Math.round(data[item]))
      data[item] = second > maxTime ? maxTime : second
    }
    return {
      nameRule: [
        {
          validator: (rule, value, callback) => {
            const chineseArr = value.match(/[\u4e00-\u9fa5]/g)
            const chineseLen = (chineseArr && chineseArr.length) || 0
            if (value.length + chineseLen > 18) {
              callback(new Error('最多输入6个字符，汉字为两个字符'))
            } else {
              callback()
            }
          }
        }
      ],
      itemData,
      showAdvance,
      maxTimeout,
      isHideOperate,
      validateNumber
    }
  },
  data() {
    return {
      hideSuspend: false
    }
  }
}
</script>
<style lang="scss" scoped>
.advance-setting {
  margin-right: 10px;
  ::v-deep .el-switch__label {
    margin-left: 5px;
    * {
      font-size: 12px !important;
    }
  }
}
</style>
