<template>
  <div>
    <el-button type="primary" style="margin-bottom: 10px;" class="iconfont icon-add" @click="add">添加参数</el-button>
    <el-row :gutter="20" v-for="(param, index) in itemData.listMsg" :key="index">
      <el-col :span="4" :offset="0">
        <basic-form-item labelWidth="0" :prop="`listMsg.${index}.name`"
          validate="required" required-message="参数名称不能为空">
          <el-input v-model.trim="param.name" clearable placeholder="字段名称"></el-input>
        </basic-form-item>
      </el-col>
      <el-col :span="4" :offset="0">
        <basic-form-item labelWidth="0">
            <el-select v-model="param.inspectType" filterable placeholder="巡检分类" @change="getInspectList(param)">
              <el-option v-for="item in inspectTypeList"
                :key="item.code"
                :label="item.name"
                :value="item.code">
              </el-option>
            </el-select>
        </basic-form-item>
      </el-col>
      <el-col :span="12" :offset="0">
        <basic-form-item labelWidth="0" :prop="`listMsg.${index}.inspectId`" validate="required" required-message="参数值不能为空">
          <el-select v-model="param.inspectId" filterable multiple placeholder="巡检项">
            <el-option v-for="item in inspectList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </basic-form-item>
      </el-col>
      <el-col :span="4" :offset="0">
        <el-button type="danger" icon="el-icon-delete" @click="del(param)">删除</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getTimings } from 'services/task/inspect'
export default {
  props: {
    itemData: {
      type: Object,
      required: true
    },
    inspectTypeList: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      inspectList: []
    }
  },
  mounted () {
    // 编辑的时候获取inspectCache数据
    this.getInspectList()
  },
  methods: {
    add () {
      this.itemData.listMsg.push({
        key: Date.now(),
        name: '',
        inspectType: '',
        inspectId: []
      })
    },
    del (row) {
      const index = this.itemData.listMsg.indexOf(row)
      if (index !== -1) {
        this.itemData.listMsg.splice(index, 1)
      }
    },
    getInspectList (row) {
      const params = {
        page: 1,
        rows: 9999
      }
      if (row?.inspectType) {
        const inspectType = row.inspectType
        params.params = JSON.stringify([{
          param: {
            category: inspectType
          },
          sign: 'EQ'
        }])
      }
      getTimings(params).then(data => {
        if (data.success) {
          this.inspectList = data.data.rows
        }
      })
    }
  }
}
</script>
