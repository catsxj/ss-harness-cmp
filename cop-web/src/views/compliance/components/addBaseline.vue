<template>
  <el-dialog :title="title[status]" :close-on-click-modal="false" visible
        @close="goBack()" width="1000px" append-to-body>
    <basic-form :model="data" ref="form" labelWidth="100px" :disabled="status == 'view'">
      <CardLayout title="基线设置">
        <basic-form-item label="基线名称：" prop="name" validate="required" required-message="请输入基线名称"
          :rule="[
            { pattern: /^\S.*$/, message: '名称不能以空格开头', trigger: ['blur', 'change'] }
          ]"
        >
          <el-input placeholder="请输入基线名称" v-model="data.name"/>
        </basic-form-item>
        <basic-form-item label="基线分类：" prop="itemType" validate="required" required-message="请选择">
          <el-select v-model="data.itemType" filterable>
            <el-option v-for="item in normList"
              :key="item.id"
              :label="item.name"
              :value="item.code">
            </el-option>
          </el-select>
        </basic-form-item>
        <template>
          <basic-form-item label="脚本来源：" prop="source">
            <!-- <el-radio v-model="data.source" label="1">手工录入</el-radio> -->
            <el-radio v-model="data.source" label="2">公共脚本</el-radio>
            <!-- <el-radio v-model="data.source" label="3">本地脚本</el-radio> -->
            <el-button type="primary" size="mini" style="margin-left: 20px" @click="loadScriptExplain">脚本输出规范</el-button>
          </basic-form-item>
          <el-row :gutter="20" v-if="data.source == 2">
            <el-col :span="12">
              <basic-form-item label="脚本分组：" prop="groupId">
                <el-cascader
                  change-on-select
                  :options="groupOptions"
                  :props="casProps"
                  v-model="data.groupId"
                  @change="selectGroup('clear')">
                </el-cascader>
              </basic-form-item>
            </el-col>
            <el-col :span="12">
              <basic-form-item label="脚本名称：" prop="scriptId">
                <el-select filterable placeholder="请选择" v-model="data.scriptId" @change="getScriptValue">
                  <el-option
                    v-for="item in scriptList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id">
                  </el-option>
                </el-select>
              </basic-form-item>
            </el-col>
          </el-row>
          <el-row v-if="data.source==3">
            <basic-form-item label="选择脚本：" prop="code">
              <el-button type="primary" @click="$refs.file.click()">浏览</el-button>
              <span style="color:red;margin-left:10px;line-height:32px">扩展名为：.sh、.bat、.pl、.py、.ps1</span>
              <input type="file" ref="file" @change="handleFileChange" v-show="false">
            </basic-form-item>
          </el-row>
        </template>
        <basic-form-item label="脚本内容：" prop="scriptContent" validate="required">
          <el-row>
            <el-col :span="24" v-if="status != 'view'">
              <div class="code-type">
                <el-radio v-for="item in scriptTypeData" class="radio"
                  v-model="data.scriptType" :label="item.value" :key="item.value">
                  {{item.name}}
                </el-radio>
              </div>
            </el-col>
            <el-col :span="24">
              <code-mirror :value="data.scriptContent" :read-only="data.source!='1' || status == 'view'" @changed="getContent"></code-mirror>
            </el-col>
          </el-row>
        </basic-form-item>
        <basic-form-item label="超时时间：" prop="timeout" validate="required" required-message="请输入超时时间">
          <el-input-number :min="60" v-model="data.timeout"></el-input-number>
        </basic-form-item>
        <basic-form-item label="脚本描述：" prop="description" maxlength="200">
          <el-input type="textarea" placeholder="请输入脚本描述" v-model="data.description"></el-input>
        </basic-form-item>
        <basic-form-item label="驳回原因：" v-if="status == 'view' && data.itemStatus == 2">
          <el-input type="textarea" v-model="data.approvalMessage"></el-input>
        </basic-form-item>
      </CardLayout>
      <CardLayout title="输入参数设置">
        <input-param :itemData="data"></input-param>
      </CardLayout>
      <CardLayout title="基线设置">
        <line-param :itemData="data"></line-param>
      </CardLayout>
    </basic-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click.native="goBack()">{{status != 'view' ? '取消' : '返回'}}</el-button>
      <el-button v-if="status != 'view'" type="primary" @click.native="create" :loading="loading">提交</el-button>
    </div>
    <script-explain v-if="dialogVisible" @goBack="dialogVisible = false"></script-explain>
  </el-dialog>
