<template>
  <el-row>
    <el-col :span="24">
      <span>关系维度：</span>
      <el-radio-group v-model="categoryId" size="medium" @change="getData()">
        <el-radio-button v-for="item in categoryData" :label="item.id" :key="item.id">{{ item.name }}</el-radio-button>
      </el-radio-group>
    </el-col>
    <el-col :span="24">
      <graph-charts id="module-topology" :data="data" width="100%" height="600px" v-if="data.nodes" @mouseup="operateChart"></graph-charts>
      <ul class="operate-node-menu node-menu">
        <li class="entry-trangle"></li>
        <li>
          <a @click="openDialog(1)">
            <Icon type=" icon-lianxian" />
            添加上级模型</a
          >
        </li>
        <li>
          <a @click="openDialog(2)">
            <Icon type=" icon-lianxian" />
            添加下级模型</a
          >
        </li>
        <li @click="removeModuleRelation" v-show="currentNode.relationId">
          <a>
            <Icon type=" icon-delete" />
            删除自身关系</a
          >
        </li>
      </ul>
      <ul class="operate-node-menu link-menu">
        <li class="entry-trangle"></li>
        <li @click="removeModuleRelation">
          <a>
            <Icon type=" icon-delete" />
            删除关系</a
          >
        </li>
      </ul>
    </el-col>
    <el-dialog :title="dialogTitle" :close-on-click-modal="false" v-if="dialogVisible" :visible.sync="dialogVisible" width="55%">
      <el-form>
        <el-form-item label="限制条件：">
          <el-radio-group v-model="limitCell">
            <el-tooltip class="item" effect="dark" :content="item.desc" placement="top" v-for="(item, key) in limitData" :key="key">
              <el-radio :label="item" border>
                <span>{{ item.source }}</span>
                <span>对 {{ item.target }}</span>
              </el-radio>
            </el-tooltip>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <el-row>
        <el-col :span="8" class="relation">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>请选择关系</span>
            </div>
            <div class="list-group">
              <a v-for="(node, key) in relationData" :key="key" class="list-group-item" :class="{ hover: node.selected }" @click="selectRelation(node)">
                <span class="block text-ellipsis">{{ node.name }}</span>
              </a>
            </div>
          </el-card>
        </el-col>
        <el-col :span="16">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>可以添加多个模型</span>
            </div>
            <el-tabs class="m-t-n">
              <el-tab-pane v-for="row in moduleData" :label="row.name" :key="row.id">
                <el-row>
                  <el-col :span="8" class="field-cell" v-for="item in row.modules" :key="item.id" :class="{ selected: item.selected }" @click.native="item.selected = !item.selected">
                    {{ item.name }}
                  </el-col>
                </el-row>
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click.native="createModuleRelation">确定</el-button>
      </div>
    </el-dialog>
  </el-row>
</template>
<script>
/* global $ */
import { getRelation, getCategory } from 'services/cmdb/relation'
import { getModuleTree, getModuleRelation, createModuleRelation, removeModuleRelation, validateRemoveRelation } from 'services/cmdb/module'

