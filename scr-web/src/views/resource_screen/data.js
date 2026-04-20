export const overviewConfigs = [
  {
    title: '总体情况',
    icon: 'el-icon-tickets',
    type: 'COUNT',
    data: [
      {
        title: '物理机',
        className: 'lgreen',
        unit: '台',
        value: 0
      },
      {
        title: '云主机',
        className: 'green',
        unit: '台',
        value: 0
      },
      {
        title: '云主机在线',
        className: 'purple',
        unit: '台',
        value: 0
      }
    ]
  },
  {
    title: '平台情况',
    icon: 'el-icon-monitor',
    type: 'COUNT',
    data: [
      {
        title: '私有云',
        className: 'lgreen',
        unit: '个',
        value: 0
      }
      // {
      //   title: "公有云",
      //   className: "green",
      //   unit: "个",
      //   value: 0,
      // },
    ]
  }
  // {
  //   title: "私有云使用情况",
  //   icon: "el-icon-data-line",
  //   type: "PROGRESS",
  //   titleStyle: {
  //     fontSize: "14px",
  //   },
  //   data: [
  //     {
  //       title: "CPU总量/剩余量",
  //       unit: "核",
  //       color: "#3AE13A",
  //       used: 0,
  //       total: 0,
  //     },
  //     {
  //       title: "内存总量/剩余量",
  //       unit: "G",
  //       color: "#FFC400",
  //       used: 0,
  //       total: 0,
  //     },
  //     {
  //       title: "存储总量/剩余量",
  //       unit: "T",
  //       color: "#33A1FF",
  //       used: 0,
  //       total: 0,
  //     },
  //   ],
  // },
]
