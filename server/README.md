# Galaxy Photography API

Express backend using **Supabase Auth, PostgreSQL and Storage**.

## Responsibilities
- User registration/login/logout with Supabase Auth
- One bootstrapped superadmin
- HTTP-only auth cookie
- Image/video uploads to Supabase Storage
- Database-backed media library
- Website media slots so the admin can replace any website image/video without editing React
- Albums and album media
- Website settings
- Contact enquiries

## Supabase setup

Create a Supabase project, then open **SQL Editor** and run the schema below.

```sql
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null unique,
  role text not null default 'user' check (role in ('user','admin','superadmin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  public_url text not null,
  filename text not null,
  title text not null default '',
  alt_text text not null default '',
  description text not null default '',
  media_type text not null check (media_type in ('image','video')),
  mime_type text not null,
  size_bytes bigint not null default 0,
  folder text not null default 'images',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_media (
  slot text primary key,
  media_id uuid not null references public.media_assets(id) on delete restrict,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  cover_media_id uuid references public.media_assets(id) on delete set null,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.album_media (
  album_id uuid not null references public.albums(id) on delete cascade,
  media_id uuid not null references public.media_assets(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (album_id, media_id)
);

create table if not exists public.site_settings (
  key text primary key,
  value text not null default '',
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null default '',
  service text not null default '',
  message text not null,
  status text not null default 'new' check (status in ('new','contacted','closed')),
  admin_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists media_published_idx on public.media_assets(is_published, sort_order, created_at desc);
create index if not exists album_sort_idx on public.albums(is_published, sort_order);
create index if not exists inquiries_status_idx on public.inquiries(status, created_at desc);

alter table public.profiles enable row level security;
alter table public.media_assets enable row level security;
alter table public.site_media enable row level security;
alter table public.albums enable row level security;
alter table public.album_media enable row level security;
alter table public.site_settings enable row level security;
alter table public.inquiries enable row level security;

insert into storage.buckets (id, name, public)
values ('galaxy-media','galaxy-media',true)
on conflict (id) do update set public=true;
```

The Express API uses the Supabase **service-role key**, so database/storage writes stay server-side. Never expose that key to React.

## Environment

Copy `server/.env.example` to `server/.env` and set:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `SUPER_ADMIN_EMAIL`
- `SUPER_ADMIN_PASSWORD`
- `CLIENT_URL`

The first server startup creates the configured superadmin.

## API

### Public
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/media` published media
- `GET /api/media/slots`
- `GET /api/albums`
- `GET /api/settings`
- `POST /api/inquiries`

### Superadmin
- `GET /api/admin/media`
- `POST /api/admin/media/upload` multipart field: `file`
- `PATCH /api/admin/media/:id`
- `DELETE /api/admin/media/:id`
- `GET /api/admin/media/slots`
- `PUT /api/admin/media/slots` body: `{ slot, mediaId }`
- `DELETE /api/admin/media/slots/:slot`
- `GET /api/admin/albums`
- `POST /api/admin/albums`
- `PATCH /api/admin/albums/:id`
- `DELETE /api/admin/albums/:id`
- `POST /api/admin/albums/:id/media`
- `DELETE /api/admin/albums/:id/media/:mediaId`
- `GET /api/admin/settings`
- `PATCH /api/admin/settings`
- `GET /api/admin/inquiries`
- `PATCH /api/admin/inquiries/:id`

## Media slots

Examples:

`home.hero`, `home.heroDisk`, `home.story.01`, `home.story.02`, `home.story.03`, `home.film`, `home.closing`, `portfolio.hero`, `portfolio.showcase.01`, `portfolio.cta`, `footer.background`.

The React website will later consume these stable slot names instead of hard-coded image paths.
