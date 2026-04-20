<template>
  <el-container class="cmdb-container">
    <el-header>
      <div class="pull-left m-t-xs">配置模型>{{ currentModule.name }}</div>
      <div class="pull-right" v-show="activeName === 'attr'">
        <el-button class="w-sm" type="primary" @click="getEditData" v-if="!isEdit">
          <Icon type=" icon-bianji" />
          编辑
        </el-button>
        <el-button class="w-sm" type="primary" @click="saveModule" v-if="isEdit">
          <Icon type=" icon-baocun" />
          保存
        </el-button>
        <el-button class="w-sm" type="ghost" @click="cancelModule" v-if="isEdit">
          <Icon type=" icon-icon-31" />
          取消
        </el-button>
      </div>
    </el-header>
    <el-container>
      <el-aside width="200px" class="left-menu">
        <el-col :span="24">
          <el-button type="primary" size="mini" class="w-sm m-t m-l-md" @click="handleModule({ flag: 1 })"><i class="iconfont icon-Added" /></el-button>
        </el-col>
        <el-col :span="24">
          <el-menu ref="menu" :default-active="currentModule.id.toString()" class="el-menu-vertical-demo" unique-opened @select="selectMenu">
            <el-submenu :index="'first' + row.id.toString()" v-for="row in moduleList" :key="row.id">
              <template slot="title">
                <i :class="row.icon" />
                <span>{{ row.name }}</span>
              </template>
              <el-menu-item :index="item.id.toString()" v-for="item in row.modules" :key="item.id">
                {{ item.name }}
                <el-dropdown @command="handleModule" placement="bottom-start" class="menu-operate">
                  <span class="el-dropdown-link cur-point" @click.stop> <Icon type=" icon-config" /></span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item :command="{ flag: 2, id: item.id }">编辑</el-dropdown-item>
                    <el-dropdown-item :disabled="item.reserved" :command="{ flag: 3, id: item.id }">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-col>
      </el-aside>
      <el-main>
        <el-tabs v-model="activeName">
          <el-tab-pane label="模型属性" name="attr">
            <module-detail :id="currentModule.id" v-if="!isEdit && currentModule.id"></module-detail>
            <el-row :gutter="20" v-if="isEdit">
              <el-col :span="16" style="width: calc(100% - 260px)">
                <draggable :list="fieldItemList" class="field-item-container" :options="{ group: { name: 'field', pull: false, put: true } }">
                  <el-col :span="24" v-for="(item, key) in fieldItemList" :key="key" :id="key">
                    <input-module :option-data="item" :regexp-data="regexpData" v-if="item.type == 'TEXTFIELD'" @remove="removeItem(key)"></input-module>
                    <textarea-module :option-data="item" :regexp-data="regexpData" v-else-if="item.type == 'TEXTAREA'" @remove="removeItem(key)"></textarea-module>
                    <select-module :option-data="item" :regexp-data="regexpData" v-else-if="item.type == 'SELECT'" @remove="removeItem(key)"></select-module>
                    <radio-module :option-data="item" :regexp-data="regexpData" v-else-if="item.type == 'RADIO'" @remove="removeItem(key)"></radio-module>
                    <checkbox-module :option-data="item" :regexp-data="regexpData" v-else-if="item.type == 'CHECKBOX'" @remove="removeItem(key)"></checkbox-module>
                    <quote-module :option-data="item" :regexp-data="regexpData" v-else-if="item.type == 'QUOTE'" @remove="removeItem(key)"></quote-module>
                    <date-module :option-data="item" :regexp-data="regexpData" v-else-if="item.type == 'DATE'" @remove="removeItem(key)"></date-module>
                    <time-module :option-data="item" :regexp-data="regexpData" v-else-if="item.type == 'TIME'" @remove="removeItem(key)"></time-module>
                    <encr-module :option-data="item" :regexp-data="regexpData" v-else-if="item.type == 'TEXTENCRYPT'" @remove="removeItem(key)"></encr-module>
                    <integer-module :option-data="item" :regexp-data="regexpData" v-else-if="item.type == 'INTEGER'" @remove="removeItem(key)"></integer-module>
                    <float-module :option-data="item" :regexp-data="regexpData" v-else-if="item.type == 'FLOAT'" @remove="removeItem(key)"></float-module>
                    <table-module :option-data="item" :regexp-data="regexpData" v-else-if="item.type == 'TABLE'" @remove="removeItem(key)"></table-module>
                    <group-module :option-data="item" :regexp-data="regexpData" v-else-if="item.type == 'GROUP'" @remove="removeItem(key)"></group-module>
                  </el-col>
                </draggable>
              </el-col>
              <el-col :span="8" style="width: 260px">
                <el-col :span="24" class="field-list-head">属性类型</el-col>
                <el-col :span="24" class="tips-text">
                  <Icon type=" icon-jinggao" />
                  属性类型可拖动到左侧编辑区！
                </el-col>
                <el-row :gutter="5">
                  <draggable :list="fieldList" :options="{ sort: false, group: { name: 'field', pull: 'clone', put: false } }" :clone="clone">
                    <el-col :span="8" v-for="item in fieldList" :key="item.name">
                      <div class="field-btn">
                        <div class="icon-content">
                          <Icon type="" :class="item.icon" />
                        </div>
                        <div>{{ item.name }}</div>
                      </div>
                    </el-col>
                  </draggable>
                </el-row>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="模型关系" name="relation">
            <relation-module v-if="activeName == 'relation'" :id="currentModule.id"></relation-module>
          </el-tab-pane>
        </el-tabs>
      </el-main>
    </el-container>
    <!--新增界面-->
    <add-dialog :dialog="dialog" :category="currentModule.categoryId" v-if="dialog.dialogFormVisible" @updateMenu="getModuleList"></add-dialog>
  </el-container>
