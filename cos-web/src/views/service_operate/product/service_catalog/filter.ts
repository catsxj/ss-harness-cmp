export enum BillPolicy {
  agility = '灵活计费',
  spec = '规格计费'
}
export function billPolicyFilter(val: string) {
  const map: any = {
    agility: '灵活计费',
    spec: '规格计费'
  }
  return map[val]
}
