/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /cards/{cardId}/card-dependencies/dependencyCardId::{dependencyCardId}:
 *   delete:
 *     summary: Remove dependency from card
 *     description: Removes a dependency association from a card. Requires board editor permissions.
 *     tags:
 *       - Card Dependencies
 *     operationId: deleteCardDependency
 *     parameters:
 *       - name: cardId
 *         in: path
 *         required: true
 *         description: ID of the dependent card
 *         schema:
 *           type: string
 *       - name: dependencyCardId
 *         in: path
 *         required: true
 *         description: ID of the dependency card to remove
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dependency removed successfully
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
  CARD_DEPENDENCY_NOT_FOUND: {
    cardDependencyNotFound: 'Card dependency not found',
  },
};

module.exports = {
  inputs: {
    cardId: {
      ...idInput,
      required: true,
    },
    dependencyCardId: {
      ...idInput,
      required: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    cardNotFound: {
      responseType: 'notFound',
    },
    cardDependencyNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { card, board } = await sails.helpers.cards
      .getPathToProjectById(inputs.cardId)
      .intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      board.id,
      currentUser.id,
    );

    if (!boardMembership) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const cardDependency = await CardDependency.qm.getOneByCardIdAndDependencyCardId(
      card.id,
      inputs.dependencyCardId,
    );

    if (!cardDependency) {
      throw Errors.CARD_DEPENDENCY_NOT_FOUND;
    }

    const deletedCardDependency = await sails.helpers.cardDependencies.deleteOne.with({
      record: cardDependency,
      board,
      actorUser: currentUser,
      request: this.req,
    });

    if (!deletedCardDependency) {
      throw Errors.CARD_DEPENDENCY_NOT_FOUND;
    }

    return {
      item: deletedCardDependency,
    };
  },
};
