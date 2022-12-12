import { useCallback, useEffect, useState } from 'react'
import { usePopupContext } from './popup-context'
import { IPopupProps } from './popup-types'

export interface IUsePopupResult<R> {
  readonly isAvailable: boolean
  close(): void
  waitFor(): Promise<R>
}

type PopupPromiseResolver<R> = (value: R | PromiseLike<R>) => void

type PopupPromiseExecutor<R> = (resolve: PopupPromiseResolver<R>) => void

const usePopup = <P, R>(props: IPopupProps<P, R>): IUsePopupResult<R> => {
  const { closePopup, createPopup } = usePopupContext()
  const [ id, setId ] = useState<string>()
  const [ waitFor, setWaitFor ] = useState<() => Promise<R>>()
  const [ isAvailable, setIsAvailable ] = useState(false)

  const close = () => {
    closePopup(id as string)
  }

  const executor: PopupPromiseExecutor<R> = useCallback((resolve: PopupPromiseResolver<R>) => {
    setId(createPopup({
      ...props,
      resolve: result => resolve(result as R)
    }))
  }, [ createPopup, props ])

  useEffect(() => {
    if (!id) {
      const promise = new Promise<R>(executor)
      setWaitFor(() => () => {
        setIsAvailable(false)
        return promise
      })
      setIsAvailable(true)
    }
  }, [ createPopup, executor, id, isAvailable, props ])

  return {
    close,
    isAvailable,
    waitFor: waitFor as () => Promise<R>
  }
}

export default usePopup
