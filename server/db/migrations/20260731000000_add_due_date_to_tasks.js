exports.up = function (knex) {
  return knex.schema.alterTable('task', (table) => {
    table.timestamp('due_date');
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('task', (table) => {
    table.dropColumn('due_date');
  });
};
