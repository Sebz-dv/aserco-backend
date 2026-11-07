import { pool } from '../../config/database';

export type UserRecord = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  is_active: number;
  created_at: Date;
  updated_at: Date;
};

export async function findUserByEmail(email: string) {
  const [rows] = (await pool.query(
    'SELECT * FROM users WHERE email = ? LIMIT 1',
    [email],
  )) as [UserRecord[], unknown];

  return rows[0] ?? null;
}

export async function findUserById(id: number) {
  const [rows] = (await pool.query(
    'SELECT id, name, email, is_active, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
    [id],
  )) as [Array<{ id: number; name: string; email: string; is_active: number; created_at: Date; updated_at: Date }>, unknown];

  return rows[0] ?? null;
}

export async function createUser({ name, email, passwordHash }: { name: string; email: string; passwordHash: string }) {
  const [result] = (await pool.query(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
    [name, email, passwordHash],
  )) as [{ insertId: number }, unknown];

  return result.insertId;
}

export async function updateUserPassword(id: number, passwordHash: string) {
  await pool.query('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [passwordHash, id]);
}

export async function getUserRoles(id: number) {
  const [rows] = (await pool.query(
    `
      SELECT r.name
      FROM user_roles ur
      INNER JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = ?
      ORDER BY r.name ASC
    `,
    [id],
  )) as [Array<{ name: string }>, unknown];

  return rows.map((row) => row.name);
}

export async function getUserPublicProfile(id: number) {
  const [rows] = (await pool.query(
    'SELECT id, name, email, is_active, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
    [id],
  )) as [Array<{ id: number; name: string; email: string; is_active: number; created_at: Date; updated_at: Date }>, unknown];

  return rows[0] ?? null;
}
