// Vue 3 JSX 兜底声明（项目几乎不用 TSX，仅保留宽松定义）
declare global {
  namespace JSX {
    interface Element {}
    interface ElementClass {}
    interface IntrinsicElements {
      [elem: string]: any
    }
  }
}

export {}
