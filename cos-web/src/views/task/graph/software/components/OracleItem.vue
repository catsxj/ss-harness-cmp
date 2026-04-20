<template>
  <basic-form :model="itemData" ref="form" :disabled="isPreview" label-wdith="110px">
    <el-row :gutter="10">
      <el-col :span="12">
        <basic-form-item label="部署方式：">
          <el-radio-group v-model="itemData.cluster_install" :disabled="isTaskInstance">
            <el-radio :label="false">单点</el-radio>
            <el-radio :label="true">集群</el-radio>
          </el-radio-group>
        </basic-form-item>
      </el-col>
      <el-col :span="12">
        <basic-form-item label="软件版本：" prop="version" validate="required">
          <el-select class="el_input" v-model="itemData.version" placeholder="版本">
            <el-option v-for="(row, index) in versionData" :key="index" :label="row.name" :value="row.value"> </el-option>
          </el-select>
        </basic-form-item>
      </el-col>
    </el-row>
    <el-alert v-if="itemData.cluster_install" class="m-b-sm" type="warning" :closable="false" title="注：集群安装时，选择目标服务器请务必选择ISCSI Client所在的两台服务器"></el-alert>
    <div v-if="itemData.cluster_install">
      <el-row :gutter="10">
        <el-col :span="12">
          <basic-form-item label="公网网卡：" prop="manage_config.oracle_gi_nic_pub" validate="required">
            <el-input v-model="itemData.manage_config.oracle_gi_nic_pub"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="私网网卡：" prop="manage_config.oracle_gi_nic_priv" validate="required">
            <el-input v-model="itemData.manage_config.oracle_gi_nic_priv"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="单客户端接口：" prop="manage_config.oracle_scan" validate="required" :rule="scanRules" show-overflow-tooltip>
            <el-input v-model="itemData.manage_config.oracle_scan"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="单客户端接口IP：" prop="manage_config.scan_ip" validate="required,ip" show-overflow-tooltip>
            <el-input v-model="itemData.manage_config.scan_ip"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <basic-form-item label="虚拟IP设置：">
            <el-button v-if="!isPreview" type="primary" size="mini" @click="addItem(itemData.manage_config.vip, '')">新增</el-button>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12" v-for="(item, index) in itemData.manage_config.vip" :key="index">
          <basic-form-item :label="`虚拟IP${index + 1}：`" :prop="'manage_config.vip.' + index" validate="required,ip">
            <el-input v-model="itemData.manage_config.vip[index]">
              <el-button slot="append" @click="removeItem(itemData.manage_config.vip, index)"><i class="el-icon-delete" /></el-button>
            </el-input>
          </basic-form-item>
        </el-col>
      </el-row>
    </div>
    <el-row>
      <el-col :span="24" class="line"></el-col>
      <el-col :span="24" class="title"> 新增数据库 <el-button v-if="!isPreview" class="m-l" type="primary" size="mini" @click="addDbItem">新增</el-button> </el-col>
    </el-row>
    <div v-for="(row, index) in itemData.oracle_databases" :key="index" class="search-container">
      <el-button v-if="!isPreview" type="text" class="del_operate" @click="removeItem(itemData.oracle_databases, index, 'required')">
        <i class="el-icon-delete" />
      </el-button>
      <el-row :gutter="10">
        <el-col :span="12">
          <basic-form-item label="数据库名称" :prop="`oracle_databases.${index}.name`" validate="required">
            <el-input v-model="row.name"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="数据库密码" :prop="`oracle_databases.${index}.oracle_password`" validate="required" :rule="rules">
            <el-input type="password" v-model="row.oracle_password" show-password></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <basic-form-item label="初始化参数：">
            <el-button v-if="!isPreview" type="primary" size="mini" @click="addItem(row.init_parameters)">新增</el-button>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="10" v-for="(item, index1) in row.init_parameters" :key="index1">
        <el-col :span="8">
          <basic-form-item label="名称：" label-width="80px" :prop="`oracle_databases.${index}.init_parameters.${index1}.name`" validate="required">
            <el-select v-model="item.name" :disabled="isPreview">
              <el-option v-for="row in initNameList" :key="row.value" :label="row.name" :value="row.value"> </el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col :span="7">
          <basic-form-item label="值：" label-width="80px" :prop="`oracle_databases.${index}.init_parameters.${index1}.value`" validate="required">
            <el-input v-model="item.value"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="7">
          <basic-form-item label="范围：" label-width="80px" :prop="`oracle_databases.${index}.init_parameters.${index1}.scope`" validate="required">
            <el-select v-model="item.scope">
              <el-option label="both" value="both"></el-option>
              <el-option label="spfile" value="spfile"></el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col :span="2" v-if="!isPreview">
          <el-button type="text" class="del_cell" @click.native="removeItem(row.init_parameters, index1)">
            <i class="el-icon-delete" />
          </el-button>
        </el-col>
      </el-row>
    </div>
    <el-row v-if="itemData.cluster_install">
      <el-col :span="24" class="line"></el-col>
      <el-col :span="24" class="title">自动化存储管理(ASM)</el-col>
      <div v-for="(row, index) in itemData.asm_diskgroups" :key="index">
        <el-row>
          <el-col :span="24">
            <basic-form-item :label="index | storageTypeFilter">
              <el-button v-if="!isPreview" type="primary" size="mini" @click="addItem(itemData.asm_diskgroups[index])">新增</el-button>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row v-for="(item, index1) in row" :key="index1">
          <el-col :span="11">
            <basic-form-item label="磁盘：" :prop="`asm_diskgroups.${index}.${index1}.device`" validate="required">
              <el-input v-model="item.device"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="11">
            <basic-form-item label="标签：" :prop="`asm_diskgroups.${index}.${index1}.asmlabel`" validate="required">
              <el-input v-model="item.asmlabel"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="2" v-if="!isPreview">
            <el-button class="m-l-sm" type="text" @click.native="removeItem(row, index1, 'required')">
              <i class="el-icon-delete" />
            </el-button>
          </el-col>
        </el-row>
      </div>
    </el-row>
    <el-row>
      <el-col :span="24" class="line"></el-col>
      <el-col :span="24" class="title">文件系统(FS)</el-col>
    </el-row>
    <el-row>
      <el-row>
        <el-col :span="24">
          <basic-form-item label="FS配置：">
            <el-button v-if="!isPreview" class="m-l" type="primary" size="mini" @click="addFsItem(itemData.host_fs_layout)">新增</el-button>
          </basic-form-item>
        </el-col>
      </el-row>
      <div v-for="(item, index) in itemData.host_fs_layout" :key="index" class="search-container">
        <el-button v-if="!isPreview" type="text" class="del_operate" @click="removeItem(itemData.host_fs_layout, index, 'required')">
          <i class="el-icon-delete" />
        </el-button>
        <el-row>
          <el-col :span="12">
            <basic-form-item label="磁盘：" :prop="`host_fs_layout.${index}.device`" validate="required">
              <el-input v-model="item.device"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="PV名称：" :prop="`host_fs_layout.${index}.pvname`" validate="required">
              <el-input v-model="item.pvname"></el-input>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <basic-form-item label="名称：" :prop="`host_fs_layout.${index}.name`" validate="required">
              <el-input v-model="item.name"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="挂载路径：" :prop="`host_fs_layout.${index}.mntp`" validate="required">
              <el-input v-model="item.mntp"></el-input>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <basic-form-item label="文件格式：" :prop="`host_fs_layout.${index}.fstype`" validate="required">
              <el-select v-model="item.fstype">
                <el-option label="ext4" value="ext4"></el-option>
                <el-option label="xfs" value="xfs"></el-option>
                <el-option label="ext3" value="ext3"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </el-row>
      </div>
    </el-row>
  </basic-form>
