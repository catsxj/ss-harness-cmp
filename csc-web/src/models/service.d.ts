export interface IService {
  id?: number
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
  icon?: string
}
