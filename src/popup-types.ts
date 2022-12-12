
export interface IPopupContentRendererProps<P, R> {
  readonly contentProps?: P
  readonly currentId?: string
  resolve(result?: R | PromiseLike<R>): void
}

export type PopupContentRenderer<P, R> = (props: IPopupContentRendererProps<P, R>) => JSX.Element

export interface IPopupContainer {
  readonly id?: string
  readonly parent?: IPopupContainer
  readonly popups: IPopupState[]
}

export interface IPopupState extends IPopupContainer {
  render(currentId?: string): JSX.Element
}

export interface IPopupProps<P, R> {
  readonly contentProps?: P
  readonly contentRenderer: PopupContentRenderer<P, R>
  readonly isDetached?: boolean
  readonly isModal?: boolean
  readonly timeout?: number
}
