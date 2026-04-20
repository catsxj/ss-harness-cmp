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
                <el-radio v-model="optionData.defaultValue" :label="item.value" class="m-t-sm"></el-radio>
              </el-col>
              <el-col :span="10">
                <el-input v-model="item.name" placeholder="描述"></el-input>
              </el-col>
              <el-col :span="10">
                <el-input v-model="item.value" placeholder="属性"></el-input>
              </el-col>
              <el-col :span="2">
                <div class="m-t-xs text-danger">
                  <Icon type=" icon-delete cur-point" @click.native="tools.removeItem(key, optionData.item)" />
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
        <el-select v-model="optionData.defaultValue" placeholder="请选择">
          <el-option v-for="(item, key) in optionData.item" :key="key" :label="item.name" :value="item.value"> </el-option>
        </el-select>
      </el-col>
      <el-col class="field-item-operate" v-show="!optionData.reserved">
        <Icon type=" icon-delete" @click.native.stop="$emit('remove')" />
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
