import { Reducer } from 'react'
import { IPopupNode, IPopupState } from './popup-types'

interface IPopupContextState extends IPopupNode {
  readonly active?: IPopupState
}

type PopupContextActions =
  | { type: 'closePopup', id: string }
  | { type: 'createPopup', popupState: IPopupState, parentId?: string }

export const findById = (node: IPopupNode, id: string): IPopupState | undefined => {
  const { popups } = node
  const index = popups.findIndex(p => p.id === id)
  if (index >= 0) {
    return popups[index]
  }
  else {
    for (const popup of popups) {
      const result = findById(popup, id)
      if (result) {
        return result
      }
    }
    return undefined
  }
}

const insertPopupNode = (node: IPopupNode, state: IPopupState, parent?: IPopupState): IPopupNode => {
  const { popups } = node
  return {
    ...node,
    popups: node.id === parent?.id
      ? [ ...popups, state ]
      : popups.reduce<IPopupState[]>((xs, popup) => [ ...xs, insertPopupNode(popup, state, parent) as IPopupState ], [])
  }
}

const isAncestorOrSelf = (target?: IPopupNode, node?: IPopupNode): boolean => (
  (target && node) ? (node.id === target.id || isAncestorOrSelf(target, node.parent)) : false
)

const removePopupNode = (node: IPopupNode, id: string): IPopupNode => {
  const { popups } = node
  const index = popups.findIndex(p => p.id === id)
  return {
    ...node,
    popups: index >= 0
      ? [ ...popups.slice(0, index), ...popups.slice(index + 1) ]
      : popups.reduce<IPopupState[]>((xs, popup) => [ ...xs, removePopupNode(popup, id) as IPopupState ], [])
  }
}

export const popupContextReducer: Reducer<IPopupContextState, PopupContextActions> = (prevState, action): IPopupContextState => {
  const { active } = prevState
  switch (action.type) {
    case 'closePopup': {
      const { id } = action
      const popup = findById(prevState, id)
      if (popup) {
        const xs = popup.parent?.popups
        return {
          ...removePopupNode(prevState, id),
          active: isAncestorOrSelf(popup, active)
            ? (xs && xs.length ? xs[xs.length - 1] : popup.parent) as IPopupState
            : active
        }
      }
      else {
        return prevState
      }
    }

    case 'createPopup': {
      const { popupState } = action
      const popup = {
        ...popupState,
        parent: active
      }
      return {
        ...insertPopupNode(prevState, popup, active),
        active: popup,
      }
    }
  }
}
