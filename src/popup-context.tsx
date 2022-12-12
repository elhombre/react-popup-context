import React, { createContext, FC, Fragment, PropsWithChildren, useCallback, useContext, useReducer } from 'react'
import { createPortal } from 'react-dom'
import { generateId } from './helpers'
import { popupContextReducer } from './popup-context-reducer'
import { IPopupContainer, IPopupProps, IPopupState } from './popup-types'

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
  close(): void
}

interface IPopupNodesProps extends IPopupContainer {
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

const createPopupRenderer = <P, R>({ close, contentProps, contentRenderer, resolve, timeout }: IPopupCreateRendererProps<P, R>) => {
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
    document.querySelector('#modal') as Element
  )
}

const PopupContextProvider: FC<IPopupContextProviderProps> = ({ children }) => {
  const [ state, dispatch ] = useReducer(popupContextReducer, { popups: [] })
  const { popups } = state

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
          close: () => closePopup(id)
        })
      }
    })
    return id
  }

  return (
    <PopupContext.Provider value={{
      closePopup,
      createPopup
    }}>
      <PopupNodes popups={popups} />
      {children}
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
