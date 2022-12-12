import { useCallback, useEffect, useRef, useState } from 'react'
import { usePopupContext } from './popup-context'
import { IPopupProps } from './popup-types'

export interface IUsePopupResult<R> {
  readonly isAvailable: boolean
  close(): void
  waitFor(): Promise<R>
}

type PopupPromiseResolver<R> = (value: R | PromiseLike<R>) => void

type PopupPromiseExecutor<R> = (resolve: PopupPromiseResolver<R>) => void

type UsePopupStage = 'Unassigned' | 'Available' | 'Used'

const usePopup = <P, R>(props: IPopupProps<P, R>): IUsePopupResult<R> => {
  const { closePopup, createPopup } = usePopupContext()
  const [ id, setId ] = useState<string>()
  const [ waitFor, setWaitFor ] = useState<() => Promise<R>>()
  const stageRef = useRef<UsePopupStage>('Unassigned')

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
    if (stageRef.current === 'Unassigned') {
      const promise = new Promise<R>(executor)
      setWaitFor(() => () => {
        stageRef.current = 'Used'
        return promise
      })
      stageRef.current = 'Available'
    }
  }, [ createPopup, executor, id, props ])

  return {
    close,
    isAvailable: stageRef.current === 'Available',
    waitFor: waitFor as () => Promise<R>
  }
}

export default usePopup
