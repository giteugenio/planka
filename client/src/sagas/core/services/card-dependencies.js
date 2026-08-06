/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put } from 'redux-saga/effects';

import request from '../request';
import actions from '../../../actions';
import api from '../../../api';

export function* createCardDependency(cardId, dependencyCardId) {
  let cardDependency;
  try {
    ({ item: cardDependency } = yield call(
      request,
      api.createCardDependency,
      cardId,
      { dependencyCardId },
    ));
  } catch (error) {
    yield put(actions.createCardDependency.failure(error));
    return;
  }

  yield put(actions.createCardDependency.success(cardDependency));
}

export function* handleCardDependencyCreate(cardDependency) {
  yield put(actions.handleCardDependencyCreate(cardDependency));
}

export function* deleteCardDependency(cardId, dependencyCardId) {
  let cardDependency;
  try {
    ({ item: cardDependency } = yield call(
      request,
      api.deleteCardDependency,
      cardId,
      dependencyCardId,
    ));
  } catch (error) {
    yield put(actions.deleteCardDependency.failure(error));
    return;
  }

  yield put(actions.deleteCardDependency.success(cardDependency));
}

export function* handleCardDependencyDelete(cardDependency) {
  yield put(actions.handleCardDependencyDelete(cardDependency));
}

export default {
  createCardDependency,
  handleCardDependencyCreate,
  deleteCardDependency,
  handleCardDependencyDelete,
};
