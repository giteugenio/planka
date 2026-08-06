/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const createCardDependency = (cardId, dependencyCardId) => ({
  type: EntryActionTypes.CARD_DEPENDENCY_CREATE,
  payload: {
    cardId,
    dependencyCardId,
  },
});

const handleCardDependencyCreate = (cardDependency) => ({
  type: EntryActionTypes.CARD_DEPENDENCY_CREATE_HANDLE,
  payload: {
    cardDependency,
  },
});

const deleteCardDependency = (cardId, dependencyCardId) => ({
  type: EntryActionTypes.CARD_DEPENDENCY_DELETE,
  payload: {
    cardId,
    dependencyCardId,
  },
});

const handleCardDependencyDelete = (cardDependency) => ({
  type: EntryActionTypes.CARD_DEPENDENCY_DELETE_HANDLE,
  payload: {
    cardDependency,
  },
});

export default {
  createCardDependency,
  handleCardDependencyCreate,
  deleteCardDependency,
  handleCardDependencyDelete,
};
