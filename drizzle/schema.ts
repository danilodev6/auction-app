import { pgTable, serial, timestamp, text, unique, varchar, foreignKey, integer, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const aaNextlive = pgTable("aa_nextlive", {
	id: serial().primaryKey().notNull(),
	nextLive: timestamp("next_live", { mode: 'string' }),
});

export const aaVerificationToken = pgTable("aa_verificationToken", {
	identifier: text().notNull(),
	token: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
});

export const aaUser = pgTable("aa_user", {
	id: text().primaryKey().notNull(),
	name: text(),
	role: varchar({ length: 20 }).default('user').notNull(),
	email: text(),
	emailVerified: timestamp({ mode: 'string' }),
	image: text(),
	phone: text(),
}, (table) => [
	unique("aa_user_email_unique").on(table.email),
]);

export const aaAccount = pgTable("aa_account", {
	userId: text().notNull(),
	type: text().notNull(),
	provider: text().notNull(),
	providerAccountId: text().notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	expiresAt: integer("expires_at"),
	tokenType: text("token_type"),
	scope: text(),
	idToken: text("id_token"),
	sessionState: text("session_state"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [aaUser.id],
			name: "aa_account_userId_aa_user_id_fk"
		}).onDelete("cascade"),
]);

export const aaItems = pgTable("aa_items", {
	id: serial().primaryKey().notNull(),
	userId: text().notNull(),
	name: text().notNull(),
	description: text(),
	startingPrice: integer().default(0).notNull(),
	currentBid: integer().default(0).notNull(),
	auctionType: text().default('regular').notNull(),
	imageUrl: text(),
	bidInterval: integer().default(1000).notNull(),
	bidEndTime: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	isFeatured: boolean().default(false).notNull(),
	isAvailable: boolean().default(true).notNull(),
	status: text().default('active').notNull(),
	soldTo: text(),
	soldAt: timestamp({ withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.soldTo],
			foreignColumns: [aaUser.id],
			name: "aa_items_soldTo_aa_user_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [aaUser.id],
			name: "aa_items_userId_aa_user_id_fk"
		}).onDelete("cascade"),
]);

export const aaBids = pgTable("aa_bids", {
	id: serial().primaryKey().notNull(),
	amount: integer().notNull(),
	itemId: integer().notNull(),
	userId: text().notNull(),
	timestamp: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.itemId],
			foreignColumns: [aaItems.id],
			name: "aa_bids_itemId_aa_items_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [aaUser.id],
			name: "aa_bids_userId_aa_user_id_fk"
		}).onDelete("cascade"),
]);

export const aaSession = pgTable("aa_session", {
	sessionToken: text().primaryKey().notNull(),
	userId: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [aaUser.id],
			name: "aa_session_userId_aa_user_id_fk"
		}).onDelete("cascade"),
]);
