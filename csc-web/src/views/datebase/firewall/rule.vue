<template>
  <el-dialog title="规则设置" :close-on-click-modal="false" :visible.sync="dialog.visible" width="800px" append-to-body="">
    <el-button type="primary" @click="addItem()" class="m-b-sm">
      <Icon type="icon-add"></Icon>
      新增规则
    </el-button>
    <basic-form :model="addData" ref="addForm">
      <CardLayout :title="`防火墙规则【${item.name || ''}】`" v-for="(item, index) in addData.rules" :key="index">
        <el-button type="text" slot="operate" class="pull-right operate" @click="removeItem(index)">删除</el-button>
        <el-row :gutter="20">
          <el-col :span="12">
            <basic-form-item label="名称：" :prop="`rules.${index}.name`" validate="required">
              <el-input v-model="item.name" auto-complete="off"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="动作：">
              <el-radio-group v-model="item.action">
                <el-radio label="ALLOW">允许</el-radio>
                <el-radio label="DROP">丢弃</el-radio>
                <el-radio label="REJECT">拒绝</el-radio>
              </el-radio-group>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <basic-form-item label="方向：">
              <el-radio-group v-model="item.direction">
                <el-radio label="IN">入站</el-radio>
                <el-radio label="OUT">出站</el-radio>
                <el-radio label="IN_OUT">双向</el-radio>
              </el-radio-group>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="IP协议：">
              <el-select v-model="item.ipProtocol">
                <el-option value="IPV4" label="IPv4"></el-option>
                <el-option value="IPV6" label="IPv6"></el-option>
                <el-option value="IPV4_IPV6" label="IPV4_IPV6"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <basic-form-item label="启用规则：">
              <el-switch v-model="item.disabled" :active-value="false" :inactive-value="true" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="启动日志：">
              <el-switch v-model="item.logged" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <basic-form-item label="规则标记：" prop="ruleTag">
              <el-input type="textarea" v-model="item.ruleTag" auto-complete="off"></el-input>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <basic-form-item label="规则源：">
              <SelectDialog :ip-list="nodes" :item-data="item" resourceType="sources" :mysql-data="mysqlData"></SelectDialog>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <basic-form-item label="规则目标：">
              <SelectDialog :ip-list="nodes" :item-data="item" resourceType="destinations" :mysql-data="mysqlData"></SelectDialog>
            </basic-form-item>
          </el-col>
        </el-row>
      </CardLayout>
    </basic-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click.native="dialog.visible = false">取消</el-button>
      <el-button type="primary" @click.native="addSubmit" :loading="loading">保存配置</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getFirewallRule, configFirewallRule } from 'services/platform/nsx/firewall'
import SelectDialog from './selectDialog.vue'
import { targetTypeFilter } from './filters'

export default {
  components: {
    SelectDialog
  },
  props: {
    detailData: {
      type: Object
    },
    dialog: {
      type: Object
    },
    mysqlData: {
      type: Object
    }
  },
  data() {
    return {
      addData: {
        rules: []
      },
      dialogVisible: false,
      switchList: [],
      switchPortList: [],
      selectDialog: {
        visible: false
      },
      loading: false
    }
  },
  computed: {
    nodes() {
      return this.mysqlData.nodes
    }
  },
  created() {
    this.handleSearch()
  },
  methods: {
    getList(params) {
      getFirewallRule(params).then(data => {
        if (data.success) {
          this.addData.rules = data.data.rows.map(item => {
            const { sources, appliedTos, destinations } = item
            return {
              ...item,
              sources: JSON.parse(sources),
              appliedTos: JSON.parse(appliedTos),
              destinations: JSON.parse(destinations)
            }
          })
        }
      })
    },
    handleSearch() {
      const params = { page: 1, rows: 10000 }
      params.params = this.$tools.handleSearchParam({
        firewallId: this.detailData.id
      })
      this.getList(params)
    },
    addItem() {
      this.addData.rules.push({
        action: 'ALLOW',
        direction: 'IN_OUT',
        disabled: false,
        ipProtocol: 'IPV4_IPV6',
        logged: true,
        destinationsExcluded: false,
        sourcesExcluded: false
      })
    },
    removeItem(index) {
      this.addData.rules.splice(index, 1)
    },
    addSubmit() {
      this.$refs.addForm.validate(valid => {
        if (valid) {
          if (!this.addData.rules.length) {
            this.$message.error('至少存在一条规则')
            return
          }
          this.loading = true
          configFirewallRule({
            firewallId: this.detailData.id,
            rules: this.addData.rules
          })
            .then(data => {
              if (data.success) {
                this.$message.success(data.message)
                this.dialog.visible = false
              }
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    }
  },
  filters: { targetTypeFilter }
}
</script>

<style></style>
