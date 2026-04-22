<template>
  <div>
    <el-card>
      <div class="title">作业列表</div>
      <div class="text-right">
        <el-button type="text" icon="el-icon-view" @click="guideShow = !guideShow">
          流程指引
        </el-button>
      </div>
      <div class="guide" v-show="guideShow">
        <div>使用指引</div>
        <div class="icon-top">
          <img v-for="(item, index) in images" :key="index" :src="item" alt />
        </div>
        <el-steps :active="4" align-center>
          <el-step title="新建作业模板">
            <div class="description" slot="description">
              通过
               <router-link :to="{ name: 'TaskTpl' }" class="detail-href">作业模板</router-link> 可以新增运维和软件安装作业，您可以使用内置模板或者
               <router-link :to="{ name: 'TaskTplCreate' }" class="detail-href">新建自定义模板</router-link>
            </div>
          </el-step>
          <el-step title="新建作业">
            <div class="description" slot="description">
              您可以使用
              <router-link :to="{ name: 'TaskTpl' }" class="detail-href">作业模板</router-link> 进行常规作业的创建，
              也可以将常规作业转换为 <router-link :to="{ name: 'CronTask' }" class="detail-href">定时作业</router-link>
            </div>
          </el-step>
          <el-step title="执行作业">
            <div class="description" slot="description">
              完成作业编排后可通过
              常规作业 手动执行任务，通过
              <router-link class="detail-href" :to="{ name: 'CronTask' }">定时作业</router-link> 自动按计划执行任务
            </div>
          </el-step>
          <el-step title="查看执行结果">
            <div class="description" slot="description">
              申请执行作业后可在
              <router-link class="detail-href" :to="{ name: 'TaskHistory' }">执行历史</router-link> 查看已执行作业任务的结果和详情
            </div>
          </el-step>
        </el-steps>
      </div>
    </el-card>
    <AdvanceTable
      :data="list"
      :searchConfigs="searchConfigs"
      :params="params"
      :total="total"
      :columns="columns"
      :get-list="getList"
      :loading="loading"
    >
      <el-button slot="action" @click="handleCreate()" type="primary" icon="el-icon-plus">新增</el-button>
      <template #name="val, record">
        <router-link
          class="detail-href"
          :to="{ name: 'TaskInstancePreview', params: { id: record.id } }"
        >{{ record.name }}</router-link>
      </template>
      <template #status="status">
        <status-icon :type="taskStatusFilter(status, 'color')">{{ taskStatusFilter(status) }}</status-icon>
      </template>
      <template #sceneName="val, record">
        <el-tag>{{ record.sceneName }}</el-tag>
      </template>
      <template #operate="val, record">
        <el-button
          type="text"
          @click="handleCreate(record.id)"
          :disabled="record.status !== 'DEVELOPING'"
          icon="el-icon-edit"
        >编辑</el-button>
        <div class="action-divider"></div>
        <el-button
          type="text"
          @click="handleDelete(record)"
          :disabled="record.status !== 'DEVELOPING'"
          icon="el-icon-delete"
        >删除</el-button>
        <div class="action-divider"></div>
        <el-dropdown trigger="click">
          <span class="el-dropdown-link">
            更多
            <i class="el-icon-arrow-down" />
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              @click.native="handleExecute(record)"
              :disabled="record.status !== 'APPROVED'"
            >申请执行</el-dropdown-item>
            <el-dropdown-item
              @click.native="handleCron(record.id)"
              :disabled="record.status !== 'APPROVED'"
            >定时执行</el-dropdown-item>
            <el-dropdown-item
              @click.native="handleStatus(record)"
              v-if="record.status === 'DEVELOPING'"
            >发布</el-dropdown-item>
            <el-dropdown-item
              @click.native="handleStatus(record, 'recall')"
              v-if="record.status === 'APPROVED'"
            >下架</el-dropdown-item>
            <router-link
              :to="{ name: 'TaskInstanceHistory', params: { id: record.id }, query: { name: record.name } }"
            >
              <el-dropdown-item>执行历史</el-dropdown-item>
            </router-link>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </AdvanceTable>
    <el-dialog title="定时执行" :close-on-click-modal="false" :visible.sync="dialogVisible" width="50%">
      <el-form label-width="85px">
        <el-form-item label="处理方式：">
          <el-radio-group v-model="cronData.isNew">
            <el-radio :label="true">新建定时任务</el-radio>
            <el-radio :label="false">转换定时任务</el-radio>
          </el-radio-group>
        </el-form-item>
        <select-cron ref="selectCron" :data="cronData.cron"></select-cron>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click.native="cronTaskSubmit" :loading="loading">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import selectCron from './components/selectCron.vue'
