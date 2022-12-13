import { createContext, FC, Fragment, PropsWithChildren, useCallback, useContext, useReducer, useRef } from 'react'
import { createPortal } from 'react-dom'
import { generateId } from './helpers'
import { popupContextReducer } from './popup-context-reducer'
import { IPopupNode, IPopupProps, IPopupState } from './popup-types'

export type IPopupContextProviderProps = PropsWithChildren

interface IPopupContext {
  readonly activePopup?: IPopupState
  closePopup(id: string): void
  createPopup<P, R>(props: IPopupCreateProps<P, R>): string
}

interface IPopupCreateProps<P, R> extends IPopupProps<P, R> {
  resolve(result?: R | PromiseLike<R>): void
}

interface IPopupCreateRendererProps<P, R> extends IPopupCreateProps<P, R> {
  readonly element: Element
  close(): void
}

interface IPopupNodesProps extends IPopupNode {
  readonly currentId?: string
}

const PopupContext = createContext<IPopupContext>({} as IPopupContext)

const PopupNodes: FC<IPopupNodesProps> = ({ popups: childPopups, currentId }) => (
  <>
    {
      childPopups && childPopups.map(popup => (
        <Fragment key={popup.id}>
          {popup.render(currentId)}
          <PopupNodes
            popups={popup.popups}
            currentId={popup.id}
          />
        </Fragment>
      ))
    }
  </>
)

const createPopupRenderer = <P, R>({ close, contentProps, contentRenderer, element, resolve, timeout }: IPopupCreateRendererProps<P, R>) => {
  if (timeout) {
    setTimeout(() => {
      resolve()
      close()
    }, timeout)
  }

  return (currentId: string) => createPortal(
    contentRenderer({
      contentProps,
      currentId,
      resolve: result => {
        resolve(result)
        close()
      }
    }),
    element
  )
}

const PopupContextProvider: FC<IPopupContextProviderProps> = ({ children }) => {
  const [ state, dispatch ] = useReducer(popupContextReducer, { popups: [] })
  const { popups } = state

  console.log('==========')
  console.log(JSON.stringify(state, null, '  '))

  const ref = useRef<HTMLDivElement>(null)

  const closePopup = useCallback((id: string) => dispatch({
    id,
    type: 'closePopup'
  }), [])

  const createPopup = <P, R>(props: IPopupCreateProps<P, R>) => {
    const id = generateId()

    dispatch({
      type: 'createPopup',
      popupState: {
        popups: [],
        id,
        render: createPopupRenderer({
          ...props,
          close: () => closePopup(id),
          element: ref.current as Element
        }),
        type: props.type || 'Standard'
      }
    })
    return id
  }

  return (
    <PopupContext.Provider value={{
      closePopup,
      createPopup
    }}>
      <div ref={ref}/>
      {children}
      <PopupNodes popups={popups} />
    </PopupContext.Provider>
  )
}

export const usePopupContext = () => {
  const context = useContext(PopupContext)
  if (context) {
    return context
  }
  throw new Error('usePopupContext() should be used within PopupContextProvider')
}

export default PopupContextProvider
