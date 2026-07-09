CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "legal_document_versions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "document_code" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "published_at" TIMESTAMPTZ NOT NULL,
  "url" TEXT NOT NULL,
  "content_text" TEXT NOT NULL,
  "content_sha256" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "legal_document_versions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "legal_document_versions_document_code_version_content_sha256_key"
  ON "legal_document_versions"("document_code", "version", "content_sha256");

CREATE INDEX "legal_document_versions_document_code_is_active_idx"
  ON "legal_document_versions"("document_code", "is_active");

CREATE TABLE "consent_events" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" INTEGER NULL,
  "anonymous_id" TEXT NULL,
  "stage" TEXT NOT NULL,
  "consent_type" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "document_version_id" UUID NULL,
  "document_code" TEXT NULL,
  "document_version" TEXT NULL,
  "document_sha256" TEXT NULL,
  "document_url" TEXT NULL,
  "booking_kind" TEXT NULL,
  "service_id" TEXT NULL,
  "appointment_id" INTEGER NULL,
  "cookie_choice" TEXT NULL,
  "cookies_necessary" BOOLEAN NULL,
  "cookies_analytics" BOOLEAN NULL,
  "cookies_marketing" BOOLEAN NULL,
  "checkbox_label" TEXT NULL,
  "button_label" TEXT NULL,
  "page_url" TEXT NOT NULL,
  "referrer" TEXT NULL,
  "ip_address_hash" TEXT NULL,
  "user_agent" TEXT NULL,
  "accept_language" TEXT NULL,
  "timezone" TEXT NULL,
  "session_id_hash" TEXT NULL,
  "request_id" TEXT NULL,
  "event_payload" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "occurred_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "previous_event_hash" TEXT NULL,
  "event_hash" TEXT NOT NULL,
  "server_signature" TEXT NOT NULL,
  "signature_algorithm" TEXT NOT NULL DEFAULT 'HMAC-SHA256',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "consent_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "consent_events_event_hash_key" ON "consent_events"("event_hash");
CREATE INDEX "consent_events_user_id_occurred_at_idx" ON "consent_events"("user_id", "occurred_at");
CREATE INDEX "consent_events_anonymous_id_occurred_at_idx" ON "consent_events"("anonymous_id", "occurred_at");
CREATE INDEX "consent_events_stage_occurred_at_idx" ON "consent_events"("stage", "occurred_at");
CREATE INDEX "consent_events_consent_type_occurred_at_idx" ON "consent_events"("consent_type", "occurred_at");
CREATE INDEX "consent_events_appointment_id_idx" ON "consent_events"("appointment_id");

ALTER TABLE "consent_events"
  ADD CONSTRAINT "consent_events_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "consent_events"
  ADD CONSTRAINT "consent_events_document_version_id_fkey"
  FOREIGN KEY ("document_version_id") REFERENCES "legal_document_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "consent_events"
  ADD CONSTRAINT "consent_events_appointment_id_fkey"
  FOREIGN KEY ("appointment_id") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE OR REPLACE FUNCTION prevent_consent_event_changes()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'consent_events is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "consent_events_no_update"
  BEFORE UPDATE ON "consent_events"
  FOR EACH ROW EXECUTE FUNCTION prevent_consent_event_changes();

CREATE TRIGGER "consent_events_no_delete"
  BEFORE DELETE ON "consent_events"
  FOR EACH ROW EXECUTE FUNCTION prevent_consent_event_changes();

CREATE OR REPLACE FUNCTION prevent_legal_document_version_content_changes()
RETURNS trigger AS $$
BEGIN
  IF OLD."document_code" IS DISTINCT FROM NEW."document_code"
    OR OLD."title" IS DISTINCT FROM NEW."title"
    OR OLD."version" IS DISTINCT FROM NEW."version"
    OR OLD."published_at" IS DISTINCT FROM NEW."published_at"
    OR OLD."url" IS DISTINCT FROM NEW."url"
    OR OLD."content_text" IS DISTINCT FROM NEW."content_text"
    OR OLD."content_sha256" IS DISTINCT FROM NEW."content_sha256"
  THEN
    RAISE EXCEPTION 'legal document version content is immutable';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "legal_document_versions_no_content_update"
  BEFORE UPDATE ON "legal_document_versions"
  FOR EACH ROW EXECUTE FUNCTION prevent_legal_document_version_content_changes();