import { getScene, getTask, removeTask, operateTask, exportTask } from 'services/task/task'
import { defineComponent, reactive, toRefs, ref } from '@vue/composition-api'
import { Message, MessageBox } from 'element-ui'
import { taskStatusFilter } from '@/filters/index'
import useTable from 'hooks/useTable'

const images = [require('@/assets/tpl_task.png'), require('@/assets/create_task.png'), require('@/assets/execute_task.png'), require('@/assets/result_task.png')];

const searchConfig: Base.ISearchConfig[] = [
  { label: '作业名称', value: 'name', type: 'Input' },
  { label: '创建', value: 'gmtCreate', type: 'DateRange' },
  { type: 'Const', value: 'code', initValue: 'standard' },
  { type: 'Select', value: 'sceneId', label: '作业场景', data: [] }
]
const columns = [
  { label: '作业名称', prop: 'name', scopedSlots: { customRender: 'name' } },
  { label: '状态', prop: 'status', scopedSlots: { customRender: 'status' } },
  { label: '作业场景', prop: 'sceneName', scopedSlots: { customRender: 'sceneName' } },
  { label: '编排模板', prop: 'templateName' },
  { label: '创建人', prop: 'creator' },
  { label: '最后修改人', prop: 'mender' },
  { label: '创建时间', prop: 'gmtCreate' },
  { label: '修改时间', prop: 'gmtModify' },
  {
    label: '操作',
    disabled: true,
    width: '220px',
    scopedSlots: { customRender: 'operate' }
  }
]
export default defineComponent({
  components: {
    selectCron
  },
  setup(props, context) {
    const guideShow = ref(true)
    const { list, total, params, loading, handleDelete, getList } = useTable<API.Task>({
      getService: getTask,
      removeService: removeTask
    })
    // 定时作业转换
    const cronData = ref({
      id: 0,
      isNew: true,
      cron: ''
    })
    const dialogVisible = ref(false)
    function handleCron(id: number) {
      cronData.value = {
        id: id,
        isNew: true,
        cron: ''
      }
      dialogVisible.value = true
    }
    // 定时任务转换
    async function cronTaskSubmit() {
      const cron = (context.refs.selectCron as any).cron
      const { id, isNew } = cronData.value
      loading.value = true
      const res = await operateTask(id, 'transfer', { cron, isNew })
      loading.value = false
      if (res.success) {
        dialogVisible.value = false
        Message({
          message: res.message,
          type: 'success'
        })
        getList()
      }
    }
    function handleCreate(id: string) {
      if (id) {
        context.root.$router.push({ name: 'TaskInstanceModify', params: { id } })
      } else context.root.$router.push({ name: 'TaskInstanceCreate' })
    }
    function handleExecute(record: any) {
      MessageBox.confirm(`您确定要执行【${record.name}】吗?`, '提示', {
        type: 'warning'
      }).then(async () => {
        const data = await operateTask(record.id, 'applyStart', {
          startMode: 'Auto'
        })
        if (data.success) {
          Message.success(data.message)
          getList()
        }
      })
    }
    function handleStatus(data: any, type: string = 'release') {
      const operateMap: any = {
        release: '发布',
        recall: '下架'
      }
      MessageBox.confirm(`您确定要${operateMap[type]}该作业【${data.name}】吗?`, '提示', {
        type: 'warning'
      }).then(() => {
        operateTask(data.id, type).then((data: any) => {
          if (data.success) {
            Message({
              message: data.message,
              type: 'success'
            })
            getList()
          }
        })
      })
    }
    // 导出任务
    function handleExport(id: number) {
      exportTask(id)
    }
    const searchConfigs = ref(searchConfig)
      ; (async function () {
      const res: Base.IResponseList = await getScene({
        page: 1,
        rows: 10000
      })
      if (res.data) {
        searchConfigs.value[3].data = res.data.rows
      }
    })()
    return {
      taskStatusFilter,
      loading,
      images,
      guideShow,
      list,
      total,
      params,
      columns,
      searchConfigs,
      getList,
      cronData,
      dialogVisible,
      handleCron,
      cronTaskSubmit,
      handleCreate,
      handleDelete,
      handleExecute,
      handleStatus
    }
  }
})
</script>
<style lang="scss" scoped>
.guide {
  .icon-top {
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-around;
    margin-bottom: 10px;
  }
  ::v-deep {
    .el-step__icon.is-text {
      background-color: $--color-primary;
    }
    .el-step__icon-inner {
      color: #fff;
    }
    .el-step.is-center .el-step__line {
      left: 60%;
      right: -40%;
    }
  }
  .description {
    margin-top: 10px;
    color: #000;
  }
}
</style>
