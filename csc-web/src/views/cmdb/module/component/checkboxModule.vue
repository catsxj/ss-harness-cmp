<template>
  <el-row>
    <el-popover ref="popover" placement="right" @show="tools.togglePopover(item)" @hide="tools.togglePopover(item)" trigger="click">
      <el-row class="field-options">
        <el-col :span="24" class="field-options-title">
          <span class="title">编辑属性</span>
        </el-col>
        <el-col :span="24" class="field-options-item m-t-sm">
          <label class="required">字段名：</label>
          <div>
            <el-input v-model="optionData.name"></el-input>
          </div>
        </el-col>
        <el-col :span="24" class="field-options-item">
          <label class="required">属性编码：</label>
          <div>
            <el-input v-model="optionData.code" :disabled="optionData.reserved"></el-input>
          </div>
        </el-col>
        <el-col :span="24" class="field-options-item">
          <label>必填：</label>
          <el-checkbox v-model="optionData.required" :disable="optionData.reserved"></el-checkbox>
        </el-col>
        <el-col :span="24" class="field-options-item">
          <label class="required">值：</label>
          <label class="pull-right">
            <el-button type="primary" size="mini" @click="tools.addItem(optionData.item)"><i class="iconfont icon-Added" /> 添加 </el-button>
          </label>
        </el-col>
        <el-col :span="24">
          <el-row :gutter="5">
            <el-col :span="24" v-for="(item, key) in optionData.item" :key="key" class="m-b-sm">
              <el-col :span="2">
                <el-checkbox v-model="item.checked" :label="item.value" class="m-t-sm" @change="selectItem"></el-checkbox>
              </el-col>
              <el-col :span="10">
                <el-input v-model="item.name" placeholder="描述"></el-input>
              </el-col>
              <el-col :span="10">
                <el-input v-model="item.value" placeholder="属性"></el-input>
              </el-col>
              <el-col :span="2">
                <div class="m-t-xs text-danger">
                  <span @click="tools.removeItem(key, optionData.item)"><Icon type=" icon-delete cur-point" /></span>
                </div>
              </el-col>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </el-popover>
    <el-row v-popover:popover class="field-item" :class="{ selected: item.selected }">
      <el-col class="field-item-name">
        <label :class="{ required: optionData.required }">
          <Icon type=" icon-guanjianzi" v-show="optionData.uniqued" />
          {{ optionData.name }}：</label
        >
      </el-col>
      <el-col class="field-item-value">
        <el-checkbox v-model="item.checked" class="m-t-sm" :label="item.value" v-for="(item, key) in optionData.item" :key="key" @change="selectItem">{{ item.name }} </el-checkbox>
      </el-col>
      <el-col class="field-item-operate" v-show="!optionData.reserved">
        <span @click.stop="$emit('remove')"><Icon type=" icon-delete" /></span>
      </el-col>
    </el-row>
  </el-row>
</template>
<script>
import * as tools from './tools'

export default {
  props: {
    optionData: {
      type: Object
    },
    regexpData: {
      type: Array
    }
  },
  data() {
    return {
      tools,
      item: {
        selected: false
      }
    }
  },

  created() {
    if (this.optionData.id) {
      this.initData()
    }
  },
  mounted() {},
  methods: {
    initData() {
      this.optionData.item.forEach(item => {
        this.$set(item, 'checked', false)
        if (this.optionData.defaultValue.indexOf(item.value) > -1) {
          item.checked = true
        }
      })
    },
    selectItem() {
      const defaultValue = []
      this.optionData.item.forEach(item => {
        if (item.checked) {
          defaultValue.push(item.value)
        }
      })
      this.optionData.defaultValue = defaultValue.join(',')
    }
  }
}
</script>
<style scope></style>
