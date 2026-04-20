/**
 * Created by HaijunZhang on 2019/2/20.
 */
export default {
  start: {
    pre: [],
    post: ['fork', 'auditTask'],
    postLimit: 1
  },
  end: {
    pre: ['join', 'auditTask'],
    post: []
  },
  fork: {
    pre: ['start', 'auditTask'],
    preLimit: 1,
    post: ['auditTask']
  },
  join: {
    pre: ['auditTask'],
    post: ['auditTask', 'end'],
    postLimit: 1
  },
  auditTask: {
    pre: ['auditTask', 'start', 'fork', 'join'],
    preLimit: 1,
    post: ['auditTask', 'end', 'fork', 'join'],
    postLimit: 2
  }
}
