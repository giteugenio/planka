/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * CardDependency.js
 *
 * @description :: Model definition for card dependencies (many-to-many join model).
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CardDependency:
 *       type: object
 *       required:
 *         - id
 *         - cardId
 *         - dependencyCardId
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the card dependency association
 *           example: "1357158568008091264"
 *         cardId:
 *           type: string
 *           description: ID of the dependent card
 *           example: "1357158568008091265"
 *         dependencyCardId:
 *           type: string
 *           description: ID of the blocking dependency card
 *           example: "1357158568008091266"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the dependency was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the dependency was last updated
 */

module.exports = {
  attributes: {
    cardId: {
      model: 'Card',
      required: true,
      columnName: 'card_id',
    },
    dependencyCardId: {
      model: 'Card',
      required: true,
      columnName: 'dependency_card_id',
    },
  },

  tableName: 'card_dependency',
};
