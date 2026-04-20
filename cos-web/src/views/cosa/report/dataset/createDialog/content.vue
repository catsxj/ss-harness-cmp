<template>
  <div style="height: 100%">
    <section v-if="['database', 'api'].includes(dialogData.type)" class="outer">
      <header>
        <el-input v-model="nameValue" placeholder="名称" style="width: 240px"></el-input>
      </header>
      <div class="out-box">
        <div class="box">
          <template v-for="(item, index) in !nameValue ? tableList : tableList.filter((item) => (item.tableType || item.name).indexOf(nameValue) > -1)">
            <p :key="index" @click="selectBox(item.tableType || item.name)" :class="selectedList.includes(item.tableType || item.name) ? 'active' : ''">
              {{ item.tableType || item.name }}
              <span>{{ item.comment || item.url }}</span>
            </p>
          </template>
        </div>
      </div>
    </section>
    <div v-if="['sql', 'json'].includes(dialogData.type)">
      <el-card v-if="dialogData.type == 'sql'">
        <CodeMirrorEditor ref="cmEditor" :codes="codes" cmMode="sql"></CodeMirrorEditor>
      </el-card>
      <el-card style="margin-top: 10px">
        <template #header>
          <div class="header">
            <span>数据预览(显示5条)</span>
            <el-button type="text" @click="preview">预览</el-button>
          </div>
        </template>
        <div class="preview">
          <el-table border :data="tableData" v-if="tableData.length">
            <template v-for="item in Object.keys(tableData[0])">
              <el-table-column :key="item" :label="item" :prop="item" show-overflow-tooltip></el-table-column>
            </template>
          </el-table>
        </div>
      </el-card>
    </div>
  </div>
</template>
<script>
import { defineComponent, ref, watch } from '@vue/composition-api'
import { getTablesOfDatasource } from 'services/reportform/datasource'
import { previewData } from 'services/reportform/dataset'
import CodeMirrorEditor from '../../components/codeMirrorEditor.vue'

export default defineComponent({
  props: ['formRef', 'dialogData'],
  expose: ['selectedList', 'getCodeValue', 'getUnusedList'],
  components: {
    CodeMirrorEditor
  },
  setup(props) {
    const tableList = ref([])
    const selectedList = ref([])
    async function getTables(id) {
      const { data, success } = await getTablesOfDatasource(id)
      if (success) {
        tableList.value = data
      }
    }
    watch(
      () => props.dialogData.resourceId,
      (val) => {
        if (props.dialogData.type != 'json') {
          getTables(val)
        }
      }
    )
    const codes = ref(props.dialogData.sql)
    const cmEditor = ref()
    const tableData = ref([])
    function preview() {
      props.formRef.validate(async (valid) => {
        if (valid) {
          const params = {
            sourceId: props.dialogData.resourceId,
            rows: 5,
            type: props.dialogData.type
          }
          if (props.dialogData.type == 'sql') {
            params.sql = cmEditor.value.getValue()
          }
          const { data } = await previewData(params)
          tableData.value = data
        }
      })
    }
    function getUnusedList() {
      const arr = []
      selectedList.value.forEach((item) => {
        const data = tableList.value.find((el) => el.name == item || el.tableType == item)
        if (!data.isused) {
          arr.push(data.name || data.tableType)
        }
      })
      return arr
    }
    function getCodeValue() {
      return cmEditor.value.getValue()
    }
    const nameValue = ref('')
    function selectBox(item) {
      selectedList.value.includes(item)
        ? selectedList.value.splice(
          selectedList.value.findIndex((el) => el == item),
          1
        )
        : selectedList.value.push(item)
    }
    return {
      tableList,
      selectedList,
      codes,
      preview,
      cmEditor,
      tableData,
      getUnusedList,
      getCodeValue,
      nameValue,
      selectBox
    }
  }
})
</script>
<style lang="scss" scoped>
.header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.preview {
  height: 300px;
  overflow: auto;
}
.outer {
  height: 100%;
  .out-box {
    height: 66vh;
    overflow: auto;
    margin-top: 10px;
    border-top: solid 1px #dcdfe6;
  }
}
.box {
  display: flex;
  justify-content: flex-start;
  // align-items: flex-start;
  flex-wrap: wrap;
  & > p {
    width: 22%;
    margin: 10px 0 0;
    margin-right: 2%;
    padding: 10px;
    box-sizing: border-box;
    border: 1px solid #dcdfe6;
    border-radius: 5px;
    text-align: left;
    cursor: pointer;
    word-break: break-all;
    span {
      display: block;
      font-size: 12px;
      color: rgb(17, 17, 17, 0.5);
    }
  }
  .active {
    border-color: #2d8cf0 !important;
    color: #2d8cf0 !important;
    span {
      color: rgb(45, 140, 240, 0.5) !important;
    }
  }
}
</style>
