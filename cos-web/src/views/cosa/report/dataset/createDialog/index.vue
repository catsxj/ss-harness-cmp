<template>
  <common-detail :title="`${dialogData.id ? '编辑' : '新增'}数据集`" @goBack="emit('back')">
    <template #item_container>
      <section>
        <header class="header">
          <div>
            <basic-form :model="dialogData" ref="formRef" class="dataset-form">
              <basic-form-item prop="resourceId" validate="required" label="数据源：">
                <el-select v-model="dialogData.resourceId" placeholder="选择数据源" style="width: 240px" :disabled="Boolean(dialogData.id)">
                  <el-option v-for="item in datasourceList" :key="item.id" :value="item.id" :label="item.name"></el-option>
                </el-select>
              </basic-form-item>
              <basic-form-item prop="name" validate="required" v-if="['sql', 'json'].includes(dialogData.type)" label="名称：">
                <el-input v-model="dialogData.name" placeholder="名称" style="width: 240px"></el-input>
              </basic-form-item>
            </basic-form>
          </div>
          <span class="btns">
            <el-button @click="emit('back')">取消</el-button>
            <el-button type="primary" @click="confirm">确定</el-button>
          </span>
        </header>
      </section>
    </template>
    <div class="content">
      <Content :dialogData="dialogData" ref="contRef" :formRef="formRef"></Content>
    </div>
  </common-detail>
</template>
<script>
import { defineComponent, ref } from '@vue/composition-api'
import { Message } from 'element-ui'
import { createDataset, updateDataset } from 'services/reportform/dataset'
import Content from './content.vue'
import { getDataSource } from 'services/reportform/datasource'
import { filterDatasourceType } from '../../utils'

export default defineComponent({
  components: { Content },
  props: ['dialogData'],
  setup(props, { emit }) {
    if (props.dialogData.type == 'sql数据集') {
      props.dialogData.type = 'sql'
    }
    const datasourceList = ref([])
    async function getDatasources() {
      const params = {
        page: 1,
        rows: 999
      }
      const { data, success } = await getDataSource(params)
      if (success) {
        datasourceList.value = data.rows.filter(item => filterDatasourceType(props.dialogData.type).includes(item.type))
      }
    }
    getDatasources()
    const contRef = ref()
    const formRef = ref()
    function confirm() {
      formRef.value.validate(async valid => {
        if (valid) {
          const params = {
            ...props.dialogData
          }
          if (['database', 'api'].includes(props.dialogData.type)) {
            params.info = [...contRef.value.getUnusedList()]
          }
          if (['sql'].includes(props.dialogData.type)) {
            const sql = contRef.value.getCodeValue()
            if (!sql) {
              return Message.warning('请输入sql')
            }
            params.sql = sql
          }
          const fn = props.dialogData.id ? updateDataset : createDataset
          const { success, message } = await fn(params, props.dialogData.id)
          if (success) {
            Message.success(message)
            emit('success')
          }
        }
      })
    }
    return {
      datasourceList,
      contRef,
      formRef,
      confirm,
      emit
    }
  }
})
</script>
<style lang="scss">
.content {
  height: calc(100vh - 220px);
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.dataset-form {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  & > div {
    margin-bottom: 0 !important;
  }
}
</style>
