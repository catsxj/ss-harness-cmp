<template>
  <div class="wrapper">
    <AdvanceTable :cardBorder="false" :searchConfigs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total">
      <template v-slot:action>
        <el-button type="primary" @click="handleCreate()"> 新增 </el-button>
      </template>
      <template #rules="val">
        <span v-for="(item, index) in val" :key="index"> {{ item.metric | alarmMetric }}{{ item.valueType | valueTypeFilter }}{{ item.operator }}{{ item.value }}持续{{ item.time }}分钟<template v-if="index !== val.length - 1">，</template> </span>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="handleCreate(record)"><i class="el-icon-edit"></i>编辑</el-button>
        <el-button type="text" @click="handleDelete(record.id)"><i class="el-icon-delete"></i> 删除</el-button>
      </template>
    </AdvanceTable>
    <el-dialog :title="textMap[dialogStatus]" :close-on-click-modal="false" v-if="addFlag" :visible.sync="addFlag" width="1200px">
      <basic-form :model="addData" ref="addData" label-width="110px">
        <el-row>
          <el-col :span="24">
            <basic-form-item label="名称：" prop="name" validate="required">
              <el-input v-model="addData.name" auto-complete="off"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="规则：">
              <el-row class="rule-box">
                <el-col :span="24" v-for="(row, index) in addData.rules" :key="index" class="m-t">
                  <el-row :gutter="10">
                    <span class="m-l pull-left" style="display: inline-block; width: 110px">{{ row.metric | alarmMetric }}：</span>
                    <el-col :span="4">
                      <el-select v-model="row.valueType" clearable>
                        <el-option v-for="item in valueType" :key="item.value" :label="item.name" :value="item.value"></el-option>
                      </el-select>
                    </el-col>
                    <el-col :span="4">
                      <el-select v-model="row.operator" clearable>
                        <el-option v-for="(item, indexItem) in relationList" :key="indexItem" :label="item.value" :value="item.value"></el-option>
                      </el-select>
                    </el-col>
                    <el-col :span="4">
                      <el-input-number :min="0" v-model="row.value" auto-complete="off" @blur="changeValue(row.value, index)"></el-input-number>
                    </el-col>
                    <el-col :span="5">
                      持续
                      <el-input-number :min="0" :step="1" step-strictly v-model="row.time" auto-complete="off"></el-input-number>
                      分钟
                    </el-col>
                    <el-col :span="4" v-if="index !== addData.rules.length - 1">
                      <el-select v-model="row.relation" clearable>
                        <el-option v-for="item in relationType" :key="item.value" :label="item.name" :value="item.value"></el-option>
                      </el-select>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </el-form-item>
          </el-col>
        </el-row>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addFlag = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash-es'
