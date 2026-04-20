<template>
  <el-row>
    <el-popover ref="popover" placement="right" @show="tools.togglePopover(item)" @hide="tools.togglePopover(item)" trigger="click">
      <el-row class="field-options">
        <el-col :span="24" class="field-options-title">
          <span class="title">编辑属性</span>
        </el-col>
        <el-col :span="24" class="field-options-item m-t-sm">
          <label class="required">表格名称：</label>
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
          <label class="required">列名：</label>
          <label class="pull-right">
            <el-button type="primary" size="mini" @click="tools.addItem(optionData.item)"><i class="iconfont icon-Added" /> 添加 </el-button>
          </label>
        </el-col>
        <el-col :span="24">
          <el-row :gutter="5" v-for="(item, key) in optionData.item" :key="key">
            <el-col :span="24" v-if="item !== ''" class="m-b-sm">
              <el-col :span="20">
                <el-input v-model="item.name" placeholder="列名" @blur="updateDom()"></el-input>
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
        <el-table :data="tableData" empty-text="" stripe fit style="width: 100%">
          <el-table-column v-for="(item, key) in optionData.item" :key="key" prop="value" :label="item.name">
            <template slot-scope="scope">
              <el-input v-model="tableData[scope.$index][key]"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="60" class="text-center">
            <template slot-scope="scope">
              <el-dropdown @command="tools.handleOperate" placement="bottom-start">
                <span class="el-dropdown-link cur-point"><Icon type=" icon-config" /></span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item :command="{ flag: 1, index: scope.$index, item: tableData }">插入行</el-dropdown-item>
                  <el-dropdown-item :command="{ flag: 2, index: scope.$index, item: tableData }">删除行</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
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
      tableData: [{}],
      item: {
        selected: false
      }
    }
  },

  created() {},
  mounted() {},
  methods: {
    updateDom() {
      const { item } = this.optionData
      item.push('')
      setTimeout(() => {
        item.pop()
      })
    }
  }
}
</script>
<style scope></style>
