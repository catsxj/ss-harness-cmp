<template>
  <div>
    <AdvanceTable :columns="columns" :data="listData" :total="total" :params="params" :get-list="getList" :searchConfigs="searchConfigs">
      <template #action>
        <el-button type="primary" @click="openDialog()">新增</el-button>
      </template>
      <template #type="val">
        {{ types[val] }}
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="openDialog(record)">编辑</el-button>
        <el-button type="text" @click="delData(record.id)">删除</el-button>
        <el-button type="text" @click="check(record)">测试</el-button>
      </template>
    </AdvanceTable>
    <!-- <el-dialog :title="`${dialogData.id ? '编辑' : '新增'}`" :close-on-click-modal="false" :visible.sync="visible" v-if="visible"> -->
    <FullScreen :visible.sync="visible" :title="dialogData.id ? '编辑数据源' : '新增数据源'" :isClose="false" :bodyStyle="{ padding: '10px' }">
      <section class="create-wrapper">
        <el-row>
          <basic-form :model="dialogData" ref="formRef" label-width="120px">
            <el-col :span="13">
              <basic-form-item prop="name" validate="required" label="名称：">
                <el-input v-model="dialogData.name"></el-input>
              </basic-form-item>
            </el-col>
            <el-col :span="13">
              <basic-form-item prop="type" validate="required" label="类型：">
                <!-- <el-select v-model="dialogData.type" @change="changeType" :disabled="Boolean(dialogData.id)">
                  <el-option v-for="item in computeTypes" :key="item.value" :value="item.value" :label="item.label"></el-option>
                </el-select> -->
                <el-radio-group v-model="dialogData.type" @change="changeType" :disabled="Boolean(dialogData.id)">
                  <el-radio-button v-for="item in computeTypes" :key="item.value" :label="item.value">{{ item.label }}</el-radio-button>
                </el-radio-group>
              </basic-form-item>
            </el-col>
            <!-- mysql 达梦-->
            <el-col :span="24" v-if="['mysql', 'dm'].includes(dialogData.type)">
              <el-col :span="13" v-if="dialogData.type == 'mysql'">
                <basic-form-item prop="config.driveClassName" validate="required" label="版本：">
                  <!-- <el-input v-model="dialogData.config.driveClassName"></el-input> -->
                  <el-radio-group v-model="dialogData.config.driveClassName">
                    <el-radio-button label="com.mysql.cj.jdbc.Driver">8.0</el-radio-button>
                    <el-radio-button label="com.mysql.jdbc.Driver">5.7</el-radio-button>
                  </el-radio-group>
                </basic-form-item>
              </el-col>
              <!-- <el-col :span="24">
                <basic-form-item prop="config.url" validate="required" label="数据源地址：">
                  <el-input v-model="dialogData.config.url"></el-input>
                </basic-form-item>
              </el-col> -->
              <el-col :span="13">
                <basic-form-item prop="config.ip" validate="required" label="地址：">
                  <el-input v-model="dialogData.config.ip"></el-input>
                </basic-form-item>
              </el-col>
              <el-col :span="13">
                <basic-form-item prop="config.port" validate="required" label="端口：">
                  <el-input v-model="dialogData.config.port"></el-input>
                </basic-form-item>
              </el-col>
              <el-col :span="13">
                <basic-form-item prop="config.database" validate="required" label="数据库：">
                  <el-input v-model="dialogData.config.database"></el-input>
                </basic-form-item>
              </el-col>
              <el-col :span="13">
                <basic-form-item prop="config.userName" validate="required" label="用户名：">
                  <el-input v-model="dialogData.config.userName"></el-input>
                </basic-form-item>
              </el-col>
              <el-col :span="13">
                <basic-form-item prop="config.passWord" validate="required" label="密码：">
                  <el-input type="password" v-model="dialogData.config.passWord" @input="isEncrypt = true"></el-input>
                </basic-form-item>
              </el-col>
            </el-col>
            <el-col :span="24" v-if="dialogData.type == 'json'">
              <el-col :span="24">
                <basic-form-item prop="config" validate="required" label="数据：">
                  <vue-json-editor
                    v-model="dialogData.config"
                    :showBtns="false"
                    :mode="'code'"
                    :modes="['code']"
                    :expandedOnStart="false"
                    ref="jsonRef"
                    @json-change="onJsonChange"
                    @has-error="onJsonError"
                  ></vue-json-editor>
                </basic-form-item>
              </el-col>
            </el-col>
            <el-col :span="24" v-if="dialogData.type == 'api'">
              <el-col :span="24">
                <basic-form-item prop="config" label="数据表：">
                  <el-button icon="el-icon-plus" circle @click="openApi()"></el-button>
                  <el-table :data="dialogData.config" v-if="Object.prototype.toString.call(dialogData.config) == '[object Array]'">
                    <el-table-column prop="name" label="名称"> </el-table-column>
                    <el-table-column prop="method" label="请求方式"> </el-table-column>
                    <el-table-column prop="url" label="URL" width="200px"> </el-table-column>
                    <el-table-column prop="status" label="状态">
                      <template slot-scope="scope">
                        <span>{{ filterStatus(scope.row.status) }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="status" label="操作">
                      <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" circle @click="openApi(scope.row, scope.$index)"></el-button>
                        <el-button type="danger" icon="el-icon-delete" circle @click="delApi(scope.$index)"></el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </basic-form-item>
              </el-col>
            </el-col>
            <el-col :span="13">
              <basic-form-item prop="name" label="描述：">
                <el-input type="textarea" v-model="dialogData.remark"></el-input>
              </basic-form-item>
            </el-col>
          </basic-form>
        </el-row>
        <el-divider></el-divider>
        <div style="text-align: right">
          <el-button type="warning" @click="check()">测试</el-button>
          <el-button @click="visible = false">取消</el-button>
          <el-button type="primary" @click="confirm">确定</el-button>
        </div>
      </section>
    </FullScreen>
    <el-dialog :visible.sync="apiVisible" title="添加API数据表" width="960px">
      <Api v-if="apiVisible" @save="apiVisible = false" @saveApi="saveApi" :apiData="apiData"></Api>
    </el-dialog>
  </div>
</template>

<script>
import { computed, defineComponent, nextTick, reactive, ref, toRefs, watch } from '@vue/composition-api'
import { Message, MessageBox } from 'element-ui'
import VueJsonEditor from 'vue-json-tool'
import { encrypt } from 'utils/crypto.js'
import { getDataSource, createDataSource, updateDataSource, deleteDataSource, testLink, testApi } from 'services/reportform/datasource'
import Api from './api.vue'
import FullScreen from '../components/fullscreen.vue'

const columns = [
  {
    label: '名称',
    prop: 'name'
  },
  {
    label: '类型',
    prop: 'type',
    scopedSlots: { customRender: 'type' }
  },
  {
    label: '创建人',
    prop: 'user'
  },
  {
    label: '描述',
    prop: 'remark'
  },
  {
    label: '创建时间',
    prop: 'gmtCreate'
  },
  {
    label: '修改时间',
    prop: 'gmtModify'
  },
  {
    label: '操作',
    width: '280px',
    scopedSlots: { customRender: 'operate' }
  }
]

const types = {
  mysql: 'MySQL数据库',
  dm: '达梦数据库',
  api: 'API数据源',
  json: 'JSON数据源'
}

export default defineComponent({
  components: {
    VueJsonEditor,
    Api,
    FullScreen
  },
  setup() {
    const params = ref({
      page: 1,
      rows: 10
    })
    const searchConfigs = ref([{ label: '数据源名称', value: 'name', type: 'Input' }])
    const state = reactive({
      listData: [],
      total: 0
    })
    async function getList() {
      const { data, success } = await getDataSource(params.value)
      if (success) {
        state.listData = data.rows
        state.total = data.total
      }
    }
    const dialogData = ref({})
    const visible = ref(false)
    // 测试变量：数据源是否经过测试
    const flag = ref(false)
    function openDialog(data) {
      dialogData.value = data?.id ? { ...data, config: JSON.parse(data.config) } : { config: { data: [] } }
      visible.value = true
      flag.value = false
    }
    const computeTypes = computed(() => {
      return Object.keys(types).map(item => ({ value: item, label: types[item] }))
    })
    function changeType(val) {
      dialogData.value.config = val == 'json' ? { data: [] } : {}
      if (val == 'mysql') {
        dialogData.value.config = {
          driveClassName: 'com.mysql.cj.jdbc.Driver',
          // url: 'jdbc:mysql://127.0.0.1:3306/test?useUnicode=true&characterEncoding=UTF-8&serverTimezone=GMT%2B8',
          ip: '127.0.0.1',
          port: '3306',
          database: '',
          userName: 'root'
        }
      }
      if (val == 'dm') {
        dialogData.value.config = {
          driveClassName: 'dm.jdbc.driver.DmDriver',
          // url: 'jdbc:dm://127.0.0.1:5236/?jimureport&zeroDateTimeBehavior=convertToNull&useUnicode=true&characterEncoding=utf-8',
          ip: '127.0.0.1',
          port: '5236',
          database: 'SYSDBA',
          userName: 'SYSDBA'
        }
      }
      if (val == 'api') {
        dialogData.value.config = []
      }
    }
    // 加密变量：密码改动后视为明文，重新加密
    const isEncrypt = ref(false)
    const formRef = ref()
    // json数据源
    const hasError = ref(false)
    function onJsonChange() {
      hasError.value = false
      flag.value = false
    }
    function onJsonError() {
      hasError.value = true
    }
    // api数据源
    const apiVisible = ref(false)
    function check(data) {
      if (data) {
        // 列表侧测试
        test(data)
      } else {
        // 表单侧测试
        formRef.value.validate(async valid => {
          if (valid) {
            const { config, type } = dialogData.value
            const passWord = isEncrypt.value ? encrypt(config.passWord) : config.passWord
            const params = {
              ...dialogData.value,
              config: type == 'api' ? JSON.stringify(config) : JSON.stringify({ ...config, passWord })
            }
            test(params)
          }
        })
      }
    }
    function test(data) {
      const { type, config } = data
      if (type == 'json') testJsonFunc(data)
      else if (type == 'api') testApiFunc(JSON.parse(config))
      else testDatabaseFunc(data)
    }
    async function testDatabaseFunc(data) {
      const { driveClassName, ip, port, database, userName, passWord, url } = JSON.parse(data.config)
      const config = {
        driveClassName,
        userName,
        passWord,
        url:
          url || dialogData.value.type == 'mysql'
            ? `jdbc:mysql://${ip}:${port}/${database}?useUnicode=true&characterEncoding=UTF-8&serverTimezone=GMT%2B8`
            : `jdbc:dm://${ip}:${port}/${database}?jimureport&zeroDateTimeBehavior=convertToNull&useUnicode=true&characterEncoding=utf-8`
      }
      const { success, message } = await testLink({ ...data, config: JSON.stringify(config) })
      if (success) {
        Message.success(message)
        flag.value = true
      }
    }
    // 测试api
    function testApiFunc(config) {
      const testArr = config.map(params => testApi({ jsonObject: params }))
      Promise.all(testArr)
        .then(data => {
          if (visible.value) {
            data.forEach((item, index) => {
              dialogData.value.config.splice(index, 1, { ...dialogData.value.config[index], status: !!item.success })
            })
          }
          return data
        })
        .then(data => {
          if (data.filter(item => !item.success).length) {
            Message.warning('测试不通过')
          } else {
            nextTick(() => {
              flag.value = true
            })
            Message.success('测试通过')
          }
        })
        .catch(err => {
          console.log(err)
        })
    }
    // 测试json
    function testJsonFunc(data) {
      if (hasError.value) {
        Message.warning('JSON数据格式不正确')
      } else {
        const config = JSON.parse(data.config)
        if (!config?.data?.length) return Message.warning('data数组不能为空')
        const isObject = config.data.every(item => {
          return Object.prototype.toString.call(item) === '[object Object]'
        })
        if (!isObject) return Message.warning('data数组中元素须为对象类型')
        flag.value = true
        Message.success('测试通过')
      }
    }
    function confirm() {
      if (!flag.value) {
        Message.warning('请先测试数据源并通过测试')
        return
      }
      formRef.value.validate(async valid => {
        if (valid) {
          const { config, type } = dialogData.value
          const passWord = isEncrypt.value ? encrypt(config.passWord) : config.passWord
          const params = { ...dialogData.value, config: type == 'api' ? config : { ...config, passWord } }
          const { ip, port, database } = params.config
          if (type == 'mysql') {
            params.config = JSON.stringify({ ...params.config, url: `jdbc:mysql://${ip}:${port}/${database}?useUnicode=true&characterEncoding=UTF-8&serverTimezone=GMT%2B8` })
          } else if (type == 'dm') {
            params.config = JSON.stringify({ ...params.config, url: `jdbc:dm://${ip}:${port}/${database}?jimureport&zeroDateTimeBehavior=convertToNull&useUnicode=true&characterEncoding=utf-8` })
          } else {
            params.config = JSON.stringify(params.config)
          }
          const fn = dialogData.value.id ? updateDataSource : createDataSource
          const { success, message } = await fn(params, dialogData.value.id)
          if (success) {
            Message.success(message)
            visible.value = false
            isEncrypt.value = false
            getList()
          }
        }
      })
    }
    function delData(id) {
      MessageBox.confirm('您确定要删除该数据源吗?', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(async () => {
        const { success, message } = await deleteDataSource(id)
        if (success) {
          Message.success(message)
          visible.value = false
          getList()
        }
      })
    }
    const apiData = ref({})
    const apiType = ref({})
    function openApi(data, index) {
      apiData.value = data ?? {}
      apiType.value = data ? { type: 'edit', index } : { type: 'add' }
      apiVisible.value = true
    }
    function delApi(index) {
      dialogData.value.config.splice(index, 1)
    }
    function saveApi(val) {
      const { type, index } = apiType.value
      if (type == 'add') dialogData.value.config.push(val)
      else dialogData.value.config.splice(index, 1, val)
    }
    function filterStatus(val) {
      return val == true ? '有效' : val == false ? '失效' : ''
    }
    // 修改表单，视为需重新测试
    watch(
      () => dialogData.value,
      (val, oVal) => {
        if (flag.value) {
          flag.value = false
        }
      },
      { deep: true }
    )
    return {
      columns,
      params,
      searchConfigs,
      ...toRefs(state),
      getList,
      openDialog,
      dialogData,
      visible,
      computeTypes,
      types,
      changeType,
      formRef,
      onJsonError,
      onJsonChange,
      apiVisible,
      confirm,
      isEncrypt,
      check,
      delData,
      flag,
      saveApi,
      filterStatus,
      apiData,
      openApi,
      delApi
    }
  }
})
</script>
<style lang="scss" scoped>
::v-deep .el-dialog__body {
  padding: 10px 20px !important;
}
.testBtn {
  display: flex;
  justify-content: center;
  .el-button {
    width: 200px;
  }
}
::v-deep .jsoneditor-menu,
::v-deep .jsoneditor-statusbar {
  display: none;
}
::v-deep .ace-jsoneditor {
  min-height: 220px;
}
::v-deep .jsoneditor {
  border: 1px solid #dcdfe6;
}
::v-deep .el-radio-button__orig-radio:checked + .el-radio-button__inner {
  border-left: solid 1px #409eff;
}
::v-deep div.jsoneditor-outer.has-main-menu-bar {
  margin-top: 0px;
  padding-top: 0px;
}
</style>
