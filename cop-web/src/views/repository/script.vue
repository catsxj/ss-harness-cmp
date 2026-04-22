<template>
  <div class="wrapper-container">
    <el-row :gutter="10">
      <el-col :span="6" style="width: 286px">
        <el-card class="group">
          <div slot="header">
            脚本分类
            <el-tooltip class="item" effect="dark" content="添加根节点" placement="top-start">
              <el-button class="pull-right" type="text" @click="add('0')" icon="el-icon-plus"></el-button>
            </el-tooltip>
          </div>
          <el-row>
            <el-col :span="24">
              <el-tree :data="treeData" ref="scriptTree" node-key="id" :props="defaultProps" :highlight-current="true" :check-on-click-node="true" @node-click="handleNodeClick">
                <span class="custom-tree-node" slot-scope="{ node, data }">
                  <div class="custom-tree-node-wrapper">
                    <span class="custom-tree-node-label">
                      {{ node.label }}
                    </span>
                    <span class="operate-btns">
                      <dot-dropdown :events="dropMenuEvents" :data="{node,data}" @addNode="addNode" @editNode="editNode" @removeNode="removeNode" />
                    </span>
                  </div>
                </span>
              </el-tree>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
      <el-col :span="18" style="width: calc(100% - 286px)">
        <AdvanceTable title="脚本列表" :data="list" :searchConfigs="searchConfigs" :params="params" :total="total" :columns="columns" :get-list="getList" :loading="loading">
          <template v-slot:action>
            <el-button @click="handleCreate(null, 1)" type="primary" icon="el-icon-plus">新增 </el-button>
          </template>
          <template #name="val, record">
            <span class="detail-href" @click="getDetail(record.id)">{{ val }}</span>
          </template>
          <template #status="status">
            <status-icon :type="applyStatusFilter(status, 'color')">
              {{ applyStatusFilter(status, 'name') }}
            </status-icon>
          </template>
          <template #operate="val, record">
            <el-button icon="el-icon-edit" type="text" @click="handleCreate(record.id, 4)" :disabled="record.status === 'APPROVING'||record.status === 'APPROVED'">
              编辑
            </el-button>
            <div class="action-divider"></div>
            <el-button icon="el-icon-delete" type="text" @click="handleDelete(record.id)" :disabled="record.status == 'APPROVING'||record.status === 'APPROVED'">
              删除
            </el-button>
            <div class="action-divider"></div>
            <el-dropdown trigger="click">
              <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="handleImport(record.id)">
                  导出
                </el-dropdown-item>
                <el-dropdown-item @click.native="handleVersionChange(record.id, record.versionId)" :disabled="record.status === 'APPROVING'||record.status === 'APPROVED'">
                  版本切换
                </el-dropdown-item>
                <el-dropdown-item @click.native="handleCreate(record.id, 3)">
                  版本新增
                </el-dropdown-item>
                <el-dropdown-item @click.native="handleCompare(record.id, record.versionId)">
                  版本对比
                </el-dropdown-item>
                <el-dropdown-item @click.native="handleRelease(record)" v-if="record.status === 'DEVELOPING'">
                  发布
                </el-dropdown-item>
                <el-dropdown-item @click.native="handleRecall(record, 'recall')" v-if="record.status === 'APPROVED'">
                  下架
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </AdvanceTable>
      </el-col>
    </el-row>
    <common-detail v-if="detailFlag" :setting="{ type: 'script' }" :title="addScript.name" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="脚本名称">{{ addScript.name }}</common-detail-item>
        <common-detail-item label="脚本分组">{{ addScript.groupName }}</common-detail-item>
        <common-detail-item label="是否公有">{{ booleanFilter(addScript.open) }}</common-detail-item>
        <common-detail-item label="当前版本">{{ addScript.version }}</common-detail-item>
      </template>
      <el-tabs :value="activeName" @tab-click="handleClick">
        <el-tab-pane label="脚本内容" name="storage">
          <el-row>
            <el-col :span="24">
              <div class="code-type">
                <el-radio v-for="item in scriptTypeData" class="radio" v-model="addScript.category" :label="item.value" :key="item.value" disabled>
                  {{ item.name }}
                </el-radio>
              </div>
            </el-col>
            <el-col :span="24" style="line-height: 26px">
              <code-mirror :value="addScript.content" :read-only="true"></code-mirror>
            </el-col>
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="脚本版本" name="version">
          <basic-table :data="versionData" :params="paramsVersion" :get-list="getAllVersionData" :total="totalVersion">
            <el-table-column label="版本" prop="version"> </el-table-column>
            <el-table-column label="创建时间" prop="gmtCreate"> </el-table-column>
            <el-table-column label="最后修改时间" prop="gmtModify"> </el-table-column>
            <el-table-column label="创建人" prop="creator"> </el-table-column>
            <el-table-column label="修改人" prop="mender"> </el-table-column>
            <el-table-column label="操作" width="160px">
              <template slot-scope="scope">
                <el-button type="text" @click="handleVersionModify(scope.row.id)" icon="el-icon-edit">
                  编辑
                </el-button>
                <div class="action-divider"></div>
                <el-button type="text" icon="el-icon-delete" @click="handleDeleteVersion(scope.row.id)" :disabled="scope.row.status == 'APPROVING'">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </basic-table>
        </el-tab-pane>
        <el-tab-pane label="提交记录" name="history">
          <el-form :inline="true">
            <el-form-item>
              <el-select v-model="listQuery.version" clearable="">
                <el-option v-for="(item, index) in versionData" :key="index" :label="item.version" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="ghost" icon="el-icon-search" @click="handleSearchHistory">搜索</el-button>
            </el-form-item>
          </el-form>
          <basic-table :data="historyList" :params="historyParams" :get-list="getHistory" :total="historyTotal">
            <el-table-column label="提交人" prop="creator"> </el-table-column>
            <el-table-column label="提交时间" prop="gmtCreate"> </el-table-column>
          </basic-table>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
    <!--新增编辑脚本分组-->
    <el-dialog :title="textMap1[dialogStatus]" :close-on-click-modal="false" v-if="addScriptGroupVisible" :visible.sync="addScriptGroupVisible" width="35%">
      <basic-form :model="addScriptGroup" ref="addScriptGroup">
        <basic-form-item label="分组名称：" prop="name" validate="required">
          <el-input v-model="addScriptGroup.name" auto-complete="off"></el-input>
        </basic-form-item>

        <basic-form-item label="分组编码：" prop="code" validate="required">
          <el-input v-model="addScriptGroup.code" auto-complete="off"></el-input>
        </basic-form-item>

        <basic-form-item label="分组描述：" prop="remark">
          <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }" v-model="addScriptGroup.remark" auto-complete="off"></el-input>
        </basic-form-item>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addScriptGroupVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addScriptGroupSubmit">确定</el-button>
      </div>
    </el-dialog>
    <!--新增编辑脚本-->
    <el-dialog :title="textMap2[dialogStatus]" :close-on-click-modal="false" v-if="addScriptVisible" :visible.sync="addScriptVisible" width="70%">
      <basic-form :model="addScript" ref="addScript">
        <el-row :gutter="20">
          <div v-if="dialogStatus === 'createversion'">
            <el-col :span="24">
              <basic-form-item label="选择版本：" prop="id" validate="required" required-message="请选择版本">
                <el-radio-group v-model="addScript.id" @change="getVersionDetail">
                  <el-radio :label="item.id" border v-for="(item, key) in versionData" :key="key">{{ item.version }}</el-radio>
                </el-radio-group>
              </basic-form-item>
            </el-col>
          </div>
          <div v-if="dialogStatus != 'create'">
            <el-col :span="24">
              <basic-form-item label="版本号：" prop="version" validate="required">
                <el-input :disabled="dialogStatus === 'update'" v-model="addScript.version" auto-complete="off"></el-input>
              </basic-form-item>
            </el-col>
          </div>
          <el-col :span="12">
            <basic-form-item label="脚本名称：" prop="name" validate="required">
              <el-input v-model="addScript.name" :disabled="source === '3' || dialogStatus === 'createversion'" auto-complete="off"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="脚本分组：" prop="groupIds" validate="required">
              <el-cascader :options="treeData" v-model="addScript.groupIds" :props="props" :disabled="dialogStatus === 'createversion'"> </el-cascader>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <basic-form-item label="是否公有：" prop="open" validate="required">
              <el-radio :disabled="dialogStatus === 'createversion'" v-model="addScript.open" :label="true">公有</el-radio>
              <el-radio :disabled="dialogStatus === 'createversion'" v-model="addScript.open" :label="false">私有</el-radio>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="脚本来源：" prop="code">
              <el-radio v-model="source" label="1">手工录入</el-radio>
              <el-radio v-model="source" label="2">脚本克隆</el-radio>
              <el-radio v-model="source" label="3">本地脚本</el-radio>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24" v-if="source == 2">
            <basic-form-item label="选择脚本：">
              <el-select clearable v-model="addScript.scriptId" placeholder="请选择" @change="getScriptValue">
                <el-option v-for="item in scriptListData" :key="item.id" :label="item.name" :value="item.id"> </el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="24" v-if="source == 3">
            <basic-form-item label="选择脚本：" prop="code">
              <input type="file" class="file" @change="handleFileChange" style="border: 1px solid #d8dce5;width: 95%;padding: 5px 10px;" />
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <basic-form-item label="脚本内容：" prop="content" validate="required">
              <el-row>
                <el-col :span="24">
                  <div class="code-type">
                    <el-radio :disabled="dialogStatus === 'update'" v-for="item in scriptTypeData" class="radio" v-model="addScript.category" :label="item.value" :key="item.value">
                      {{ item.name }}
                    </el-radio>
                  </div>
                </el-col>
                <el-col :span="24" style="line-height: 26px">
                  <code-mirror :value="addScript.content" :read-only="source != '1'" @changed="getContent"></code-mirror>
                </el-col>
              </el-row>
            </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addScriptVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addScriptSubmit">确定</el-button>
      </div>
    </el-dialog>
    <!--修改版本-->
    <el-dialog title="修改版本" :close-on-click-modal="false" v-if="modifyVersionVisible" :visible.sync="modifyVersionVisible" width="70%">
      <basic-form :model="detailVersionData" ref="modifyVersionData">
        <el-row :gutter="20">
          <div>
            <el-col :span="24">
              <basic-form-item label="版本号：" prop="version" validate="required">
                <el-input disabled v-model="detailVersionData.version" auto-complete="off"></el-input>
              </basic-form-item>
            </el-col>
          </div>
          <el-col :span="12">
            <basic-form-item label="脚本名称：" prop="name" validate="required">
              <el-input v-model="detailVersionData.name" disabled auto-complete="off"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="脚本分组：" prop="groupIds" validate="required">
              <el-cascader :options="treeData" v-model="detailVersionData.groupIds" :props="props" change-on-select disabled> </el-cascader>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <basic-form-item label="是否公有：" prop="open" validate="required">
              <el-radio disabled v-model="detailVersionData.open" :label="true">公有</el-radio>
              <el-radio disabled v-model="detailVersionData.open" :label="false">私有</el-radio>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="脚本来源：" prop="code">
              <el-radio disabled v-model="source" label="1">手工录入</el-radio>
              <el-radio disabled v-model="source" label="2">脚本克隆</el-radio>
              <el-radio disabled v-model="source" label="3">本地脚本</el-radio>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24" v-if="source == 2">
            <basic-form-item label="脚本名称：">
              <el-select clearable v-model="detailVersionData.scriptId" placeholder="请选择" @change="getScriptValue" disabled>
                <el-option v-for="item in scriptListData" :key="item.id" :label="item.name" :value="item.id"> </el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="24" v-if="source == 3">
            <basic-form-item label="选择脚本：" prop="code">
              <input type="file" class="file" @change="handleFileChange" disabled style="border: 1px solid #d8dce5;width: 95%;padding: 5px 10px;" />
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <basic-form-item label="脚本内容：" prop="content" validate="required">
              <el-row>
                <el-col :span="24">
                  <div class="code-type">
                    <el-radio v-for="item in scriptTypeData" class="radio" v-model="detailVersionData.category" :label="item.value" :key="item.value">
                      {{ item.name }}
                    </el-radio>
                  </div>
                </el-col>
                <el-col :span="24" style="line-height: 26px">
                  <code-mirror :value="detailVersionData.content" :read-only="source != '1'" @changed="getContent"></code-mirror>
                </el-col>
              </el-row>
            </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="modifyVersionVisible = false">取消</el-button>
        <el-button type="primary" @click.native="modifyVersionSubmit">确定</el-button>
      </div>
    </el-dialog>
    <!--版本详情-->
    <el-dialog title="版本详情" :close-on-click-modal="false" v-if="detailVersionVisible" :visible.sync="detailVersionVisible" width="50%">
      <basic-form :model="detailVersionData" ref="detailVersionData">
        <el-row>
          <el-col :span="6">名称：</el-col>
          <el-col :span="18">{{ detailVersionData.name }}</el-col>
          <el-col :span="6">版本：</el-col>
          <el-col :span="18">{{ detailVersionData.version }}</el-col>
          <el-col :span="6">修改时间：</el-col>
          <el-col :span="18">{{ detailVersionData.gmtModify }}</el-col>
          <el-col :span="6">最终版本：</el-col>
          <el-col :span="18">{{ detailVersionData.lastVersion }}</el-col>
          <el-col :span="24">
            <el-col :span="6">脚本内容：</el-col>
            <el-col :span="18">
              <pre class="content">{{ detailVersionData.content }}</pre>
            </el-col>
          </el-col>
        </el-row>
      </basic-form>
    </el-dialog>
    <!--版本对比-->
    <el-dialog title="版本对比" :close-on-click-modal="false" v-if="compareVersionVisible" :visible.sync="compareVersionVisible" width="70%">
      <basic-form>
        <el-row>
          <el-col :span="24">
            <basic-form-item label="选择版本：">
              <el-radio-group v-model="versionId" @change="compareVersion">
                <el-radio :label="item.id" border v-for="(item, key) in versionData" :key="key">{{ item.version }}</el-radio>
              </el-radio-group>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <el-col :span="12">当前版本</el-col>
            <el-col :span="12">对比版本</el-col>
          </el-col>
          <el-col :span="24" style="background-color: #fff;">
            <el-col :span="24" class="m-t">
              <vue-code-diff :old-string="oldStr" :new-string="newStr" :context="15" outputFormat="side-by-side" />
            </el-col>
          </el-col>
        </el-row>
      </basic-form>
    </el-dialog>
    <!--版本更换-->
    <el-dialog title="版本更换" :close-on-click-modal="false" v-if="versionChangeVisible" :visible.sync="versionChangeVisible" width="70%">
      <basic-form :model="versionChangeData" ref="versionChangeData">
        <el-row :gutter="20">
          <el-col :span="24">
            <basic-form-item label="选择版本：" prop="id" validate="required" required-message="请选择版本">
              <el-radio-group v-model="versionChangeData.id">
                <el-radio :label="item.id" border v-for="(item, key) in versionData" :key="key">{{ item.version }}</el-radio>
              </el-radio-group>
            </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="versionChangeVisible = false">取消</el-button>
        <el-button type="primary" @click.native="versionChangeSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import CodeMirror from 'cmp-element/components/code-mirror/CodeMirror.vue'
