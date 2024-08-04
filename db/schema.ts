import { relations } from 'drizzle-orm';
import { boolean } from 'drizzle-orm/pg-core';
import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const rooms = pgTable('rooms', {
  id: serial('id').primaryKey(),
  roomId: text('room_id').notNull().unique(),
  started: boolean('in_progress').notNull().default(false),
  private: boolean('private').notNull().default(false)
});

export const roomsRelations = relations(rooms, ({ many }) => ({
  sessions: many(sessions)
}));

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  socketId: text('socket_id').notNull().unique(),
  roomId: text('room_id')
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  author: one(rooms, {
    fields: [sessions.roomId],
    references: [rooms.roomId]
  })
}));
