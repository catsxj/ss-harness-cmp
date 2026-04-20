/** * Created by Zhang Haijun on 2017/9/5. */
<template>
  <div>
    <el-row :gutter="10">
      <slot>
        <el-col :span="12">
          <basic-form-item label="脚本分组：" prop="groupId" validate="required">
            <el-cascader :options="groupOptions" :props="casProps" v-model="scriptItem.groupId" @change="selectGroup('clear')"> </el-cascader>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="脚本名称：" prop="scriptId" validate="required" required-message="请选择脚本">
            <el-select filterable placeholder="请选择" v-model="scriptItem.scriptId" @change="getScriptContent">
              <el-option v-for="item in scriptOptions" :key="item.id" :label="item.name" :value="item.id"> </el-option>
            </el-select>
          </basic-form-item>
        </el-col>
      </slot>
    </el-row>
    <el-row :gutter="10">
      <el-col :span="24">
        <basic-form-item label="脚本内容：" validate="required">
          <el-row>
            <el-col :span="24">
              <div class="code-type">
                <el-radio v-for="item in scriptTypeData" class="radio" v-model="scriptItem.category" :label="item.value" :key="item.value" disabled>{{ item.name }} </el-radio>
              </div>
            </el-col>
            <el-col :span="24" style="line-height: 26px">
              <code-mirror :value="scriptItem.content"></code-mirror>
            </el-col>
          </el-row>
        </basic-form-item>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import CodeMirror from 'cmp-element/components/code-mirror'
import { last } from 'lodash-es'
import { getGroup, getScriptBySimple, getScriptDetail } from 'services/task/script'

export default {
  components: { CodeMirror },
  props: {
    scriptItem: {
      type: Object
    }
  },
  data() {
    return {
      scriptGroup: [],
      groupOptions: [],
      scriptOptions: [],
      scriptTypeData: [
        { name: 'shell', value: 'SHELL' },
        { name: 'bat', value: 'BAT' },
        { name: 'perl', value: 'PERL' },
        { name: 'python', value: 'PYTHON' },
        { name: 'playbook', value: 'PLAYBOOK' },
        { name: 'powershell', value: 'POWERSHELL' }
      ],
      casProps: {
        // 级联选择器配置
        value: 'id',
        label: 'name',
        checkStrictly: true,
        children: 'childrenList'
      }
    }
  },
  created() {
    if (this.scriptItem.category === 'SQL') {
      this.scriptTypeData = [{ name: 'sql', value: 'SQL' }]
    }
    this.selectGroup()
    this.getGroupOptions()
  },
  methods: {
    selectGroup(type) {
      // 选择分组时清空id与内容
      if (type === 'clear') {
        this.scriptItem.scriptId = ''
      }
      if (this.scriptItem.groupId) {
        this.getScriptOptions(last(this.scriptItem.groupId))
      }
    },
    async getScriptContent() {
      const data = await getScriptDetail(this.scriptItem.scriptId)
      if (data.success) {
        const { category, content, name: scriptName, filename } = data.data
        const reg = new RegExp(/\$\{\{(.+)\}\}/g)
        const res = content.match(reg)
        const params = []
        if (res) {
          // ['${{hostname}}'] => ['hostname']
          const keys = [...new Set(res.map((item) => item.slice(3, item.length - 2)))]
          keys.forEach((element) => {
            params.push({
              key: element,
              value: ''
            })
          })
        }
        this.scriptItem.category = category
        this.scriptItem.content = content
        this.scriptItem.scriptName = scriptName
        this.scriptItem.name = filename || scriptName
        this.scriptItem.params = params
      }
    },
    async getGroupOptions() {
      const data = await getGroup({ parentId: 0 })
      if (data.success) {
        this.groupOptions = data.data
      }
    },
    async getScriptOptions(id) {
      let params = [
        { param: { status: 'APPROVED', groupId: id }, sign: 'EQ' },
        { param: { category: 'SQL' }, sign: 'UEQ' }
      ]
      if (this.scriptItem.category === 'SQL') {
        params = [{ param: { status: 'APPROVED', groupId: id, category: 'SQL' }, sign: 'EQ' }]
      }
      const data = await getScriptBySimple({
        page: 1,
        rows: 10000,
        params: JSON.stringify(params)
      })
      if (data.success) {
        this.scriptOptions = data.data.rows
      }
    }
  }
}
</script>
<style scoped>
.code-type {
  height: 35px;
  padding-left: 15px;
  background: #f6f8f8;
  line-height: 35px;
  border: 1px solid #ddd;
}
</style>