const limitData = [
  {
    target: '一',
    source: '一',
    desc: '该模型下的1个配置可与其他模型关系下的1个配置建立关系',
    sourceValue: '1',
    targetValue: '1'
  },
  {
    target: '多',
    source: '一',
    desc: '该模型下的1个配置可与其他模型关系下的多个配置建立关系',
    sourceValue: '1',
    targetValue: 'N'
  },
  {
    target: '一',
    source: '多',
    desc: '该模型下的多个配置可与其他模型关系下的1个配置建立关系',
    sourceValue: 'N',
    targetValue: '1'
  },
  {
    target: '多',
    source: '多',
    desc: '该模型下的多个配置可与其他模型关系下的多个配置建立关系',
    sourceValue: 'N',
    targetValue: 'N'
  }
]
export default {
  props: {
    id: {}
  },
  data() {
    return {
      data: {},
      limitData,
      limitCell: limitData[0],
      currentNode: '',
      categoryData: '',
      categoryId: '',
      relationData: [],
      dialogTitle: '',
      dialogVisible: false,
      moduleData: [],
      addData: {}
    }
  },

  created() {
    this.getCategory()
  },
  methods: {
    // 对图形进行操作
    operateChart(params) {
      const event = params.event.event
      event.stopPropagation()
      if (event.button == 2) {
        if (params.data.isRoot) {
          $('.node-menu')
            .css({
              top: event.y - 200,
              left: event.x - 380
            })
            .show()
        } else {
          $('.link-menu')
            .css({
              top: event.y - 200,
              left: event.x - 380
            })
            .show()
        }

        this.currentNode = params.data
      }
    },
    openDialog(flag) {
      if (flag === 1) this.dialogTitle = '添加上级模型'
      else this.dialogTitle = '添加下级模型'
      this.limitCell = limitData[0] // 重置类型
      this.dialogVisible = true
      this.addData = {
        categoryId: this.categoryId,
        relationId: ''
      }
      this.getRelation()
      this.getModuleTree()
    },
    handleRelationData(data) {
      if (data.relationName) {
        data.name = `${data.name}(${data.relationName})`
      }
      data.nodes.push({
        id: data.id,
        icon: data.icon,
        name: data.name,
        isRoot: true,
        relationId: data.relationId
      })
      const locationMap = {}
      data.nodes.forEach((item, index) => {
        locationMap[item.id] = index
        item.draggable = 'true'
        item.symbol = 'image://' + item.icon
      })
      data.links.forEach(item => {
        item.source = locationMap[item.source]
        item.target = locationMap[item.target]
        item.value = `${item.relation}(${item.type})`
      })
      this.data = {
        nodes: data.nodes,
        links: data.links
      }
    },
    // 获取拓扑数据
    getData() {
      getModuleRelation({
        categoryId: this.categoryId || 1,
        id: this.id
      }).then(data => {
        if (data.success) {
          this.handleRelationData(data.data)
        }
      })
    },
    getModule() {
      getModuleTree({
        filter: 'ALL',
        excludeRelationModuleId: this.currentNode.id,
        categoryId: this.categoryId
      }).then(data => {
        if (data.success) {
          this.moduleData = data.data
          this.moduleData.forEach(row => {
            row.modules.forEach(item => {
              this.$set(item, 'selected', false)
            })
          })
        }
      })
    },
    getCategory() {
      getCategory().then(data => {
        if (data.success) {
          this.categoryData = data.data
          this.categoryId = data.data[0].id
          this.getData()
        }
      })
    },
    // 选择关系
    selectRelation(node) {
      this.relationData.forEach(item => {
        item.selected = false
      })
      node.selected = true
      this.addData.relationId = node.id
    },
    // 获取关系
    getRelation() {
      getRelation({ categoryId: this.categoryId }).then(data => {
        if (data.success) {
          this.relationData = data.data
          this.relationData.forEach(item => {
            this.$set(item, 'selected', false)
          })
          this.selectRelation(this.relationData[0])
        }
      })
    },
    // 删除模型关系
    removeModuleRelation() {
      validateRemoveRelation(this.currentNode.id, this.currentNode.relationId).then(data => {
        if (data.success) {
          this.$message({
            message: data.message,
            type: 'success'
          })
          this.getData()
        } else {
          this.$confirm('此关系已在仓库中应用，若确认删除，则会解绑所有已配置的关系,是否继续？', '提示', {
            confirmButtonText: '继续',
            confirmButtonClass: 'el-button--danger',
            type: 'warning'
          }).then(() => {
            removeModuleRelation(this.currentNode.id, this.currentNode.relationId).then(data => {
              if (data.success) {
                this.$message({
                  message: data.message,
                  type: 'success'
                })
                this.getData()
              }
            })
          })
        }
      })
    },
    // 添加模型关系
    createModuleRelation() {
      const target = []
      // 组合添加模型关系的数据
      this.moduleData.forEach(row => {
        row.modules.forEach(item => {
          if (item.selected) {
            let obj = {}
            if (this.dialogTitle === '添加上级模型') {
              obj = {
                sourceId: item.id,
                targetId: this.currentNode.id,
                sourceType: this.limitCell.targetValue,
                targetType: this.limitCell.sourceValue,
                categoryId: this.addData.categoryId,
                relationId: this.addData.relationId
              }
            } else {
              obj = {
                sourceId: this.currentNode.id,
                targetId: item.id,
                sourceType: this.limitCell.sourceValue,
                targetType: this.limitCell.targetValue,
                categoryId: this.addData.categoryId,
                relationId: this.addData.relationId
              }
            }

            target.push(obj)
          }
        })
      })
      createModuleRelation(this.currentNode.id, { relation: target }).then(data => {
        if (data.success) {
          this.$message({
            message: data.message,
            type: 'success'
          })
          this.dialogVisible = false
          this.getData()
        }
      })
    }
  }
}
</script>
<style scope>
.operate-node-menu {
  background: rgba(0, 0, 0, 0.6);
  border-radius: 4px;
  border: 1px solid #e6ebf5;
  padding: 8px;
  z-index: 2000;
  text-align: justify;
  word-break: break-all;
  font-size: 14px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  position: absolute;
  list-style: none;
  display: none;
}

.entry-trangle {
  position: absolute;
  width: 0;
  height: 0;
  border-color: transparent;
  border-style: solid;
  top: 10px;
  left: -8px;
  border-width: 8px 8px 8px 0;
  border-right-color: rgba(0, 0, 0, 0.6);
}

.relation .el-card__body {
  padding: 0 !important;
  max-height: 300px;
  overflow: auto;
}

.operate-node-menu li a {
  display: block;
  color: #fff;
  padding: 6px 10px;
  cursor: pointer;
}

.operate-node-menu li a:hover {
  color: #409eff;
}

a.list-group-item:nth-child(odd) {
  border-left-color: #7266ba !important;
}

a.list-group-item:hover,
a.list-group-item:focus,
a.list-group-item.hover {
  background-color: #ececec;
}

.list-group-item:hover .hover-action {
  display: inline-block;
}

.hover-action {
  display: none;
}

.field-cell.selected {
  color: #fff;
  background: #22adf6;
}

.field-cell {
  height: 26px;
  width: 24%;
  border-radius: 2px;
  margin: 1px 1px 10px 1px;
  cursor: pointer;
  line-height: 26px;
  text-align: center;
  background: #eee;
}
</style>
