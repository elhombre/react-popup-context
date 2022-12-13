
export interface IPopupContentRendererProps<P, R> {
  readonly contentProps?: P
  readonly currentId?: string
  resolve(result?: R | PromiseLike<R>): void
}

export type PopupContentRenderer<P, R> = (props: IPopupContentRendererProps<P, R>) => JSX.Element

export type PopupType = 'Standard' | 'Detached' | 'Modal'

export interface IPopupNode {
  readonly id?: string
  readonly parent?: IPopupNode
  readonly popups: IPopupState[]
}

export interface IPopupState extends IPopupNode {
  readonly type: PopupType
  render(currentId?: string): JSX.Element
}

export interface IPopupProps<P, R> {
  readonly contentProps?: P
  readonly contentRenderer: PopupContentRenderer<P, R>
  readonly timeout?: number
  readonly type?: PopupType
}
