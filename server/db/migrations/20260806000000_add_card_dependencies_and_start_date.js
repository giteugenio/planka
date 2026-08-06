/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  await knex.schema.createTable('card_dependency', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('card_id').notNullable();
    table.bigInteger('dependency_card_id').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.unique(['card_id', 'dependency_card_id']);
    table.index('dependency_card_id');
  });

  await knex.schema.alterTable('card', (table) => {
    table.timestamp('start_date', true);
  });
};

exports.down = async (knex) => {
  await knex.schema.alterTable('card', (table) => {
    table.dropColumn('start_date');
  });

  await knex.schema.dropTable('card_dependency');
};