import vueCodeDiff from 'vue-code-diff'
import dotDropdown from './component/dotDropdown.vue'
import { applyStatusFilter, booleanFilter } from '@/filters/index'
import {
  getGroup,
  createGroup,
  exportScript,
  modifyGroup,
  removeGroup,
  getScript,
  getScriptBySimple,
  createScript,
  operateScript,
  modifyScript,
  getScriptDetail,
  removeScript,
  getVersion,
  createVersion,
  modifyVersion,
  removeVersion,
  compareVersion,
  getVersionDetail,
  getVersionHistory,
  releaseRoutine,
  recallRoutine
} from 'services/task/script'
import dayjs from 'utils/day'
function open(value) {
  const obj = {
    true: '公有',
    false: '私有'
  }
  return obj[value]
}
const chartSetting = {
  series: {
    initialTreeDepth: 2
  }
}
export default {
  components: {
    vueCodeDiff,
    CodeMirror,
    dotDropdown
  },
  data() {
    return {
      applyStatusFilter,
      booleanFilter,
      loading: false,
      searchConfigs: [{ label: '脚本名称', value: 'name', type: 'Input' }],
      columns: [
        { label: '脚本名称', prop: 'name', scopedSlots: { customRender: 'name' } },
        { label: '当前版本', prop: 'version' },
        { label: '状态', prop: 'status', scopedSlots: { customRender: 'status' } },
        {
          label: '是否公有',
          prop: 'open',
          customRender(val) {
            return val ? '是' : '否'
          }
        },
        { label: '创建时间', prop: 'gmtCreate' },
        { label: '操作', disabled: true, width: '230px', scopedSlots: { customRender: 'operate' } }
      ],
      chartSetting,
      list: [],
      total: null,
      params: {
        page: 1,
        rows: 10
      },
      listQuery: {
        name: '',
        version: ''
      },
      groupId: null,
      parentId: null,
      // 树形菜单
      treeData: [],
      defaultProps: {
        children: 'childrenList',
        label: 'name'
      },
      dropMenuEvents: [
        { label: '编辑', funcName: 'editNode' },
        { label: '删除', funcName: 'removeNode' },
        { label: '新建子节点', funcName: 'addNode' }
      ],
      // 详情
      detailFlag: false,
      detailData: [],
      // 新增编辑脚本分组
      dialogStatus: '',
      textMap1: {
        update: '编辑脚本分组',
        create: '新增脚本分组'
      },
      addScriptGroup: {},
      addScriptGroupVisible: false,
      // 新增编辑脚本
      textMap2: {
        update: '脚本修改',
        create: '新增脚本',
        createversion: '新增版本'
      },
      props: {
        value: 'id',
        children: 'childrenList',
        label: 'name',
        checkStrictly: true
      },
      source: '1',
      scriptListData: [],
      scriptItem: {},
      addScript: {
        name: ''
      },
      addScriptVisible: false,
      scriptTypeData: [
        { name: 'shell', value: 'SHELL' },
        { name: 'bat', value: 'BAT' },
        { name: 'perl', value: 'PERL' },
        { name: 'python', value: 'PYTHON' },
        { name: 'playbook', value: 'PLAYBOOK' },
        { name: 'powershell', value: 'POWERSHELL' },
        { name: 'sql', value: 'SQL' }
      ],
      flag: null,
      // 提交记录
      historyList: [],
      historyParams: {
        page: 1,
        rows: 10
      },
      historyTotal: 0,
      // 树
      operate: false,
      chartObject: {},
      // 版本详情
      detailVersionVisible: false,
      detailVersionData: {},
      // 比对
      compareVersionVisible: false,
      oldStr: '',
      newStr: '',
      versionId: null,
      // 版本更换
      versionChangeVisible: false,
      versionData: [],
      totalVersion: 0,
      paramsVersion: {
        page: 1,
        rows: 10
      },
      versionChangeData: { id: null },
      // 版本修改
      versionCreateVisible: false,
      versionCreateData: {},
      activeName: 'storage',
      modifyVersionVisible: false
    }
  },
  created() {
    this.getTreeData()
    this.getList()
  },
  methods: {
    handleRelease(data) {
      this.$confirm(`您确定要发布该模板【${data.name}】吗?`, '提示', {
        confirmButtonText: '确定',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        releaseRoutine(data.id).then((data) => {
          if (data.success) {
            this.$message({
              message: data.message,
              type: 'success'
            })
            this.getList()
          }
        })
      })
    },
    handleRecall(data) {
      this.$confirm(`您确定要下架该模板【${data.name}】吗?`, '提示', {
        confirmButtonText: '确定',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        recallRoutine(data.id).then((data) => {
          if (data.success) {
            this.$message({
              message: data.message,
              type: 'success'
            })
            this.getList()
          }
        })
      })
    },
    addNode({ node, data }) {
      this.addScriptGroup = {}
      this.dialogStatus = 'create'
      this.parentId = data.id
      this.addScriptGroupVisible = true
    },
    editNode({ node, data }) {
      this.addScriptGroup = Object.assign({}, data)
      this.dialogStatus = 'update'
      this.addScriptGroupVisible = true
    },
    removeNode({ node, data }) {
      this.$confirm('您确定要删除该分组吗?', '提示', {
        type: 'warning'
      })
        .then(() => {
          removeGroup(data.id).then((data) => {
            if (data.success) {
              this.$message.success({
                message: data.message,
                type: 'success'
              })
              this.getTreeData()
            }
          })
        })
        .catch(() => {})
    },
    async getTreeData() {
      const that = this
      const data = await getGroup({ parentId: 0 })
      if (data.success) {
        that.treeData = data.data
        setTimeout(function () {
          if (that.groupId) {
            that.$refs.scriptTree.setCurrentKey(that.groupId)
          }
        }, 10)
      }
    },
    async getList() {
      this.loading = true
      const data = await getScript(this.params)
      if (data.success) {
        this.list = data.data.rows
        this.total = data.data.total
        this.loading = false
      }
    },
    handleNodeClick(node) {
      this.groupId = node.id
      this.handleSearch()
    },
    handleReset() {
      this.groupId = null
      this.getTreeData()
      this.listQuery = {
        name: '',
        version: ''
      }
      this.handleSearch()
    },
    // 查询
    handleSearch(params) {
      this.params.page = 1
      // this.params.params = params
      this.params.params = this.$tools.handleSearchParam({
        groupId: this.groupId || 0,
        name: this.listQuery.name
      })
      this.getList()
    },
    // 删除脚本
    handleDelete(id) {
      this.$confirm('您确定要删除该脚本吗？', '提示', {
        type: 'warning'
      })
        .then(() => {
          removeScript(id).then((data) => {
            if (data.success) {
              this.$message.success({
                message: data.message,
                type: 'success'
              })
              this.getList()
            }
          })
        })
        .catch(() => {})
    },
    // 新增脚本分组
    add(flag) {
      this.flag = flag
      this.addScriptGroup = {}
      this.dialogStatus = 'create'
      this.parentId = '0'
      this.addScriptGroupVisible = true
    },
    // 保存新增的脚本分组
    addScriptGroupSubmit() {
      const that = this
      this.$refs.addScriptGroup.validate((valid) => {
        if (valid) {
          const editObj = ['name', 'code', 'remark']
          const param = {}
          for (const a in editObj) {
            const attr = editObj[a]
            param[attr] = that.addScriptGroup[attr]
          }
          let service = ''
          if (that.dialogStatus === 'update') {
            service = modifyGroup
            param.id = this.addScriptGroup.id
          } else {
            service = createGroup
            param.parentId = that.parentId
          }
          service(param).then((data) => {
            if (data.success) {
              that.$notify({
                message: data.message,
                type: 'success'
              })
              that.addScriptGroupVisible = false
              that.getTreeData()
            }
          })
        }
      })
    },
    // 获取脚本列表
    async getScriptLst() {
      const data = await getScriptBySimple()
      if (data.success) {
        this.scriptListData = data.data.rows
      }
    },
    // 新增编辑脚本
    handleCreate(id, flag) {
      this.addScript = {
        content: ''
      }
      this.source = '1'
      switch (flag) {
        case 1:
          this.dialogStatus = 'create'
          this.addScript = {
            open: true,
            name: '',
            category: 'SHELL',
            content: ''
          }
          break
        case 3:
          this.dialogStatus = 'createversion'
          this.$set(this.addScript, 'versionId', null)
          this.getAllVersionSimple(id)
          break
        case 4:
          this.dialogStatus = 'update'
          this.addScript.content = ''
          getScriptDetail(id).then((data) => {
            if (data.success) {
              this.addScript = Object.assign({}, data.data)
              this.addScript.groupIds = JSON.parse(this.addScript.groupIds)
            }
          })
          break
      }
      this.getScriptLst()
      this.addScriptVisible = true
    },
    // 保存脚本
    addScriptSubmit() {
      const that = this
      this.$refs.addScript.validate((valid) => {
        if (valid) {
          let service
          switch (this.dialogStatus) {
            case 'create':
              service = createScript
              break
            case 'update':
              service = modifyScript
              break
            case 'createversion':
              service = createVersion
              break
          }
          if (that.source != '3') {
            that.addScript.filename = null
          }
          const length = that.addScript.groupIds.length
          that.addScript.groupId = that.addScript.groupIds[length - 1]
          service(this.addScript).then((data) => {
            if (data.success) {
              this.$message({
                message: data.message,
                type: 'success'
              })
              that.addScriptVisible = false
              that.getList()
            }
          })
        }
      })
    },
    async getScriptValue(id) {
      const data = await getScriptDetail(id)
      if (data.success) {
        this.addScript.content = data.data.content
        this.addScript.category = data.data.category
      }
    },
    handleFileChange(event) {
      const self = this
      const data = event.target.files[0]
      // 对文件大小和类型进行过滤
      const arr = data.name.split('.')
      if (['txt', 'sh', 'py', 'bat', 'pl', 'sql', 'yaml', 'yml'].indexOf(arr[arr.length - 1]) === -1) {
        self.$message({
          message: '请上传脚本类型的文件，【.txt，.sh，.py，.bat，.pl，.sql，.yaml，.yml】',
          type: 'error'
        })
        return
      }
      if (data.size > 1024 * 1024) {
        self.$message({
          message: '文件大小超过1M',
          type: 'error'
        })
        return
      }
      if (data) {
        arr.pop()
        self.addScript.name = `${arr.join('')}${dayjs().format('YYYYMMDDHHmmss')}`
        self.addScript.filename = data.name
        // 将文件进行转码，转换为text
        const reader = new FileReader()
        reader.readAsText(data)
        reader.onload = function (f) {
          self.addScript.content = this.result
        }
      }
    },
    // 导出
    handleImport(id) {
      exportScript(id)
    },
    // 详情
    getDetail(id) {
      this.listQuery.version = ''
      this.activeName = 'storage'
      getScriptDetail(id).then((data) => {
        if (data.success) {
          this.addScript = Object.assign({}, data.data)
          this.addScript.id = id
          this.addScript.groupIds = JSON.parse(this.addScript.groupIds)
          this.detailFlag = true
        }
      })
    },
    handleClick(tab, event) {
      switch (tab.name) {
        case 'version':
          this.handleSearchVersion()
          break
        case 'history':
          this.getAllVersionSimple(this.addScript.id)
          this.handleSearchHistory()
          break
      }
    },
    goBack() {
      this.detailFlag = false
    },
    // 获取手动输入的脚本内容
    getContent(value) {
      this.addScript.content = value
      this.detailVersionData.content = value
    },
    handleSearchHistory() {
      this.historyParams.page = 1
      this.historyParams.params = this.$tools.handleSearchParam({
        versionId: this.listQuery.version,
        scriptId: this.addScript.id
      })
      this.getHistory(this.addScript.id)
    },
    // 提交记录
    async getHistory(id) {
      const versionId = this.listQuery.version || id
      const data = await getVersionHistory(versionId, this.historyParams)
      if (data.success) {
        this.historyList = data.data.rows
        this.historyTotal = data.data.total
      }
    },
    // 版本列表
    handleSearchVersion() {
      this.paramsVersion.page = 1
      this.paramsVersion.params = JSON.stringify([
        {
          param: { scriptId: this.addScript.id },
          sign: 'EQ'
        }
      ])
      this.getAllVersionData(this.addScript.id)
    },
    // 分页
    async getAllVersionData(id) {
      const data = await getVersion(id, this.paramsVersion)
      if (data.success) {
        this.versionData = data.data.rows
        this.totalVersion = data.data.total
      }
    },
    // simle格式的全部版本
    async getAllVersionSimple(id) {
      const data = await getVersion(id, {
        simple: true,
        params: JSON.stringify([
          {
            param: { scriptId: id },
            sign: 'EQ'
          }
        ])
      })
      if (data.success) {
        this.versionData = data.data.rows
      }
    },
    // 版本比对
    async handleCompare(id, versionId) {
      this.oldStr = ''
      this.newStr = ''
      this.versionId = null
      const data = await getVersion(id, {
        simple: true,
        params: JSON.stringify([
          {
            param: { scriptId: id },
            sign: 'EQ'
          }
        ])
      })
      if (data.success) {
        this.versionData = data.data.rows
        for (let i = 0; i < this.versionData.length; i++) {
          if (this.versionData[i].id === versionId) {
            this.versionData.splice(i, 1)
            break
          }
        }
        this.compareVersionVisible = true
      }
    },
    async compareVersion(id) {
      const data = await compareVersion(id)
      if (data.success) {
        if (data.data.length) {
          this.oldStr = data.data[0].content
          this.newStr = data.data[1].content
        }
      }
    },
    // 版本切换
    async handleVersionChange(id, versionId) {
      this.versionChangeData.id = null
      const data = await getVersion(id, {
        simple: true,
        params: JSON.stringify([
          {
            param: { scriptId: id },
            sign: 'EQ'
          }
        ])
      })
      if (data.success) {
        this.versionData = data.data.rows
        for (let i = 0; i < this.versionData.length; i++) {
          if (this.versionData[i].id === versionId) {
            this.versionData.splice(i, 1)
            break
          }
        }
        this.$nextTick(() => {
          if (this.versionData.length) {
            this.versionChangeVisible = true
          } else {
            this.$message.info('暂无版本可切换')
          }
        })
      }
    },
    // 版本切换提交
    versionChangeSubmit() {
      this.$refs.versionChangeData.validate((valid) => {
        if (valid) {
          operateScript(this.versionChangeData.id, 'switch').then((data) => {
            if (data.success) {
              this.$message.success(data.message)
              this.getList()
              this.versionChangeVisible = false
            }
          })
        }
      })
    },
    // 版本编辑
    async handleVersionModify(id) {
      this.source = '1'
      const data = await getVersionDetail(id)
      if (data.success) {
        this.detailVersionData = data.data
        this.detailVersionData.groupIds = JSON.parse(this.detailVersionData.groupIds)
        this.modifyVersionVisible = true
      }
    },
    // 版本编辑提交
    modifyVersionSubmit() {
      this.$refs.modifyVersionData.validate((valid) => {
        if (valid) {
          modifyVersion(this.detailVersionData).then((data) => {
            if (data.success) {
              this.$message({
                message: data.message,
                type: 'success'
              })
              this.modifyVersionVisible = false
              this.getAllVersionData(this.addScript.id)
            }
          })
        }
      })
    },
    // 版本删除
    handleDeleteVersion(id) {
      this.$confirm('您确定要删除该版本吗?', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      })
        .then(() => {
          removeVersion(id).then((data) => {
            if (data.success) {
              this.$message.success({
                message: data.message,
                type: 'success'
              })
              this.getAllVersionData(this.addScript.id)
            }
          })
        })
        .catch(() => {})
    },
    async getVersionDetail(id) {
      const data = await getVersionDetail(id)
      if (data.success) {
        const versionId = this.addScript.id
        this.addScript = Object.assign({}, data.data)
        this.addScript.id = id
        this.addScript.groupIds = JSON.parse(this.addScript.groupIds)
      }
      this.addScript.version = this.versionData[id]
    }
  }
}
</script>

<style scoped="scoped" lang="scss">
.code-type {
  height: 35px;
  padding-left: 15px;
  line-height: 35px;
  border: 1px solid #ddd;
}
.content {
  font-size: 14px;
  border: 1px solid #cccccc;
  min-height: 50px;
  max-height: 300px;
  padding: 10px;
  overflow: auto;
}
.item {
  color: rgb(64 158 255);
  font-size: 16px;
}
::v-deep .tree .el-tree-node__expand-icon.expanded {
  -webkit-transform: rotate(0deg);
  transform: rotate(0deg);
}
::v-deep .el-icon-caret-right:before {
  content: '\e6e0';
  font-size: 14px;
}
::v-deep .el-tree-node__content {
  position: relative;
  height: 32px;
  line-height: 32px;
  .operate-btns {
    position: absolute;
    right: 2px;
    display: none;
  }
  // 鼠标悬停时，展示
  &:hover,
  :focus-within {
    .operate-btns {
      display: inline;
    }
  }
}
</style>
