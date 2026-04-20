<template>
  <el-card class="wrapper">
    <common-detail v-if="detailFlag" :setting="{ type: 'host' }" :data="installDetail" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ installDetail.name }}</common-detail-item>
        <common-detail-item label="状态"
          ><status-icon :color="installDetail.status | vmStatusColor">{{ installDetail.status | openstackServer }}</status-icon></common-detail-item
        >
        <common-detail-item label="资源组">{{ installDetail.resourceGroupName }}</common-detail-item>
        <common-detail-item label="区域">{{ installDetail.regionName }}</common-detail-item>
        <common-detail-item label="标签">{{ installDetail.tags }}</common-detail-item>
        <!-- <common-detail-item label="区域">{{installDetail.location}}</common-detail-item>
        <common-detail-item label="运行状况探测">{{installDetail.address}}</common-detail-item>
        <common-detail-item label="订阅">{{installDetail.gmtCreate}}</common-detail-item>
        <common-detail-item label="负载均衡规则">{{installDetail.expiredTime}}</common-detail-item>
        <common-detail-item label="订阅ID">{{installDetail.expiredTime}}</common-detail-item>
        <common-detail-item label="NAT规则">{{installDetail.expiredTime}}</common-detail-item> -->
      </template>
      <el-tabs v-model="active">
        <el-tab-pane label="前端IP配置" name="frontends">
          <frontends :detail="installDetail" v-if="active == 'frontends'" @back="getDetail(installDetail.id)"></frontends>
        </el-tab-pane>
        <el-tab-pane label="后端池" name="backends">
          <backends :detail="installDetail" v-if="active == 'backends'" @back="getDetail(installDetail.id)"></backends>
        </el-tab-pane>
        <el-tab-pane label="运行状况探测" name="probes">
          <probes :detail="installDetail" v-if="active == 'probes'" @back="getDetail(installDetail.id)"></probes>
        </el-tab-pane>
        <el-tab-pane label="负载均衡规则" name="lbs-rules">
          <lbs-rules :detail="installDetail" v-if="active == 'lbs-rules'" @back="getDetail(installDetail.id)"></lbs-rules>
        </el-tab-pane>
        <el-tab-pane label="入站NAT规则" name="nats-rules">
          <nats-rules :detail="installDetail" v-if="active == 'nats-rules'" @back="getDetail(installDetail.id)"></nats-rules>
        </el-tab-pane>
        <el-tab-pane label="监控" name="monitor">
          <monitor :detail="installDetail" v-if="active == 'monitor'" @back="getDetail(installDetail.id)"></monitor>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
    <el-form :inline="true">
      <el-form-item>
        <el-input v-model="searchName" placeholder="请输入名称"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="ghost" icon="el-icon-search" @click="getList">搜索</el-button>
        <el-button
          type="ghost"
          icon="el-icon-refresh-left"
          @click="
            () => {
              searchName = ''
              getList()
            }
          "
          >刷新</el-button
        >
        <el-button type="primary" @click="add">
          <Icon type="icon-add"></Icon>
          新增
        </el-button>
      </el-form-item>
    </el-form>
    <!-- list -->
    <basic-table :data="list" :params="params" :get-list="getList" :total="total">
      <el-table-column prop="name" label="名称">
        <template slot-scope="scope">
          <span class="detail-href" @click="getDetail(scope.row.id)">{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" show-overflow-tooltip min-width="100px">
        <template slot-scope="scope" style="width: 100%">
          <status-icon :color="scope.row.status | vmStatusColor">{{ scope.row.status | openstackServer }}</status-icon>
        </template>
      </el-table-column>
      <el-table-column prop="resourceGroupName" label="资源组"></el-table-column>
      <el-table-column prop="regionId" label="区域" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ scope.row.regionName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <lock :data="scope.row" type="Slb" @back="getList">
            <el-button type="text" @click="handleOperate({ flag: 5, imageUuid: scope.row.imageUuid, id: scope.row.id, azureResourceGroupName: scope.row.azureResourceGroupName })"> 删除 </el-button>
            <el-button type="text" @click="setTags(scope.row)"> 分配标签 </el-button>
          </lock>
        </template>
      </el-table-column>
    </basic-table>
    <add :add-data="addData" v-if="addData.dialog" @back="getList"></add>
    <tags :add-data="tagData" v-if="tagData.dialog" @back="getList"></tags>
  </el-card>
</template>
<script>
import { getResource, getLb, removeLb, detailLb } from 'services/platform/azure'
import add from './add.vue'
import frontends from './frontends/index.vue'
import backends from './backends/index.vue'
import probes from './probes/index.vue'
import lbsRules from './lbsRules/index.vue'
import natsRules from './natsRules/index.vue'
import monitor from './monitor.vue'
import tags from '@/components/tag/index.vue'
import webSocket from '@/common/mixins/getGlobalSocket'
import lock from '@/components/lock.vue'

const detailSetting = {
  type: 'image',
  columns: [
    [
      { name: '名称', value: 'name' },
      { name: '资源组', value: 'resourceGroupName' },
      { name: '区域', value: 'regionName' }
    ],
    [{ name: '标签', value: 'tags' }]
  ]
}
export default {
  mixins: [webSocket],
  components: { add, frontends, backends, probes, lbsRules, natsRules, lock, monitor, tags },
  data() {
    return {
      // 自定义镜像分页
      params: {
        page: 1,
        rows: 10
      },
      detailSetting,
      searchName: '',
      // 自定义镜像
      list: [],
      // 自定义镜像分页
      total: 0,
      // 镜像总显隐
      detailFlag: false,
      installDetail: {},
      azureResourceGroupName: '',
      addData: {
        dialog: false,
        data: {}
      },
      tagData: {
        dialog: false,
        data: {}
      },
      active: 'frontends'
    }
  },
  methods: {
    onmessage(data) {
      if (data.operate.indexOf('azure') > -1) {
        this.getList()
        if (this.detailFlag) this.getDetail(this.installDetail.id)
      }
    },
    setTags(data) {
      const tags = []
      if (data.tags) {
        const tag = JSON.parse(data.tags)
        for (const i in tag) {
          tags.push({ key: i, value: tag[i] })
        }
      }
      this.tagData = {
        dialog: true,
        data: {
          resourceId: data.id,
          action: 'SLB',
          tags: tags
        }
      }
    },
    add() {
      this.addData = {
        dialog: true,
        data: {
          slbType: 'EXTERNAL',
          publicIPAddressId: '',
          inboundNatPools: [
            {
              name: 'natpool',
              protocol: 'TCP',
              frontendPortRangeStart: 10,
              frontendPortRangeEnd: 20,
              backendPort: 20
            }
          ]
        }
      }
    },
    // 自定义镜像
    getList() {
      const searchParam = this.$tools.formatSearchParam({
        lkParam: {
          name: this.searchName
        }
      })
      this.params.params = searchParam
      getLb(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          this.list.forEach(item => {
            item.isRome = item.isModifier = false
            if (item.status == 'IN_USE') item.isAllDisabeld = true
            switch (item.status) {
              case 'ACTIVE':
                item.isRome = item.isModifier = true
                break
            }
          })
        }
      })
    },
    getDetail(id) {
      detailLb(id).then(data => {
        if (data.success) {
          this.installDetail = data.data
          if (this.installDetail.status == 'IN_USE') this.installDetail.isAllDisabeld = true
          if (this.installDetail.locked) this.installDetail.isAllDisabeld = true
          this.active = 'frontends'
          this.detailFlag = true
        }
      })
    },
    goBack() {
      this.getList()
      this.detailFlag = false
    },
    // 做自定义镜像操作
    handleOperate(command) {
      switch (command.flag / 1) {
        case 5:
          // 删除镜像
          this.handleDelete(command.imageUuid, command.id, command.azureResourceGroupName)
          break
      }
    },
    // 删除
    handleDelete(imageUuid, id, azureResourceGroupName) {
      const params = {
        id: id
      }
      this.$confirm('该操作为不可逆操作，确定后将永久删除该负载均衡，是否继续！', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeLb(id).then(data => {
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
  },
  mounted() {
    this.getList()
  },
  created() {
    if (this.$route.query.id) {
      this.getDetail(this.$route.query.id)
    }
  }
}
</script>

<style scoped></style>
