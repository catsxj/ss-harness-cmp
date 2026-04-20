/** * Created by Zhang Haijun on 2017/9/5. */
<template>
  <basic-form :model="hostData" :disabled="disabled" ref="formRef" v-bind="$attrs">
    <el-row :gutter="10">
      <el-col :span="24" v-if="!disabled">
        <el-form-item label="服务器集：" class="m-b-sm">
          <el-button type="primary" size="small" class="pull-left" @click="selectServer" icon="el-icon-monitor"> 选择服务器 </el-button>
          <el-button type="danger" size="small" class="pull-right" @click="clearServer" icon="el-icon-delete"> 清空服务器 </el-button>
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item :label="disabled ? '服务器集:' : ''">
          <smart-table :data="hostData.list" class="target-table">
            <el-table-column label="主机名称" prop="name" show-overflow-tooltip> </el-table-column>
            <el-table-column label="IP" prop="ip"> </el-table-column>
            <el-table-column label="端口">
              <template slot-scope="scope">
                <basic-form-item class="m-b-none" :prop="'list.' + scope.row.indexKey + '.port'" validate="required,port" required-message="请填写端口号">
                  <el-input v-model="scope.row.port" type="number" :disabled="disabled"></el-input>
                </basic-form-item>
              </template>
            </el-table-column>
            <template v-if="itemData.authenMode == 'SINGLE'">
              <el-table-column label="用户名">
                <template slot-scope="scope">
                  <basic-form-item class="m-b-none" :prop="'list.' + scope.row.indexKey + '.username'" validate="required" required-message="请填写用户名">
                    <el-input v-model="scope.row.username" :disabled="disabled"></el-input>
                  </basic-form-item>
                </template>
              </el-table-column>
              <el-table-column label="密码">
                <template slot-scope="scope">
                  <basic-form-item class="m-b-none" :prop="'list.' + scope.row.indexKey + '.pasd'" validate="required" required-message="请填写密码">
                    <el-input v-model="scope.row.pasd" type="password" :disabled="disabled" show-password></el-input>
                  </basic-form-item>
                </template>
              </el-table-column>
            </template>
            <el-table-column label="操作" width="100px">
              <template slot-scope="scope">
                <el-button size="mini" type="danger" @click="delServer(scope.row)" :disabled="disabled" icon="el-icon-delete"> 删除 </el-button>
              </template>
            </el-table-column>
          </smart-table>
        </el-form-item>
      </el-col>
      <el-dialog title="服务器列表" :close-on-click-modal="false" :visible.sync="dialogServerVisible" append-to-body width="1200px">
        <AdvanceTable :data="list" :card-border="false" row-key="id" :searchConfigs="searchConfigs" :params="params" :total="total" :columns="columns" :get-list="getList" :loading="loading" ref="tableRef" @select="handleSelectItem" @select-all="handleSelectAll">
          <template #status="status">
            <status-icon :type="vmStatusColorFilter(status, 'color')">{{ vmStatusFilter(status) }}</status-icon>
          </template>
        </AdvanceTable>
        <div slot="footer" class="dialog-footer">
          <el-button type="ghost" @click.native="dialogServerVisible = false">取消</el-button>
          <el-button type="primary" @click.native="ok">确定</el-button>
        </div>
      </el-dialog>
    </el-row>
  </basic-form>
</template>

