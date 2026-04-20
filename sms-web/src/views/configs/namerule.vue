<template>
  <el-card class="wrapper">
    <AdvanceTable title="命名规则" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
      <template v-slot:action>
        <el-button type="primary" @click="handleCreate()" slot="operate" icon="el-icon-plus"> 新增 </el-button>
      </template>
      <template #composition="val, record">
        {{ record.hasUser ? '用户' : '' }} {{ record.customize ? '自定义' : '' }} {{ record.hasProject ? $store.getters.systemConfig.projectConfigLabel + '名称' : '' }} {{ record.hasProjectCode ? $store.getters.systemConfig.projectConfigLabel + '编号' : '' }} {{ record.hasIp ? 'IP地址' : '' }}
        {{ record.hasProjectAbbreviation ? $store.getters.systemConfig.projectConfigLabel + '简称' : '' }}
      </template>
      <template #suffixType="val, record">
        {{ suffixTypeFilter(record.suffixType) }}
      </template>
      <template #suffixLength="val, record">
        {{ record.suffixType === 'RandomString' ? record.suffixLength : '无' }}
      </template>
      <template #currentNum="val, record">
        {{ record.suffixType === 'Number' ? record.currentNum : '无' }}
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="handleCreate('edit', record)"> <i class="el-icon-edit"></i> 编辑 </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="remove(record.id)"> <i class="el-icon-delete"></i> 删除 </el-button>
      </template>
    </AdvanceTable>
    <el-dialog :title="textMap[dialogStatus]" width="1000px" :close-on-click-modal="false" v-if="addDialogVisible" :visible.sync="addDialogVisible">
      <basic-form :model="addData" ref="addData">
        <basic-form-item label="规则名称：" prop="name" validate="required">
          <el-input v-model="addData.name" auto-complete="off"></el-input>
        </basic-form-item>
        <basic-form-item label="组合选项：" prop="type" validate="required">
          <el-checkbox-group v-model="addData.type">
            <el-checkbox v-for="item in typeList" :label="item.value" :key="item.value" border>{{ item.name }}</el-checkbox>
          </el-checkbox-group>
        </basic-form-item>
        <basic-form-item label="自定义值：" prop="customize" v-if="addData.type.includes('customize')" validate="required">
          <el-input v-model="addData.customize"></el-input>
        </basic-form-item>
        <el-form-item label="后缀类型：">
          <el-radio-group v-model="addData.suffixType">
            <el-radio v-for="item in suffixTypeList" :key="item.value" :label="item.value" border>{{ item.name }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="后缀长度：" prop="suffixLength" v-if="addData.suffixType === 'RandomString'">
          <el-tooltip content="请输入10-20之间的数值" placement="top">
            <el-input-number v-model="addData.suffixLength" :min="10" :max="20" :controls="false" style="width: 100%"></el-input-number>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="当前编号：" prop="currentNum" v-if="addData.suffixType === 'Number'" :disabled="addData.id">
          <el-input-number v-model="addData.currentNum" :min="1" :controls="false" style="width: 100%"></el-input-number>
        </el-form-item>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit" :loading="loading">确定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { IAjaxData, IListParams } from '@/common/interface'
import { getNameRule, removeNameRule, createNameRule, modifyNameRule } from 'services/platform/index'

@Component
export default class NameRule extends Vue {
  private params: IListParams = {
    page: 1,
    rows: 10
  }

  private searchConfigs = [{ label: '名称', value: 'name', type: 'Input' }]
  private columns = [
    {
      label: '名称',
      prop: 'name',
      scopedSlots: { customRender: 'name' }
    },
    {
      label: '组合选项',
      scopedSlots: { customRender: 'composition' }
    },
    {
      label: '自定义值',
      prop: 'customize',
      scopedSlots: { customRender: 'customize' }
    },
    {
      label: '后缀类型',
      prop: 'suffixType',
      scopedSlots: { customRender: 'suffixType' }
    },
    {
      label: '后缀长度',
      prop: 'suffixLength',
      scopedSlots: { customRender: 'suffixLength' }
    },
    {
      label: '当前编号',
      prop: 'currentNum',
      scopedSlots: { customRender: 'currentNum' }
    },
    {
      label: '操作',
      disabled: true,
      width: '160px',
      scopedSlots: { customRender: 'operate' }
    }
  ]

  private list: any = []
  private total = 0
  private addDialogVisible = false
  private addData: any = {}
  private textMap = {
    update: '编辑规则',
    create: '添加规则'
  }

  private dialogStatus = ''
  private typeList = [
    { name: '用户', value: 'hasUser' },
    { name: 'IP地址', value: 'hasIp' },
    { name: this.$store.getters.systemConfig.projectConfigLabel + '名称', value: 'hasProject' },
    { name: this.$store.getters.systemConfig.projectConfigLabel + '编号', value: 'hasProjectCode' },
    { name: this.$store.getters.systemConfig.projectConfigLabel + '简称', value: 'hasProjectAbbreviation' },
    { name: '自定义', value: 'customize' }
  ]

  private suffixTypeList = [
    { name: '毫秒数', value: 'Millis' },
    { name: '随机字符串', value: 'RandomString' },
    { name: '顺序编号', value: 'Number' }
  ]

  private loading = false
  private suffixTypeFilter = (value: string) => {
    const map: any = {
      Millis: '毫秒数',
      RandomString: '随机字符串',
      Number: '顺序编号'
    }
    return map[value]
  }

  private handlePostData() {
    const { id, name, type, suffixType, suffixLength, currentNum, customize } = this.addData
    const addData: any = { id, name, suffixType, suffixLength, currentNum, hasTenant: false, hasUser: false, hasBusiness: false, hasProject: false, hasProjectCode: false, hasIp: false, hasProjectAbbreviation: false }
    type.forEach((item: string) => {
      if (item !== 'customize') addData[item] = true
    })
    if (type.includes('customize')) addData.customize = customize
    return addData
  }

  private addSubmit() {
    ;(this.$refs.addData as any).validate((valid: boolean) => {
      if (valid) {
        this.loading = true
        const addData = this.handlePostData()
        const service = addData.id ? modifyNameRule : createNameRule
        service(addData)
          .then((data: any) => {
            if (data.success) {
              this.$message({
                message: data.message,
                type: 'success'
              })
              this.addDialogVisible = false
              this.getList()
            }
          })
          .finally(() => {
            this.loading = false
          })
      }
    })
  }

  private handleCreate(type: string, data: any) {
    if (type === 'edit') {
      this.addData = Object.assign({}, data, { type: [] })
      ;['hasTenant', 'hasUser', 'hasBusiness', 'hasProject', 'hasProjectCode', 'hasIp', 'hasProjectAbbreviation', 'customize'].forEach((item) => {
        if (this.addData[item]) {
          this.addData.type.push(item)
        }
      })
      this.dialogStatus = 'update'
      this.addDialogVisible = true
    } else {
      this.addData = {
        suffixLength: 10,
        currentNum: 1,
        suffixType: 'Millis',
        type: []
      }
      this.dialogStatus = 'create'
      this.addDialogVisible = true
    }
  }

  private remove(id: number) {
    this.$confirm('此操作将永久删除该规则, 是否继续?', '提示', {
      type: 'warning'
    }).then(() => {
      removeNameRule(id).then((data: any) => {
        if (data.success) {
          this.$message({
            type: 'success',
            message: data.message
          })
          this.getList()
        }
      })
    })
  }

  private getList() {
    this.loading = true
    getNameRule(this.params)
      .then((data: any) => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
      .finally(() => {
        this.loading = false
      })
  }

  private handleSearch(params: any) {
    this.params.page = 1
    this.params.params = params
    this.getList()
  }
}
</script>
<style scoped lang="scss">
.wrapper ::v-deep .el-card__body {
  padding: 0 !important;
}
.table-container {
  margin-bottom: 0;
}
</style>
