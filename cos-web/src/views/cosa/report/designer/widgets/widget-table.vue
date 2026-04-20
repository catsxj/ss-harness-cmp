<template>
  <section :style="{ ...style, height: '100%' }">
    <header>
      <p :style="{ color: global.textColor || globalOptions.textColor }">{{ options.title.text }}</p>
      <el-button @click="openExport" :type="global.theme == 'dark' || globalOptions.theme == 'dark' ? 'primary' : 'default'">导出</el-button>
    </header>
    <el-table
      :data="tableData"
      border
      :style="{ width: '100%', height: 'calc(100% - 80px)', overflowY: 'auto', color: element.options.textStyle.color || global.textColor || globalOptions.textColor }"
    >
      <template v-for="item in element.data.dropList.map(item => item.alias)">
        <el-table-column :prop="item" :label="item" :key="randomKey(item)">
          <template #header>
            {{ item }}
          </template>
        </el-table-column>
      </template>
    </el-table>
    <div class="page-box" :style="{ backgroundColor: global.elementBackgroundColor || globalOptions.elementBackgroundColor }">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="params.page"
        :page-sizes="[10, 50, 100, 200]"
        :pager-count="5"
        :page-size="params.row"
        layout="total, sizes, prev, pager, next"
        :total="total"
        :style="{ backgroundColor: global.elementBackgroundColor || globalOptions.elementBackgroundColor }"
      >
      </el-pagination>
    </div>
    <el-dialog title="导出" :visible.sync="visible" :append-to-body="true">
      <section class="export">
        <div>
          <span>文件格式：</span>
          <el-radio-group v-model="exportObj.type">
            <el-radio-button label="EXCEL">EXCEL</el-radio-button>
            <el-radio-button label="WORD" disabled>WORD</el-radio-button>
            <el-radio-button label="PDF" disabled>PDF</el-radio-button>
          </el-radio-group>
        </div>
      </section>
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="exportTable">确定</el-button>
      </template>
    </el-dialog>
  </section>
</template>
<script>
import { getPreviewById, exportData } from '@/services/reportform/dataset'
import { eventBus } from '../eventBus'
import { isJSON } from '../../utils'
import { packParams } from './widgets.utils'
import { MinxinStyleOptions } from './minxin-style-options'
import { mapState } from 'vuex'

export default {
  mixins: [MinxinStyleOptions],
  props: {
    element: {
      type: Object,
      default: () => ({
        data: {},
        style: {},
        uuid: ''
      })
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      tableData: [{ key: '' }],
      params: {
        rows: 10,
        page: 1,
        includeTitle: true
      },
      total: 0,
      visible: false,
      exportObj: {
        type: 'EXCEL'
      },
      dropAliasList: []
    }
  },
  computed: {
    ...mapState({
      global: state => state.elements.globalOptions
    })
  },
  watch: {
    element: {
      handler(data) {
        this.tableData = [{ key: '' }]
        this.total = 0
        const { datasetId, dropList } = data.data
        if (datasetId && dropList[0]) {
          this.getList()
        }
      },
      deep: true
    }
  },
  mounted() {
    if (!this.isEdit) {
      this.getList()
    }
    eventBus.$on('inputChange', data => {
      this.setParamsToGetList(data)
    })
    eventBus.$on('selectChange', data => {
      this.setParamsToGetList(data)
    })
    eventBus.$on('calendarChange', data => {
      this.setParamsToGetList(data)
    })
  },
  methods: {
    // 修复表头顺序不修改
    randomKey() {
      return Math.random()
    },
    setParamsToGetList(data) {
      const { params: currentParams, bindUuid, isEdit } = data
      if (bindUuid?.includes && bindUuid.includes(this.element.uuid) && this.isEdit === isEdit) {
        if (isJSON(this.params?.params)) {
          this.params.params = JSON.stringify(packParams(currentParams, JSON.parse(this.params.params)))
        } else {
          this.params.params = JSON.stringify(packParams(currentParams))
        }
        if (this.element.data.datasetId) {
          this.params.page = 1
          this.getList()
        }
      }
    },
    async getList() {
      const { success, data } = await getPreviewById(this.element.data.datasetId, this.params)
      if (success) {
        this.tableData = data.rows
        this.total = data.total
      }
    },
    handleSizeChange(val) {
      this.params.rows = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.params.page = val
      this.getList()
    },
    filterTableHeader(val) {
      const {
        data: { dropList }
      } = this.element
      return dropList?.length ? dropList.map(item => item.alias || item.name).includes(val) : false
    },
    openExport() {
      this.visible = true
      this.exportObj = {
        type: 'EXCEL',
        isColor: false
      }
    },
    exportTable() {
      const { datasetId, dropList } = this.element.data
      const { backgroundColor } = this.element.style
      // if (!datasetId || !dropList?.length) return
      const params = {
        titles: dropList.map(item => item.alias).join(',')
      }
      exportData(datasetId, params)
      this.visible = false
    }
  }
}
</script>
<style scoped lang="scss">
section > header {
  height: 40px;
  padding: 0 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  p {
    color: #333;
  }
}
.page-box {
  width: 100%;
  height: 40px;
  padding: 4px 5px;
  box-sizing: border-box;
  text-align: right;
  // background: #fff;
}
.export > div {
  display: flex;
  align-items: center;
  padding: 5px 0;
  & > span {
    width: 100px;
    text-align: right;
  }
}
::v-deep .el-table {
  background-color: transparent;
}
::v-deep .el-table tr {
  background-color: transparent;
}
::v-deep .el-table th {
  background-color: var(--d-th-backgroundColor);
  // color: #393b3e;
  color: var(--d-text-color);
}
::v-deep .el-input__inner {
  background-color: transparent;
}
::v-deep .el-pagination.is-background .btn-prev,
::v-deep .el-pagination.is-background .btn-next,
::v-deep .el-pagination.is-background .el-pager li {
  background-color: transparent;
}
</style>