</template>
<script>
/* global $ */
import { getModuleTree, removeModule, getProperties, saveProperties } from 'services/cmdb/module'
import { getReg } from 'services/cmdb'
import addDialog from './addDialog.vue'
import draggable from 'vuedraggable'
import inputModule from './component/inputModule.vue'
import textareaModule from './component/textareaModule.vue'
import selectModule from './component/selectModule.vue'
import radioModule from './component/radioModule.vue'
import checkboxModule from './component/checkboxModule.vue'
import quoteModule from './component/quoteModule.vue'
import dateModule from './component/dateModule.vue'
import timeModule from './component/timeModule.vue'
import encrModule from './component/encrModule.vue'
import integerModule from './component/integerModule.vue'
import floatModule from './component/floatModule.vue'
import tableModule from './component/tableModule.vue'
import groupModule from './component/groupModule.vue'
import moduleDetail from './moduleDetail.vue'
import relationModule from './relationModule.vue'

const fieldList = [
  {
    name: '单行文本',
    icon: 'icon-danxingwenben',
    type: 'TEXTFIELD',
    length: 100
  },
  {
    name: '多行文本',
    icon: 'icon-duoxingwenben',
    type: 'TEXTAREA',
    length: 100
  },
  {
    name: '下拉菜单',
    icon: 'icon-xiala',
    type: 'SELECT',
    item: [{}]
  },
  {
    name: '单选',
    icon: 'icon-iconfontoptionbutton',
    type: 'RADIO',
    item: [{}]
  },
  {
    name: '多选',
    icon: 'icon-xuanze',
    type: 'CHECKBOX',
    item: [{}]
  },
  {
    name: '引用',
    icon: 'icon-yinyong',
    type: 'QUOTE'
  },
  {
    name: '日期',
    icon: 'icon-icon04',
    type: 'DATE'
  },
  {
    name: '时间',
    icon: 'icon-icon04',
    type: 'TIME'
  },
  {
    name: '加密数据',
    icon: 'icon-mima',
    type: 'TEXTENCRYPT',
    length: 100
  },
  {
    name: '整数',
    icon: 'icon-zhengshu',
    type: 'INTEGER'
  }, {
    name: '小数',
    icon: 'icon-xiaoshu1',
    type: 'FLOAT',
    decimalNum: 2
  },
  {
    name: '表格',
    icon: 'icon-biaoge',
    type: 'TABLE',
    item: [{}]
  },
  {
    name: '属性分组',
    icon: 'icon-fenzu',
    type: 'GROUP'
  }]
