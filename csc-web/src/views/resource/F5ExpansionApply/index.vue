<template>
  <el-card>
    <div slot="header">
      <span class="back" @click="goBack"><i class="iconfont icon-left-arrow"></i> 返回</span>
      <span class="line"></span>
      <span class="header-title">F5扩容</span>
      <span class="pull-right m-r-lg">
        <el-button type="primary" @click="save" :loading="loading" :disabled="parseInt(this.projectId) === 0"> 申请</el-button>
      </span>
    </div>
    <div class="template-body">
      <div class="m-b detail-title">申请信息</div>
      <el-form :inline="true">
        <el-form-item label=" ">
          <el-input v-model="searchData.name" placeholder="名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="ghost" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
      <basic-table class="virtualserver" :data="list" :params="params" :get-list="getList" :total="total" ref="multipleTable">
        <el-table-column type="expand">
          <template slot-scope="props">
            <div class="networkmap-container map virtual-server">
              <status-icon :type="props.row.status | F5Status('color')">
                <el-tooltip placement="top" effect="light">
                  <div slot="content">
                    <p class="head">Virtual Server</p>
                    <p class="content-title">Destination Address:</p>
                    <p class="content-value">{{ props.row.destinationAddress }}</p>
                    <p class="content-title">Partition / Path:</p>
                    <p class="content-value">{{ props.row.partition }}</p>
                  </div>
                  <span>{{ props.row.name }}</span>
                </el-tooltip>
              </status-icon>
            </div>
            <ul>
              <li class="networkmap-container map poolBox" v-for="(irule, index) in props.row.iRules" :key="index">
                <i class="circle"></i>
                <el-tooltip placement="top" effect="light">
                  <div slot="content">
                    <p class="head">iRule</p>
                    <p class="content-title">Partition / Path:</p>
                    <p class="content-value">{{ irule.partition }}</p>
                  </div>
                  <span> {{ irule.name }}</span>
                </el-tooltip>
              </li>
              <li class="networkmap-container map poolBox">
                <status-icon :type="props.row.pool.status | F5Status('color')">
                  <el-tooltip placement="top" effect="light">
                    <div slot="content">
                      <p class="head">Pool</p>
                      <p class="content-title">Source:</p>
                      <p class="content-value">
                        {{ props.row.pool.source }}
                      </p>
                      <p class="content-title">Partition / Path:</p>
                      <p class="content-value">{{ props.row.pool.partition }}</p>
                    </div>
                    <span>{{ props.row.pool.name }}</span>
                  </el-tooltip>
                </status-icon>
                <ul>
                  <li class="networkmap-container map pool_member" v-for="member in props.row.pool.members" :key="member.id">
                    <status-icon :type="member.status | F5Status('color')">
                      <el-tooltip placement="top" effect="light">
                        <div slot="content">
                          <p class="head">Pool Member</p>
                          <p class="content-title">Parent Node:</p>
                          <p class="content-value">
                            <status-icon :type="member.nodeStatus | F5Status('color')">
                              {{ member.poolMemberAddress }}
                            </status-icon>
                          </p>
                          <p class="content-title">Port:</p>
                          <p class="content-value">{{ member.poolMemberPort }}</p>
                        </div>
                        <span>{{ member.name }}</span>
                      </el-tooltip>
                    </status-icon>
                  </li>
                </ul>
              </li>
            </ul>
          </template>
        </el-table-column>
        <el-table-column label="名称" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-radio :label="scope.row" v-model="itemData.virtualServer">{{ scope.row.name }} </el-radio>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" show-overflow-tooltip>
          <template slot-scope="scope">
            <status-icon :type="scope.row.status | F5Status('color')">
              {{ scope.row.status | F5Status('name') }}
            </status-icon>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="地址" show-overflow-tooltip></el-table-column>
        <el-table-column prop="port" label="端口" show-overflow-tooltip></el-table-column>
        <el-table-column prop="userName" label="申请人" show-overflow-tooltip></el-table-column>
        <el-table-column prop="projectName" :label="$store.getters.systemConfig.projectConfigLabel" show-overflow-tooltip></el-table-column>
      </basic-table>
      <div class="detail-title">扩容信息</div>
      <basic-form ref="F5ExpansionApply" :model="itemData" label-width="130px">
        <el-row v-for="(item, index) in itemData.members" :key="index">
          <el-col :span="8">
            <basic-form-item :label="'服务器地址' + (index + 1) + '：'" :prop="'members.' + index + '.poolMemberAddress'" validate="required,ip">
              <el-input v-model="item.poolMemberAddress"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="6">
            <basic-form-item label="服务器端口：" :prop="'members.' + index + '.poolMemberPort'" validate="required,port">
              <el-input v-model="item.poolMemberPort"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="10">
            <el-button class="m-l" type="danger" @click="removeMembers(index)" v-if="itemData.members.length > 1">
              <Icon type="icon-sub" />
            </el-button>
            <el-button class="m-l" type="primary" @click="addMembers()" v-if="index === itemData.members.length - 1">
              <Icon type="icon-Added" />
            </el-button>
          </el-col>
        </el-row>
      </basic-form>
    </div>
  </el-card>
