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
          <label class="required">引用对象：</label>
          <div>
            <el-select v-model="optionData.linkModuleId" filterable placeholder="请选择" @change="getQuoteData">
              <el-option v-for="item in moduleData" :key="item.id" :label="item.name" :value="item.id"> </el-option>
            </el-select>
          </div>
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
        <el-select v-model="quote" placeholder="请选择">
          <el-option v-for="item in quoteData" :key="item.id" :label="item.bname" :value="item.id"> </el-option>
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
import { getInstance } from 'services/cmdb/instance'
import { getModule } from 'services/cmdb/module'

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
      quote: '',
      item: {
        selected: false
      },
      quoteData: [],
      moduleData: []
    }
  },

  created() {
    this.getModule()
    if (this.optionData.id) this.getQuoteData()
  },
  mounted() {},
  methods: {
    getModule() {
      getModule().then(data => {
        if (data.success) {
          this.moduleData = data.data
        }
      })
    },
    getQuoteData() {
      getInstance({
        simple: true,
        showTitle: true,
        params: JSON.stringify([{ param: { moduleId: this.optionData.linkModuleId }, sign: 'EQ' }])
      }).then(data => {
        if (data.success) {
          this.quoteData = data.data.rows
        }
      })
    }
  }
}
</script>
<style scope></style>
