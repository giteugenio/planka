/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createSelector } from 'redux-orm';

import orm from '../orm';
import { selectPath } from './router';
import { selectCurrentUserId } from './users';
import { isLocalId } from '../utils/local-id';
import { BoardContexts, ListTypes, DoingListNames, WIP } from '../constants/Enums';

export const makeSelectListById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ List }, id) => {
      const listModel = List.withId(id);

      if (!listModel) {
        return listModel;
      }

      return {
        ...listModel.ref,
        isPersisted: !isLocalId(id),
      };
    },
  );

export const selectListById = makeSelectListById();

export const makeSelectCardIdsByListId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ List }, id) => {
      const listModel = List.withId(id);

      if (!listModel) {
        return listModel;
      }

      return listModel.getCardsModelArray().map((cardModel) => cardModel.id);
    },
  );

export const selectCardIdsByListId = makeSelectCardIdsByListId();

export const makeSelectFilteredCardIdsByListId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ List }, id) => {
      const listModel = List.withId(id);

      if (!listModel) {
        return listModel;
      }

      return listModel.getFilteredCardsModelArray().map((cardModel) => cardModel.id);
    },
  );

export const selectFilteredCardIdsByListId = makeSelectFilteredCardIdsByListId();

export const selectIsListWithIdAvailableForCurrentUser = createSelector(
  orm,
  (_, id) => id,
  (state) => selectCurrentUserId(state),
  ({ List, User }, id, currentUserId) => {
    const listModel = List.withId(id);

    if (!listModel) {
      return false;
    }

    const currentUserModel = User.withId(currentUserId);
    return listModel.isAvailableForUser(currentUserModel);
  },
);

export const selectCurrentListId = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    if (boardModel.context === BoardContexts.BOARD) {
      return null;
    }

    const listModel = boardModel.lists
      .filter({
        type: boardModel.context || ListTypes.ACTIVE, // TODO: hack?
      })
      .first();

    return listModel && listModel.id;
  },
);

export const selectCurrentList = createSelector(
  orm,
  (state) => selectCurrentListId(state),
  ({ List }, id) => {
    if (!id) {
      return id;
    }

    const listModel = List.withId(id);

    if (!listModel) {
      return listModel;
    }

    return listModel.ref;
  },
);

export const selectFirstKanbanListId = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    const listModel = boardModel.getKanbanListsQuerySet().first();
    return listModel && listModel.id;
  },
);

export const selectFilteredCardIdsForCurrentList = createSelector(
  orm,
  (state) => selectCurrentListId(state),
  ({ List }, id) => {
    if (!id) {
      return id;
    }

    const listModel = List.withId(id);

    if (!listModel) {
      return listModel;
    }

    return listModel.getFilteredCardsModelArray().map((cardModel) => cardModel.id);
  },
);

export const makeSelectIsListExceededWipByListId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ List }, id) => {
      const listModel = List.withId(id);

      if (!listModel || !listModel.name) {
        return false;
      }

      const listName = listModel.name.trim().toLowerCase();
      const isDoingList = DoingListNames.DOING.some(
        (doingName) => doingName.toLowerCase() === listName,
      );

      if (!isDoingList) {
        return false;
      }

      const cards = listModel.getCardsModelArray();
      const userCardCounts = {};

      for (const cardModel of cards) {
        const users = cardModel.users.toRefArray();
        for (const user of users) {
          userCardCounts[user.id] = (userCardCounts[user.id] || 0) + 1;
          if (userCardCounts[user.id] > WIP) {
            return true;
          }
        }
      }

      return false;
    },
  );

export const selectIsListExceededWipByListId = makeSelectIsListExceededWipByListId();

export default {
  makeSelectListById,
  selectListById,
  makeSelectCardIdsByListId,
  selectCardIdsByListId,
  makeSelectFilteredCardIdsByListId,
  selectFilteredCardIdsByListId,
  selectIsListWithIdAvailableForCurrentUser,
  selectCurrentListId,
  selectCurrentList,
  selectFirstKanbanListId,
  selectFilteredCardIdsForCurrentList,
  makeSelectIsListExceededWipByListId,
  selectIsListExceededWipByListId,
};
