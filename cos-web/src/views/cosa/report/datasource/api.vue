<template>
  <div class="step">
    <el-steps :active="step" style="width: 80%; margin: auto">
      <el-step title="步骤 1"></el-step>
      <el-step title="步骤 2"></el-step>
    </el-steps>
    <section v-show="step == 1">
      <el-row>
        <basic-form :model="apiData" ref="formRef">
          <el-col :span="24">
            <p>基础信息</p>
          </el-col>
          <el-col :span="24">
            <basic-form-item prop="name" label="名称：" validate="required">
              <el-input v-model="apiData.name"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item prop="method" label="请求：" validate="required">
              <el-radio-group v-model="apiData.method">
                <el-radio-button label="GET"></el-radio-button>
                <el-radio-button label="POST"></el-radio-button>
              </el-radio-group>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item prop="url" label="" validate="required">
              <el-input type="textarea" v-model="apiData.url" placeholder="请求地址："></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <p>请求参数</p>
          </el-col>
          <el-col :span="24">
            <div class="request-info">
              <el-tabs v-model="activeTab">
                <el-tab-pane label="请求头" name="first">
                  <List :lists="headers" :model="defaultModel"></List>
                </el-tab-pane>
                <el-tab-pane label="请求体" name="second" v-if="apiData.method == 'POST'">
                  <el-radio-group v-model="bodyType">
                    <el-radio v-for="item in bodyList" :key="item" :label="item" style="margin-bottom: 10px"></el-radio>
                  </el-radio-group>
                  <!-- <List :lists="bodys" :model="defaultModel" type="body" v-if="bodyType"></List> -->
                  <code-mirror-editor ref="cmEditor" :codes="bodyCodes" :cmMode="bodyType" v-if="bodyType"></code-mirror-editor>
                </el-tab-pane>
              </el-tabs>
            </div>
          </el-col>
          <el-col>
            <basic-form-item prop="path" label="提取数据：" validate="required">
              <el-input v-model="apiData.path" placeholder="请用JsonPath填写数据路径"></el-input>
            </basic-form-item>
          </el-col>
        </basic-form>
      </el-row>
    </section>
    <section v-show="step == 2">
      <p>数据预览</p>
      <el-table border :data="tableData" stripe style="width: 100%" v-if="tableData.length">
        <template v-for="key in Object.keys(tableData[0])">
          <el-table-column :prop="key" :label="key" :key="key"></el-table-column>
        </template>
        <!-- <el-table-column
          prop="url"
          label="url">
        </el-table-column>
        <el-table-column
          prop="name"
          label="title">
        </el-table-column>
        <el-table-column
          prop="time"
          label="time">
        </el-table-column>
        <el-table-column
          prop="imgUrl"
          label="imgUrl">
        </el-table-column> -->
      </el-table>
      <p v-else>暂无数据</p>
    </section>
    <div class="footer">
      <el-button type="primary" @click="toNext" v-if="step == 1">下一步</el-button>
      <el-button type="primary" @click="step = 1" v-if="step == 2">上一步</el-button>
      <el-button type="primary" @click="save" v-if="step == 2">保存</el-button>
    </div>
  </div>
</template>
<script>
import { onMounted, ref, watch, nextTick } from '@vue/composition-api'
import { bodyList, isJSON } from '../utils'
import List from './list.vue'
import CodeMirrorEditor from '../components/codeMirrorEditor.vue'
import { Message } from 'element-ui'
import { testApi } from 'services/reportform/datasource'

const defaultModel = {
  key: '',
  value: '',
  status: false
}
export default {
  components: {
    List,
    CodeMirrorEditor
  },
  props: ['apiData'],
  setup(props, { emit }) {
    const step = ref(1)
    // const apiData = ref({})
    const headers = ref([{ ...defaultModel }])
    const activeTab = ref('first')
    const bodyType = ref('json')
    const bodys = ref([{ ...defaultModel }])
    const bodyCodes = ref('{}')
    const cmEditor = ref()
    onMounted(() => {
      if (props?.apiData?.header) {
        const h = Object.keys(props.apiData.header)
        if (h.length) {
          headers.value = h.map(item => ({
            key: item,
            value: props.apiData.header[item],
            status: true
          }))
        }
      }
      if (props?.apiData?.body) {
        const { params, body } = props.apiData
        bodyType.value = body
        nextTick(() => {
          cmEditor.value.setValue(params)
        })
      }
    })
    const formRef = ref()
    function toNext() {
      formRef.value.validate(async valid => {
        if (valid) {
          const params = {
            ...props.apiData,
            header: headers.value
              .filter(item => item.key && item.value)
              .reduce((prev, cur) => {
                prev[cur.key] = cur.value
                return prev
              }, {})
          }
          if (params.method == 'POST' && bodyType.value) {
            params.body = bodyType.value
            const value = cmEditor.value.getValue()
            if (bodyType.value == 'json' && !isJSON(value)) return Message.warning('请求体参数格式错误')
            params.params = value
          }
          const { success, data } = await testApi({ jsonObject: params })
          if (success) {
            tableData.value = data ? JSON.parse(data) : []
            step.value = 2
            emit('saveApi', params)
          }
        }
      })
    }
    const tableData = ref([])
    function save() {
      emit('save')
    }
    watch(
      () => props.apiData.method,
      val => {
        if (val == 'GET') {
          activeTab.value = 'first'
        }
      }
    )
    return {
      step,
      defaultModel,
      headers,
      bodyList,
      activeTab,
      bodyType,
      bodys,
      bodyCodes,
      toNext,
      tableData,
      save,
      cmEditor,
      formRef
    }
  }
}
</script>
<style lang="scss" scoped>
.request-info {
  margin-left: 100px;
  margin-bottom: 20px;
  padding: 10px 20px;
  border: 1px solid rgb(220, 223, 230);
  border-radius: 4px;
}
.footer {
  margin-top: 10px;
  text-align: right;
}
</style>
