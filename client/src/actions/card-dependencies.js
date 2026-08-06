/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const createCardDependency = (cardId, dependencyCardId) => ({
  type: ActionTypes.CARD_DEPENDENCY_CREATE,
  payload: {
    cardId,
    dependencyCardId,
  },
});

createCardDependency.success = (cardDependency) => ({
  type: ActionTypes.CARD_DEPENDENCY_CREATE__SUCCESS,
  payload: {
    cardDependency,
  },
});

createCardDependency.failure = (error) => ({
  type: ActionTypes.CARD_DEPENDENCY_CREATE__FAILURE,
  payload: {
    error,
  },
});

const handleCardDependencyCreate = (cardDependency) => ({
  type: ActionTypes.CARD_DEPENDENCY_CREATE_HANDLE,
  payload: {
    cardDependency,
  },
});

const deleteCardDependency = (cardId, dependencyCardId) => ({
  type: ActionTypes.CARD_DEPENDENCY_DELETE,
  payload: {
    cardId,
    dependencyCardId,
  },
});

deleteCardDependency.success = (cardDependency) => ({
  type: ActionTypes.CARD_DEPENDENCY_DELETE__SUCCESS,
  payload: {
    cardDependency,
  },
});

deleteCardDependency.failure = (error) => ({
  type: ActionTypes.CARD_DEPENDENCY_DELETE__FAILURE,
  payload: {
    error,
  },
});

const handleCardDependencyDelete = (cardDependency) => ({
  type: ActionTypes.CARD_DEPENDENCY_DELETE_HANDLE,
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
