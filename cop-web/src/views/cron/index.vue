<template>
  <div>
    <AdvanceTable :title="'定时作业列表'" :data="list" :searchConfigs="searchConfigs" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
      <template v-slot:action>
        <el-button type="primary" @click="handleCreate()" slot="operate" icon="el-icon-plus">新增</el-button>
      </template>
      <template #name="val, record">
        <router-link class="detail-href" :to="{ name: 'CronTaskPreview', params: { id: record.id } }">
          {{ val }}
        </router-link>
      </template>
      <template #status="status">
        <status-icon :type="cronTaskStatusFlilter(status, 'color')">
          {{ cronTaskStatusFlilter(status, 'status') }}
        </status-icon>
      </template>
      <template #operate="val,record">
        <el-button type="text" @click="handleCreate(record)" :disabled="record.status === 'APPROVING'||record.status === 'WAITTING'||record.status === 'RUNNING'" icon="el-icon-edit">
          编辑
        </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="handleDelete(record)" :disabled="record.status === 'APPROVING'||record.status === 'WAITTING'||record.status === 'RUNNING'" icon="el-icon-delete">
          删除
        </el-button>
        <div class="action-divider"></div>
        <el-dropdown trigger="click">
          <span class="el-dropdown-link">
            更多
            <i class="el-icon-arrow-down"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="operateTasks('active', record.id)" :disabled="record.status !== 'SUSPENDED' && record.status !== 'APPROVED'">
              激活
            </el-dropdown-item>
            <el-dropdown-item @click.native="operateTasks('suspend', record.id)" :disabled="record.status !== 'WAITTING'">
              挂起
            </el-dropdown-item>
            <el-dropdown-item @click.native="applyActive(record)" :disabled="(record.status !== 'CREATED' && record.status !== 'UNAPPLY') || record.status === 'END'">
              申请激活
            </el-dropdown-item>
            <router-link :to="{ name: 'CronTaskHistory', params: { id: record.id }, query: { name: record.name } }">
              <el-dropdown-item>
                执行历史
              </el-dropdown-item>
            </router-link>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </AdvanceTable>
    <el-dialog :title="addData.isNew ? '新增定时作业' : '修改定时作业'" :close-on-click-modal="false" :visible.sync="addDialogVisible" width="50%">
      <basic-form :model="addData" ref="formRef">
        <el-row :gutter="20">
          <el-col :span="12" v-if="addData.isNew">
            <basic-form-item label="作业列表：" prop="id" validate="required">
              <el-select v-model="addData.id" placeholder="请选择" filterable="">
                <el-option v-for="item in taskList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="12" v-else>
            <basic-form-item label="作业名称：" prop="name" validate="required">
              <el-input v-model="addData.name"></el-input>
            </basic-form-item>
          </el-col>
        </el-row>
        <select-cron ref="cornRef" :data="addData.cron"></select-cron>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit" :loading="loading">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import selectCron from '@/views/task/components/selectCron.vue'
import useTable from 'hooks/useTable'
import { getTask, removeTask, operateTask, modifyTask } from 'services/task/task'
import { defineComponent, Ref, ref } from '@vue/composition-api'
import { Message, MessageBox } from 'element-ui'
import { handleSearchParam } from 'cmp-element/utils'
import useGlobalWebsocket from '@/common/hooks/useGlobalWebsocket'
const searchConfigs = [
  { label: '作业名称', value: 'name', type: 'Input' },
  { label: '创建', value: 'gmtCreate', type: 'DateRange' },
  { type: 'Const', value: 'code', initValue: 'scheduled' }
]
function cronTaskStatusFlilter(value: string, type: string) {
  const statusMap: any = {
    CREATED: '新创建',
    WAITTING: '等待中',
    RUNNING: '运行中',
    SUSPENDED: '已挂起',
    APPROVING: '审批中',
    REFUSED: '未批准',
    APPROVED: ' 已批准',
    UNAPPLY: '未申请',
    END: '已结束'
  }
  const colorMap: any = {
    CREATED: 'normal',
    WAITTING: 'primary',
    RUNNING: 'success',
    SUSPENDED: 'warning',
    APPROVING: 'primary',
    REFUSED: 'danger',
    APPROVED: 'success',
    UNAPPLY: 'normal',
    END: 'danger'
  }
  return type === 'color' ? colorMap[value] : statusMap[value]
}
const columns = [
  { label: '作业名称', prop: 'name', scopedSlots: { customRender: 'name' } },
  { label: '状态', prop: 'status', scopedSlots: { customRender: 'status' } },
  { label: '执行计划', prop: 'cron' },
  { label: '创建人', prop: 'creator' },
  { label: '创建时间', prop: 'gmtCreate' },
  {
    label: '操作',
    disabled: true,
    width: '220px',
    scopedSlots: { customRender: 'operate' }
  }
]
type ICron = {
  id?: number;
  cron?: string;
  isNew?: boolean;
}
export default defineComponent({
  components: {
    selectCron
  },
  setup(props, context) {
    const { list, total, params, handleDelete, loading, getList } = useTable({
      getService: getTask,
      removeService: removeTask
    });
    useGlobalWebsocket((data: any) => {
      if (data.operate === 'task.cron') {
        getList()
      }
    },
    context.root.$store
    );
    // 新增
    const addData: Ref<ICron> = ref({})
    const addDialogVisible: Ref<boolean> = ref(false)
    const taskList = ref([])
    async function getTaskList() {
      const data = await getTask({
        simple: true,
        params: handleSearchParam({
          code: 'standard', hasSuspend: false, status: 'APPROVED'
        })
      })
      if (data.success) {
        taskList.value = data.data.rows
      }
    }
    function handleCreate(data: ICron) {
      if (data) {
        addData.value = Object.assign({}, data)
      } else {
        getTaskList()
        addData.value = {
          isNew: true
        }
      }
      addDialogVisible.value = true
    }
    const formRef = ref()
    const cornRef = ref()
    function addSubmit() {
      formRef.value.validate((valid: boolean) => {
        if (valid) {
          addData.value.cron = cornRef.value.cron
          loading.value = true
          const callback = (data: any) => {
            if (data.success) {
              addDialogVisible.value = false;
              Message.success(data.message)
              getList()
            }
            loading.value = false
          }
          const { isNew, id } = addData.value;
          if (isNew) {
            operateTask(id, 'transfer', addData.value).then(callback)
          } else modifyTask(addData.value).then(callback)
        }
      })
    }
    // 操作
    function applyActive(record: any) {
      MessageBox.confirm(`您确定要激活【${record.name}】吗?`, '提示', {
        type: 'warning'
      }).then(async () => {
        const data = await operateTask(record.id, 'applyActive', {
          startMode: 'Auto'
        });
        if (data.success) {
          Message.success(data.message);
          getList()
        }
      });
    }

    // 启动暂停任务
    function operateTasks(type: string, id: number) {
      operateTask(id, type).then((data: any) => {
        if (data.success) {
          Message.success(data.message)
          getList()
        }
      })
    }
    return {
      columns,
      searchConfigs,
      list,
      total,
      params,
      handleDelete,
      loading,
      getList,
      cronTaskStatusFlilter,
      // 新增
      addData,
      addDialogVisible,
      taskList,
      formRef,
      cornRef,
      handleCreate,
      addSubmit,
      operateTasks,
      applyActive
    }
  }
})
// export default class CronList extends Vue {
//   private cronTaskStatusFlilter = cronTaskStatusFlilter

//   private onmessage(data: any) {
//     if (data.operate === 'task.cron') {
//       this.getList()
//     }
//   }

// }
</script>
