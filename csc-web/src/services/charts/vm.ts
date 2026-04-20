/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'

type IVmCondition = 'getStatusStatistics' | 'getNumberTrend'

export function getVmStatus(condition: IVmCondition) {
  return request.get('/ims/v1/vms/condition', {
    params: {
      condition: JSON.stringify({ condition })
    }
  })
}
