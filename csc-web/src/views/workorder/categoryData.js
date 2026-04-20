/**
 * Created by Zhang Haijun on 2018/8/2.
 */
export default [
  {
    code: 'Resource',
    name: '单一资源',
    children: [
      {
        code: 'Computer',
        name: '云主机'
      },
      {
        code: 'Image',
        name: '镜像'
      },
      {
        code: 'Storage',
        name: '云硬盘'
      },
      {
        code: 'Router',
        name: '云路由'
      },
      {
        code: 'FloatingIp',
        name: '公网IP'
      },
      {
        code: 'Snapshot',
        name: '云快照'
      },
      {
        code: 'Lpar',
        name: '分区'
      },
      {
        code: 'F5',
        name: '负载均衡',
        children: [
          {
            code: 'ResourceF5Apply',
            name: 'F5申请'
          },
          {
            code: 'F5ExpansionApply',
            name: 'F5扩容'
          }
        ]
      }
    ]
  },
  {
    name: '混合资源',
    code: 'Ros'
  },
  {
    code: 'ResourceOperate',
    name: '资源操作',
    children: [
      {
        code: 'ExpansionSpecApply',
        name: '云主机规格变更'
      },
      {
        code: 'ExpansionDiskApply',
        name: '云主机磁盘扩容'
      }
    ]
  },
  {
    name: '运维作业',
    code: 'Task'
  },
  {
    name: '软件安装',
    code: 'Software',
    children: [
      {
        code: 'Tomcat',
        name: 'Tomcat'
      },
      {
        code: 'Redis',
        name: 'Redis'
      },
      {
        code: 'ZooKeeper',
        name: 'ZooKeeper'
      },
      {
        code: 'MySQL',
        name: 'MySQL'
      },
      {
        code: 'Nginx',
        name: 'Nginx'
      },
      {
        code: 'WebLogic',
        name: 'WebLogic'
      },
      {
        code: 'RabbitMQ',
        name: 'RabbitMQ'
      },
      {
        code: 'JDK',
        name: 'JDK'
      },
      {
        code: 'NFS',
        name: 'NFS'
      },
      {
        code: 'Oracle',
        name: 'Oracle'
      },
      {
        code: 'Apache',
        name: 'Apache'
      },
      {
        code: 'MongoDB',
        name: 'MongoDB'
      },
      {
        code: 'Etcd',
        name: 'Etcd'
      },
      {
        code: 'Kafka',
        name: 'Kafka'
      },
      {
        code: 'ActiveMQ',
        name: 'ActiveMQ'
      },
      {
        code: 'Was',
        name: 'Was'
      }
    ]
  }
]
