CREATE TABLE "promo_codes" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "code" TEXT NOT NULL,
  "normalized_code" TEXT NOT NULL,
  "discounted_amount" INTEGER NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "promo_codes_code_key" ON "promo_codes"("code");
CREATE UNIQUE INDEX "promo_codes_normalized_code_key" ON "promo_codes"("normalized_code");
CREATE INDEX "promo_codes_is_active_idx" ON "promo_codes"("is_active");

ALTER TABLE "payments" ADD COLUMN "promo_code_id" UUID;
ALTER TABLE "payments" ADD COLUMN "original_amount" INTEGER;
UPDATE "payments" SET "original_amount" = "amount" WHERE "original_amount" IS NULL;
ALTER TABLE "payments" ALTER COLUMN "original_amount" SET NOT NULL;
CREATE INDEX "payments_promo_code_id_idx" ON "payments"("promo_code_id");

ALTER TABLE "payments"
  ADD CONSTRAINT "payments_promo_code_id_fkey"
  FOREIGN KEY ("promo_code_id") REFERENCES "promo_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "promo_codes" ("code", "normalized_code", "discounted_amount") VALUES
  ('Скидка2026', 'СКИДКА2026', 3500),
  ('СпешлФорОлегБасов', 'СПЕШЛФОРОЛЕГБАСОВ', 100);