export default {
  components: {
    addDialog,
    draggable,
    inputModule,
    textareaModule,
    selectModule,
    radioModule,
    checkboxModule,
    quoteModule,
    dateModule,
    timeModule,
    encrModule,
    integerModule,
    floatModule,
    tableModule,
    groupModule,
    moduleDetail,
    relationModule
  },
  data () {
    return {
      regexpData: [],
      fieldList,
      activeName: 'attr', // 显示tab
      // 模型新增相关
      dialog: {
        dialogFormVisible: false,
        operateId: ''
      },
      isEdit: false, // 是否处于编辑模式下
      currentModule: { id: '' },
      moduleMap: {},
      moduleList: [],
      fieldItemList: [],
      moduleDetailData: []
    }
  },

  created () {
    this.getModuleList()
    this.getRegexpData()
  },
  mounted () {
  },
  methods: {
    // 模型操作
    handleModule (data) {
      switch (data.flag) {
        case 1:
          this.dialog.id = ''
          this.dialog.dialogFormVisible = true
          break
        case 2:
          this.dialogTitle = '编辑模型'
          this.dialog.id = data.id
          this.dialog.dialogFormVisible = true
          break
        case 3:
          this.$confirm('该操作不可恢复，删除模型将清空该模型下所有的配置及关联关系，建议采取禁用操作。是否确认删除?', '提示', {
            confirmButtonText: '删除',
            confirmButtonClass: 'el-button--danger',
            type: 'warning'
          }).then(() => {
            removeModule(data.id).then(data => {
              if (data.success) {
                this.$notify({
                  message: data.message,
                  type: 'success'
                })
                this.currentModule = { id: '' }
                this.getModuleList()
              }
            })
          })
      }
    },
    // 删除子项
    removeItem (key) {
      this.fieldItemList.splice(key, 1)
    },
    // 获取模型列表
    getModuleList () {
      getModuleTree({ filter: 'ALL' }).then(data => {
        if (data.success) {
          this.moduleList = data.data
          this.moduleMap = {}
          let id = ''
          // 生成模型map供后续使用
          this.moduleList.forEach(row => {
            row.modules.forEach(item => {
              this.moduleMap[item.id] = item
              if (!id) id = item.id
            })
          })
          setTimeout(() => {
            this.currentModule.id = id
            this.selectMenu(this.currentModule.id)
          })
        }
      })
    },
    // 获取正则表达式
    getRegexpData () {
      getReg().then(data => {
        if (data.success) {
          this.regexpData = data.data
        }
      })
    },
    getEditData () {
      getProperties(this.currentModule.id).then(data => {
        if (data.success) {
          this.fieldItemList = []
          this.isEdit = true
          // 编辑数据回现
          const itemData = data.data
          itemData.groups.forEach((item) => {
            item.type = 'GROUP'
            this.fieldItemList.splice(item.orderNum, 0, item)
          })
          itemData.properties.forEach((item) => {
            this.fieldItemList.splice(item.orderNum, 0, item)
          })
        }
      })
    },
    selectMenu (index) {
      this.currentModule = this.moduleMap[index]
      this.isEdit = false
      this.activeName = 'attr'
    },
    // 右侧克隆数据处理
    clone (original) {
      return this._.cloneDeep(original)
    },
    // 对数据进行验证
    validateModule () {
      const self = this
      const codeObj = {};
      const groupMap = {};
      const validate = function (data) {
        const validateNameAndCode = function () {
          if (!data.name) {
            self.$message({
              message: '字段名称不能为空',
              type: 'warning'
            })
            return false
          } else if (!data.code) {
            self.$message({
              message: '属性编码不能为空',
              type: 'warning'
            })
            return false
          } else if (!/^[a-zA-Z0-9_]*$/.test(data.code)) {
            self.$message({
              message: '属性编码只能为数字字母和下划线',
              type: 'warning'
            })
            return false
          } else if (codeObj[data.code]) {
            self.$message({
              message: '抱歉，该属性编码已被占用',
              type: 'warning'
            })
            return false
          } else {
            codeObj[data.code] = true
          }

          return true
        }
        switch (data.type) {
          case 'TEXTFIELD':
          case 'TEXTAREA':
          case 'DATE':
          case 'TIME':
          case 'TEXTENCRYPT':
          case 'INTEGER':
          case 'FLOAT':
            return validateNameAndCode()
          case 'SELECT':
          case 'RADIO':
          case 'CHECKBOX':
            // case 'TABLE':
            if (validateNameAndCode()) {
              const obj = {}
              if (!data.item.every(function (item) {
                obj[item.value] = obj[item.value] ? ++obj[item.value] : 1
                return item.name && item.value
              })) {
                self.$message({
                  message: '值的属性和描述不能为空',
                  type: 'warning'
                })
                return false
              } else {
                for (const a in obj) {
                  if (obj[a] > 1) {
                    self.$message.error('属性值必须唯一')
                    return false
                  }
                }
              }
            } else return false
            return true
          case 'TABLE':
            if (validateNameAndCode()) {
              if (!data.item.every(function (item) {
                return item.name
              })) {
                self.$message({
                  message: '列名不能为空',
                  type: 'warning'
                })
                return false
              }
            } else return false
            return true
          case 'QUOTE':
            if (validateNameAndCode()) {
              if (!data.linkModuleId) {
                self.$message({
                  message: '引入对象不能为空',
                  type: 'warning'
                })
                return false
              }
            } else return false
            return true
          case 'GROUP':
            if (!data.name) {
              self.$message({
                message: '字段名称不能为空',
                type: 'warning'
              });
              return false
            }
            if (groupMap[data.name]) {
              self.$message.warning('分组名称不能重复');
              return false
            }
            groupMap[data.name] = true;
            return true
        }
      }
      return this.fieldItemList.every((item, key) => {
        if (!validate(item)) {
          setTimeout(() => {
            $('#' + key).find('.field-item').trigger('click')
          })
          return false
        } else return true
      })
    },
    // 处理保存数据
    handleSaveData () {
      let groupName = ''
      const properties = [], groups = [],
      this.fieldItemList.forEach((row, index) => {
        row.orderNum = index
        if (row.type === 'GROUP') {
          groupName = row.name
          row.moduleId = this.currentModule.id
          groups.push(row)
        } else {
          row.groupName = groupName
          row.moduleId = this.currentModule.id
          properties.push(row)
        }
      });
      return {
        moduleId: this.currentModule.id,
        properties: properties,
        groups: groups
      }
    },
    // 保存模型属性
    saveModule () {
      if (!this.validateModule()) return
      saveProperties(this.handleSaveData()).then(data => {
        if (data.success) {
          this.isEdit = false
          this.$message({
            message: data.message,
            type: 'success'
          })
        }
      })
    },
    // 取消保存
    cancelModule () {
      this.$confirm('您确定要取消编辑该模型吗？ 取消后所编辑内容将全部失效', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '关闭',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        this.isEdit = false
      })
    }

  }
}
</script>
<style lang="scss">
.cmdb-container {
  background: #fff;
}

