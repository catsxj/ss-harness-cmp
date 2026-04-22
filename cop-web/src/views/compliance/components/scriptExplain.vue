<template>
  <el-dialog title="脚本说明" :close-on-click-modal="false" visible @close="goBack()" width="1000px" append-to-body>
    <el-table :data="explainList" border stripe>
      <el-table-column prop="key" label="key" width="120" show-overflow-tooltip>
      </el-table-column>
      <el-table-column prop="name" label="名称" show-overflow-tooltip>
      </el-table-column>
      <el-table-column prop="type" label="类型" show-overflow-tooltip>
      </el-table-column>
      <el-table-column prop="value" label="取值" width="200">
        <template slot-scope="scope">
          <div v-html="scope.row.value"></div>
        </template>
      </el-table-column>
      <el-table-column prop="required" label="必须" width="150">
        <template slot-scope="scope">
          <div v-html="scope.row.required"></div>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="说明" width="320">
        <template slot-scope="scope">
          <div v-html="scope.row.description"></div>
        </template>
      </el-table-column>
    </el-table>
    <br>
    <label>&nbsp;【inspect_result】输出样例：</label>
    <el-table :data="explainList2" border :span-method="objectSpanMethod" stripe style="margin-top: 20px" >
      <el-table-column prop="key" label="场景" show-overflow-tooltip>
      </el-table-column>
      <el-table-column prop="example" label="inspect_result输出样例" show-overflow-tooltip>
      </el-table-column>
      <el-table-column prop="exp1" label="页面阈值设置" show-overflow-tooltip>
        <template slot-scope="scope">
          <div v-html="scope.row.exp1"></div>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<script>
export default {
  data () {
    return {
      explainList: [
        {
          key: 'script_run_status',
          name: '脚本执行状态',
          type: '数字',
          value: '0  success<br> 1 error<br> 2 warning',
          required: '必须',
          description: `表示脚本是否顺利执行成功，如果失败，输出<br>【脚本执行错误信息】<br>
            0  success(成功)<br> 1 error(失败，严重错误  脚本无法执行)<br> 2 warning
            (告警，脚本可以执行 但是需要输出告警信息)`
        },
        {
          key: 'script_error_info',
          name: '脚本执行错误信息',
          type: '字符串',
          value: '脚本错误说明',
          required: '当[脚本执行状态]=1或2<br>则必须',
          description: '当脚本执行出现错误时的说明'
        },
        {
          key: 'inspect_result',
          name: '合规结果',
          type: '数字',
          value: '格式化字符串',
          required: '必须',
          description: `有以下几种输出格式<br>
1.输出一个合规值value（支持字符串，数字，百分比）<br>
2.输出多个合规值<br>
  多个合规key-value之间||||分割<br>
  key和value之间====分割，key只支持字符串<br>
3.输出多组单个合规值 <br>
  多组合规结果之间@@@@分割<br>
  合规分组名称和合规数据之间++++分割<br>
4.输出多组多个合规值  组合2和3两种情况<br>`
        },
        {
          key: 'inspect_info',
          name: '合规检测详细数据',
          type: '格式化字符串',
          value: '|||| &nbsp;每项',
          required: '非必须',
          description: '合规过程中的查询项目详细信息，如须输出到报告中<br>便于管理员查看，则在此输出'
        }
      ],
      explainList2: [
        {
          key: '只输出所有硬盘总量的使用率',
          example: '70%',
          exp1: '【单值匹配】<br>  >  50%  '
        }
      ]
    }
  },
  methods: {
    goBack () {
      this.$emit('goBack')
    },
    objectSpanMethod ({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 3) {
        if (rowIndex === 0) {
          return {
            rowspan: 5,
            colspan: 1
          };
        } else {
          return {
            rowspan: 0,
            colspan: 0
          };
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.table-bordered {
  border: 1px solid #ddd;
}
</style>
