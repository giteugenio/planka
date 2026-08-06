/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      required: true,
    },
    project: {
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

  exits: {
    dependencyAlreadyExists: {},
  },

  async fn(inputs) {
    const { values } = inputs;

    let cardDependency;
    try {
      cardDependency = await CardDependency.qm.createOne({
        cardId: values.card.id,
        dependencyCardId: values.dependencyCard.id,
      });
    } catch (error) {
      if (error.code === 'E_UNIQUE') {
        throw 'dependencyAlreadyExists';
      }

      throw error;
    }

    sails.sockets.broadcast(
      `board:${inputs.board.id}`,
      'cardDependencyCreate',
      {
        item: cardDependency,
      },
      inputs.request,
    );

    return cardDependency;
  },
};
