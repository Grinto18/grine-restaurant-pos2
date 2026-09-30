CREATE TABLE "pos_snapshots" (
	"scope" text PRIMARY KEY,
	"payload" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
