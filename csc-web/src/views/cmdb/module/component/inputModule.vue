<template>
  <el-row>
    <el-popover ref="popover" placement="right" @show="tools.togglePopover(item)" @hide="tools.togglePopover(item)" trigger="click">
      <el-row class="field-options">
        <el-col :span="24" class="field-options-title">
          <span class="title">编辑属性</span>
          <div class="pull-right">
            <Icon type=" icon-guanjianzi" />
            关键属性
            <el-switch v-model="optionData.uniqued" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
          </div>
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
          <label>默认值：</label>
          <div>
            <el-input v-model="optionData.defaultValue" :disabled="optionData.reserved"></el-input>
          </div>
        </el-col>
        <el-col :span="24" class="field-options-item">
          <label>必填：</label>
          <el-checkbox v-model="optionData.required" :disable="optionData.reserved"></el-checkbox>
        </el-col>
        <el-col :span="24" class="field-options-item">
          <label>校验规则：</label>
          <div>
            <el-select v-model="optionData.regexpId" placeholder="请选择">
              <el-option value="" label="无校验"></el-option>
              <el-option v-for="item in regexpData" :key="item.id" :label="item.name" :value="item.id"> </el-option>
            </el-select>
          </div>
        </el-col>
        <el-col :span="24" class="field-options-item">
          <label class="required">文本最大长度：</label>
          <div>
            <el-input v-model="optionData.length" type="number" :disabled="optionData.reserved" @blur="tools.validateLength(optionData)"></el-input>
          </div>
        </el-col>
      </el-row>
    </el-popover>
    <el-row v-popover:popover class="field-item" :class="{ selected: item.selected }">
      <el-col class="field-item-name">
        <label :class="{ required: optionData.required }">
          <Icon type="icon-guanjianzi" v-show="optionData.uniqued" />
          {{ optionData.name }}：</label
        >
      </el-col>
      <el-col class="field-item-value">
        <el-input v-model="optionData.defaultValue"></el-input>
      </el-col>
      <el-col class="field-item-operate" v-show="!optionData.reserved">
        <Icon type="icon-delete" @click.native.stop="$emit('remove')" />
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

  created() {},
  mounted() {}
}
</script>
<style scope></style>
