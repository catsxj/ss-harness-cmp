<template>
  <el-card class="wrapper">
    <div v-if="!detailFlag">
      <el-tabs v-model="listQuery.vendorType" @tab-click="handleSearch">
        <el-tab-pane v-for="(item, index) in typelist" :label="item | vendorName" :name="item" :key="index"> </el-tab-pane>
      </el-tabs>
      <el-form :inline="true">
        <!-- <el-form-item>
          <router-link v-if="listQuery.vendorType && listQuery.vendorType !== 'SANGFOR'" :to="{ name: 'ServiceDiskCreate', params: { type: listQuery.vendorType } }" class="m-l-xs m-r-xs">
            <el-button type="primary">订购云硬盘</el-button>
          </router-link>
        </el-form-item> -->
        <el-form-item>
          <el-input class="search-item" placeholder="硬盘名称" v-model="listQuery.name"> </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <!-- <el-button type="ghost" @click="removes()" :disabled="selectList.length == 0" >
            退订
          </el-button> -->
        </el-form-item>
      </el-form>
      <basic-table :data="list" :params="params" :get-list="getList" :total="total" ref="multipleTable" @select="handleSelectItem" @select-all="handleSelectAll">
        <!-- <el-table-column type="selection"></el-table-column> -->
        <el-table-column label="硬盘名称" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-button type="text" @click="getDetail(scope.row)">{{ scope.row.name ? scope.row.name : scope.row.volumeUuid }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="硬盘状态" show-overflow-tooltip>
          <template slot-scope="scope">
            <status-icon :type="scope.row.status | openstackServerColor">{{ scope.row.status | openstackServer }} </status-icon>
          </template>
        </el-table-column>
        <el-table-column label="硬盘大小(GB)" prop="size" show-overflow-tooltip></el-table-column>
        <el-table-column label="所属平台" prop="vendorName" show-overflow-tooltip> </el-table-column>
        <el-table-column label="是否共享" v-if="listQuery.vendorType == 'SMARTX' || listQuery.vendorType == 'CLOUDTOWER'">
          <template slot-scope="scope">
            {{ scope.row.multiattach | isTrue }}
          </template>
        </el-table-column>
        <el-table-column v-else label="是否为启动卷">
          <template slot-scope="scope">
            {{ scope.row.bootVolume | isTrue }}
          </template>
        </el-table-column>
        <el-table-column :label="$store.getters.systemConfig.projectConfigLabel" prop="projectName" show-overflow-tooltip></el-table-column>
        <el-table-column label="创建者" prop="creatorName" show-overflow-tooltip></el-table-column>
        <el-table-column label="所有者" prop="ownerName" show-overflow-tooltip></el-table-column>
        <el-table-column label="维护者" prop="menderName" show-overflow-tooltip></el-table-column>

        <el-table-column label="过期时间" prop="expiredTime" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ scope.row.expiredTime ? (scope.row.expiredTime.indexOf('2099') > -1 ? '无限期' : scope.row.expiredTime) : scope.row.expiredTime }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160px">
          <template slot-scope="scope">
            <!-- <el-button v-if="scope.row.vendorType == 'AWS'" type="text" @click="modify(scope.row)">
              编辑
            </el-button>
            <div class="action-divider" v-if="scope.row.vendorType == 'AWS'"></div> -->
            <DelayService :data="scope.row" @getList="getList" v-if="!scope.row.bootVolume"> </DelayService>
            <div class="action-divider" v-if="scope.row.expiredTime && scope.row.expiredTime.indexOf('2099') === -1"></div>
            <UnsubscribeService :disabled="scope.row.status === 'IN-USE'" :data="scope.row" @getList="getList" type="disk"> </UnsubscribeService>
            <div class="action-divider"></div>
            <el-dropdown @command="handleCommand">
              <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :disabled="scope.row.status != 'AVAILABLE' || scope.row.bootVolume || scope.row.isExpired" :command="{ type: 1, row: scope.row, index: 2 }"> <i class="iconfont icon-portal-icon-guaqiyunzhuji"></i> 挂载 </el-dropdown-item>
                <el-dropdown-item :disabled="scope.row.status !== 'IN-USE' || scope.row.bootVolume" :command="{ type: 2, row: scope.row, index: 3 }"> <i class="iconfont icon-xuniwangqia81"></i> 卸载 </el-dropdown-item>
                <el-dropdown-item v-if="['OPENSTACK', 'MANAGEONE', 'TCE', 'ALIYUN', 'TENCENT', 'SMARTX', 'EASYSTACK'].indexOf(scope.row.vendorType) > -1" :command="{ type: 3, row: scope.row }"> <i class="iconfont icon-add"></i> 创建快照 </el-dropdown-item>
                <el-dropdown-item v-if="scope.row.vendorType == 'AZURE'" :disabled="scope.row.status != 'AVAILABLE' && scope.row.status !== 'IN-USE'" :command="{ type: 4, row: scope.row }"> <i class="iconfont icon-add"></i> 创建快照 </el-dropdown-item>
                <!-- <el-dropdown-item :disabled="scope.row.bootVolume && scope.row.vendorType != 'ALIYUN'" :command="{ type: 5, row: scope.row }"> <i class="iconfont icon-add"></i> 扩容 </el-dropdown-item> -->
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </basic-table>
    </div>
    <common-detail v-if="detailFlag" :title="detail.name" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="硬盘名称">{{ detail.name }}</common-detail-item>
        <common-detail-item label="硬盘状态">
          <status-icon :type="detail.status | openstackServerColor">{{ detail.status | openstackServer }}</status-icon>
        </common-detail-item>
        <common-detail-item label="硬盘UUID">{{ detail.volumeUuid }}</common-detail-item>
        <common-detail-item label="硬盘大小">{{ detail.size }}GB</common-detail-item>
        <common-detail-item label="是否共享" v-if="detail.vendorType == 'SMARTX' || detail.vendorType == 'CLOUDTOWER'">{{ detail.multiattach | isTrue }}</common-detail-item>
        <common-detail-item label="所属租户">{{ detail.tenantName }}</common-detail-item>
        <common-detail-item label="所属地域" v-if="detail.vendorType != 'MANAGEONE'">{{ detail.regionName }}</common-detail-item>
        <common-detail-item label="所属区域" v-if="detail.vendorType != 'OPENSTACK' && detail.vendorType != 'SMARTX' && detail.vendorType != 'CLOUDTOWER' && detail.vendorType != 'EASYSTACK'">{{ detail.zoneName }}</common-detail-item>
        <common-detail-item label="所属平台" v-if="detail.vendorType != 'MANAGEONE'">{{ detail.vendorName }}</common-detail-item>
        <common-detail-item label="所属子系统" v-if="detail.vendorType != 'MANAGEONE'">{{ detail.projectName }}</common-detail-item>
        <common-detail-item label="所属用户" v-if="detail.vendorType == 'OPENSTACK' || detail.vendorType == 'SMARTX' || detail.vendorType == 'CLOUDTOWER' || detail.vendorType == 'EASYSTACK'">{{ detail.ownerName }}</common-detail-item>
        <common-detail-item :label="$store.getters.systemConfig.serviceConfigLabel">{{ detail.businessName }}</common-detail-item>
        <common-detail-item label="创建者">{{ detail.creatorName }}</common-detail-item>
        <common-detail-item label="所有者">{{ detail.ownerName }}</common-detail-item>
        <common-detail-item label="维护者">{{ detail.menderName }}</common-detail-item>
        <common-detail-item label="标签">
          <tag :detail="detail" type="Storage" @back="getDetail(detail)"></tag>
        </common-detail-item>
        <common-detail-item label="描述" v-if="detail.vendorType != 'OPENSTACK' && detail.vendorType != 'SMARTX' && detail.vendorType != 'CLOUDTOWER' && detail.vendorType != 'EASYSTACK'">{{ detail.remark }}</common-detail-item>
      </template>
      <el-tabs value="third">
        <el-tab-pane label="挂载机器" name="third">
          <smartTable :data="hostListData">
            <el-table-column label="名称" prop="name" show-overflow-tooltip> </el-table-column>
            <el-table-column label="IP" prop="address" show-overflow-tooltip>
              <template slot-scope="scope">
                <div v-if="scope.row.vendorType == 'OPENSTACK' || scope.row.vendorType == 'EASYSTACK' || scope.row.vendorType == 'MANAGEONE' || scope.row.vendorType == 'FUSIONCLOUD'">
                  <span v-for="item in scope.row.privateIpsList" :key="item.networkId">
                    <div v-for="(items1, index) in item.addresses" :key="index">(内网){{ items1.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
                  </span>
                </div>
                <div v-else-if="scope.row.vendorType == 'VMWARE' || scope.row.vendorType == 'INSPURRAIL' || scope.row.vendorType == 'CNWARE' || scope.row.vendorType == 'ZSTACK' || scope.row.vendorType == 'CECSTACK' || scope.row.vendorType == 'H3C'">
                  <div v-for="item in scope.row.privateIpsList" :key="item.address">(内网){{ !item.address ? '' : item.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
                </div>
                <div v-else-if="scope.row.vendorType == 'HUAWEI' || scope.row.vendorType == 'HCSO'">
                  <div v-for="item in scope.row.privateIpsList" :key="item.address">{{ item.type == 'floating' ? '(公网)' : '(内网)' }}{{ !item.address ? '' : item.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
                </div>
                <div v-else-if="scope.row.vendorType == 'QCLOUD'">
                  <div v-for="(item, index) in scope.row.privateIpsList" :key="index">(内网){{ item.address }}</div>
                </div>
                <div v-else-if="scope.row.vendorType == 'AZURE' || scope.row.vendorType == 'AWS'">
                  <div v-for="item in scope.row.privateIpsList" :key="item">(内网){{ item }}</div>
                </div>
                <div v-else-if="scope.row.vendorType == 'JDCLOUD'">
                  <div v-for="(item, index) in scope.row.privateIpsList" :key="index">(内网){{ item }}</div>
                </div>
                <div v-else-if="scope.row.vendorType == 'VOLCENGINE'">
                  <!-- <div v-for="(item, index) in scope.row.privateIpsList" :key="index">(内网){{ item.primaryIpAddress }}</div> -->
                  <div v-if="JSON.parse(scope.row.privateIps)[0].primaryIpAddress">{{ JSON.parse(scope.row.privateIps)[0].primaryIpAddress }}(内网)</div>
                  <div v-if="JSON.parse(scope.row.privateIps)[0].eipAddress">{{ JSON.parse(scope.row.privateIps)[0].eipAddress }}(公网)</div>
                </div>
                <div v-else-if="scope.row.vendorType == 'SMARTX' || scope.row.vendorType == 'CLOUDTOWER'">
                  <div>{{ scope.row.managerIp ? '(内网)' + scope.row.managerIp : '--' }}</div>
                </div>
                <div v-else-if="scope.row.vendorType == 'SANGFOR'">
                  <div>{{ scope.row.privateIps }}</div>
                </div>
                <div v-else>
                  <div v-for="item in scope.row.privateIpsList" :key="item">(内网){{ item }}</div>
                </div>
                <div v-if="scope.row.floatingIp">(公网){{ scope.row.floatingIp }}</div>
                <div v-if="scope.row.vendorType == 'CNWARE' || scope.row.vendorType == 'CECSTACK'">
                  <div v-for="(item, index) in scope.row.publicIps" :key="index">(公网){{ item.address }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="状态" prop="status" show-overflow-tooltip>
              <template slot-scope="scope">
                <status-icon :type="scope.row.status | openstackServerColor">{{ scope.row.status | openstackServer }} </status-icon>
              </template>
            </el-table-column>
            <el-table-column label="平台类型" prop="vendorType" show-overflow-tooltip> </el-table-column>
            <el-table-column label="所属平台" prop="vendorName" show-overflow-tooltip> </el-table-column>
          </smartTable>
        </el-tab-pane>
        <el-tab-pane label="快照列表" name="second" v-if="detail.vendorType != 'QCLOUD' && detail.vendorType != 'AWS' && detail.vendorType != 'TENCENT' && detail.vendorType != 'FUSIONSPHERE' && detail.vendorType != 'ZSTACK' && detail.vendorType != 'CLOUDTOWER'">
          <basic-table :data="Snapshotlist" :params="Snapshotparams" :get-list="SnapshotgetList" :total="Snapshottotal">
            <el-table-column label="快照ID" prop="snapshotUuid" show-overflow-tooltip> </el-table-column>
            <el-table-column label="快照名称" prop="name" show-overflow-tooltip> </el-table-column>
            <el-table-column label="云硬盘ID" prop="volumeUuid" show-overflow-tooltip> </el-table-column>
            <el-table-column label="状态" prop="status">
              <template slot-scope="scope">
                <status-icon :type="scope.row.status | openstackServerColor">{{ scope.row.status | openstackServer }} </status-icon>
              </template>
            </el-table-column>
            <el-table-column label="大小(GB)" prop="size" show-overflow-tooltip> </el-table-column>
            <el-table-column label="操作" width="220px" align="center">
              <template slot-scope="scope">
                <el-button type="text" @click="removeSnapshot(scope.row.id)"> 删除 </el-button>
                <div class="action-divider" v-if="detail.vendorType == 'TCE'"></div>
                <el-button type="text" @click="revertSnapshot(scope.row.id, '恢复')" v-if="detail.vendorType == 'TCE'"> 回滚 </el-button>
                <div class="action-divider" v-if="detail.vendorType == 'SMARTX' || detail.vendorType == 'CLOUDTOWER'"></div>
                <el-button type="text" @click="revertSnapshot(scope.row.id, '恢复')" v-if="detail.vendorType == 'SMARTX' || detail.vendorType == 'CLOUDTOWER'"> 恢复 </el-button>
              </template>
            </el-table-column>
          </basic-table>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
    <!--挂载-->
    <el-dialog :title="title2" :close-on-click-modal="false" v-if="dialogFormmountVisible" :visible.sync="dialogFormmountVisible">
      <el-form :model="addDatamount" label-width="100px" status-icon :rules="rules" ref="addDatamount">
        <el-row>
          <basic-form-item label="主机列表：" prop="serverId" validate="required" required-message="请选择主机列表">
            <el-select filterable v-model="addDatamount.serverId" placeholder="请选择">
              <el-option v-for="(item, index) in vmDataList" :key="index" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </basic-form-item>
          <basic-form-item label="设备：" prop="mountpoint" validate="required" v-if="vendorType == 'AWS'">
            <el-input v-model="addDatamount.mountpoint" placeholder="/dev/sdf"></el-input>
            <div class="mine-text">Linux 设备:/dev/sdf through /dev/sdp</div>
          </basic-form-item>
          <!-- <basic-form-item label="挂载点：" prop="mountpoint" validate="required" v-if="vendorType == 'HUAWEI'">
            <el-select filterable v-model="addDatamount.mountpoint">
              <el-option v-for="(item, index) in mountpointList" :key="index" :label="item.name" :value="item.name"></el-option>
            </el-select>
          </basic-form-item> -->
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="dialogFormmountVisible = false">取消</el-button>
        <el-button type="primary" @click.native="mountSubmit">确定</el-button>
      </div>
    </el-dialog>
    <!--卸载-->
    <el-dialog title="卸载" :close-on-click-modal="false" v-if="detachVisible" :visible.sync="detachVisible">
      <basic-form :model="detachData" label-width="100px" status-icon ref="detachData">
        <basic-form-item label="主机：" prop="serverId" validate="required">
          <el-select filterable v-model="detachData.serverId" placeholder="请选择">
            <el-option v-for="(item, index) in vmDataList" :key="index" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </basic-form-item>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="detachVisible = false">取消</el-button>
        <el-button type="primary" @click.native="detachSubmit">确定</el-button>
      </div>
    </el-dialog>
    <modify v-if="modifyData.dialog" :add-data="modifyData" @back="getList"></modify>
    <add-snapshot v-if="snapshotData.dialog" :add-data="snapshotData" @back="getList"></add-snapshot>
    <modify-size v-if="modifySizeData.dialog" :add-data="modifySizeData" @back="getList"></modify-size>
    <selection-service router="ServiceDiskCreate" code="storage" v-if="dialog.dialog" :dialog="dialog"></selection-service>
  </el-card>
</template>

<script>
import webSocket from '@/common/mixins/webSocket'
import { openstackServerColor, openstackServer, isTrue } from 'filters'
import { unsubscribeServices } from 'services/services/product'
import { conditionService, getVolume, createVolume, modifyVolume, removeVolume, detailVolume, getVm, getSnapshot, patchVolume, patchVm, getVolumeVms, removeSnapshot, patchSnapshot } from 'services/platform/index'
import { getVolumesVms } from 'services/platform/smart'
import modify from './modify.vue'
import modifySize from './modifySize.vue'
import selectionService from '@/components/selectionService.vue'
import tag from '@/components/tag/index.vue'
import UnsubscribeService from '@/components/UnsubscribeService.vue'
import DelayService from '@/components/DelayService.vue'
import addSnapshot from './addSnapshot.vue'
export default {
  mixins: [webSocket],
  components: { modify, selectionService, UnsubscribeService, DelayService, addSnapshot, modifySize, tag },
  data() {
    return {
      rules: {
        name: [{ required: true, message: '请填写内容', trigger: 'blur' }],
        months: [{ required: true, message: '请填写内容', trigger: 'blur' }]
      },
      hostListData: [],
      Snapshotlist: null,
      Snapshottotal: null,
      list: null,
      total: null,
      listQuery: {
        name: '',
        vendorType: ''
      },
      Snapshotparams: {
        page: 1,
        rows: 10
      },
      params: {
        page: 1,
        rows: 10
      },
      vmDataList: null,
      dialogFormtimeVisible: false,
      dialogFormmountVisible: false,
      detailFlag: false,
      //        详情数据
      detail: {
        id: '',
        title: '硬盘详情',
        header: '基本信息'
      },
      title2: '挂载',
      title3: '延期',
      addDatatime: {},
      addDatamount: {},
      vendorType: '',
      loading: false,
      modifyData: {
        dialog: false,
        data: {}
      },
      mountpointList: [{ name: '/dev/vdb' }, { name: '/dev/vdc' }, { name: '/dev/vdd' }, { name: '/dev/vde' }, { name: '/dev/vdf' }, { name: '/dev/vdg' }, { name: '/dev/vdh' }, { name: '/dev/vdi' }, { name: '/dev/vdj' }, { name: '/dev/vdk' }],
      dialog: {
        dialog: false
      },
      snapshotData: {
        dialog: false,
        data: {}
      },
      modifySizeData: {
        dialog: false,
        data: {}
      },
      detachVisible: false,
      detachData: {},
      typelist: [],
      idList: [],
      selectList: []
    }
  },
  created() {
    conditionService('volume').then(data => {
      if (data.success) {
        this.typelist = data.data.filter(item => !['VMWARE', 'SANGFOR', 'INSPURRAIL'].includes(item))
        this.listQuery.vendorType = this.$route.query.vendorType || this.typelist[0]
        this.handleSearch()
      }
    })
  },
  methods: {
    handleCommand({ type, row, index }) {
      switch (type) {
        case 1:
          this.handleDelete(row, index)
          break
        case 2:
          this.handleDelete(row, index)
          break
        case 3:
          this.addSnapshot(row)
          break
        case 4:
          this.addSnapshot(row)
          break
        case 5:
          this.modifySize(row)
          break
      }
    },
    removes() {
      const idList = []
      const nameList = []
      const previews = []
      this.selectList.forEach(item => {
        idList.push(item.uuid)
        nameList.push(item.name)
        previews.push([
          { label: '名称', value: item.name },
          { label: '大小', value: `${item.size}GB` }
        ])
      })
      let service
      switch (this.listQuery.vendorType) {
        case 'FUSIONSPHERE':
          service = 'fusionsphere.standard.volume'
          break
        case 'OPENSTACK':
          service = 'openstack.standard.volume'
          break
        case 'EASYSTACK':
          service = 'easystack.standard.volume'
          break
      }
      this.$confirm('此操作将退订所选资源, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        unsubscribeServices({
          instances: idList,
          instanceNames: nameList,
          previews: previews,
          service: service
        }).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.getList()
          }
        })
      })
    },
    refreshId() {
      this.idList = []
      this.selectList.forEach(item => {
        this.idList.push(item.id)
      })
    },
    // 单选
    handleSelectItem(selection, row) {
      this.refreshId()
      if (this.idList.indexOf(row.id) > -1) {
        for (let j = 0; j < this.selectList.length; j++) {
          const item = this.selectList[j]
          if (item.id == row.id) {
            this.selectList.splice(j, 1)
            break
          }
        }
      } else {
        this.selectList.push(row)
      }
    },
    // 全选
    handleSelectAll(selection) {
      this.refreshId()
      if (selection.length) {
        // 全选情况下
        selection.forEach(item => {
          if (this.idList.indexOf(item.id) == -1) {
            this.selectList.push(item)
          }
        })
      } else {
        // 全不选情况下
        this.list.forEach(item => {
          if (this.idList.indexOf(item.id) > -1) {
            for (let j = 0; j < this.selectList.length; j++) {
              const row = this.selectList[j]
              if (item.id == row.id) {
                this.selectList.splice(j, 1)
                break
              }
            }
          }
        })
      }
    },
    modifySize(data) {
      this.modifySizeData = {
        dialog: true,
        data: {
          ...data,
          newDiskSize: data.size,
          params: {
            type: data.vendorType,
            mode: 'Hour',
            size: data.size,
            categoryId: data.categoryId
          }
        }
      }
    },
    removeSnapshot(id) {
      this.$confirm('此操作将永久删除该快照, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeSnapshot(id).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.SnapshotgetList()
          }
        })
      })
    },
    revertSnapshot(id, type) {
      this.$confirm(`确定要${type}该快照嘛？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        patchSnapshot('revert', { id: id }).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.SnapshotgetList()
          }
        })
      })
    },
    addSnapshot(data) {
      this.snapshotData = {
        dialog: true,
        data: {
          name: '',
          remark: '',
          volumeId: data.id,
          vendorId: data.vendorId
        }
      }
    },
    modify(data) {
      this.modifyData = {
        dialog: true,
        data: {
          id: data.id,
          vendorId: data.vendorId,
          name: data.name,
          size: data.size
        }
      }
    },
    onmessage(data) {
      if (data.operate.indexOf('volume') > -1 || data.operate.indexOf('storage') > -1) this.getList()
      if (data.operate.indexOf('snapshot') > -1 && this.detailFlag) this.SnapshotgetList()
    },
    SnapshotgetList() {
      this.Snapshotparams.params = JSON.stringify([
        {
          param: { volumeId: this.detail.id, vendorId: this.detail.vendorId },
          sign: 'EQ'
        }
      ])
      getSnapshot(this.Snapshotparams).then(data => {
        if (data.success) {
          this.Snapshotlist = data.data.rows
          this.Snapshottotal = data.data.total
        }
      })
    },
    getList() {
      getVolume(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows.map(item => {
            const nowTime = new Date()
            const nowDate = nowTime.getTime()
            item.isExpired = false
            const expiredTimeDate = new Date(item.expiredTime).getTime()
            if (expiredTimeDate < nowDate) {
              item.isExpired = true
            }
            // 统一状态
            if (item.status === 'IN_USE') item.status = 'IN-USE'
            return item
          })
          this.total = data.data.total
          this.selectList = []
        }
      })
    },
    getServer() {
      const params = {
        id: this.detail.id
      }
      if (this.detail.vendorType == 'SMARTX') {
        params.condition = 'smartx'
      }
      if (this.detail.vendorType == 'CLOUDTOWER') {
        // params.condition = 'cloudtower'
      }
      getVolumeVms(params).then(data => {
        if (data.success) {
          this.hostListData = data.data
          this.hostListData.forEach(item => {
            if (item.privateIps) item.privateIpsList = JSON.parse(item.privateIps)
            if (item.publicIps) item.publicIpsList = JSON.parse(item.publicIps)
          })
        }
      })
    },
    goSnapshot(row) {
      this.$router.push({
        name: 'volumeSnapshot',
        params: { type: 'disk', vendorId: row.vendorId, region: row.region, volumeId: row.id, bootVolume: row.bootVolume }
      })
    },
    handleClick(tab, event) {
      switch (tab.index / 1) {
        case 1:
          this.SnapshotgetList()
          break
        case 2:
          this.getServer()
          break
        default:
      }
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        'name:lk': this.listQuery.name,
        vendorType: this.listQuery.vendorType
      })
      this.getList()
    },
    detachSubmit() {
      this.$refs.detachData.validate(valid => {
        if (valid) {
          if (!this.detachData.multiattach) {
            const msg = '当前云硬盘为非共享盘，执行卸载操作会删除当前云硬盘，确定执行卸载并删除该云硬盘吗？'
            this.detachOk(this.detachData, msg)
          } else {
            const msg = '您确定要卸载该云硬盘吗？'
            this.detachOk(this.detachData, msg)
          }
        }
      })
    },
    detachOk(params, msg) {
      this.$confirm(msg, '提示', {
        confirmButtonText: '确定',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        patchVolume('detach', params).then(data => {
          if (data.success) {
            this.$message.success({
              message: data.message,
              type: 'success'
            })
            this.getList()
          }
        })
      })
    },
    handleDelete(row, falg) {
      let url, msg
      switch (falg / 1) {
        case 1:
          this.$confirm('您确定要删除该硬盘吗？', '提示', {
            confirmButtonText: '确定',
            confirmButtonClass: 'el-button--danger',
            type: 'warning'
          }).then(() => {
            removeVolume(row.id).then(data => {
              if (data.success) {
                this.$message.success({
                  message: data.message,
                  type: 'success'
                })
                this.getList()
              }
            })
          })
          break
        case 2: // 挂载
          getVm({
            simple: true,
            params: this.$tools.handleSearchParam({
              vendorType: row.vendorType,
              vendorId: row.vendorId,
              isRecycle: 0,
              regionId: row.vendorType === 'TENCENT' || row.vendorType === 'QCLOUD' || row.vendorType === 'HUAWEI' || row.vendorType === 'AZURE' || row.vendorType === 'ALIYUN' ? row.regionId : '',
              zone: row.vendorType === 'TENCENT' || row.vendorType === 'QCLOUD' || row.vendorType === 'HUAWEI' || row.vendorType === 'ALIYUN' || row.vendorType === 'AWS' ? row.zone : ''
            })
          }).then(data => {
            if (data.success) {
              this.vmDataList = data.data.rows.map(item => {
                const list = item.privateIps ? JSON.parse(item.privateIps) : []
                console.log(list)
                let ip = '无'
                switch (item.vendorType) {
                  case 'OPENSTACK':
                    ip = list.length ? list[0].addresses[0].address : '无'
                    break
                  case 'HUAWEI':
                    ip = list.length ? list[0].address : '无'
                    break
                  case 'HCSO':
                    ip = list.length ? list[0].address : '无'
                    break
                  default:
                    ip = list.length ? list[0] : '无'
                }
                return {
                  ...item,
                  name: `${item.name}(${ip || '无'})`
                }
              })
            }
          })
          this.addDatamount.id = row.id
          this.vendorType = row.vendorType
          this.dialogFormmountVisible = true
          break
        case 3:
          if (row.vendorType == 'SMARTX') {
            getVolumesVms(row.id, { condition: 'smartx' }).then(data => {
              if (data.success) {
                if (data.data.length > 1) {
                  this.detachVisible = true
                  this.vmDataList = data.data
                  this.detachData = {
                    id: row.id,
                    multiattach: row.multiattach,
                    serverId: ''
                  }
                } else if (data.data.length == 1) {
                  if (!row.multiattach) {
                    msg = '当前云硬盘为非共享盘，执行卸载操作会删除当前云硬盘，确定执行卸载并删除该云硬盘吗？'
                    this.detachOk({ id: row.id }, msg)
                  } else {
                    msg = '您确定要卸载该云硬盘吗？'
                    this.detachOk({ id: row.id }, msg)
                  }
                } else {
                  return this.$message.error('当前云硬盘尚未挂载任何云主机，无法执行卸载操作')
                }
              }
            })
          } else if (row.vendorType == 'CLOUDTOWER') {
            getVolumesVms(row.id, { condition: 'cloudtower' }).then(data => {
              if (data.success) {
                if (data.data.length > 1) {
                  this.detachVisible = true
                  this.vmDataList = data.data
                  this.detachData = {
                    id: row.id,
                    multiattach: row.multiattach,
                    serverId: ''
                  }
                } else if (data.data.length == 1) {
                  if (!row.multiattach) {
                    msg = '当前云硬盘为非共享盘，执行卸载操作会删除当前云硬盘，确定执行卸载并删除该云硬盘吗？'
                    this.detachOk({ id: row.id }, msg)
                  } else {
                    msg = '您确定要卸载该云硬盘吗？'
                    this.detachOk({ id: row.id }, msg)
                  }
                } else {
                  return this.$message.error('当前云硬盘尚未挂载任何云主机，无法执行卸载操作')
                }
              }
            })
          } else {
            this.$confirm('您确定要卸载该硬盘吗？', '提示', {
              confirmButtonText: '确定',
              confirmButtonClass: 'el-button--danger',
              type: 'warning'
            }).then(() => {
              patchVolume('detach', { id: row.id }).then(data => {
                if (data.success) {
                  this.$message.success({
                    message: data.message,
                    type: 'success'
                  })
                  this.getList()
                }
              })
            })
          }
          break
        case 4: // 延期
          this.dialogFormtimeVisible = true
          this.addDatatime = {
            resId: row.id,
            vendorId: row.vendorId,
            months: 1
          }
      }
    },
    // 挂载
    mountSubmit() {
      this.$refs.addDatamount.validate(valid => {
        if (valid) {
          patchVolume('attach', this.addDatamount).then(data => {
            if (data.success) {
              this.$notify({
                message: data.message,
                type: 'success'
              })
              this.dialogFormmountVisible = false
              this.addDatamount = {}
              this.getList()
            }
          })
        }
      })
    },
    // 延期
    timeSubmit() {
      this.$refs.addDatatime.validate(valid => {
        if (valid) {
          this.loading = true
          patchVolume('updateExpriedTime', this.addDatatime).then(data => {
            if (data.success) {
              this.$notify({
                message: data.message,
                type: 'success'
              })
              this.dialogFormtimeVisible = false
              this.getList()
            }
            this.loading = false
          })
        }
      })
    },
    // 跳转详情页
    getDetail(row) {
      detailVolume(row.id).then(data => {
        if (data.success) {
          this.detail = data.data
          this.detail.expiredTime = row.expiredTime
          if (this.detail.regionName === null) this.detail.regionName = data.data.zone
          this.getServer()
          if (this.detail.vendorType != 'ZSTACK') this.SnapshotgetList()
          this.detailFlag = true
        }
      })
    },
    goBack() {
      this.detailFlag = false
      this.hostListData = []
      this.Snapshotlist = []
      this.idList = []
      this.selectList = []
    }
  }
}
</script>
<style scoped>
.detail_icon {
  font-size: 25px;
  margin: 10px;
  color: #409eff;
}
</style>
