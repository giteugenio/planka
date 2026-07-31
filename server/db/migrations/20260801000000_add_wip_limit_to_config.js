/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) =>
  knex.schema.alterTable('config', (table) => {
    /* Columns */

    table.integer('wip_limit');
  });

exports.down = (knex) =>
  knex.schema.alterTable('config', (table) => {
    table.dropColumn('wip_limit');
  });
