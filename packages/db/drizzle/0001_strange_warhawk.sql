ALTER TABLE "wallets" ADD COLUMN "pix_key" text;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_pix_key_unique" UNIQUE("pix_key");