# Galaxy Photography API

Express + **MongoDB** backend with **Supabase Storage only for image/video files**.

## Architecture

React
  ↓
Express API
  ├── MongoDB → users, media metadata, albums, website slots, settings, enquiries
  └── Supabase Storage → image/video binary files

Supabase is **not** the application database. MongoDB remains the database.

## Backend responsibilities
- Registration, login, logout and current-user session
- One bootstrapped superadmin
- JWT authentication with HTTP-only cookie
- Image/video uploads to Supabase Storage
- Media metadata in MongoDB
- Website media slots so admin can replace any website image/video without changing React code
- Albums and album media in MongoDB
- Website settings
- Contact enquiries

## Setup

1. Create MongoDB database.
2. Create a Supabase project and a public Storage bucket named `galaxy-media`.
3. Copy `server/.env.example` to `server/.env`.
4. Fill in MongoDB, Supabase and superadmin credentials.
5. From `server/`, run `npm install` and `npm run dev`.

The Supabase **service-role key stays server-side only**.

## Environment

```env
MONGO_URI=mongodb://127.0.0.1:27017/galaxy-studio
JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=7d

SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-secret-service-role-key
SUPABASE_STORAGE_BUCKET=galaxy-media

CLIENT_URL=http://localhost:5173

SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=strong-password
SUPER_ADMIN_NAME=Galaxy Photography Admin
```

## Public API
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/media`
- `GET /api/media/slots`
- `GET /api/albums`
- `GET /api/settings`
- `POST /api/inquiries`

## Superadmin API
- `GET /api/admin/media`
- `POST /api/admin/media/upload`
- `PATCH /api/admin/media/:id`
- `DELETE /api/admin/media/:id`
- `GET /api/admin/media/slots`
- `PUT /api/admin/media/slots`
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

## Website media slots

The admin can assign any uploaded asset to stable slots such as:

- `home.hero`
- `home.heroDisk`
- `home.story.01`
- `home.story.02`
- `home.story.03`
- `home.film`
- `home.closing`
- `portfolio.hero`
- `portfolio.showcase.01`
- `portfolio.showcase.02`
- `portfolio.cta`
- `footer.background`

Changing a photograph on the website will not require editing React source code or redeploying the site.