/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    board: {
      type: 'ref',
      required: true,
    },
    actorUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {},

  async fn(inputs) {
    const cardDependency = await CardDependency.qm.deleteOne(inputs.record.id);

    if (cardDependency) {
      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'cardDependencyDelete',
        {
          item: cardDependency,
        },
        inputs.request,
      );
    }

    return cardDependency;
  },
};
