import { index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const playlist = pgTable(
  "playlist",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    shareToken: text("share_token").unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("playlist_owner_updated_idx").on(table.ownerId, table.updatedAt)],
);

export const track = pgTable(
  "track",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    playlistId: uuid("playlist_id")
      .notNull()
      .references(() => playlist.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    artist: text("artist").notNull(),
    title: text("title").notNull(),
    url: text("url"),
    note: text("note"),
  },
  (table) => [index("track_playlist_position_idx").on(table.playlistId, table.position)],
);