</template>
<script>
import { F5Status } from 'filters'
import { getF5 } from 'services/services/f5'
import { createCloudServices } from 'services/platform/index'
export default {
  components: {},
  data() {
    return {
      loading: false,
      projectId: localStorage.getItem('projectId'),
      searchData: {
        name: ''
      },
      list: [],
      total: 0,
      params: {
        page: 1,
        rows: 10
      },
      addData: {
        serviceId: this.$route.query.itemId,
        startMode: 'AUTO',
        params: {}
      },
      itemData: {
        members: [{}],
        virtualServerId: '',
        virtualServer: {},
        resourceCategory: 'F5ExpansionApply'
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        'name:LK': this.searchData.name
      })
      this.getList()
    },
    getList() {
      getF5(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    },
    addMembers() {
      this.itemData.members.push({})
    },
    removeMembers(index) {
      this.itemData.members.splice(index, 1)
    },
    save() {
      this.$refs.F5ExpansionApply.validate(valid => {
        if (valid) {
          this.loading = true
          this.itemData.virtualServerId = this.itemData.virtualServer.id
          this.addData.params = Object.assign({}, this.itemData)
          createCloudServices(this.addData).then(data => {
            if (data.success) {
              this.$notify({
                message: data.message,
                type: 'success'
              })
              this.addData = {}
              this.goBack()
            }
            this.loading = false
          })
        }
      })
    },
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>
<style scoped>
.template {
  width: 100%;
  overflow: hidden;
}

.template-header {
  width: 100%;
  height: 44px;
  line-height: 44px;
  z-index: 99;
  padding: 0px 20px;
  border-bottom: 1px solid #ebebeb;
}

.header-title {
  display: inline-block;
}

.line {
  position: relative;
  top: 4px;
  margin: 0 10px;
  height: 20px;
  width: 1px;
  display: inline-block;
  background-color: #b5b5b5;
}

.back {
  color: #46abf1;
  cursor: pointer;
}

.money-right {
  float: right;
  position: relative;
  right: 40px;
  font-size: 16px;
  color: #46abf1;
}

.template-body {
  width: 100%;
  padding: 20px 20px;
}
.networkmap-container.map {
  overflow: hidden;
  min-width: 200px;
  display: inline-block;
  width: 98%;
}
.networkmap-container.map div {
  margin: 0 0.25em;
  padding: 0.15em 0;
  white-space: nowrap;
}
.networkmap-container.map span:hover {
  color: #409eff !important;
  cursor: pointer;
  text-decoration: underline;
}
.networkmap-container.virtual-server {
  min-width: 218px;
}
.networkmap-container ol,
ul {
  list-style: none;
  margin: 0;
}
li.networkmap-container.map {
  padding-left: 70px;
}
p.head {
  padding-bottom: 5px;
  border-bottom: 1px dashed #ccc;
}
.content-title,
p.head {
  font-weight: bold;
}
i.circle {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 1px solid #ccc;
  margin: 3px 0 0 5px;
  border-radius: 50%;
  -moz-border-radius: 50%;
  -webkit-border-radius: 50%;
}
</style>
