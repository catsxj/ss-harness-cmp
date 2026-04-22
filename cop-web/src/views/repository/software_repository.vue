<template>
  <el-card class="wrapper">
    <el-form class="m-t m-l" :inline="true">
      <el-form-item>
        <el-button @click="handleCreate()" type="primary" icon="el-icon-plus">新增</el-button>
      </el-form-item>
      <el-form-item>
        <el-input placeholder="名称" v-model="listQuery.name">
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-select clearable v-model="listQuery.type" placeholder="类型" @change="handleSearch">
          <el-option v-for="item in softwareType" :key="item.name" :label="item.name" :value="item.name">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button type="ghost" icon="el-icon-refresh" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
    <AdvanceTable :data="list" :searchConfigs="[]" :columns="columns" :get-list="getList" :loading="loading" :showTools="false">
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record)">{{ record.name }}</span>
      </template>
      <template #baseurl="val, record">
        {{ record.baseurl || record.metalink || record.mirrorlist }}
      </template>
      <template #operate="val,record">
        <el-button :disabled="record.name === 'cmp'" type="text" @click="handleCreate(record)">
          <i class="el-icon-edit"></i>
          编辑
        </el-button>
        <div class="action-divider"></div>
        <el-button type="text" :disabled="record.name === 'cmp'" @click="handleDelete(record.name)">
          <i class="el-icon-delete"></i>
          删除
        </el-button>
        <div class="action-divider"></div>
        <el-dropdown trigger="click">
          <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="handleConfig(record)">
              配置
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
      <div slot="pagination"></div>
    </AdvanceTable>
    <!--新增界面-->
    <el-dialog :title="title" :close-on-click-modal="false" v-if="dialogFormVisible" :visible.sync="dialogFormVisible" width="70%">
      <basic-form :model="addForm" ref="addForm" label-width="140px">
        <el-row>
          <el-col :span="12">
            <basic-form-item label="名称：" prop="name" validate="required,noChinese" required-message="请输入名称">
              <el-input :disabled="status === 'update'" v-model="addForm.name" auto-complete="off"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="类型：" prop="type" validate="required" required-message="请选择类型">
              <el-select :disabled="status === 'update'" v-model="addForm.type" placeholder="请选择类型" @change="selectType">
                <el-option v-for="item in softwareType" :key="item.name" :label="item.name" :value="item.name"> </el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <!--ISO-->
          <div v-if="addForm.type === 'ISO'">
            <el-col :span="24">
              <basic-form-item label="选择镜像：" prop="imageId" validate="required">
                <basic-table :data="imageList" :params="paramsImage" :get-list="getImageList" :total="totalImage" ref="table">
                  <el-table-column label="镜像名称" show-overflow-tooltip>
                    <template slot-scope="scope">
                      <el-radio :disabled="scope.row.disabled" v-model="addForm.imageId" :label="scope.row.id" @change="changeImage">{{ scope.row.name }}</el-radio>
                    </template>
                  </el-table-column>
                  <el-table-column label="系统类型" prop="osType" show-overflow-tooltip> </el-table-column>

                  <el-table-column label="版本" prop="osVersion" show-overflow-tooltip> </el-table-column>

                  <el-table-column label="ISO文件" prop="isoName" show-overflow-tooltip> </el-table-column>

                  <el-table-column label="大小（MB）" prop="size" show-overflow-tooltip> </el-table-column>

                  <el-table-column label="创建时间" prop="gmtCreate" show-overflow-tooltip> </el-table-column>
                  <el-table-column label="描述" prop="remark" show-overflow-tooltip> </el-table-column>
                </basic-table>
              </basic-form-item>
            </el-col>
          </div>
          <!--PUBLIC-->
          <div v-if="addForm.type === 'PUBLIC'">
            <el-col :span="24">
              <el-row>
                <el-col :span="12">
                  <basic-form-item label="地址类型：" prop="urlType">
                    <el-select v-model="addForm.urlType" @change="urlTypeChange">
                      <el-option label="baseurl" value="baseurl"></el-option>
                      <el-option label="mirrorlist" value="mirrorlist"></el-option>
                      <el-option label="metalink" value="metalink"></el-option>
                    </el-select>
                  </basic-form-item>
                </el-col>
                <el-col :span="12">
                  <el-tooltip v-if="addForm.urlType === 'baseurl'" content="参考格式： http://ftp.sjtu.edu.cn/centos/7.6.1810/os/x86_64/" placement="bottom" effect="light">
                    <div class="m-l">
                      <basic-form-item label="源地址：" prop="baseurl" maxlength="1024" validate="required">
                        <el-input v-model="addForm.baseurl" auto-complete="off"></el-input>
                      </basic-form-item>
                    </div>
                  </el-tooltip>
                  <el-tooltip v-if="addForm.urlType === 'metalink'" content="参考格式：https://mirrors.fedoraproject.org/metalink?repo=epel-7&arch=$basearch" placement="bottom" effect="light">
                    <div>
                      <basic-form-item label="源地址：" prop="metalink" maxlength="1024">
                        <el-input v-model="addForm.metalink" auto-complete="off"></el-input>
                      </basic-form-item>
                    </div>
                  </el-tooltip>
                  <el-tooltip v-if="addForm.urlType === 'mirrorlist'" content="参考格式：http://mirrorlist.centos.org/?release=$releasever&arch=$basearch&repo=os" placement="bottom" effect="light">
                    <div>
                      <basic-form-item label="源地址：" prop="mirrorlist" maxlength="1024">
                        <el-input v-model="addForm.mirrorlist" auto-complete="off"></el-input>
                      </basic-form-item>
                    </div>
                  </el-tooltip>
                </el-col>
              </el-row>
            </el-col>
            <el-col :span="12" v-if="addForm.urlType != 'baseurl'">
              <div>
                <basic-form-item label="failovermethod：">
                  <el-select v-model="addForm.failovermethod">
                    <el-option label="roundrobin" value="roundrobin"></el-option>
                    <el-option label="priority" value="priority"></el-option>
                  </el-select>
                </basic-form-item>
              </div>
            </el-col>
            <el-col :span="24">
              <el-col :span="12">
                <basic-form-item label="gpgcheck：">
                  <el-radio-group v-model="addForm.gpgcheck" @change="gpgcheck">
                    <el-radio :label="1" border>是</el-radio>
                    <el-radio :label="0" border>否</el-radio>
                  </el-radio-group>
                </basic-form-item>
              </el-col>
              <el-col :span="12" v-if="addForm.gpgcheck == 1">
                <basic-form-item label="gpgkey：">
                  <el-input v-model="addForm.gpgkey" auto-complete="off"></el-input>
                </basic-form-item>
              </el-col>
            </el-col>
          </div>
          <!--PRIVATE-->
          <div v-if="addForm.type === 'PRIVATE'">
            <el-col :span="24" v-if="status === 'create'">
              <select-server :itemData="addForm"></select-server>
            </el-col>
            <el-col :span="24" v-else>
              <basic-form-item label="主机：">
                <basic-table :data="serverInfoArr">
                  <el-table-column label="IP" prop="host" show-overflow-tooltip></el-table-column>
                  <el-table-column label="端口" prop="port" show-overflow-tooltip></el-table-column>
                  <el-table-column label="类型" prop="category" show-overflow-tooltip></el-table-column>
                  <el-table-column label="用户名" prop="user" show-overflow-tooltip></el-table-column>
                  <div slot="pagination"></div>
                </basic-table>
              </basic-form-item>
            </el-col>
            <el-col :span="24">
              <basic-form-item label="路径：" prop="repoPath" validate="required" maxlength="1000">
                <el-input v-model="addForm.repoPath" auto-complete="off"></el-input>
              </basic-form-item>
            </el-col>
          </div>
          <el-col :span="24">
            <basic-form-item label="源文件名称：" prop="file" validate="required">
              <el-input :disabled="status == 'update'" v-model="addForm.file" auto-complete="off"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="描述：" prop="description" validate="required,english" maxlength="64">
              <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }" v-model="addForm.description" auto-complete="off"></el-input>
            </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit">确定</el-button>
      </div>
    </el-dialog>
    <!--配置界面-->
    <el-dialog title="配置" :close-on-click-modal="false" v-if="configFormVisible" :visible.sync="configFormVisible" width="70%">
      <basic-form :model="configForm" label-width="110px" ref="configForm">
        <el-row>
          <select-server-item :itemData="configForm"></select-server-item>
          <el-col :span="12">
            <basic-form-item label="名称：" prop="name">
              <el-input disabled v-model="configForm.name" auto-complete="off"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="类型：" prop="type">
              <el-input disabled v-model="configForm.type" auto-complete="off"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="源地址：">
              <el-input disabled :value="configForm.baseurl || configForm.metalink || configForm.mirrorlist" auto-complete="off"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="清理原有源：">
              <el-checkbox v-model="configForm.clean"></el-checkbox>
            </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="configFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="configSubmit">确定</el-button>
      </div>
    </el-dialog>
    <common-detail v-if="detailFlag" :setting="{ type: 'software' }" :title="detailData.name" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ detailData.name }}</common-detail-item>
        <common-detail-item label="源文件名称">{{ detailData.file }}</common-detail-item>
        <common-detail-item label="类型">{{ detailData.type }}</common-detail-item>
        <common-detail-item v-if="detailData.type == 'ISO'" label="镜像名称">{{ detailData.imageName }}</common-detail-item>
        <common-detail-item v-if="detailData.type == 'ISO'" label="系统类型">{{ detailData.osType }}</common-detail-item>
        <common-detail-item v-if="detailData.type == 'ISO'" label="版本">{{ detailData.osVersion }}</common-detail-item>
        <common-detail-item v-if="detailData.type == 'ISO'" label="iso文件名">{{ detailData.isoName }}</common-detail-item>
        <common-detail-item v-if="detailData.type == 'PRIVATE'" label="路径">{{ detailData.repoPath }}</common-detail-item>
        <common-detail-item v-if="detailData.type == 'PRIVATE'" label="主机IP">{{ detailData.host }}</common-detail-item>
        <common-detail-item v-if="detailData.type == 'PRIVATE'" label="主机端口">{{ detailData.port }}</common-detail-item>
        <common-detail-item v-if="detailData.type == 'PUBLIC'" label="地址类型">{{ detailData.urlType }}</common-detail-item>
        <common-detail-item v-if="detailData.type == 'PUBLIC'" label="源地址">{{ detailData.url }}</common-detail-item>
        <common-detail-item v-if="detailData.type == 'PUBLIC' && (detailData.mirrorlist || detailData.metalink)" label="failovermethod">{{ detailData.failovermethod }}</common-detail-item>
        <common-detail-item v-if="detailData.type == 'PUBLIC' && (detailData.baseurl || detailData.mirrorlist || detailData.metalink)" label="gpgkey">{{ detailData.gpgkey }}</common-detail-item>
        <common-detail-item label="描述">{{ detailData.description }}</common-detail-item>
      </template>
    </common-detail>
  </el-card>
