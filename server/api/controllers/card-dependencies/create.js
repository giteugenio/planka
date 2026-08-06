/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /cards/{cardId}/card-dependencies:
 *   post:
 *     summary: Add dependency to card
 *     description: Adds a dependency (blocking card) to a card. Requires board editor permissions.
 *     tags:
 *       - Card Dependencies
 *     operationId: createCardDependency
 *     parameters:
 *       - name: cardId
 *         in: path
 *         required: true
 *         description: ID of the card adding the dependency
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dependencyCardId
 *             properties:
 *               dependencyCardId:
 *                 type: string
 *                 description: ID of the card that blocks this card
 *     responses:
 *       200:
 *         description: Dependency added successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       422:
 *         $ref: '#/components/responses/UnprocessableEntity'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
  DEPENDENCY_CARD_NOT_FOUND: {
    dependencyCardNotFound: 'Dependency card not found',
  },
  DEPENDENCY_ALREADY_EXISTS: {
    dependencyAlreadyExists: 'Dependency already exists',
  },
  CIRCULAR_DEPENDENCY: {
    circularDependency: 'Circular dependency detected',
  },
  CANNOT_DEPEND_ON_SELF: {
    cannotDependOnSelf: 'A card cannot depend on itself',
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
    dependencyCardNotFound: {
      responseType: 'notFound',
    },
    dependencyAlreadyExists: {
      responseType: 'conflict',
    },
    circularDependency: {
      responseType: 'unprocessableEntity',
    },
    cannotDependOnSelf: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (inputs.cardId === inputs.dependencyCardId) {
      throw Errors.CANNOT_DEPEND_ON_SELF;
    }

    const { card, list, board, project } = await sails.helpers.cards
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

    const dependencyCard = await Card.qm.getOneById(inputs.dependencyCardId, {
      boardId: board.id,
    });

    if (!dependencyCard) {
      throw Errors.DEPENDENCY_CARD_NOT_FOUND;
    }

    // Check for circular dependency
    // Fetch all cards for this board to check reachability
    const boardLists = await List.qm.getByBoardId(board.id);
    const finiteLists = boardLists.filter((l) => sails.helpers.lists.isFinite(l));
    const listIds = sails.helpers.utils.mapRecords(finiteLists);
    const boardCards = await Card.qm.getByListIds(listIds);
    const boardCardIds = sails.helpers.utils.mapRecords(boardCards);
    const existingDependencies = await CardDependency.qm.getByCardIds(boardCardIds);

    // Map graph: cardId -> [dependencyCardId]
    const graph = {};
    existingDependencies.forEach((dep) => {
      if (!graph[dep.cardId]) {
        graph[dep.cardId] = [];
      }
      graph[dep.cardId].push(dep.dependencyCardId);
    });

    // Check if cardId is reachable from dependencyCardId (which would create a cycle: cardId -> dependencyCardId -> ... -> cardId)
    const visited = new Set();
    const queue = [String(inputs.dependencyCardId)];
    let hasCycle = false;

    while (queue.length > 0) {
      const current = queue.shift();
      if (current === String(inputs.cardId)) {
        hasCycle = true;
        break;
      }
      if (!visited.has(current)) {
        visited.add(current);
        const deps = graph[current] || [];
        deps.forEach((nextDep) => {
          if (!visited.has(String(nextDep))) {
            queue.push(String(nextDep));
          }
        });
      }
    }

    if (hasCycle) {
      throw Errors.CIRCULAR_DEPENDENCY;
    }

    const cardDependency = await sails.helpers.cardDependencies.createOne
      .with({
        project,
        board,
        values: {
          card,
          dependencyCard,
        },
        actorUser: currentUser,
        request: this.req,
      })
      .intercept('dependencyAlreadyExists', () => Errors.DEPENDENCY_ALREADY_EXISTS);

    return {
      item: cardDependency,
    };
  },
};
