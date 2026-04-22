<template>
<el-dialog :title="title" :close-on-click-modal="false" :before-close="back" :visible.sync="dialog.show" width="800px" append-to-body>
    <basic-form :model="addData" ref="form" labelWidth="100px" :disabled="dialog.isview">
      <basic-form-item label="模板名称：" prop="name" validate="required" required-message="请输入指标名称">
        <el-input placeholder="请输入指标名称" v-model.trim="addData.name"></el-input>
      </basic-form-item>
      <basic-form-item label="基线分类：">
        <el-select v-model="addData.type" clearable filterable @change="getLineItemByType">
          <el-option v-for="item in normListAll"
            :key="item.id"
            :label="item.name"
            :value="item.code">
          </el-option>
        </el-select>
      </basic-form-item>
      <basic-form-item label="基线项：" validate="required">
        <el-transfer v-model="addData.item" :data="lineItem"
          :titles="['基线项列表', '已选基线项']"
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
import { normListAll, getComplianceTempDetail } from '../utils/index'
import { getBaseLineList, getAllBaseLineList, createTemplate, modifyTemplate } from 'services/task/compliance'
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
      lineItem: []
    }
  },
  computed: {
    title () {
      return this.dialog.isview ? '查看合规模板' : (this.dialog.id ? '编辑合规模板' : '新增合规模板')
    }
  },
  mounted () {
    this.getLineItem()
    // 编辑
    if (this.dialog.id) {
      getComplianceTempDetail(this, this.dialog.id).then(res => {
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
    getLineItem () {
      return getAllBaseLineList().then(data => {
        if (data.success) {
          this.lineItem = data.data
        }
      })
    },
    getLineItemByType () {
      if (this.addData.type === 'all') {
        this.getLineItem()
        return
      }
      const params = {}
      params.params = JSON.stringify([
        {
          param: {
            itemType: this.addData.type
          },
          sign: 'EQ'
        }
      ])
      getBaseLineList(params).then(data => {
        if (data.success) {
          this.lineItem = data.data.rows
        }
      })
    },
    create () {
      if (!this.addData.item?.length > 0) {
        this.$message.error('请选择基线项')
        return
      }
      this.$refs.form.validate(valid => {
        if (valid) {
          this.loading = true
          const params = {
            item: []
          }
          let http = createTemplate
          if (this.dialog.id) {
            // 编辑提交
            http = modifyTemplate
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