</template>
<script>
import { cloneDeep } from 'lodash-es'
import { encrypt, decrypt } from 'utils/crypto'
import node from '../../mixins/index'
import show from '../../mixins/show'
import software from '../mixins/itemOperate'
import { getDictChildren } from 'services/system/dictionary'
export default {
  mixins: [node, show, software],
  props: {
    itemData: {
      type: Object,
      default: function () {
        return {
          cluster_install: false,
          manage_config: {
            vip: []
          },
          host_fs_layout: [{ mntp: '/u01', fstype: 'ext4' }],
          asm_diskgroups: {
            crs: [{}],
            data: [{}],
            fra: [{}]
          },
          oracle_databases: [{ init_parameters: [{}] }]
        }
      }
    }
  },
  data() {
    return {
      versionData: [],
      initNameList: [],
      rules: [
        {
          pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,}$/,
          message: '请输入包含大小写字母、数字，至少为八个字符的密码'
        }
      ],
      scanRules: [
        {
          pattern: /^[A-Za-z]/,
          message: '输入内容必须以字母开头'
        }
      ]
    }
  },
  created() {
    this.getDict('ORACLE-VERSION', 'versionData')
    this.getDict('ORACLE_INIT_NAME', 'initNameList')
    this.initData()
  },
  methods: {
    initData() {
      const {
        asm_diskgroups,
        oracle_databases,
        cluster_install,
        manage_config,
        manage_config: { vip }
      } = this.itemData
      if (!asm_diskgroups) {
        this.$set(this.itemData, 'asm_diskgroups', { crs: [{}], data: [{}], fra: [{}] })
      }
      if (cluster_install) {
        const vipCache = []
        vip.forEach((item) => {
          vipCache.push(item.split(' ')[0])
        })
        manage_config.vip = vipCache
      }
      // 密码解密
      oracle_databases.forEach((item) => {
        const { oracle_password } = item
        if (oracle_password) {
          item.oracle_password = decrypt(oracle_password)
        }
      })
    },
    getDict(params, dataName) {
      getDictChildren({ value: params }).then((data) => {
        if (data.success) {
          this[dataName] = data.data
        }
      })
    },
    addDbItem() {
      this.itemData.oracle_databases.push({ init_parameters: [] })
    },
    addFsItem(data) {
      data.push({ mntp: '/u01', fstype: 'ext4' })
    },
    getPostData() {
      let data = false
      this.$refs.form.validate((valid) => {
        if (valid) {
          const itemData = cloneDeep(this.itemData)
          const {
            manage_config,
            oracle_databases,
            manage_config: { oracle_gi_nic_pub: pub, oracle_gi_nic_priv: priv, vip },
            cluster_install
          } = itemData
          if (cluster_install) {
            if (pub === priv) return this.$message.error('公网网卡与私网网卡名称不能相同')
            // 处理虚拟机IP参数
            const vipCache = []
            vip.forEach((item, key) => {
              vipCache.push(`${item} rac${key + 1}-vip`)
            })
            manage_config.vip = vipCache
          } else {
            delete itemData.asm_diskgroups
          }
          // 数据库密码加密
          oracle_databases.forEach((item) => {
            item.oracle_password = encrypt(item.oracle_password)
          })
          data = itemData
        }
      })
      return data
    }
  },
  filters: {
    storageTypeFilter(value) {
      const map = {
        crs: 'CRS配置：',
        data: 'DATA配置：',
        fra: 'FRA配置：'
      }
      return map[value]
    }
  }
}
</script>
<style scoped lang="scss">
@import 'index';
</style>
