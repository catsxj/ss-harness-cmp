import store from '@/store'
import { conditionProject } from 'services/system/project'
import { getUser } from 'services/system/user'
export const columns = [
  {
    type: 'selection'
  },
  {
    label: '编号',
    prop: 'instanceNo',
    scopedSlots: { customRender: 'instanceNo' }
  },
  {
    label: '类型',
    prop: 'applyCategory',
    scopedSlots: { customRender: 'applyCategory' }
  },
  {
    label: '标题',
    prop: 'name'
  },
  {
    label: store.getters.systemConfig.projectConfigLabel,
    prop: 'projectName'
  },
  {
    label: '发起人',
    prop: 'creatorName'
  },
  {
    label: '发起时间',
    prop: 'gmtCreate'
  },
  {
    label: '等待时长',
    prop: 'duration'
  },
  {
    label: '当前审批人',
    prop: 'currentAuditors'
  },
  {
    label: '状态',
    prop: 'instanceState',
    scopedSlots: { customRender: 'instanceState' }
  },
  {
    label: '操作',
    prop: 'id',
    width: '160px',
    disabled: true,
    scopedSlots: { customRender: 'operate' }
  }
]
export const searchConfigs = [
  { type: 'Input', label: '标题', value: 'name' },
  {
    type: 'Select',
    label: '发起人',
    value: 'creatorId',
    data: [],
    service: {
      api: getUser,
      params: {
        simple: true
      },
      attr: 'data.rows'
    }
  },
  {
    type: 'Select',
    label: store.getters.systemConfig.projectConfigLabel,
    value: 'projectId',
    data: [],
    service: {
      api: conditionProject,
      params: {
        condition: JSON.stringify({
          condition: 'listApplyProjects'
        })
      },
      attr: 'data'
    }
  }
  // {
  //   type: 'Select',
  //   label: '类型',
  //   value: 'applyCategory',
  //   data: applyTypeList
  // }
]
