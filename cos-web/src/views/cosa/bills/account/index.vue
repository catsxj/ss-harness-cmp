<template>
  <div>
    <AdvanceTable title="账号列表" :data="list" :searchConfigs="searchConfigs" :params="params" :total="total" :columns="columns" :get-list="getList">
      <template #action>
        <el-button type="primary" @click="openVisible()">新增</el-button>
        <el-button @click="importVisible = true">导入</el-button>
      </template>
      <template #type="val">
        <span class="type">
          <img :src="logoObj[val]" alt="" v-if="logoObj[val]" />
          <span>{{ val }}</span>
        </span>
      </template>
      <template #status="status">
        <status-icon :type="status | statusColor">
          {{ status | statusFilter }}
        </status-icon>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="openVisible(record)">编辑</el-button>
        <el-button type="text" @click="remove(record.id)">删除</el-button>
        <el-button type="text" @click="openSync(record)">同步账单</el-button>
      </template>
    </AdvanceTable>
    <el-dialog :visible.sync="visible" :title="accountData.id ? '编辑' : '新增'">
      <el-row>
        <basic-form :model="accountData" ref="formRef">
          <el-col :span="24">
            <basic-form-item label="平台类型：" props="vendorType" validate="required">
              <section class="vendors">
                <div v-for="item in vendors" :key="item.value" @click="setVendorType(item.value)" :class="item.value == accountData.vendorType ? 'active' : ''">
                  <img :src="logoObj[item.value]" alt="" />
                  <span>{{ item.label }}</span>
                </div>
              </section>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="平台名称：" prop="vendorType" validate="required">
              <el-input v-model="accountData.vendorName"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="所属区域：" prop="regionId" validate="required">
              <el-radio-group v-model="accountData.regionId">
                <el-radio-button v-for="item in regionList" :key="item.value" :label="item.value">{{ item.name }}</el-radio-button>
              </el-radio-group>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="accessKey：" prop="accessKey" validate="required">
              <el-input v-model="accountData.accessKey"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="secretKey：" prop="secretKey" validate="required">
              <el-input v-model="accountData.secretKey"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="描述：" prop="remark">
              <el-input type="textarea" v-model="accountData.remark"></el-input>
            </basic-form-item>
          </el-col>
        </basic-form>
      </el-row>
      <template #footer>
        <el-button type="default" @click="visible = false">取消</el-button>
        <el-button type="primary" @click="confirm">确定</el-button>
      </template>
    </el-dialog>
    <el-dialog :visible.sync="syncVisible" title="同步" width="420px">
      <el-date-picker v-model="syncData.month" type="month" value-format="yyyy-MM" placeholder="选择月份"> </el-date-picker>
      <template #footer>
        <el-button @click="handleCancle">取消</el-button>
        <el-button type="primary" @click="sync">确定</el-button>
      </template>
    </el-dialog>
    <sync-all
      :visible="importVisible"
      @success="getList"
      @close="
        importVisible = false
        getSelectVendorList()
      "
      :vendors="vendors"
    ></sync-all>
  </div>
</template>
<script>
import { getVendors, getAccount, putAccount, postAccount, syncNewCloudBills, deleteAccount, getSelectVendors } from '@/services/services/bill'
import { status } from '@/filters'
import { getDictionaries } from '@/services/platform'
import crypto from 'utils/crypto.js'
import SyncAll from './import.vue'
import { logoObj } from './logo'
const columns = [
  {
    label: '名称',
    prop: 'vendorName'
  },
  {
    label: '类型',
    prop: 'vendorType',
    scopedSlots: { customRender: 'type' }
  },
  {
    label: '状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: '上次同步时间',
    prop: 'gmtModify'
  },
  {
    label: '创建时间',
    prop: 'gmtCreate'
  },
  {
    label: '操作',
    scopedSlots: { customRender: 'operate' }
  }
]

