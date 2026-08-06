/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

/* Actions */

const createCardDependency = (cardId, data, headers) =>
  socket.post(`/cards/${cardId}/card-dependencies`, data, headers);

const deleteCardDependency = (cardId, dependencyCardId, headers) =>
  socket.delete(
    `/cards/${cardId}/card-dependencies/dependencyCardId:${dependencyCardId}`,
    undefined,
    headers,
  );

export default {
  createCardDependency,
  deleteCardDependency,
};
