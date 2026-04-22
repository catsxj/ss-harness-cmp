<template>
  <div class="ruleParam">
    <div class=flex>
      <el-button class="top_btn" type="primary" @click="add">新增阈值</el-button>
      <el-radio-group style="margin-left: 20px;" v-model="itemData.multiCompare">
        <el-radio label="one">单值匹配</el-radio>
        <el-radio label="more">多值匹配</el-radio>
      </el-radio-group>
    </div>
    <div class="content">
      <!-- header -->
      <el-row :gutter="20" class="header item" type="flex">
        <template v-if="itemData.multiCompare === 'more'">
          <el-col>名称</el-col>
          <el-col>取值</el-col>
        </template>
        <el-col>规则</el-col>
        <el-col>阈值</el-col>
        <el-col>告警级别</el-col>
        <el-col>告警描述</el-col>
        <el-col>操作</el-col>
      </el-row>
      <!-- content -->
      <el-row type="flex" class="item" :gutter="20" v-for="(item, index) in itemData.targetRule" :key="index">
        <template v-if="itemData.multiCompare === 'more'">
          <el-col>
            <basic-form-item labelWidth="0" :prop="`targetRule.${index}.keyName`" validate="required" required-message="内容不能为空">
              <el-input v-model.trim="item.keyName"></el-input>
            </basic-form-item>
          </el-col>
          <el-col>
            <basic-form-item labelWidth="0" :prop="`targetRule.${index}.key`" validate="required" required-message="内容不能为空">
              <el-input v-model.trim="item.key"></el-input>
            </basic-form-item>
          </el-col>
        </template>
        <el-col>
          <basic-form-item labelWidth="0" :prop="`targetRule.${index}.rule`" validate="required" required-message="请选择规则">
            <el-select v-model="item.rule" filterable>
              <el-option v-for="item in ruleList"
                :key="item.id"
                :label="item.name"
                :value="item.code">
              </el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col>
          <basic-form-item labelWidth="0" :prop="`targetRule.${index}.threshold`" validate="required" required-message="内容不能为空">
            <el-input v-model.trim="item.threshold"></el-input>
          </basic-form-item>
        </el-col>
        <el-col>
          <basic-form-item labelWidth="0" :prop="`targetRule.${index}.warnId`" validate="required" required-message="请选择告警级别">
            <el-select v-model="item.warnId" filterable @change="getDescription(index, item.warnId)">
              <el-option v-for="item in levelList"
                :key="item.id"
                :label="item.warnLevel"
                :value="item.id">
              </el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col>
          <el-tooltip :content="item.description" placement="top" effect="light">
            <el-input v-model="item.description"></el-input>
          </el-tooltip>
        </el-col>
        <el-col>
          <el-button type="danger" @click="del(item)" :disabled="itemData.targetRule.length === 1">删除</el-button>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { ruleList } from '../utils/index'
import { getWarns } from 'services/task/inspect'
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
      levelList: []
    }
  },
  created () {
    this.getLevelList()
  },
  methods: {
    getDescription (index, data) {
      this.levelList.forEach(item => {
        if (item.id === data) {
          this.$nextTick(() => {
            this.itemData.targetRule[index].description = item.remark
          })
        }
      })
    },
    getLevelList () {
      getWarns().then(data => {
        if (data.success) {
          this.levelList = data.data.rows
        }
      })
    },
    add () {
      this.itemData.targetRule.push({
        rule: '',
        warnId: '',
        threshold: '',
        description: ''
      })
    },
    del (row) {
      const index = this.itemData.targetRule.indexOf(row)
      if (index !== -1) {
        this.itemData.targetRule.splice(index, 1)
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
