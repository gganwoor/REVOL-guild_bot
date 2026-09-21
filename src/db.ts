import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import type { ClubType } from "./config.js";

mkdirSync("data", { recursive: true });

const db = new DatabaseSync("data/guild-bot.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS clubs (
    post_id     TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    type        TEXT NOT NULL,
    leader_id   TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'recruiting',
    role_id     TEXT,
    category_id TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS members (
    post_id   TEXT NOT NULL,
    user_id   TEXT NOT NULL,
    joined_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (post_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS handled_messages (
    message_id TEXT PRIMARY KEY,
    post_id    TEXT NOT NULL,
    user_id    TEXT NOT NULL,
    handled_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

export interface ClubRow{
    post_id: string;
    name: string;
    type: ClubType;
    leader_id: string;
    status: "recruiting" | "active";
    role_id: string | null;
    category_id: string | null;
}

export function upsertClub(club: {
    postId: string;
    name: string;
    type: ClubType;
    leaderId: string;
}): void {
    db.prepare(
        `INSERT INTO clubs (post_id, name, type, leader_id)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(post_id) DO UPDATE SET
          name = excluded.name,
          type = excluded.type,
          leader_id = excluded.leader_id`,
    ).run(club.postId, club.name, club.type, club.leaderId);
}

export function getClub(postId: string): ClubRow | null {
    const row = db.prepare("SELECT * FROM clubs WHERE post_id = ?").get(postId);

    return (row as ClubRow | undefined) ?? null;
}

export function addMember(postId: string, userId: string): void {
    db.prepare(
        "INSERT OR IGNORE INTO members (post_id, user_id) VALUES (?, ?)",
    ).run(postId, userId);
}

export function countMembers(postId: string): number {
    const row = db
        .prepare("SELECT COUNT(*) AS count FROM members WHERE post_id = ?")
        .get(postId) as { count: number };

    return row.count;
}

export function isHandled(messageId: string): boolean {
    const row = db
        .prepare("SELECT 1 FROM handled_messages WHERE message_id = ?")
        .get(messageId);

    return row !== undefined;
}

export function markHandled(messageId: string, postId: string, userId: string): void {
    db.prepare(
        `INSERT OR IGNORE INTO handled_messages (message_id, post_id, user_id) VALUES (?, ?, ?)`,
    ).run(messageId, postId, userId);
}

export function markOpened(postId: string, roleId: string, categoryId: string): void {
    db.prepare(
        `UPDATE clubs SET status = 'active', role_id = ?, category_id = ? WHERE post_id = ?`,
    ).run(roleId, categoryId, postId);
}

export function listMembers(postId: string): string[] {
    const rows = db
        .prepare("SELECT user_id FROM members WHERE post_id = ?")
        .all(postId) as { user_id: string }[];

    return rows.map((row) => row.user_id);
}