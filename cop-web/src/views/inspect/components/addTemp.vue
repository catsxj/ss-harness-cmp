<template>
<el-dialog :title="title" :close-on-click-modal="false" :before-close="back" :visible.sync="dialog.show" width="800px" append-to-body>
    <basic-form :model="addData" ref="form" labelWidth="100px" :disabled="dialog.isview">
      <basic-form-item label="模板名称：" prop="name" validate="required" required-message="请输入模板名称">
        <el-input v-model.trim="addData.name"/>
      </basic-form-item>
      <basic-form-item label="指标分类：" v-if="!dialog.isview">
        <el-select v-model="addData.type" filterable @change="getInspectItemByType">
          <el-option v-for="item in normListAll"
            :key="item.id"
            :label="item.name"
            :value="item.code">
          </el-option>
        </el-select>
      </basic-form-item>
      <basic-form-item label="巡检项：">
        <el-transfer v-model="addData.item" :data="inspectItem"
          :titles="['巡检项列表', '已选巡检项']"
          :props="{ key: 'id', label: 'name' }"
          filterable
        >
          <span slot-scope="{ option }">
            <el-tooltip :content="option.name" placement="top" effect="light" :open-delay="500">
              <span>{{ option.name }}</span>
            </el-tooltip>
          </span>
        </el-transfer>
      </basic-form-item>
    </basic-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click.native="back">取消</el-button>
      <el-button type="primary" @click.native="create" :loading="loading" v-if="!dialog.isview">提交</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { normListAll, getTempDetail } from '../utils/index'
import { createTemplates, modifyTemplates, getAllInspectItem, getInspectItem } from 'services/task/inspect'
export default {
  props: {
    dialog: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      normListAll,
      loading: false,
      addData: {
        name: '',
        type: '',
        item: []
      },
      inspectItem: []
    }
  },
  computed: {
    title () {
      return this.dialog.isview ? '查看巡检模板' : (this.dialog.id ? '编辑巡检模板' : '新增巡检模板')
    }
  },
  mounted () {
    this.getInspectItem()
    // 编辑
    if (this.dialog.id) {
      getTempDetail(this, this.dialog.id).then(res => {
        this.addData.name = this.dialog.name
        res.forEach(item => {
          this.addData.item.push(item.id)
        })
      })
    }
  },
  methods: {
    back () {
      this.dialog.show = false
    },
    // 获取巡检列表
    getInspectItem () {
      return getAllInspectItem().then(data => {
        if (data.success) {
          this.inspectItem = data.data
        }
      })
    },
    getInspectItemByType () {
      if (this.addData.type === 'all') {
        this.getInspectItem()
        return
      }
      const params = {}
      params.params = JSON.stringify([
        {
          param: {
            targetType: this.addData.type
          },
          sign: 'EQ'
        }
      ])
      getInspectItem(params).then(data => {
        if (data.success) {
          this.inspectItem = data.data.rows
        }
      })
    },
    create () {
      if (!this.addData.item?.length > 0) {
        this.$message.error('请选择巡检项')
        return
      }
      this.$refs.form.validate(valid => {
        if (valid) {
          this.loading = true
          const params = {
            item: []
          }
          let http = createTemplates
          if (this.dialog.id) {
            // 编辑提交
            http = modifyTemplates
            params.id = this.dialog.id
          }
          this.addData.item.forEach(item => {
            params.item.push({ id: Number(item) })
          })
          params.name = this.addData.name
          http(params).then(data => {
            if (data.success) {
              this.back()
              this.$notify.success(data.message)
              this.$emit('getList')
            }
          }).finally(_ => {
            this.loading = false
          })
        }
      })
    }
  }
}
</script>
