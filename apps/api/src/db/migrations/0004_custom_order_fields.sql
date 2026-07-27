-- 0004_custom_order_fields.sql
-- Extra fields for the custom-order lifecycle: progress/final photos, revision counter,
-- and the recorded deposit amount. Idempotent.
alter table public.custom_order_requests
  add column if not exists progress_image_urls text[] not null default '{}',
  add column if not exists final_image_urls text[] not null default '{}',
  add column if not exists revision_count int not null default 0,
  add column if not exists deposit_amount numeric(10,2);
