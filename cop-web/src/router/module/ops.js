/**
 * Created by HaijunZhang on 2018/11/12.
 */
const ops = {
  TaskDashboard: () => import('views/dashboard/index.vue'),
  CronTask: () => import('views/cron/index.vue'),
  TaskHistory: () => import('views/history/index.vue'),
  TaskHistoryPreview: () => import('views/task/graph/executeDetail/index.vue'),
  TaskTpl: () => import('views/tpl/index.vue'),
  TaskManageList: () => import('views/task/list.vue'),
  CreateTask: () => import('views/task/graph/graph.vue'),
  TaskAccount: () => import('views/security/account.vue'),
  TaskCommand: () => import('views/security/command/index.vue'),
  ScriptRepository: () => import('views/repository/script.vue'),
  FileRepository: () => import('views/repository/file_repository.vue'),
  SoftwareRepository: () => import('views/repository/software_repository.vue'),
  componentsBank: () => import('views/repository/components.vue'),
  // 巡检管理
  InspectReport: () => import('views/inspect/report/index.vue'),
  InspectAlarm: () => import('views/inspect/alarm.vue'),
  InspectTemp: () => import('views/inspect/temp.vue'),
  InspectQuick: () => import('views/inspect/fastInspect.vue'),
  InspectNorm: () => import('views/inspect/normInspect.vue'),
  InspectTiming: () => import('views/inspect/timingInspect.vue'),
  InspectNormal: () => import('views/inspect/routineInspect.vue'),
  InspectHistory: () => import('views/inspect/history.vue'),
  InspectOverview: () => import('views/inspect/overview.vue'),
  // 合规检查
  ComplianceNormal: () => import('views/compliance/normal'),
  ComplianceTime: () => import('views/compliance/time'),
  ComplianceHistory: () => import('views/compliance/history'),
  ComplianceBaseline: () => import('views/compliance/baseline'),
  ComplianceTemplate: () => import('views/compliance/template'),
  // 配置对比
  AcrossCompare: () => import('views/compare/acrossCompare.vue'),
  HistoryCompare: () => import('views/compare/historyCompare.vue'),
  StandardCompare: () => import('views/compare/standardCompare.vue'),
  CompareResult: () => import('views/compare/viewCompare.vue'),
  CompareWhiteList: () => import('views/compare/whiteList.vue'),
  // 补丁管理
  PatchDeploy: () => import('views/patch/deploy'),
  PatchHistory: () => import('views/patch/history')
}
export default ops
