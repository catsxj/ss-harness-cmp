/**
 * Created by HaijunZhang on 2019/1/26.
 */
import request from 'utils/request'
import { wrapperParams } from 'utils'
export function getPropertiesByCode(code) {
  return request.get('/ims/v1/properties', {
    params: wrapperParams({ code })
  })
}
