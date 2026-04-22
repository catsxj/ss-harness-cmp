<template>
  <div>
    <el-button type="primary" style="margin-bottom: 10px;" icon="el-icon-plus" @click="addParam">添加参数</el-button>
      <el-row class="header" :gutter="20" type="flex">
        <el-col>节点名称</el-col>
        <el-col>参数名称</el-col>
        <el-col>参数值</el-col>
        <el-col>参数描述</el-col>
        <el-col>操作</el-col>
      </el-row>
      <div style="height: 20px;"></div>
      <el-collapse-transition>
        <div  class="content">
          <el-row class="item" :gutter="20" type="flex" v-for="(resource, sindex) in itemData.param" :key="sindex">
            <el-col>
              <basic-form-item labelWidth="0" :prop="`param.${sindex}.code`"
                validate="required" required-message="请选择节点">
                <el-select v-model="resource.code" clearable filterable @change="clearParam(resource)">
                  <el-option v-for="item in nodeList"
                    :key="item.selfCode"
                    :label="item.name"
                    :value="item.selfCode">
                  </el-option>
                </el-select>
              </basic-form-item>
            </el-col>
            <el-col>
              <basic-form-item labelWidth="0" :prop="`param.${sindex}.path_name`"
                validate="required" required-message="请选择参数">
                <el-input v-if="resource.code.indexOf('task.maintain.upload') == -1" v-model="resource.path_name" clearable></el-input>
                <el-select v-else v-model="resource.path_name" @change="addDescription(resource)">
                  <el-option v-for="item in inputParams[resource.code]"
                    :key="item.name"
                    :label="item.name"
                    :value="item.name">
                  </el-option>
                </el-select>
              </basic-form-item>
            </el-col>
            <el-col>
              <basic-form-item labelWidth="0" :prop="`param.${sindex}.value`"
                validate="required" required-message="内容不能为空" maxlength="999">
                <el-input v-model="resource.value" clearable></el-input>
              </basic-form-item>
            </el-col>
            <el-col>
              <basic-form-item labelWidth="0" maxlength="999">
                <el-tooltip :content="resource.description" placement="top" effect="light">
                  <el-input v-model="resource.description"></el-input>
                </el-tooltip>
              </basic-form-item>
            </el-col>
            <el-col>
              <el-button type="danger" @click="delParam(sindex)">删除</el-button>
            </el-col>
          </el-row>
        </div>
      </el-collapse-transition>
  </div>
</template>

<script>
import { paramType } from '../utils/index'
import { getInspectItemParams } from 'services/task/inspect'
export default {
  props: {
    itemData: {
      type: Object,
      required: true
    },
    nodeList: {
      type: Array,
      required: true
    },
    inputParams: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      paramType
    };
  },
  methods: {
    // 自动填充参数描述
    addDescription (row) {
      // 判断参数是否已经重复选择
      const len = this.itemData.param.length
      if (len > 1) {
        const param = this.itemData.param.slice(0)
        let count = 0
        for (const p of param) {
          if (row.code === p.code && row.path_name === p.path_name) {
            count++
            if (count > 1) {
              this.$message.error('该参数已经选择')
              row.path_name = ''
              return
            }
          }
        }
      }
      const paramsList = this.inputParams[row.code] || []
      paramsList.forEach(item => {
        if (item.name === row.path_name) {
          row.description = item?.description || ''
        }
      })
      if (row.code?.split('&&&')[0] === 'task.maintain.upload') {
        // 文件分发
        this.nodeList.forEach(node => {
          if (node.selfCode === row.code) {
            row.value = node?.input?.fronts?.target || ''
          }
        })
      }
    },
    // 切换参数清除已选
    clearParam (row) {
      row.path_name = ''
      row.value = ''
      row.description = ''
    },
    // 判断是否已经选择过
    judge (data, index) {
      let flag_i = 0
      for (const item of this.itemData.param) {
        if (item.itemId === data.itemId && item.resourceId === data.resourceId) {
          flag_i++
          if (flag_i === 2) {
            data.itemId = ''
            return this.$message.error('该巡检项已经选择过，请勿重复选择')
          }
        }
      }
      this.getParamList(data, index)
    },
    // 获取参数
    getParamList (data, index) {
      let itemId = data.itemId;
      if (data.itemId == 0) {
        itemId = this.itemData.itemIds.join(',');
      }
      getInspectItemParams({
        params: itemId
      }).then(res => {
        let index = 0
        data.keys = res.data.map(item => {
          return {
            id: index++,
            name: item
          }
        });
        data.customParams = [];
      })
    },
    // 添加参数
    addParam () {
      this.itemData.param.push({
        code: '',
        path_name: '',
        value: '',
        description: ''
      })
    },
    delParam (sindex) {
      this.itemData.param.splice(sindex, 1)
    }
  }
};
</script>

<style lang="scss" scoped>
  .header {
    text-align: center;
    font-size: 12px;
    font-weight: 550;
    background: #f5f7fa;
    height: 40px;
    line-height: 40px;
  }
  .content {
    padding: 0 20px;

    .item {
      text-align: center;
    }
  }
</style>
