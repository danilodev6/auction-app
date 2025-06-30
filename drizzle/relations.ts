import { relations } from "drizzle-orm/relations";
import { aaUser, aaAccount, aaItems, aaBids, aaSession } from "./schema";

export const aaAccountRelations = relations(aaAccount, ({one}) => ({
	aaUser: one(aaUser, {
		fields: [aaAccount.userId],
		references: [aaUser.id]
	}),
}));

export const aaUserRelations = relations(aaUser, ({many}) => ({
	aaAccounts: many(aaAccount),
	aaItems_soldTo: many(aaItems, {
		relationName: "aaItems_soldTo_aaUser_id"
	}),
	aaItems_userId: many(aaItems, {
		relationName: "aaItems_userId_aaUser_id"
	}),
	aaBids: many(aaBids),
	aaSessions: many(aaSession),
}));

export const aaItemsRelations = relations(aaItems, ({one, many}) => ({
	aaUser_soldTo: one(aaUser, {
		fields: [aaItems.soldTo],
		references: [aaUser.id],
		relationName: "aaItems_soldTo_aaUser_id"
	}),
	aaUser_userId: one(aaUser, {
		fields: [aaItems.userId],
		references: [aaUser.id],
		relationName: "aaItems_userId_aaUser_id"
	}),
	aaBids: many(aaBids),
}));

export const aaBidsRelations = relations(aaBids, ({one}) => ({
	aaItem: one(aaItems, {
		fields: [aaBids.itemId],
		references: [aaItems.id]
	}),
	aaUser: one(aaUser, {
		fields: [aaBids.userId],
		references: [aaUser.id]
	}),
}));

export const aaSessionRelations = relations(aaSession, ({one}) => ({
	aaUser: one(aaUser, {
		fields: [aaSession.userId],
		references: [aaUser.id]
	}),
}));