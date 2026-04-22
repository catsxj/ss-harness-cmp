<template>
  <div class="ruleParam">
    <div class=flex>
      <el-button class="top_btn" type="primary" @click="add">新增基线值</el-button>
    </div>
    <div class="content">
      <!-- header -->
      <el-row :gutter="20" class="header item" type="flex">
        <el-col>基线名称</el-col>
        <el-col>规则</el-col>
        <el-col>基线值</el-col>
        <el-col>是否合规</el-col>
        <el-col>操作</el-col>
      </el-row>
      <!-- content -->
      <el-row type="flex" class="item" :gutter="20" v-for="(item, index) in itemData.complianceRule" :key="index">
        <el-col>
          <basic-form-item labelWidth="0" :prop="`complianceRule.${index}.name`" validate="required" required-message="请输入基线名称" :rule="[
            { pattern: /^\S.*$/, message: '名称不能以空格开头', trigger: ['blur', 'change'] }
          ]">
            <el-input v-model="item.name"></el-input>
          </basic-form-item>
        </el-col>
        <el-col>
          <basic-form-item labelWidth="0" :prop="`complianceRule.${index}.rule`" validate="required" required-message="请选择规则">
            <el-select v-model="item.rule" placeholder="" clearable filterable>
              <el-option v-for="item in ruleList"
                :key="item.id"
                :label="item.name"
                :value="item.code">
              </el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col>
          <basic-form-item labelWidth="0" :prop="`complianceRule.${index}.value`" validate="required" required-message="内容不能为空" maxlength="9999">
            <el-input v-model="item.value"></el-input>
          </basic-form-item>
        </el-col>
        <el-col>
          <basic-form-item labelWidth="0" :prop="`complianceRule.${index}.pass`" validate="required">
            <el-select v-model="item.pass" placeholder="" clearable filterable>
              <el-option v-for="item in passList"
                :key="item.id"
                :label="item.name"
                :value="item.code">
              </el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col>
          <el-button type="danger" @click="del(item)" :disabled="itemData.complianceRule.length === 1">删除</el-button>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { ruleList, passList } from '../utils/index'

export default {
  props: {
    itemData: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      ruleList,
      passList
    }
  },
  created () {
  },
  methods: {
    add () {
      this.itemData.complianceRule.push({
        rule: '',
        name: '',
        value: '',
        pass: true
      })
    },
    del (row) {
      const index = this.itemData.complianceRule.indexOf(row)
      if (index !== -1) {
        this.itemData.complianceRule.splice(index, 1)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.ruleParam {
  .content {
    text-align: center;

    .header {
      color: #666;
      font-size: 12px;
    }

    .item {
      margin-top: 10px;
    }
  }
}
</style>
