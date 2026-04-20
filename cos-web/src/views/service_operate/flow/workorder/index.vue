<template>
  <el-card>
    <div>
      <AdvanceTable title="" :search-configs="searchConfigs" :data="tableData" :params="params" :columns="columns" :get-list="getData" :total="total" :loading="loading">
        <template #instanceUuid="val, record">
          <span class="detail-href" @click="getDetail(record.id)">{{ val }}</span>
        </template>
        <template #type="val, record">
          {{ typeFilter[record.resourceCatalog] + '-' + typeFilter[record.resourceCategory] }}
        </template>
        <template #status="val">
          <status-icon :type="val | workOrderColor">
            {{ val | workOrder }}
          </status-icon>
        </template>
      </AdvanceTable>
    </div>
    <common-detail v-if="detailFlag" :title="detail.name" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="标题">{{ detail.name }}</common-detail-item>
        <common-detail-item label="编号">{{ detail.instanceUuid }}</common-detail-item>
        <common-detail-item label="提交时间">{{ detail.gmtCreate }}</common-detail-item>
        <common-detail-item label="状态">
          <status-icon :type="detail.status | workOrderColor">
            {{ detail.status | workOrder }}
          </status-icon></common-detail-item
        >
      </template>
      <el-card class="m-t-md">
        <div slot="header">沟通记录</div>
        <div class="user_box m-b-md" v-for="(item, index) in valueList" :key="index">
          <div class="image">
            <img :src="item.portrait ? item.portrait : '/web-common-resource/img/avatar_default.png'" alt="" />
          </div>
          <div class="box_value">
            <div class="header m-b-xs" :class="{ header_admin: item.user }">
              {{ item.userName }}
            </div>
            <div class="value">
              {{ item.content ? item.content : '' }}
            </div>
            <div class="time m-t-md">
              {{ item.gmtCreate }}
            </div>
          </div>
          <div style="clear: both"></div>
          <div class="line" v-if="index + 1 < valueList.length"></div>
        </div>
      </el-card>
      <el-card class="m-t-md m-b-md" v-if="detail.status != 'closed'">
        <div slot="header">问题回复</div>
        <basic-form :model="addData" ref="addForm" label-width="120px">
          <basic-form-item label="详细描述：" prop="content" validate="required">
            <el-input type="textarea" v-model="addData.content" placeholder="请描述你遇到的问题"></el-input>
          </basic-form-item>
          <!-- <el-form-item label="上传附件：">
            <el-upload
              class="upload-demo"
              action="/server/upload">
              <el-button slot="trigger" size="small"><i class="el-icon-upload"></i>上传文件</el-button>
            </el-upload>
          </el-form-item> -->
          <el-form-item label="">
            <el-button type="primary" @click="ok">确定</el-button>
          </el-form-item>
        </basic-form>
      </el-card>
      <el-card class="m-t-md m-b-md" v-else>
        <div slot="header">问题已关闭</div>
        <basic-form>
          <el-form-item label="问题反馈：">
            {{ detail.remark }}
          </el-form-item>
          <el-form-item label="评价：">
            <el-rate v-model="detail.star" disabled show-score text-color="#ff9900" score-template="{value}"> </el-rate>
          </el-form-item>
        </basic-form>
      </el-card>
    </common-detail>
  </el-card>
</template>

