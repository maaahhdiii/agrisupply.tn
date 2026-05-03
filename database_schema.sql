-- PRODUCTS TABLE
create table products (
  id uuid default gen_random_uuid() primary key,
  name_ar text not null,
  name_fr text not null,
  description_ar text,
  description_fr text,
  price decimal(10,2) not null,
  unit_ar text not null,
  unit_fr text not null,
  image_url text,
  category text,
  stock_available boolean default true,
  created_at timestamptz default now()
);

-- ORDERS TABLE
create table orders (
  id uuid default gen_random_uuid() primary key,
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  notes text,
  status text default 'pending' check (status in ('pending','confirmed','delivered','cancelled')),
  total_amount decimal(10,2) not null,
  delivery_date date not null,
  is_recurring boolean default false,
  created_at timestamptz default now()
);

-- ORDER ITEMS TABLE
create table order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  quantity integer not null,
  unit_price decimal(10,2) not null
);

-- SCHEDULES TABLE
create table schedules (
  id uuid default gen_random_uuid() primary key,
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  product_id uuid references products(id),
  quantity integer not null,
  frequency text check (frequency in ('weekly','monthly')),
  day_of_week integer check (day_of_week between 0 and 6),
  day_of_month integer check (day_of_month between 1 and 28),
  next_order_date date not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- INDEXES
create index on orders(status);
create index on orders(created_at desc);
create index on schedules(next_order_date) where is_active = true;

-- DISABLE RLS (no auth needed for MVP)
alter table products disable row level security;
alter table orders disable row level security;
alter table order_items disable row level security;
alter table schedules disable row level security;

-- SAMPLE PRODUCTS
insert into products (name_ar, name_fr, price, unit_ar, unit_fr, image_url, category, stock_available) values
('طماطم', 'Tomates', 8.00, 'كرتون', 'carton', 'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=400', 'légumes', true),
('بطاطا', 'Pommes de terre', 15.00, 'كيس', 'sac', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400', 'légumes', true),
('برتقال', 'Oranges', 20.00, 'كرتون', 'carton', 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400', 'fruits', true),
('بصل', 'Oignons', 10.00, 'كيس', 'sac', 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400', 'légumes', true),
('كوسة', 'Courgettes', 12.00, 'كرتون', 'carton', 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400', 'légumes', true),
('تفاح', 'Pommes', 25.00, 'كرتون', 'carton', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400', 'fruits', true),
('فلفل', 'Poivrons', 18.00, 'كرتون', 'carton', 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400', 'légumes', true),
('ثوم', 'Ail', 30.00, 'كيس', 'sac', 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=400', 'légumes', true),
('خس', 'Laitue', 5.00, 'حبة', 'pièce', 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400', 'légumes', true),
('جزر', 'Carottes', 9.00, 'كيس', 'sac', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400', 'légumes', true);
