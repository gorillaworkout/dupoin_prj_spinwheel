import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({
  host: "127.0.0.1",
  port: 5432,
  user: "dupoin",
  password: "dupoin2026secure",
  database: "dupoin_hr",
});

async function seed() {
  const username = "dupoin";
  const password = "dupoin123";
  const hash = await bcrypt.hash(password, 10);

  await pool.query(
    `INSERT INTO spinwheel_users (username, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (username) DO UPDATE SET password_hash = $2`,
    [username, hash]
  );

  console.log(`✅ User "${username}" seeded/updated.`);
  await pool.end();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
