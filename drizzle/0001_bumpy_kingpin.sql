CREATE TABLE "aa_nextlive" (
	"id" serial PRIMARY KEY NOT NULL,
	"next_live" timestamp
);
--> statement-breakpoint
ALTER TABLE "aa_items" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "aa_items" ADD COLUMN "auctionType" text DEFAULT 'regular' NOT NULL;--> statement-breakpoint
ALTER TABLE "aa_items" ADD COLUMN "bidEndTime" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "aa_items" ADD COLUMN "isFeatured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "aa_items" ADD COLUMN "status" text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "aa_items" ADD COLUMN "soldTo" text;--> statement-breakpoint
ALTER TABLE "aa_items" ADD COLUMN "soldAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "aa_user" ADD COLUMN "role" varchar(20) DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "aa_user" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "aa_items" ADD CONSTRAINT "aa_items_soldTo_aa_user_id_fk" FOREIGN KEY ("soldTo") REFERENCES "public"."aa_user"("id") ON DELETE no action ON UPDATE no action;