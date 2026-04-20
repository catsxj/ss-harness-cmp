/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'

type IOrderCondition = 'orderCategoryOverview'

export function getOrderStatus(condition: IOrderCondition) {
  return request.get('/cos/v1/orders/condition', {
    params: {
      condition: JSON.stringify({ condition })
    }
  })
}
