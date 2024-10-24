import { sql } from 'kysely';
import { db } from '@/lib/kysely';
import bcrypt from 'bcrypt';

async function seedUser() {
  const user = {
    id: 'f6829b1e-68cb-4a70-9e1a-fd4acb13e43d',
    name: 'User',
    email: 'user@gmail.com',
    password: '123456',
  };

  await db.schema.dropTable('users').ifExists().execute();
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`.execute(db);
  await db.schema
    .createTable('users')
    .addColumn('id', 'uuid', col => col.defaultTo(sql`gen_random_uuid()`).primaryKey())
    .addColumn('name', 'varchar', col => col.notNull())
    .addColumn('email', 'text', col => col.notNull().unique())
    .addColumn('password', 'text', col => col.notNull())
    .execute();

  const hashedPassword = await bcrypt.hash(user.password, 10);
  const insertedUser = db
    .insertInto('users')
    .values({
      id: user.id,
      name: user.name,
      email: user.email,
      password: hashedPassword,
    })
    .onConflict(oc => oc.column('id').doNothing())
    .executeTakeFirst();

  return insertedUser;
}

export async function GET() {
  try {
    await seedUser();

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