<script>
import { workOrder, workOrderColor, isTrue, adminStateupFilter } from 'filters'
import { getworkOrder, removeworkOrder, getworkOrderDetail, recordWorkOrder, createRecordsWorkOrder } from 'services/system/workorder'
const typeFilter = {
  Resource: '单一资源',
  Computer: '云主机',
  Image: '镜像',
  Storage: '云硬盘',
  Router: '路由',
  FloatingIp: '浮动IP',
  Snapshot: '快照',
  Lpar: '分区',
  F5: 'F5',
  ResourceF5Apply: 'F5申请',
  F5ExpansionApply: 'F5扩容',
  Ros: '混合资源',
  ResourceOperate: '资源操作',
  ExpansionSpecApply: '云主机规格变更',
  ExpansionDiskApply: '云主机磁盘扩容',
  TASK: '运维作业',
  Software: '软件安装',
  Tomcat: 'Tomcat',
  Redis: 'Redis',
  ZooKeeper: 'ZooKeeper',
  MySQL: 'MySQL',
  Nginx: 'Nginx',
  WebLogic: 'WebLogic',
  RabbitMQ: 'RabbitMQ',
  JDK: 'JDK',
  NFS: 'NFS',
  Oracle: 'Oracle',
  Apache: 'Apache',
  MongoDB: 'MongoDB',
  Etcd: 'EtcdEtcd',
  Kafka: 'Kafka',
  ActiveMQ: 'ActiveMQ',
  Was: 'Was'
}

const columns = [
  {
    label: '编号',
    prop: 'instanceUuid',
    scopedSlots: { customRender: 'instanceUuid' }
  },
  {
    label: '分类',
    scopedSlots: { customRender: 'type' }
  },
  {
    label: '标题',
    prop: 'name'
  },
  {
    label: '问题详述',
    prop: 'content'
  },
  {
    label: '提交时间',
    prop: 'gmtCreate'
  },
  {
    label: '手机号码',
    prop: 'phone'
  },
  {
    label: '邮箱',
    prop: 'email'
  },
  {
    label: '状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  }
]
export default {
  data() {
    return {
      searchConfigs: [{ type: 'Input', label: '标题', value: 'name' }],
      columns,
      loading: false,
      typeFilter,
      feedbackData: {
        dialog: false,
        data: {}
      },
      detailFlag: false,
      detail: {},
      valueList: [],
      params: {
        page: 1,
        rows: 10
      },
      searchData: {
        name: ''
      },
      tableData: [],
      total: 0,
      addData: {},
      value: 5
    }
  },
  methods: {
    ok() {
      this.$refs.addForm.validate((valid) => {
        if (valid) {
          this.addData.orderId = this.detail.id
          createRecordsWorkOrder(this.addData).then((data) => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.$refs.addForm.resetFields()
              this.getRecords()
            }
          })
        }
      })
    },
    getRecords() {
      recordWorkOrder(this.detail.id).then((data) => {
        if (data.success) {
          this.valueList = data.data
        }
      })
    },
    feedback(data) {
      this.feedbackData = {
        dialog: true,
        instanceUuid: data.instanceUuid,
        data: data
      }
    },
    getDetail(id) {
      getworkOrderDetail(id).then((data) => {
        if (data.success) {
          this.detail = data.data
          this.getRecords()
          this.detailFlag = true
        }
      })
    },
    goBack() {
      this.detailFlag = false
    },
    getData() {
      this.loading = true
      getworkOrder(this.params).then((data) => {
        this.loading = false
        if (data.success) {
          this.tableData = data.data.rows
          this.total = data.data.total
        }
      })
    },
    handleSearch(params) {
      this.params.page = 1
      this.params.params = params
      this.getData()
    }
  },
  created() {}
}
</script>

<style scoped lang="scss">
.user_box {
  width: 100%;
  .image {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    margin: 0px 20px 0px 0px;
    border: 1px solid #d9d9d9;
    float: left;
    img {
      width: 100%;
      height: 100%;
    }
  }
  .box_value {
    float: left;
    .header {
      font-size: 10px;
      color: #999999;
      white-space: nowrap;
    }
    .header_admin {
      font-size: 12px !important;
      font-weight: 400 !important;
    }
    .value {
      font-size: 12px;
      font-weight: 400;
      font-style: normal;
    }
    .time {
      font-size: 10px;
      color: #999999;
      white-space: nowrap;
    }
  }
  .line {
    border: 1px dotted #b9b3b3;
    margin-top: 20px;
  }
}
.el-rate {
  line-height: 2 !important;
}
</style>
