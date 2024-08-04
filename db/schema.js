"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionsRelations = exports.sessions = exports.roomsRelations = exports.rooms = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const pg_core_2 = require("drizzle-orm/pg-core");
exports.rooms = (0, pg_core_2.pgTable)('rooms', {
    id: (0, pg_core_2.serial)('id').primaryKey(),
    roomId: (0, pg_core_2.text)('room_id').notNull().unique(),
    started: (0, pg_core_1.boolean)('in_progress').notNull().default(false),
    private: (0, pg_core_1.boolean)('private').notNull().default(false)
});
exports.roomsRelations = (0, drizzle_orm_1.relations)(exports.rooms, ({ many }) => ({
    sessions: many(exports.sessions)
}));
exports.sessions = (0, pg_core_2.pgTable)('sessions', {
    id: (0, pg_core_2.serial)('id').primaryKey(),
    socketId: (0, pg_core_2.text)('socket_id').notNull().unique(),
    roomId: (0, pg_core_2.text)('room_id')
});
exports.sessionsRelations = (0, drizzle_orm_1.relations)(exports.sessions, ({ one }) => ({
    author: one(exports.rooms, {
        fields: [exports.sessions.roomId],
        references: [exports.rooms.roomId]
    })
}));