</template>

<script>
import webSocket from '@/common/mixins/getGlobalSocket'
import crypto from 'utils/crypto.js'
import SelectServerItem from './component/selectHost.vue'
import SelectServer from './component/selectServer.vue'
import { getImage, getRepos, createRepos, modifyRepos, removeRepos, configureYum } from 'services/installhost'
import { getResource } from 'services/platform/index'
import { getDictChildren } from 'services/system/dictionary'
const softwareType = [
  { id: 0, name: 'ISO' },
  { id: 1, name: 'PRIVATE' },
  { id: 2, name: 'PUBLIC' }
]
export default {
  mixins: [webSocket],
  components: { SelectServerItem, SelectServer },
  data() {
    return {
      loading: false,
      searchConfigs: [
        { label: '名称', value: 'name', type: 'Input' },
        {
          label: '类型',
          value: 'type',
          type: 'Select',
          data: softwareType,
          validate: 'required',
          props: {
            value: 'name'
          }
        }
      ],
      columns: [
        { label: '名称', prop: 'name', showOverflowTooltip: true, scopedSlots: { customRender: 'name' } },
        { label: '源文件名称', prop: 'file', showOverflowTooltip: true },
        { label: '类型', prop: 'type', showOverflowTooltip: true },
        { label: '源地址', prop: 'baseurl', showOverflowTooltip: true },
        { label: '操作', disabled: true, width: '220px', scopedSlots: { customRender: 'operate' } }
      ],
      softwareType,
      list: null,
      total: null,
      typeData: null,
      listQuery: {
        type: '',
        name: ''
      },
      params: {},
      dialogFormVisible: false,
      // 新增编辑界面数据,
      addForm: {},
      title: '',
      status: '',
      versionDisabled: false,
      configFormVisible: false,
      configForm: {
        targets: [],
        clean: false
      },
      targetData: [],
      serverInfoArr: [],
      imageList: null,
      totalImage: null,
      paramsImage: {
        page: 1,
        rows: 10
      },
      detailFlag: false,
      detailData: {}
    }
  },
  created() {
    this.getList()
  },
  updated() {},
  methods: {
    onmessage(data) {
      if (data.operate === 'image.upload' || data.operate === 'yum.operate') {
        this.getList()
      }
    },
    goBack() {
      this.detailFlag = false
    },
    handleReset() {
      this.listQuery = {}
      this.params = {}
      this.getList()
    },
    getList() {
      this.loading = true
      getRepos(this.params)
        .then(data => {
          if (data.success) {
            this.list = data.data
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    getOS() {
      getDictChildren({ value: 'OS_CATEGORY' }).then(data => {
        if (data.success) {
          this.typeData = data.data
        }
      })
    },
    getTargetData() {
      getResource({
        page: 1,
        rows: 100000,
        params: JSON.stringify([
          { param: { category: 'Computer' }, sign: 'EQ' },
          { param: { inventory: 'centos' }, sign: 'LK' }
        ])
      }).then(data => {
        if (data.success) {
          this.targetData = data.data.rows
          this.targetData.forEach(item => {
            item.privateIps = JSON.parse(item.privateIps)
          })
        }
      })
    },
    handleSearch() {
      this.params = {}
      if (this.listQuery.name) {
        this.params.name = this.listQuery.name
      }
      if (this.listQuery.type) {
        this.params.type = this.listQuery.type.toUpperCase()
      }
      this.getList()
    },
    handleCreate(data) {
      if (data) {
        this.title = '编辑软件仓库'
        this.status = 'update'
        this.addForm = Object.assign({}, data)
        switch (this.addForm.type) {
          case 'PUBLIC':
            if (this.addForm.baseurl) {
              this.addForm.urlType = 'baseurl'
            }
            if (this.addForm.metalink) {
              this.addForm.urlType = 'metalink'
            }
            if (this.addForm.mirrorlist) {
              this.addForm.urlType = 'mirrorlist'
            }
            break
          case 'PRIVATE':
            this.serverInfoArr = []
            const data = JSON.parse(this.addData.serverInfo)
            data.pasd = crypto.decrypt(data.pasd)
            this.serverInfoArr.push(data)
            break
        }
      } else {
        this.title = '新增软件仓库'
        this.status = 'create'
        this.addForm = {
          name: '',
          type: 'ISO',
          imageId: '',
          description: '',
          osType: '',
          osVersion: ''
        }
      }
      this.getOS()
      this.getImageList()
      this.dialogFormVisible = true
    },
    selectType(value) {
      const name = this.addForm.name
      switch (value) {
        case 'ISO':
          this.addForm = {
            name: name,
            type: 'ISO',
            imageId: '',
            description: '',
            osType: '',
            osVersion: ''
          }
          break
        case 'PUBLIC':
          this.addForm = {
            name: name,
            type: 'PUBLIC',
            description: '',
            gpgcheck: 0,
            urlType: 'baseurl',
            baseurl: ''
          }
          break
        case 'PRIVATE':
          this.addForm = {
            name: name,
            type: 'PRIVATE',
            description: '',
            repoPath: '',
            targets: []
          }
          this.getTargetData()
          break
      }
    },
    gpgcheck(value) {
      if (value === 1) {
        this.$set(this.addForm, 'gpgkey', 'file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-7')
      } else {
        delete this.addForm.gpgkey
      }
    },
    urlTypeChange(value) {
      const arr = ['baseurl', 'metalink', 'mirrorlist']
      arr.forEach(attr => {
        if (this.addForm[attr]) {
          delete this.addForm[attr]
        }
      })
      this.$set(this.addForm, value, '')
      if (value === 'baseurl') {
        delete this.addForm.failovermethod
      } else {
        this.$set(this.addForm, 'failovermethod', 'roundrobin')
      }
    },
    selectOsType() {
      if (this.addForm.osType === 'WINDOWSSERVER') {
        this.addForm.osVersion = '2012'
        this.versionDisabled = true
      } else {
        this.addForm.osVersion = ''
        this.versionDisabled = false
      }
    },
    addSubmit() {
      this.$refs.addForm.validate(valid => {
        if (valid) {
          const addForm = Object.assign({}, this.addForm)
          if (this.status === 'update') {
            addForm.target = JSON.parse(this.addForm.serverInfo)
            if (addForm.target) {
              addForm.target.forEach(element => {
                if (element.pasd) {
                  element.pasd = crypto.encrypt(element.pasd)
                }
              })
            }
            if (addForm.urlType) {
              delete addForm.urlType
            }
            modifyRepos(addForm).then(data => {
              if (data.success) {
                this.$notify({
                  message: data.message,
                  type: 'success'
                })
                this.getList()
                this.dialogFormVisible = false
              }
            })
          } else {
            if (this.addForm.type === 'PRIVATE') {
              if (this.addForm.targets.length == 0) {
                return this.$message({
                  message: '必须选择一个目标主机',
                  type: 'error'
                })
              }
              addForm.target = {
                host: this.addForm.targets[0].host,
                port: this.addForm.targets[0].port,
                user: this.addForm.targets[0].user,
                pasd: this.addForm.targets[0].pasd,
                resourceId: this.addForm.targets[0].resourceId,
                name: this.addForm.targets[0].name
              }
              delete addForm.targets
              if (addForm.target && addForm.target.pasd) {
                addForm.target.pasd = crypto.encrypt(addForm.target.pasd)
              }
            }
            if (addForm.urlType) {
              delete addForm.urlType
            }
            createRepos(addForm).then(data => {
              if (data.success) {
                this.$notify({
                  message: data.message,
                  type: 'success'
                })
                this.getList()
                this.dialogFormVisible = false
              }
            })
          }
        }
      })
    },
    handleDelete(name) {
      this.$confirm('您确定要删除该软件吗?', '提示', {
        confirmButtonText: '删除',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        removeRepos(name).then(data => {
          if (data.success) {
            this.$notify({
              message: data.message,
              type: 'success'
            })
            this.getList()
          }
        })
      })
    },
    handleConfig(data) {
      this.configForm = Object.assign({}, data)
      if (!this.configForm.clean) {
        this.$set(this.configForm, 'clean', false)
      }
      if (!this.configForm.targets) {
        this.configForm.targets = []
        this.configFormVisible = true
      } else {
        this.configForm.targets.forEach(item => {
          item.pasd = crypto.decrypt(item.pasd)
        })
        this.configFormVisible = true
      }
    },
    configSubmit() {
      this.$refs.configForm.validate(valid => {
        if (valid) {
          if (this.configForm.targets.length == 0) {
            return this.$message({
              message: '必须选择一个目标主机',
              type: 'error'
            })
          }
          this.configForm.targets.forEach(item => {
            if (item.pasd) {
              item.pasd = crypto.encrypt(item.pasd)
            }
          })
          configureYum(this.configForm).then(data => {
            if (data.success) {
              this.$notify({
                message: data.message,
                type: 'success'
              })
              this.configFormVisible = false
              this.getList()
            }
          })
        }
      })
    },
    getImageList() {
      this.paramsImage.params = this.$tools.handleSearchParam({
        'catalog:EQ': 'PM'
      })
      getImage(this.paramsImage).then(data => {
        if (data.success) {
          this.imageList = data.data.rows
          this.imageList.forEach(item => {
            item.disabled = false
            switch (item.osType) {
              case 'ESXI':
              case 'UBUNTU':
              case 'SUSE':
              case 'WINDOWSSERVER':
                item.disabled = true
            }
          })
          this.totalImage = data.data.total
        }
      })
    },
    changeImage(value) {
      this.imageList.forEach(item => {
        if (item.id === this.addForm.imageId) {
          this.addForm.osVersion = item.osVersion
          this.addForm.osType = item.osType
        }
      })
    },
    getDetail(data) {
      this.detailData = Object.assign({}, data)
      switch (this.detailData.type) {
        case 'ISO':
          break
        case 'PRIVATE':
          this.detailData.serverInfo = JSON.parse(this.detailData.serverInfo)
          this.detailData.host = this.detailData.serverInfo.host
          this.detailData.port = this.detailData.serverInfo.port
          break
        case 'PUBLIC':
          if (this.detailData.baseurl) {
            this.detailData.urlType = 'baseurl'
            this.detailData.url = this.detailData.baseurl
          } else if (this.detailData.mirrorlist) {
            this.detailData.urlType = 'mirrorlist'
            this.detailData.url = this.detailData.mirrorlist
          } else {
            this.detailData.urlType = 'metalink'
            this.detailData.url = this.detailData.metalink
          }
          break
      }
      this.detailFlag = true
    }
  }
}
</script>
<style scoped>
.wrapper {
  padding: 0 !important;
}
.wrapper ::v-deep .el-card__body {
  padding: 0 !important;
}
</style>