export default {
  components: {
    SyncAll
  },
  data() {
    return {
      list: null,
      total: null,
      params: {
        page: 1,
        rows: 10
      },
      searchConfigs: [
        { type: 'Input', label: '名称', value: 'vendorName' },
        {
          type: 'Select',
          label: '类型',
          value: 'vendorType',
          data: []
        }
      ],
      columns,
      vendors: [],
      visible: false,
      accountData: {},
      regionList: [],
      syncData: {
        month: '',
        vendorType: ''
      },
      syncVisible: false,
      importVisible: false,
      logoObj,
      selectVendors: []
    }
  },
  filters: {
    statusFilter(val) {
      return status(val)
    },
    statusColor(val) {
      return status(val, 'color')
    }
  },
  created() {
    this.getVendorList()
    this.getSelectVendorList()
  },
  methods: {
    async getSelectVendorList() {
      const { data, success } = await getSelectVendors()
      if (success) {
        this.searchConfigs[1].data = data.map((item) => ({ name: item, id: item }))
      }
    },
    async getVendorList() {
      const { data, success } = await getVendors()
      if (success) {
        this.vendors = data.find((item) => item.name == '公有云').children.map((item) => ({ label: item.name, value: item.value }))
      }
    },
    async getRegionList() {
      const { data, success } = await getDictionaries({ value: `${this.accountData.vendorType}_REGION` })
      this.regionList = success ? data : []
    },
    async getList() {
      const { data, success } = await getAccount(this.params)
      if (success) {
        this.list = data.rows
        this.total = data.total
      }
    },
    setVendorType(value) {
      this.$set(this.accountData, 'vendorType', value)
      this.getRegionList()
    },
    openVisible(data) {
      this.accountData = {}
      if (data) {
        const { authentication, id, remark, vendorName, vendorType } = data
        const { accessKey, secretKey, regions } = JSON.parse(authentication)
        this.accountData = {
          id,
          remark,
          vendorName,
          vendorType,
          accessKey: accessKey ? crypto.decrypt(accessKey) : '',
          secretKey: secretKey ? crypto.decrypt(secretKey) : '',
          regionId: regions?.length ? regions[0] : ''
        }
        this.getRegionList()
      }
      this.visible = true
    },
    confirm() {
      this.$refs.formRef.validate(async (valid) => {
        if (valid) {
          const { accessKey, regionId, remark, secretKey, vendorName, vendorType, id } = this.accountData
          const params = {
            vendorName,
            vendorType,
            remark,
            authentication: JSON.stringify({ accessKey: crypto.encrypt(accessKey), secretKey: crypto.encrypt(secretKey), regions: [regionId] })
          }
          const fn = id ? putAccount : postAccount
          const { message, success } = await fn(params, id)
          if (success) {
            this.$message.success(message)
            this.visible = false
            this.getList()
          }
        }
      })
    },
    remove(id) {
      this.$confirm('您确定要删除该账号吗?', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(async () => {
        const { message, success } = await deleteAccount(id)
        if (success) {
          this.$message.success(message)
          this.getList()
        }
      })
    },
    openSync(data) {
      this.syncVisible = true
      this.syncData.vendorType = data.vendorType
    },
    sync() {
      const { id, month, vendorType } = this.syncData
      if (!this.syncData.month) return this.$message.error('请选择月份')
      const params = {
        vendorType,
        month: month
      }
      syncNewCloudBills(params).then((data) => {
        if (data.success) {
          this.syncVisible = false
          this.$message.success(data.message)
        }
      })
    },
    handleCancle() {
      this.syncData = {
        month: '',
        vendorType: ''
      }
      this.syncVisible = false
    }
  }
}
</script>
<style lang="scss" scoped>
.type {
  display: flex;
  align-items: center;
  img {
    width: 30px;
    height: 22.733px;
    margin-right: 5px;
  }
}
.vendors {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  & > div {
    width: 130px;
    height: 40px;
    margin: 0 10px 10px 0;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid rgba(204, 204, 204, 1);
    border-radius: 4px;
    cursor: pointer;
    img {
      width: 30px;
      height: 22.733px;
      margin-right: 5px;
    }
  }
}
.active {
  border: 1px solid rgba(45, 140, 240, 1) !important;
  background-color: rgba(45, 140, 240, 0.2);
  color: rgb(45, 140, 240);
}
</style>