import { getRules, createRules, modifyRules, deleteRule } from '@/services/soa/costAnalysis'
const relationList = [{ value: '>' }, { value: '>=' }, { value: '==' }, { value: '<' }, { value: '<=' }, { value: '!=' }]
const valueType = [
  { name: '最大值', value: 'max' },
  { name: '最小值', value: 'min' },
  { name: '平均值', value: 'avg' }
]
const relationType = [
  { name: '与', value: 'and' },
  { name: '或', value: 'or' }
]
const defaultRuleItem = { operator: '', value: '', valueType: '', relation: '', time: '', timeunit: 'm' }
export default {
  data() {
    return {
      columns: [
        {
          label: '名称',
          prop: 'name'
        },
        {
          label: '规则明细',
          prop: 'rules',
          width: '700px',
          scopedSlots: { customRender: 'rules' }
        },
        {
          label: '创建时间',
          prop: 'gmtCreate'
        },
        {
          label: '创建人',
          prop: 'createName'
        },
        {
          label: '操作',
          width: '220px',
          scopedSlots: { customRender: 'operate' }
        }
      ],
      searchConfigs: [{ type: 'Input', label: '名称', value: 'name' }],
      relationList,
      relationType,
      valueType,
      list: null,
      total: null,
      params: {
        page: 1,
        rows: 10
      },
      // 新增编辑
      addFlag: false,
      addData: {},
      textMap: {
        update: '编辑优化分析',
        create: '新增优化分析'
      },
      dialogStatus: ''
    }
  },
  filters: {
    valueTypeFilter(val) {
      return valueType.find(({ value }) => value === val).name
    }
  },
  methods: {
    getList() {
      getRules(this.params).then((data) => {
        if (data.success) {
          this.list = data.data.rows.map((item) => {
            item.rules = JSON.parse(item.rules || '[]')
            return item
          })
          this.total = data.data.total
        }
      })
    },
    // 查询
    handleSearch(params) {
      this.params.page = 1
      this.params.params = params
      this.getList()
    },
    handleCreate(data) {
      if (data) {
        this.addData = cloneDeep(data)
        this.dialogStatus = 'update'
        const type = []
        this.addData.rules.forEach((item) => {
          type.push(item.metric)
        })
        if (type.indexOf('cpuUsageAverage') == -1) {
          this.addData.rules.push({ metric: 'memUsageAverage', ...cloneDeep(defaultRuleItem) })
        }
        if (type.indexOf('memUsageAverage') == -1) {
          this.addData.rules.push({ metric: 'memUsageAverage', ...cloneDeep(defaultRuleItem) })
        }
        if (type.indexOf('diskUsedPercent') == -1) {
          this.addData.rules.push({ metric: 'diskUsedPercent', ...cloneDeep(defaultRuleItem) })
        }
        this.addFlag = true
      } else {
        this.addData = {
          name: '',
          rules: [
            { metric: 'cpuUsageAverage', ...cloneDeep(defaultRuleItem) },
            { metric: 'memUsageAverage', ...cloneDeep(defaultRuleItem) },
            { metric: 'diskUsedPercent', ...cloneDeep(defaultRuleItem) }
          ]
        }
        this.dialogStatus = 'create'
        this.addFlag = true
      }
    },
    addSubmit() {
      this.$refs.addData.validate((valid) => {
        if (valid) {
          const rulesFlag = this.addData.rules.every((item) => {
            if ((item.operator && item.value && item.valueType && item.time) || (!item.operator && !item.value && !item.valueType && !item.time)) {
              return true
            } else {
              return false
            }
          })
          if (!rulesFlag) {
            return this.$message({
              message: '请确保规则信息填写完整',
              type: 'error'
            })
          }
          const addData = {
            rules: []
          }
          const edit = ['id', 'name', 'type', 'gmtCreate', 'creatorId', 'deleted']
          edit.forEach((attr) => {
            addData[attr] = this.addData[attr]
          })
          addData.rules = Object.assign([], this.addData.rules)
          for (let j = 0; j < addData.rules.length; j++) {
            if (!addData.rules[j].operator) {
              addData.rules.splice(j, 1)
              j--
            }
          }
          if (!addData.rules.length) {
            return this.$message.error('至少选一项规则填写！')
          }
          if (this.dialogStatus == 'update') {
            modifyRules(addData).then((data) => {
              if (data.success) {
                this.$message.success(data.message)
                this.getList()
                this.addFlag = false
              }
            })
          } else {
            createRules(addData).then((data) => {
              if (data.success) {
                this.$message.success(data.message)
                this.getList()
                this.addFlag = false
              }
            })
          }
        }
      })
    },
    handleDelete(id) {
      this.$confirm('您确定要删除该规则吗?', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      })
        .then(() => {
          deleteRule(id).then((data) => {
            if (data.success) {
              this.$message.success(data.message)
              this.getList()
            }
          })
        })
        .catch(() => {})
    },
    changeValue(value, index) {
      if (value < 0) {
        this.addData.rules[index].value = 0
      }
    }
  }
}
</script>