<script>
// selection-change reserve-selection，选中和数据更新都会触发change事件，数据缓存较为复杂所以弃用
import useTable from 'hooks/useTable'
import { columns, searchConfigs } from './selectServerConfig'
import { getHosts } from '@/services/task/resource'
import { decrypt, encrypt } from 'utils/crypto'
import { vmStatusFilter, vmStatusColorFilter } from '@/filters/index'
import { ref, nextTick, unref, computed, reactive, watch } from '@vue/composition-api'
import { Message, MessageBox } from 'element-ui'
function formatHostData(list) {
  return list.map(item => {
    const { id, name: rawName, ip: host, port, segmentId, osCategory: category, username: user, pasd } = item
    return {
      id,
      rawName,
      host,
      port,
      segmentId,
      category,
      user,
      pasd: pasd && encrypt(pasd)
    }
  })
}
export default {
  props: {
    itemData: {
      type: Object
    },
    osCategory: {
      // 通过osCategory过滤linux/windows机器
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const hostData = reactive({
      // 对数据进行格式化以保持和列表数据一致
      list: props.itemData.data.map(data => {
        const { host: ip, pasd, user: username, category: osCategory, rawName: name, ...others } = data
        const password = pasd && decrypt(pasd)
        return {
          ...others,
          name,
          ip,
          username,
          pasd: password,
          password,
          osCategory
        }
      })
    })
    // 对主机数据监听，实时返回主机数据
    watch(
      () => hostData.list,
      () => {
        context.emit('host-change', formatHostData(hostData.list))
      }
    )
    const { list, total, params, loading, getList } = useTable({
      getService: getHosts,
      async afterGetList() {
        await nextTick()
        unref(list).forEach(item => {
          if (selectIds.value.includes(item.id)) {
            unref(tableRef).toggleRowSelection(item, true)
          }
        })
      }
    })
    const selectList = ref([])
    function handleSelectItem(selection, row) {
      if (unref(selectIds).includes(row.id)) {
        const index = unref(selectList).findIndex(item => item.id === row.id)
        selectList.value.splice(index, 1)
      } else {
        selectList.value.push(row)
      }
    }
    function handleSelectAll(selection) {
      if (selection.length) {
        // 全选情况下
        selection.forEach(item => {
          if (!unref(selectIds).includes(item.id)) {
            selectList.value.push(item)
          }
        })
      } else {
        // 全不选情况下
        list.value.forEach(item => {
          if (unref(selectIds).includes(item.id)) {
            const index = unref(selectList).findIndex(_ => _.id === item.id)
            selectList.value.splice(index, 1)
          }
        })
      }
    }
    const selectIds = computed(() => {
      return unref(selectList).map(item => item.id)
    })
    function ok() {
      hostData.list = unref(selectList).map(item => {
        // 对输入数据对缓存
        const { pasd, password, osCategory, port, ...others } = item
        return {
          ...others,
          osCategory,
          pasd: pasd || (password && decrypt(password)),
          port: port || (osCategory.toUpperCase() === 'WINDOWS' ? 5986 : 22)
        }
      })
      dialogServerVisible.value = false
    }
    // 选择服务器
    const dialogServerVisible = ref(false)
    const tableRef = ref()
    function selectServer() {
      searchConfigs[3].initValue = props.osCategory
      if (tableRef.value) {
        const { searchRef } = tableRef.value
        searchRef.handleReset()
      }
      // 对数据进行格式化以适应后端的传参需求
      selectList.value = [...hostData.list]
      dialogServerVisible.value = true
    }
    // 服务器操作
    function clearServer() {
      MessageBox.confirm('您确定要清空所选主机吗?', '提示', {
        confirmButtonText: '清空',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        hostData.list = []
      })
    }
    function delServer({ id, name }) {
      MessageBox.confirm(`您确定要删除主机【${name}】吗?`, '提示', {
        confirmButtonText: '清空',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        const index = hostData.list.findIndex(item => item.id === id)
        hostData.list.splice(index, 1)
      })
    }
    const formRef = ref()
    function getPostData() {
      let data = false
      formRef.value.validate(valid => {
        if (valid) {
          data = formatHostData(hostData.list)
        } else {
          Message.error('请填写目标主机必填项')
        }
      })
      return data
    }
    return {
      hostData,
      columns,
      searchConfigs,
      list,
      total,
      params,
      loading,
      vmStatusFilter,
      vmStatusColorFilter,
      getList,
      handleSelectItem,
      handleSelectAll,
      ok,
      formRef,
      // 服务器选择
      tableRef,
      dialogServerVisible,
      selectServer,
      clearServer,
      delServer,
      getPostData
    }
  }
}
</script>
<style scoped>
.target-table .el-form-item.is-error {
  margin-bottom: 15px !important;
}
</style>
