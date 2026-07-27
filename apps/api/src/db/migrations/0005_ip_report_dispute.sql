-- 0005_ip_report_dispute.sql
-- Counter-notice support: a disputed flag + the seller's counter-notice text. Idempotent.
alter table public.ip_reports
  add column if not exists disputed boolean not null default false,
  add column if not exists counter_notice text;
