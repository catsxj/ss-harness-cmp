/** * Created by Zhang Haijun on 2018/1/11. */
<template>
  <el-form :label-width="labelWidth" :model="item" :disabled="disabled">
    <el-form-item :label="item.name + ':'" :title="item.name" prop="defaultValue" :rules="{ required: item.required, message: '该属性不能为空' }">
      <el-input v-model="item.defaultValue" v-if="item.type == 'TEXTFIELD'"></el-input>
      <el-input v-model="item.defaultValue" type="textarea" v-else-if="item.type == 'TEXTAREA'"></el-input>
      <el-radio-group v-model="item.defaultValue" class="m-t-sm" v-else-if="item.type == 'RADIO'">
        <el-radio :label="item1.value" v-for="(item1, key) in item.item" :key="key">{{ item1.name }}</el-radio>
      </el-radio-group>
      <el-select v-model="item.defaultValue" placeholder="请选择" v-else-if="item.type == 'SELECT'">
        <el-option v-for="(item1, key) in item.item" :key="key" :label="item1.name" :value="item1.value"> </el-option>
      </el-select>
      <el-checkbox-group v-model="item.defaultValue" v-else-if="item.type == 'CHECKBOX'">
        <el-checkbox :label="item1.value" v-for="(item1, key) in item.item" :key="key">{{ item1.name }}</el-checkbox>
      </el-checkbox-group>
      <el-table v-else-if="item.type == 'TABLE'" :data="item.grid" empty-text="" border style="width: 100%">
        <el-table-column v-for="(item1, key) in item.item" :key="key" :label="item1.name">
          <template slot-scope="scope">
            <el-input v-model="item.grid[scope.$index][item1.value]"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="60" class="text-center">
          <template slot-scope="scope">
            <el-dropdown @command="tools.handleOperate" placement="bottom-start">
              <span class="el-dropdown-link cur-point" @click.stop><i class="el-icon-setting"></i></span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :disabled="disabled" :command="{ flag: 1, index: scope.$index, item: item.grid }">插入行 </el-dropdown-item>
                <el-dropdown-item :disabled="disabled" :command="{ flag: 2, index: scope.$index, item: item.grid }">删除行 </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
        <div slot="empty">
          <el-button type="primary" size="mini" @click="tools.handleOperate({ flag: 3, item: item.grid })"><i class="el-icon-plus" />添加数据 </el-button>
        </div>
      </el-table>
      <el-input v-else-if="item.type == 'INTEGER'" v-model.number="item.defaultValue" type="number" @blur="validateInteger(item)">
        <template slot="append" v-if="item.unit">{{ item.unit }}</template>
      </el-input>
      <el-input v-model.number="item.defaultValue" type="number" v-else-if="item.type === 'FLOAT'" @blur="validateFloat(item)">
        <template slot="append" v-if="item.unit">{{ item.unit }}</template>
      </el-input>
      <el-input v-model="item.defaultValue" :type="showType" v-else-if="item.type === 'TEXTENCRYPT'" show-password> </el-input>
      <el-date-picker class="w-full" v-else-if="item.type === 'DATE'" v-model="item.defaultValue" type="date" value-format="yyyy-MM-dd" placeholder="选择日期"> </el-date-picker>
      <el-date-picker class="w-full" v-else-if="item.type == 'TIME'" v-model="item.defaultValue" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="选择日期时间"> </el-date-picker>
      <el-select v-model="item.defaultValue" placeholder="请选择" v-else-if="item.type == 'QUOTE'">
        <el-option v-for="item1 in item.quoteData" :key="item1.id" :label="item1.bname" :value="item1.id.toString()"> </el-option>
      </el-select>
    </el-form-item>
  </el-form>
</template>
<script>
import * as tools from './moduleTools'

export default {
  props: {
    item: {
      type: Object
    },
    disabled: {
      type: Boolean,
      default: false
    },
    labelWidth: {
      type: String,
      default: '150px'
    }
  },
  data() {
    return {
      tools,
      showType: 'password' // 加密数据默认password
    }
  },
  created() {},
  mounted() {},
  methods: {
    validateInteger(item) {
      if (!item.defaultValue) return
      item.defaultValue = Math.round(item.defaultValue)
      if (item.maxValue && item.defaultValue > item.maxValue) item.defaultValue = item.maxValue
      if (item.minValue && item.defaultValue < item.minValue) item.defaultValue = item.minValue
    },
    validateFloat(item) {
      if (!item.defaultValue) return
      item.defaultValue = Number(item.defaultValue).toFixed(item.decimalNum)
    }
  }
}
</script>
<style scoped>
.el-form-item >>> .el-form-item__label {
  overflow: hidden;
  text-overflow: ellipsis;
}
.cmdb-form .el-collapse-item {
  margin-bottom: 10px;
}

.cmdb-form .el-collapse-item.is-active {
  border: 1px solid #eee;
  border-bottom: none;
}

.cmdb-form .el-collapse-item__header {
  padding: 0 10px;
  background: #f1e8e8;
}

.cmdb-form .el-collapse-item__content {
  padding: 15px;
}

.w-full .el-input-number .el-input__inner {
  text-align: left;
}
</style>
