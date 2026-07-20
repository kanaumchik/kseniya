CREATE TABLE "payments" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "provider_payment_id" TEXT,
  "idempotence_key" UUID NOT NULL,
  "user_id" INTEGER NOT NULL,
  "booking_id" INTEGER,
  "starts_at" TIMESTAMPTZ(6) NOT NULL,
  "ends_at" TIMESTAMPTZ(6) NOT NULL,
  "client_time_zone" TEXT NOT NULL,
  "package_title" TEXT,
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'RUB',
  "payment_method" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'CREATED',
  "confirmation_url" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payments_provider_payment_id_key" ON "payments"("provider_payment_id");
CREATE UNIQUE INDEX "payments_idempotence_key_key" ON "payments"("idempotence_key");
CREATE UNIQUE INDEX "payments_booking_id_key" ON "payments"("booking_id");
CREATE INDEX "payments_user_id_created_at_idx" ON "payments"("user_id", "created_at");
CREATE INDEX "payments_status_created_at_idx" ON "payments"("status", "created_at");

ALTER TABLE "payments"
  ADD CONSTRAINT "payments_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "payments"
  ADD CONSTRAINT "payments_booking_id_fkey"
  FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