</template>

<script>
import CodeMirror from 'cmp-element/components/code-mirror/CodeMirror.vue'
import { last } from 'lodash-es'
import ScriptExplain from './scriptExplain'
import lineParam from './lineParam'
import inputParam from './inputParam'
import { normList } from '../utils/index'
import { getScriptList, getScriptGroup, getScriptDetail } from 'services/task/inspect'
import { getBaseLineDetail, createBaseLine, modifyBaseLine } from 'services/task/compliance'
export default {
  components: {
    ScriptExplain, inputParam, lineParam, CodeMirror
  },
  props: {
    status: {
      type: String,
      default: 'create'
    },
    id: {
      type: [String, Number]
    }
  },
  data () {
    return {
      normList,
      loading: false,
      title: {
        create: '创建合规基线',
        update: '编辑合规基线',
        view: '查看合规基线'
      },
      data: {
        name: '',
        source: '2',
        scriptContent: '',
        groupId: '',
        scriptId: '',
        timeout: 1800,
        scriptType: 'SHELL',
        itemParam: '',
        sensitiveParam: false,
        description: '',
        multiCompare: 'one',
        itemType: '',
        scriptParam: [{
          key: Date.now(),
          name: '',
          value: ''
        }],
        complianceRule: [
          {
            rule: '',
            name: '',
            value: '',
            pass: true
          }
        ]
      },
      sensitiveParam: false,
      sysList: [
        { id: '0', name: 'Linux' },
        { id: '1', name: 'Windows' },
        { id: '2', name: 'Aix' }
      ],
      scriptTypeData: [
        { name: 'shell', value: 'SHELL', suffix: 'sh' },
        { name: 'bat', value: 'BAT', suffix: 'bat' },
        { name: 'perl', value: 'PERL', suffix: 'pl' },
        { name: 'python', value: 'PYTHON', suffix: 'py' },
        { name: 'powershell', value: 'POWERSHELL', suffix: 'ps1' }
      ],
      paramsText: '请输入参数',
      scriptList: [],
      groupOptions: [],
      casProps: {
        value: 'id',
        label: 'name',
        children: 'childrenList'
      },
      dialogVisible: false,
      inputParamData: [],
      ruleParamData: []
    }
  },
  watch: {
    'data.source' () {
      this.data.scriptContent = ''
      this.data.groupId = ''
      this.data.scriptId = ''
    }
  },
  created () {
    if (this.id) {
      this.getNormById(this.id)
    }
    this.ruleParamData = []
    this.inputParamData = []
    this.selectGroup()
    this.getGroupOptions()
  },
  methods: {
    getScriptList (id) {
      const params = {
        simple: true
      }
      params.params = JSON.stringify([
        {
          param: {
            groupId: id,
            status: 'APPROVED'
          },
          sign: 'EQ'
        }
      ])
      getScriptList(params).then(res => {
        if (res.success) {
          this.scriptList = res.data.rows
        }
      })
    },
    handleSensChange () {
      if (this.sensitiveParam) {
        this.sensitiveParam = false
        this.data.itemParam = ''
      }
    },
    handleParamFocus () {
      if (this.sensitiveParam) {
        this.paramsText = this.data.itemParam
        this.data.itemParam = ''
      }
    },
    handleParamBlur () {
      if (this.sensitiveParam) {
        if (this.data.itemParam) {
          this.sensitiveParam = false
        } else {
          this.data.itemParam = this.paramsText
        }
        this.paramsText = '请输入参数'
      }
    },
    paramChange () {
      if (this.data.id) {
        this.data.paramChanged = true
      }
    },
    loadScriptExplain () {
      this.dialogVisible = true
    },
    getNormById (id) {
      getBaseLineDetail(id).then(data => {
        if (data.success) {
          this.data.id = data.data.id
          this.data.name = data.data.name
          this.data.scriptContent = data.data.scriptContent
          this.data.groupId = JSON.parse(data.data.groupId) || []
          this.data.scriptId = data.data.scriptId || ''
          this.data.scriptType = data.data.scriptType
          this.data.timeout = data.data.timeout
          this.data.sensitiveParam = data.data.sensitiveParam
          this.sensitiveParam = data.data.sensitiveParam
          this.data.description = data.data.description
          this.data.itemParam = data.data.sensitiveParam ? '*******' : data.data.itemParam
          this.data.itemType = data.data.itemType
          this.data.scriptParam = JSON.parse(data.data.scriptParam) || [{
            key: Date.now(),
            name: '',
            value: ''
          }]
          this.data.complianceRule = JSON.parse(data.data.complianceRule) || []
          this.data.multiCompare = data.data?.multiCompare ? 'more' : 'one'
          this.getScriptList(this.data.groupId[this.data.groupId.length - 1])
        }
      })
    },
    saveInputParam (data) {
      this.inputParamData = data
    },
    saveRuleParam (data) {
      this.ruleParamData = data
    },
    create () {
      const self = this
      if (this.id && !this.data.id) {
        this.$message.error('巡检基线信息未获取/获取异常')
        return
      }
      this.$refs.form.validate(valid => {
        if (valid) {
          this.loading = true
          const params = {
            name: this.data.name,
            groupId: this.data.groupId,
            scriptId: this.data.scriptId,
            scriptContent: this.data.scriptContent,
            scriptType: this.data.scriptType,
            itemParam: this.sensitiveParam ? '' : this.data.itemParam,
            description: this.data.description,
            timeout: this.data.timeout,
            sensitiveParam: this.data.sensitiveParam,
            itemType: this.data.itemType,
            scriptParam: this.data.scriptParam,
            complianceRule: this.data.complianceRule,
            multiCompare: this.data.multiCompare === 'more'
          }
          let http = createBaseLine
          if (this.data.id) {
            http = modifyBaseLine
            params.id = this.data.id
            if (this.data.paramChanged) {
              params.paramChanged = this.data.paramChanged
            }
          }
          http(params).then(data => {
            if (data.success) {
              this.$message.success(data.message)
              this.goBack(true)
            }
            this.loading = false
          })
        }
      })
    },
    goBack (val) {
      this.$emit('goBack', val)
    },
    handleFileChange (event) {
      const that = this
      const file = event.target.files[0]
      const reader = new FileReader()
      const fileName = file.name
      if (file && file.type && /text+/.test(file.type) && (/(.sh|.bat|.pl|.py|.ps1)$/.test(file.name))) {
        reader.onload = function () {
          const content = this.result
          that.data.scriptContent = content
          const list = file.name.split('.')
          for (const type of that.scriptTypeData) {
            if (type.suffix == list[list.length - 1]) {
              that.data.scriptType = type.value
              break
            }
          }
        }
        reader.readAsText(file)
      } else {
        that.data.scriptContent = ''
        that.$message.error('上传脚本不合法')
      }
      event.target.value = null
    },
    selectGroup (type) {
      if (type === 'clear') {
        this.data.scriptId = ''
      }
      if (this.data.groupId && this.data.groupId.length) {
        this.getScriptOptions(last(this.data.groupId))
      }
    },
    getGroupOptions () {
      getScriptGroup({
        parentId: 0
      }).then(data => {
        if (data.success) {
          this.groupOptions = data.data
        }
      })
    },
    getScriptOptions (id) {
      const params = this.$tools.handleSearchParam({
        status: 'APPROVED',
        groupId: id
      })
      getScriptList({
        page: 1,
        rows: 10000,
        params: params,
        simple: true
      }).then(data => {
        if (data.success) {
          this.scriptList = data.data.rows
        }
      })
    },
    getContent (value) {
      this.data.scriptContent = value
    },
    getScriptValue () {
      getScriptDetail(this.data.scriptId).then(data => {
        this.data.scriptType = data.data.category
        this.data.scriptContent = data.data.content
      })
    }
  }
}
</script>

<style scoped>
.code-type {
  height: 35px;
  padding-left: 15px;
  background: #F6F8F8;
  line-height: 35px;
  border: 1px solid #ddd;
}
</style>
