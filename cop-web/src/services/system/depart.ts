/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'
import { wrapperParams } from 'utils/index'
import { IDepart } from '@/models/depart'

const baseUrl = '/sms/v1/departments'

export function getDepart(params: any) {
  return request.get<IDepart[]>(baseUrl, {
    params
  })
}
