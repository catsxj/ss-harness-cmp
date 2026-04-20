type IState = {
  name: string
  onmessage: any
}
function emptyAction(state: any, fireImmediately?: boolean) {}
class Actions {
  actions = {
    name: '',
    onGlobalStateChange: emptyAction,
    setGlobalState: emptyAction
  }

  init(props: any, callback: any) {
    this.actions = props
    this.onGlobalStateChange(callback)
  }

  onGlobalStateChange(callback: any, fireImmediately: boolean = true) {
    return this.actions.onGlobalStateChange(callback, fireImmediately)
  }

  setGlobalState(state: IState) {
    this.actions.setGlobalState({
      ...state,
      name: this.actions.name
    })
  }
}
const actions = new Actions()
export default actions
