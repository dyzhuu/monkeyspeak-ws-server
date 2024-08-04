import { eq } from 'drizzle-orm';
import { db } from './db';
import { rooms, sessions } from './db/schema';

export async function getOrCreateRoomById(roomId: string) {
  const room = await db
    .insert(rooms)
    .values({
      roomId,
      inProgress: false,
      private: false
    })
    .onConflictDoNothing();

  const players = await db
    .select()
    .from(sessions)
    .where(eq(sessions.roomId, roomId));

  return {
    ...room,
    players
  };
}

export async function addUserToRoom(roomId: string, socketId: string) {
  await db
    .insert(sessions)
    .values({
      roomId,
      socketId
    })
    .onConflictDoNothing();
}

export async function deleteUser(socketId: string) {
  await db.delete(sessions).where(eq(sessions.socketId, socketId));
}
