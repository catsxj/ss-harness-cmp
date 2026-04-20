<template>
  <div>
    <el-tabs v-model="activeName">
      <el-tab-pane label="数据预览" name="preview">
        <div class="head" v-if="detailData.type == 'sql'">
          <div>
            <!-- <span>显示行数</span>
            <el-input type="text" v-model="rows" style="margin-left: 10px">
              <el-button slot="append" icon="el-icon-search" @click="getPreviewList"></el-button>
            </el-input> -->
          </div>
          <div>
            <el-button @click="openSqlDailog">编辑sql数据集</el-button>
          </div>
        </div>
        <el-table border :data="previewList" v-if="previewList.length">
          <template v-for="item in Object.keys(previewList[0])">
            <el-table-column :key="item" :label="item" :prop="item" show-overflow-tooltip>
              <template slot-scope="scope">
                <span v-if="jsSnippets.map(item => item.effectField).includes(item)">{{filterJS(scope.row[item], item)}}</span>
                <span v-else>{{scope.row[item]}}</span>
              </template>
            </el-table-column>
          </template>
        </el-table>
        <div style="text-align: right">
          <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="params.page" :page-sizes="[10, 50, 100, 200]" :page-size="params.row" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
        </div>
      </el-tab-pane>
      <el-tab-pane label="字段管理" name="field">
        <template>
          <div style="margin-bottom: 10px">
            <el-button v-if="filterDatasourceType(detailData.type).includes('mysql')" @click="openDialog">新建计算字段</el-button>
            <el-button v-if="filterDatasourceType(detailData.type).includes('mysql')" @click="openJsDialog">新建JS片段</el-button>
            <el-button @click="sync">同步字段</el-button>
          </div>
          <el-collapse v-model="activeFiled">
            <el-collapse-item title="维度" name="1">
              <filed-table :data="filedList.filter(item => item.coordinate)" :filedList="filedList" :filedTypes="filedTypes" @edit="openDialog" @delete="removeCalFeild"></filed-table>
            </el-collapse-item>
            <el-collapse-item title="指标" name="2">
              <filed-table :data="filedList.filter(item => !item.coordinate)" :filedList="filedList" :filedTypes="filedTypes" @edit="openDialog" @delete="removeCalFeild"></filed-table>
            </el-collapse-item>
          </el-collapse>
        </template>
      </el-tab-pane>
      <el-tab-pane label="数据关联" name="related" v-if="detailData.type == 'database'">
        <el-button type="primary" @click="openRelated()">新增关联</el-button>
        <el-table :data="relatedList">
          <el-table-column label="关联表" prop="relevanceTableName" show-overflow-tooltip></el-table-column>
          <el-table-column label="关联字段" prop="relevanceField" show-overflow-tooltip></el-table-column>
          <el-table-column label="关联关系" prop="relevanceRelation" show-overflow-tooltip>
            <template slot-scope="scope">
              {{filterRelation(scope.row.relevanceRelation)}}
            </template>
          </el-table-column>
          <el-table-column label="被关联表" prop="byRelevanceTableName" show-overflow-tooltip></el-table-column>
          <el-table-column label="被关联字段" prop="byRelevanceField" show-overflow-tooltip></el-table-column>
          <el-table-column label="操作" prop="item" show-overflow-tooltip>
            <template slot-scope="scope">
              <el-button type="text" @click="openRelated(scope.row)">编辑</el-button>
              <el-button type="text" @click="removeRelated(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-dialog title="关联" :visible.sync="relatedVisible" :append-to-body="true">
          <el-row>
            <basic-form :model="relatedData" ref="relatedRef" label-width="120px">
              <el-col :span="12">
                <basic-form-item label="关联表：" prop="relevanceTableName">
                  <el-input :value="detailData.tableName" disabled></el-input>
                </basic-form-item>
              </el-col>
              <el-col :span="12">
                <basic-form-item label="关联字段：" prop="relevanceField" validate="required">
                  <el-select v-model="relatedData.relevanceField" filterable clearable>
                    <el-option v-for="item in filedListRelated.filter(item => !item.calc && item.name != 'JS片段')" :key="item.id" :value="item.name" :label="item.alias || item.name"></el-option>
                  </el-select>
                </basic-form-item>
              </el-col>
              <el-col :span="12">
                <basic-form-item label="被关联表：" prop="byRelevanceTableName" validate="required">
                  <el-select v-model="relatedData.byRelevanceTableName" filterable clearable>
                    <el-option v-for="item in toTables" :key="item.tableType" :value="item.tableType" :label="item.tableType"></el-option>
                  </el-select>
                </basic-form-item>
              </el-col>
              <el-col :span="12">
                <basic-form-item label="被关联字段：" prop="byRelevanceField" validate="required">
                  <el-select v-model="relatedData.byRelevanceField" filterable clearable>
                    <el-option v-for="item in tableFields" :key="item.name" :value="item.name" :label="item.name"></el-option>
                  </el-select>
                </basic-form-item>
              </el-col>
              <el-col :span="12">
                <basic-form-item label="关联关系：" prop="relevanceRelation" validate="required">
                  <el-select v-model="relatedData.relevanceRelation">
                    <el-option v-for="item in relations" :key="item.value" :value="item.value" :label="item.label"></el-option>
                  </el-select>
                </basic-form-item>
              </el-col>
            </basic-form>
          </el-row>
          <template #footer>
            <el-button @click="relatedVisible=false">取消</el-button>
            <el-button type="primary" @click="confirmRelated">确定</el-button>
          </template>
        </el-dialog>
      </el-tab-pane>
      <el-tab-pane label="数据集信息" name="infos">
        <section class="info">
          <header>
            <p>数据集信息</p>
          </header>
          <div>
            <span>名称：</span>
            <span>{{ infosList.name }}</span>
          </div>
          <div>
            <span>类型：</span>
            <span>{{ infosList.type }}</span>
          </div>
          <div>
            <span>创建人：</span>
            <span>{{ infosList.user }}</span>
          </div>
          <div>
            <span>创建时间：</span>
            <span>{{ infosList.gmtCreate }}</span>
          </div>
        </section>
        <section class="info">
          <header>
            <p>数据源信息</p>
          </header>
          <div>
            <span>名称：</span>
            <span>{{ infosList.dataSource.name }}</span>
          </div>
          <div>
            <span>类型：</span>
            <span>{{ infosList.dataSource.type }}</span>
          </div>
          <div>
            <span>创建时间：</span>
            <span>{{ infosList.dataSource.gmtCreate }}</span>
          </div>
        </section>
      </el-tab-pane>
    </el-tabs>
  <!-- </template> -->
  <el-dialog :title="`${calData.id ? '编辑' : '新增'}计算字段`" :visible.sync="visible" :append-to-body="true" width="90%">
    <el-row>
      <basic-form :model="calData" ref="calcRef" label-width="120px">
        <el-col :span="24">
          <basic-form-item prop="alias" label="名称：" validate="required">
            <el-input v-model="calData.alias" placeholder="请输入名称"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="24">
          <el-row>
            <el-col :span="14">
              <basic-form-item prop="calcConfig" label="表达式：" validate="required">
                <CodeMirrorEditor ref="cmEditor" cmMode="python"></CodeMirrorEditor>
              </basic-form-item>
              <el-col :span="24" class="item-col">
                <basic-form-item prop="coordinate" label="数据类型：" validate="required">
                  <el-radio-group v-model="calData.coordinate">
                    <el-radio-button :label="true">维度</el-radio-button>
                    <el-radio-button :label="false">指标</el-radio-button>
                  </el-radio-group>
                </basic-form-item>
              </el-col>
              <el-col :span="24" class="item-col">
                <basic-form-item prop="typeAlias" label="字段类型：" validate="required">
                  <el-select v-model="calData.typeAlias" style="width: 280px">
                    <el-option v-for="item in filedTypes" :key="item.value" :value="item.value" :label="item.name"></el-option>
                  </el-select>
                </basic-form-item>
              </el-col>
            </el-col>
            <el-col :span="10" class="calc-box">
              <el-col :span="12" style="padding: 0 5px">
                <span>点击引用字段</span>
                <el-input placeholder="搜索" prefix-icon="el-icon-search" v-model="searchFeild"></el-input>
                <span>维度</span>
                <section class="items-box-min" style="height: 180px">
                  <div v-for="item in calcFiledList.filter(item => item.coordinate)" :key="item.id" class="dimension" @click="setExpression(item.name, 'feild')">{{ item.alias }}</div>
                </section>
                <span>指标</span>
                <section class="items-box-min" style="height: 180px">
                  <div v-for="item in calcFiledList.filter(item => !item.coordinate)" :key="item.id" class="index" @click="setExpression(item.name, 'feild')">{{ item.alias }}</div>
                </section>
              </el-col>
              <el-col :span="12" style="padding: 0 5px">
                <span>点击引用函数</span>
                <el-input placeholder="搜索" prefix-icon="el-icon-search" v-model="funcFeild"></el-input>
                <section class="items-box-min" style="height: 400px">
                  <template v-for="item in funcFeild ? funcList.filter(item => item.name.indexOf(funcFeild) > -1) : funcList">
                    <el-tooltip :key="item.id" :content="item.notes" placement="right" effect="light">
                      <div @click="setExpression(item.name, 'func')">{{ item.name }}</div>
                    </el-tooltip>
                  </template>
                </section>
              </el-col>
            </el-col>
          </el-row>
        </el-col>
      </basic-form>
    </el-row>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="confirmCalc">确定</el-button>
    </template>
  </el-dialog>
  <el-dialog :title="`${jsData.id ? '编辑' : '新增'}JS片段`" :visible.sync="jsVisible" :append-to-body="true" width="960px">
    <el-row>
      <basic-form :model="jsData" ref="jsRef">
        <el-col :span="24">
          <basic-form-item prop="alias" label="名称：" validate="required">
            <el-input v-model="jsData.alias"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="24">
          <basic-form-item prop="effectField" label="对应字段：" validate="required">
            <el-select v-model="jsData.effectField">
              <el-option v-for="item in filedList.filter(item => item.name != 'JS片段')" :key="item.id" :value="item.alias" :label="item.alias"></el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col>
          <basic-form-item prop="calcConfig" label="函数：" validate="required">
            <CodeMirrorEditor ref="cmEditorJs" cmMode="javascript"></CodeMirrorEditor>
          </basic-form-item>
        </el-col>
      </basic-form>
    </el-row>
    <template #footer>
      <el-button @click="jsVisible = false">取消</el-button>
      <el-button type="primary" @click="confirmJsFunction">确定</el-button>
    </template>
  </el-dialog>
    <CreateDialog
      v-if="editSqlVisible"
      :dialogData="editSqlData"
      @success="
        editSqlVisible = false
        getPreviewList()
        getFiledList()
        getDatasetInfos()
      "
      @back="editSqlVisible = false"
    ></CreateDialog>
  </div>
