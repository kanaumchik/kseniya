CREATE TABLE "analytics_events" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "event_type" TEXT NOT NULL,
  "event_name" TEXT NOT NULL,
  "element_id" TEXT NULL,
  "element_text" TEXT NULL,
  "element_group" TEXT NULL,
  "page_url" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "referrer" TEXT NULL,
  "user_id" INTEGER NULL,
  "anonymous_id" TEXT NULL,
  "session_id" TEXT NULL,
  "ip_address" TEXT NULL,
  "user_agent" TEXT NULL,
  "accept_language" TEXT NULL,
  "timezone" TEXT NULL,
  "consent_analytics" BOOLEAN NOT NULL DEFAULT false,
  "duration_ms" INTEGER NULL,
  "event_payload" JSONB NOT NULL DEFAULT '{}',
  "occurred_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "analytics_daily_aggregates" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "date_key" TEXT NOT NULL,
  "event_type" TEXT NOT NULL,
  "event_name" TEXT NOT NULL,
  "element_id" TEXT NULL,
  "element_text" TEXT NULL,
  "element_group" TEXT NULL,
  "path" TEXT NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "total_duration_ms" INTEGER NOT NULL DEFAULT 0,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "analytics_daily_aggregates_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "analytics_events_occurred_at_idx" ON "analytics_events"("occurred_at");
CREATE INDEX "analytics_events_event_type_occurred_at_idx" ON "analytics_events"("event_type", "occurred_at");
CREATE INDEX "analytics_events_event_name_occurred_at_idx" ON "analytics_events"("event_name", "occurred_at");
CREATE INDEX "analytics_events_element_id_occurred_at_idx" ON "analytics_events"("element_id", "occurred_at");
CREATE INDEX "analytics_events_user_id_occurred_at_idx" ON "analytics_events"("user_id", "occurred_at");
CREATE INDEX "analytics_events_path_occurred_at_idx" ON "analytics_events"("path", "occurred_at");

CREATE UNIQUE INDEX "analytics_daily_aggregates_date_key_event_type_event_name_path_element_id_key"
  ON "analytics_daily_aggregates"("date_key", "event_type", "event_name", "path", COALESCE("element_id", ''));
CREATE INDEX "analytics_daily_aggregates_date_key_idx" ON "analytics_daily_aggregates"("date_key");
CREATE INDEX "analytics_daily_aggregates_event_type_date_key_idx" ON "analytics_daily_aggregates"("event_type", "date_key");
CREATE INDEX "analytics_daily_aggregates_event_name_date_key_idx" ON "analytics_daily_aggregates"("event_name", "date_key");

ALTER TABLE "analytics_events"
  ADD CONSTRAINT "analytics_events_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
