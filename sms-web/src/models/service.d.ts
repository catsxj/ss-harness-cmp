export interface IService {
  id?: number
  code?: string
  name?: string
  status?: string
  iconId?: number
  catalogId?: number
  checked?: boolean
  billable?: boolean
  billPolicy?: string
  basicPrice?: string
  vendorType?: string
  discount?: number
  templateId?: number | string
  templateName?: string
  icon?: string
  isPublic?: boolean
  flowList?: any
}
