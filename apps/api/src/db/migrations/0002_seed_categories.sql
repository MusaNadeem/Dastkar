-- 0002_seed_categories.sql — seed the fixed category taxonomy.
insert into public.categories (name) values
  ('Fine Art'),
  ('Crafts'),
  ('Calligraphy'),
  ('Jewelry'),
  ('Home Decor'),
  ('Custom')
on conflict (name) do nothing;