.cmdb-container .el-header {
  padding: 10px 20px;
  height: auto !important;
  border-bottom: 1px solid #ddd;
}

.field-item-container {
  min-height: 600px;
  border-right: 1px solid #ddd;
}

.field-item {
  margin-top: 10px;
  cursor: move;
  padding: 5px;
  position: relative;
}

.field-item.selected {
  border: 1px solid #ddd;
}

.field-item-container .field-item-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
  padding-right: 10px;
  margin: 0;
  width: 20%;
  height: 30px;
  line-height: 30px;
  max-width: 110px;
  color: #3c763d;
}

.field-item-container .field-item-value {
  width: calc(80% - 40px);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.field-item-container .field-item-operate {
  margin-left: 10px;
  width: 30px;
  height: 30px;
  background-color: #dff0d8;
  border-color: #d6e9c6;
  color: #d05d5d;
  border-radius: 5px;
  text-align: center;
  line-height: 30px;
  display: block;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  z-index: 100;
}

.field-list-head {
  padding: 8px 12px;
  color: #8a6d3b;
  background-color: #fcf8e3;
  border-color: #faebcc;
}

.tips-text {
  margin-top: 10px;
  border: 1px dashed #6ac5fe;
  color: #6ac5fe;
  line-height: 30px;
  padding: 0 10px;
}

.field-btn {
  width: 70px;
  height: 70px;
  text-align: center;
  cursor: move;
  border-radius: 2px;
  display: block;
  margin: 12px 0 0 0;
  color: #4082e6;
  border: 1px solid #e4e7eb;
  .icon-content {
    -webkit-transition: -webkit-transform 0.25s linear;
    transition: -webkit-transform 0.25s linear;
    line-height: 48px;
    height: 42px;
    .iconfont {
      font-size: 24px;
    }
  }
  &:hover .icon-content {
    -webkit-transform: scale3d(1.3, 1.3, 1.3);
    transform: scale3d(1.3, 1.3, 1.3);
  }
}

.field-options {
  width: 300px;
}

.field-options-title {
  padding: 0 16px;
  line-height: 32px;
  height: 32px;
  border-bottom: 1px solid #88aac7;
  color: #31708f;
}

.field-options-item {
  margin-bottom: 10px;
}

.icon-guanjianzi {
  font-size: 13px;
  color: #ffda00;
}

.field-options-item label.required:before,
.field-item label.required:before {
  display: inline-block;
  margin-right: 4px;
  content: '*';
  font-size: 13px;
  color: #f50;
}

span.title {
  font-size: inherit;
  color: inherit;
}

.item-group {
  width: calc(100% - 45px) !important;
  padding: 5px 8px;
  color: #3c763d;
  background-color: #dff0d8;
}

.left-menu .menu-operate {
  position: absolute;
  right: 20px;
  height: 30px;
  display: none;
}

.el-menu-item.is-active .menu-operate {
  display: inline-block;
}
</style>
