/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const defaultFind = (criteria) => CardDependency.find(criteria).sort('id');

/* Query methods */

const create = (arrayOfValues) => CardDependency.createEach(arrayOfValues).fetch();

const createOne = (values) => CardDependency.create({ ...values }).fetch();

const getByIds = (ids) => defaultFind(ids);

const getByCardId = (cardId) =>
  defaultFind({
    cardId,
  });

const getByCardIds = (cardIds) =>
  defaultFind({
    or: [{ cardId: cardIds }, { dependencyCardId: cardIds }],
  });

const getOneByCardIdAndDependencyCardId = (cardId, dependencyCardId) =>
  CardDependency.findOne({
    cardId,
    dependencyCardId,
  });

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => CardDependency.destroy(criteria).fetch();

const deleteOne = (criteria) => CardDependency.destroyOne(criteria);

module.exports = {
  create,
  createOne,
  getByIds,
  getByCardId,
  getByCardIds,
  getOneByCardIdAndDependencyCardId,
  deleteOne,
  delete: delete_,
};
