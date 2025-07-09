CREATE TABLE "aa_account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE "aa_bids" (
	"id" serial PRIMARY KEY NOT NULL,
	"amount" integer NOT NULL,
	"itemId" integer NOT NULL,
	"userId" text NOT NULL,
	"timestamp" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aa_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"startingPrice" integer DEFAULT 0 NOT NULL,
	"currentBid" integer DEFAULT 0 NOT NULL,
	"auctionType" text DEFAULT 'regular' NOT NULL,
	"imageURL" text,
	"bidInterval" integer DEFAULT 1000 NOT NULL,
	"bidEndTime" timestamp with time zone NOT NULL,
	"isFeatured" boolean DEFAULT false NOT NULL,
	"isAvailable" boolean DEFAULT true NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"soldTo" text,
	"soldAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "aa_session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aa_nextlive" (
	"id" serial PRIMARY KEY NOT NULL,
	"next_live" timestamp
);
--> statement-breakpoint
CREATE TABLE "aa_user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"role" varchar(20) DEFAULT 'user' NOT NULL,
	"email" text,
	"emailVerified" timestamp,
	"image" text,
	"phone" text,
	CONSTRAINT "aa_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "aa_verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "aa_account" ADD CONSTRAINT "aa_account_userId_aa_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."aa_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aa_bids" ADD CONSTRAINT "aa_bids_itemId_aa_items_id_fk" FOREIGN KEY ("itemId") REFERENCES "public"."aa_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aa_bids" ADD CONSTRAINT "aa_bids_userId_aa_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."aa_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aa_items" ADD CONSTRAINT "aa_items_userId_aa_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."aa_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aa_items" ADD CONSTRAINT "aa_items_soldTo_aa_user_id_fk" FOREIGN KEY ("soldTo") REFERENCES "public"."aa_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aa_session" ADD CONSTRAINT "aa_session_userId_aa_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."aa_user"("id") ON DELETE cascade ON UPDATE no action;