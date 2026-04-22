<template>
  <div>
    <el-button type="primary" style="margin-bottom: 10px;" @click="addResource" icon="el-icon-plus">
      添加资源
    </el-button>
    <el-card class="m-b card-layout" v-for="(resource, sindex) in itemData.customParams" :key="sindex">
      <div slot="header">
        <span @click="toggleShowStatus(resource)" style="display: inline-block; width: calc(100% - 20px);">资源</span>
        <i class="el-icon-close" @click="delResource(sindex, resource)"></i>
      </div>
      <el-collapse-transition>
        <div style="padding: 20px;" v-show="resource.show">
          <el-row class="header" :gutter="20">
            <el-col :span="9" :offset="0">
              <basic-form-item label="资源名称：" :prop="`hostGroupList.${itemIndex}.customParams.${sindex}.resourceId`" validate="required" required-message="请选择资源">
                <el-select v-model="resource.resourceId" filterable @change="clearParam(resource,sindex)">
                  <el-option label="全部" :value="0"></el-option>
                  <el-option v-for="item in itemData.hostList" :key="item.id" :label="item[`${itemData.executeType === 'remote' ? 'rawName' : 'host'}`]" :value="item.id">
                  </el-option>
                </el-select>
              </basic-form-item>
            </el-col>
            <el-col :span="9" :offset="0">
              <basic-form-item label="巡检项：" :prop="`hostGroupList.${itemIndex}.customParams.${sindex}.itemId`" validate="required" required-message="请选择巡检项">
                <el-select v-model="resource.itemId" filterable @change="judge(resource, sindex)">
                  <el-option v-for="item in selectInspectItem" :key="item.id" :label="item.name" :value="item.id">
                  </el-option>
                </el-select>
              </basic-form-item>
            </el-col>
            <el-col :span="4" :offset="0">
              <el-button class="pull-right" type="primary" @click="addParam(resource, sindex)">添加参数</el-button>
            </el-col>
          </el-row>
          <el-row v-for="(param, pindex) in resource.customParams" :key="pindex" :gutter="20">
            <el-col :span="9" :offset="0">
              <basic-form-item label="参数名称：" :prop="`hostGroupList.${itemIndex}.customParams.${sindex}.customParams.${pindex}.key`" validate="required" required-message="参数名称不能为空">
                <el-select v-model="param.key" filterable>
                  <el-option v-for="item in resource.keys" :key="item.id" :label="item.name" :value="item.name">
                  </el-option>
                </el-select>
              </basic-form-item>
            </el-col>
            <el-col :span="9" :offset="0">
              <basic-form-item label="参数值：" :prop="`hostGroupList.${itemIndex}.customParams.${sindex}.customParams.${pindex}.value`" validate="required" required-message="参数值不能为空">
                <el-input v-model.trim="param.value" placeholder="" clearable></el-input>
              </basic-form-item>
            </el-col>
            <el-col :span="4" :offset="0">
              <el-button class="pull-right" type="danger" circle icon="el-icon-delete" @click="delParam(sindex, pindex, resource)">
              </el-button>
            </el-col>
          </el-row>
        </div>
      </el-collapse-transition>
    </el-card>
  </div>
</template>

<script>
import { getInspectItemParams } from 'services/task/inspect'
export default {
  props: {
    itemData: {
      type: Object,
      required: true
    },
    itemIndex: {
      type: Number,
      required: true
    },
    inspectItem: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      customParamsData: {
        show: true,
        resourceId: '',
        itemId: '',
        customParams: []
      },
      flag: true
    }
  },
  computed: {
    selectInspectItem() {
      const data = [
        {
          id: 0,
          name: '选择全部'
        }
      ]
      this.inspectItem.forEach((item) => {
        if (this.itemData.itemIds.includes(item.id)) {
          data.push(item)
        }
      })
      return data
    }
  },
  watch: {
    'itemData.itemIds'(val) {
      this.itemData.customParams = []
      this.itemData.customParams.push(this.customParamsData)
      if (this.flag) {
        this.addParam(this.itemData.customParams[0], 0)
        this.flag = false
      }
    }
  },
  methods: {
    // 资源改变时参数列表清空
    clearParam(data, index) {
      data.customParams = []
      this.addParam(data, index)
    },
    createResourceList(rName, val) {
      const data = val.slice()
      data.unshift({
        id: 0,
        [rName]: '选择全部'
      })
      this.resourceList = data
      this.rName = rName
    },
    // 判断是否已经选择过
    judge(data, index) {
      let flag_i = 0
      for (const item of this.itemData.customParams) {
        if (item.itemId === data.itemId && item.resourceId === data.resourceId) {
          flag_i++
          if (flag_i === 2) {
            data.itemId = ''
            return this.$message.error('该巡检项已经选择过，请勿重复选择')
          }
        }
      }
      this.getParamList(data, index)
    },
    // 获取参数
    getParamList(data, idx) {
      let itemId = data.itemId
      if (data.itemId == 0) {
        itemId = this.itemData.itemIds.join(',')
      }
      getInspectItemParams({
        params: itemId
      }).then((res) => {
        let index = 0
        data.keys = res.data.map((item) => {
          return {
            id: index++,
            name: item
          }
        })
        data.customParams = []
        this.addParam(data, idx)
      })
    },
    // 添加资源
    addResource() {
      if (!this.itemData.data && !this.itemData.hostList) {
        return this.$message.error('请先添加资源')
      }
      if (!(this.itemData.itemIds?.length > 0)) {
        return this.$message.error('请先选择巡检项')
      }
      this.itemData.customParams.forEach((item) => {
        item.show = false
      })
      this.itemData.customParams.push({
        show: true,
        resourceId: '',
        itemId: '',
        customParams: []
      })
    },
    // 添加参数
    addParam(data, index) {
      data.customParams.push({})
      this.$set(this.itemData.customParams, index, data)
    },
    delParam(sindex, pindex, data) {
      this.itemData.customParams[sindex].customParams.splice(pindex, 1)
    },
    // 切换显示状态
    toggleShowStatus(item) {
      item.show = !item.show
    },
    delResource(index, item) {
      this.$confirm('是否确认删除？', '操作确认', {
        confirmButtonText: '确定',
        type: 'warning'
      }).then(() => {
        this.itemData.customParams.splice(index, 1)
      })
    }
  }
}
</script>