</template>
<script>
import { getPreviewById, getJsSnippets, getFeildById, syncFeildData, getInfosById, getDatabaseFuncitons, createFeild, updateFeildById, deleteFeild, getRelatedById, deleteRelated, getFieldsOfTables, updateRelated, createRelated } from '@/services/reportform/dataset'
import { getDictChildren } from '@/services/system/dictionary'
import { defineComponent, nextTick, ref, watch } from '@vue/composition-api'
import { Message, MessageBox } from 'element-ui'
import FiledTable from './filedTable.vue'
import { filterDatasourceType } from '../utils'
import CodeMirrorEditor from '../components/codeMirrorEditor.vue'
import CreateDialog from './createDialog/index.vue'
import { getTablesOfDatasource } from '@/services/reportform/datasource'

export default defineComponent({
  components: { FiledTable, CodeMirrorEditor, CreateDialog },
  props: ['detailData'],
  setup(props, { emit }) {
    function goBack() {
      emit('back')
    }
    const activeName = ref('preview')
    const rows = ref(1000)
    const previewList = ref([])
    const params = ref({
      page: 1,
      rows: 10,
      includeTitle: true
    })
    const total = ref(0)
    async function getPreviewList() {
      if (!/^\d{1,4}$/.test(rows.value)) {
        return Message.warning('请输入5位以内的整数')
      }
      const { data, success } = await getPreviewById(props.detailData.id, params.value)
      if (success) {
        previewList.value = data.rows
        total.value = data.total
      }
    }
    const jsSnippets = ref([])
    async function getJsList() {
      const { data, success } = await getJsSnippets(props.detailData.id)
      if (success) {
        jsSnippets.value = data
      }
    }
    getPreviewList()
    getJsList()
    function handleSizeChange(val) {
      params.value.rows = val
      getPreviewList()
    }
    function filterJS(val, effectField) {
      const jsSnippet = jsSnippets.value.find(item => item.effectField == effectField)
      /* eslint-disable */
      const fn = eval("(" + jsSnippet.calcConfig + ")")
      return fn(val)
    }
    function handleCurrentChange(val) {
      params.value.page = val
      getPreviewList()
    }
    // 字段管理
    const activeFiled = ref(['1', '2'])
    const filedList = ref([])
    async function getFiledList() {
      const { data, success } = await getFeildById(props.detailData.id)
      success && (filedList.value = data)
    }
    getFiledList()
    const filedTypes = ref([])
    async function getFieldTypes() {
      const { data, success } = await getDictChildren({ value: 'DATA_SOURCE_CONFIG' })
      success && (filedTypes.value = data)
    }
    getFieldTypes()
    // 数据关联
    const relatedList = ref([])
    async function getRelatedList() {
      if (props.detailData.type != 'database') return
      const { data, success } = await getRelatedById(props.detailData.id)
      if (success) {
        relatedList.value = data
      }
    }
    getRelatedList()
    function removeRelated(id) {
      MessageBox.confirm('您确定要删除该关联关系吗？', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(async () => {
        const { success, message } = await deleteRelated(id)
        if (success) {
          Message.success(message)
          getRelatedList()
          getFiledList()
        }
      })
    }
    const relatedVisible = ref(false)
    const relatedData = ref({})
    const relatedRef = ref()
    const relations = [
      { label: '左连接', value: 'left join' },
      { label: '右连接', value: 'right join' },
      { label: '内连接', value: 'inner join' },
    ]
    const toTables = ref([])
    const filedListRelated = ref([])
    async function openRelated(data) {
      relatedVisible.value = true
      relatedData.value = data?.id ? { ...data } : {}
      getFieldsOfTables(props.detailData.resourceId, { tableName: props.detailData.tableName }).then(data => {
        filedListRelated.value = data.data
      })
      if (!toTables.value.length) {
        const { data, success } = await getTablesOfDatasource(props.detailData.resourceId)
        if (success) {
          toTables.value = data
        }
      }
    }
    const tableFields = ref([])
    watch(() => relatedData.value.byRelevanceTableName, val => {
      if (!val) return tableFields.value = []
      getFieldsOfTables(props.detailData.resourceId, { tableName: val }).then(data => {
        tableFields.value = data.data
      })
    })
    async function confirmRelated() {
      const params = { ...relatedData.value, relevanceTableName: props.detailData.tableName, dataSetId: props.detailData.id }
      const fn = relatedData.value.id ? updateRelated : createRelated
      const { message, success } = await fn(params, params.id)
      if (success) {
        Message.success(message)
        getRelatedList()
        getFiledList()
        relatedVisible.value = false
      }
    }
    function filterRelation(val) {
      const r = relations.find(item => item.value == val)
      return r?.label ?? ''
    }
    // 数据集信息
    const infosList = ref({
      dataSource: {}
    })
    async function getDatasetInfos() {
      const { data, success } = await getInfosById(props.detailData.id)
      if (success) {
        infosList.value = { ...data, dataSource: data.dataSource ?? {} }
      }
    }
    getDatasetInfos()
    watch(
      () => activeName.value,
      val => {
        if (val == 'preview') {
          getPreviewList()
          getJsList()
        }
      }
    )
    async function sync() {
      const { success, message } = await syncFeildData(props.detailData.id)
      if (success) {
        Message.success(message)
        getFiledList()
      }
    }
    const visible = ref(false)
    const calData = ref({})
    const calcFiledList = ref([])
    function openDialog(data) {
      if (data.name == 'JS片段') {
        return this.openJsDialog(data)
      }
      visible.value = true
      calcFiledList.value = filedList.value
      calData.value = data ? { ...data } : {}
      nextTick(() => {
        cmEditor.value.setValue(data?.calcConfig ?? '')
      })
    }
    const jsVisible = ref(false)
    const jsData = ref({})
    const cmEditorJs = ref()
    function openJsDialog(data) {
      jsVisible.value = true
      jsData.value = data ? { ...data } : {}
      nextTick(() => {
        cmEditorJs.value.setValue(data?.calcConfig ?? 'function filter(params) {}')
      })
    }
    const searchFeild = ref('')
    watch(
      () => searchFeild.value,
      val => {
        if (!val) {
          calcFiledList.value = filedList.value
          return
        }
        calcFiledList.value = filedList.value.filter(item => item.alias.indexOf(val) > -1)
      }
    )
    const funcFeild = ref('')
    const funcList = ref([])
    async function getFuncList() {
      const { data, success } = await getDatabaseFuncitons()
      if (success) {
        funcList.value = data
      }
    }
    getFuncList()
    const cmEditor = ref()
    function setExpression(data, type) {
      // const { dataSource } = infosList.value
      if (type == 'func') cmEditor.value.insertData(`${data}()`)
      else cmEditor.value.insertData(data)
    }
    const calcRef = ref()
    function confirmCalc() {
      calData.value.calcConfig = cmEditor.value.getValue()
      calcRef.value.validate(async valid => {
        if (valid) {
          const params = {
            ...calData.value,
            calc: true,
            enable: true,
            name: '计算字段',
            typeName: '计算字段',
            dataSetId: props.detailData.id
          }
          const fn = calData.value.id ? updateFeildById : createFeild
          const { success, message } = await fn(params, calData.value.id)
          if (success) {
            visible.value = false
            Message.success(message)
            getFiledList()
          }
        }
      })
    }
    const jsRef = ref()
    function confirmJsFunction() {
      jsData.value.calcConfig = cmEditorJs.value.getValue()
      jsRef.value.validate(async valid => {
        if (valid) {
          const params = {
            ...jsData.value,
            isTrusted: true,
            typeAlias: 'String',
            coordinate: false,
            calc: true,
            enable: true,
            name: 'JS片段',
            typeName: 'JS片段',
            dataSetId: props.detailData.id
          }
          const fn = jsData.value.id ? updateFeildById : createFeild
          const { success, message } = await fn(params, jsData.value.id)
          if (success) {
            jsVisible.value = false
            Message.success(message)
            getFiledList()
          }
        }
      })
    }
    function removeCalFeild(id) {
      MessageBox.confirm('您确定要删除该字段吗？', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(async () => {
        const { success, message } = await deleteFeild(id)
        if (success) {
          Message.success(message)
          getFiledList()
        }
      })
    }
    const editSqlVisible = ref(false)
    const editSqlData = ref({})
    function openSqlDailog() {
      editSqlVisible.value = true
      editSqlData.value = { ...infosList.value }
    }
    return {
      activeName,
      goBack,
      rows,
      params,
      total,
      previewList,
      getPreviewList,
      handleSizeChange,
      handleCurrentChange,
      jsSnippets,
      filterJS,
      activeFiled,
      getFiledList,
      filedList,
      filedTypes,
      infosList,
      getDatasetInfos,
      sync,
      filterDatasourceType,
      visible,
      calData,
      calcFiledList,
      openDialog,
      jsVisible,
      jsData,
      jsRef,
      relatedList,
      openRelated,
      filedListRelated,
      relatedVisible,
      relatedRef,
      relatedData,
      relations,
      toTables,
      tableFields,
      filterRelation,
      confirmRelated,
      removeRelated,
      openJsDialog,
      cmEditorJs,
      searchFeild,
      funcFeild,
      funcList,
      cmEditor,
      setExpression,
      calcRef,
      confirmCalc,
      removeCalFeild,
      editSqlVisible,
      editSqlData,
      openSqlDailog,
      confirmJsFunction
    }
  }
})
</script>
<style lang="scss" scoped>
.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  span {
    width: 80px;
  }
  .el-input {
    width: 240px;
  }
}
.calc-box {
  height: 420px;
}
[class^='items-box'] {
  min-height: 100px;
  overflow: auto;
  & > div {
    margin-top: 2px;
    padding: 5px;
    border: solid 1px #eee;
    border-radius: 3px;
    cursor: pointer;
  }
  .dimension {
    border-color: #1d54d5 !important;
    background: #e4eafa;
  }
  .index {
    border-color: #00b375 !important;
    background: #d4f2e8;
  }
}
.info {
  // width: 98%;
  margin: 0 10px;
  // border: solid 1px #dcdfe6;
  // box-shadow: 0 0 5px #cdcdcd;
  & > header {
    width: auto;
    p {
      width: 70px;
      margin: 0;
      padding: 5px 0; 
      border-bottom: solid 1px #d1d6e2;
    }
  }
  & > div {
    padding: 5px 20px 0;
  }
  & > div:last-child {
    padding-bottom: 10px;
  }
}
/* ::v-deep .detail-body .el-card {
  visibility: hidden;
  opacity: 0;
} */
</style>
