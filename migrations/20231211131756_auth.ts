import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .createTable('users', function (table) {
            table.uuid('id').primary();
            table.string('username', 255).notNullable();
            table.string('password', 255).notNullable();
            table.integer('hit_request').notNullable();
            table.integer('access_token').notNullable();
            table.string('package', 255).notNullable();
        })
}


export async function down(knex: Knex): Promise<void> {
}

