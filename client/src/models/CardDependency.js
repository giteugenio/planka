/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';
import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'CardDependency';

  static fields = {
    id: attr(),
    cardId: fk({
      to: 'Card',
      as: 'card',
      relatedName: 'cardDependencies',
    }),
    dependencyCardId: fk({
      to: 'Card',
      as: 'dependencyCard',
      relatedName: 'cardDependents',
    }),
  };

  static reducer({ type, payload }, CardDependency) {
    switch (type) {
      case ActionTypes.LOCATION_CHANGE_HANDLE:
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
      case ActionTypes.BOARD_FETCH__SUCCESS:
        if (payload.cardDependencies) {
          payload.cardDependencies.forEach((cardDependency) => {
            CardDependency.upsert(cardDependency);
          });
        }
        break;
      case ActionTypes.CARD_DEPENDENCY_CREATE_HANDLE:
      case ActionTypes.CARD_DEPENDENCY_CREATE__SUCCESS:
        if (payload.cardDependency) {
          CardDependency.upsert(payload.cardDependency);
        }
        break;
      case ActionTypes.CARD_DEPENDENCY_DELETE_HANDLE:
      case ActionTypes.CARD_DEPENDENCY_DELETE__SUCCESS:
        if (payload.cardDependency) {
          try {
            const model = CardDependency.withId(payload.cardDependency.id);
            if (model) {
              model.delete();
            }
          } catch {
            /* empty */
          }
        }
        break;
      default:
    }
  }
}
