/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* cardDependenciesWatchers() {
  yield all([
    takeEvery(
      EntryActionTypes.CARD_DEPENDENCY_CREATE,
      ({ payload: { cardId, dependencyCardId } }) =>
        services.createCardDependency(cardId, dependencyCardId),
    ),
    takeEvery(
      EntryActionTypes.CARD_DEPENDENCY_CREATE_HANDLE,
      ({ payload: { cardDependency } }) =>
        services.handleCardDependencyCreate(cardDependency),
    ),
    takeEvery(
      EntryActionTypes.CARD_DEPENDENCY_DELETE,
      ({ payload: { cardId, dependencyCardId } }) =>
        services.deleteCardDependency(cardId, dependencyCardId),
    ),
    takeEvery(
      EntryActionTypes.CARD_DEPENDENCY_DELETE_HANDLE,
      ({ payload: { cardDependency } }) =>
        services.handleCardDependencyDelete(cardDependency),
    ),
  ]);
}
