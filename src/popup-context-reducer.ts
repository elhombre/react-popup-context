import { Reducer } from 'react'
import { IPopupNode, IPopupState } from './popup-types'

interface IPopupContextState extends IPopupNode {
  readonly active?: IPopupState
}

type PopupContextActions =
  | { type: 'closePopup', id: string }
  | { type: 'createPopup', popupState: IPopupState, parentId?: string }

export const findById = ({ popups }: IPopupNode, id: string, index = popups.findIndex(p => p.id === id)): IPopupState | undefined => (
  index >= 0
    ? popups[index]
    : popups.reduce<IPopupState | undefined>((found, popup) => found || findById(popup, id), undefined)
)

const insertPopupNode = ({ id, popups, ...rest }: IPopupNode, state: IPopupState, parent?: IPopupState): IPopupNode => ({
  ...rest,
  id,
  popups: id === parent?.id
    ? [ ...popups, state ]
    : popups.reduce<IPopupState[]>((xs, popup) => [ ...xs, insertPopupNode(popup, state, parent) as IPopupState ], [])
})

const isAncestorOrSelf = (target?: IPopupNode, node?: IPopupNode): boolean => (
  (target && node) ? (node.id === target.id || isAncestorOrSelf(target, node.parent)) : false
)

const maybeActive = (popup?: IPopupState) => popup && popup.type !== 'Detached' ? popup : undefined

const removePopupNode = ({ popups, ...rest }: IPopupNode, id: string, index = popups.findIndex(p => p.id === id)): IPopupNode => ({
  ...rest,
  popups: index >= 0
    ? [ ...popups.slice(0, index), ...popups.slice(index + 1) ]
    : popups.reduce<IPopupState[]>((xs, popup) => [ ...xs, removePopupNode(popup, id) as IPopupState ], [])
})

// The active popup can be removed from a different location than the current one,
// so there must be a way to look for a new active one among all popups.
// If the popup was active, then its parent is also active, or absent
const findNextActive = (root: IPopupNode, prevActive?: IPopupState, popups = prevActive?.parent?.popups): IPopupState | undefined => prevActive
  ? popups?.reduceRight((active, popup) => active || maybeActive(popup)) || prevActive.parent as IPopupState
  : root.popups.reduceRight((active, popup) => active || maybeActive(popup) || findNextActive(popup))

export const popupContextReducer: Reducer<IPopupContextState, PopupContextActions> = (prevState, action): IPopupContextState => {
  const { active } = prevState
  switch (action.type) {
    case 'closePopup': {
      const { id } = action
      const popup = findById(prevState, id)
      return popup
        ? {
          ...removePopupNode(prevState, id),
          active: isAncestorOrSelf(popup, active) ? findNextActive(prevState, popup) : active
        }
        : prevState
    }

    case 'createPopup': {
      const { popupState } = action
      const isDetached = popupState.type === 'Detached'
      const popup = {
        ...popupState,
        parent: isDetached ? undefined : active
      }
      return {
        ...insertPopupNode(prevState, popup, active),
        active: isDetached ? active : popup
      }
    }
  }
}
