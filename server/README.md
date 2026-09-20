# Galaxy Studio API

Express + MongoDB backend for authentication and website media management.

## Backend responsibilities
- User registration, login, logout and current-user session
- One bootstrapped superadmin account
- JWT authentication using an HTTP-only cookie (Bearer tokens are also accepted)
- Cloudinary image/video storage
- Superadmin media library
- Website media slots so the admin can change which uploaded asset appears in each part of the website

## Local setup
1. Copy server/.env.example to server/.env.
2. Fill in MongoDB, JWT and Cloudinary credentials.
3. Set a strong SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD.
4. From server/, run npm install and npm run dev.
The first server startup creates the configured superadmin if that email does not already exist.

## Authentication API
POST /api/auth/register body: { name, email, password }
POST /api/auth/login body: { email, password }
POST /api/auth/logout
GET /api/auth/me
Public registration always creates a normal user. A client cannot register itself as admin or superadmin.

## Media API
Public: GET /api/media/slots
Superadmin: GET /api/media
Superadmin: POST /api/media/upload (multipart field: file)
Superadmin: PATCH /api/media/:id
Superadmin: PUT /api/media/slots (body: { slot, mediaId })
Superadmin: DELETE /api/media/slots/:slot
Superadmin: DELETE /api/media/:id
A media asset cannot be deleted while it is assigned to a website slot.

## Media slot examples
home.hero
home.heroDisk
home.story.01
home.story.02
home.film
home.closing

The frontend will request assets by stable slots instead of hardcoding image URLs. The superadmin can upload a new photograph or video and assign it to a slot without changing React source code.

## Cloudinary
The server uploads files directly to Cloudinary using the Cloudinary Node SDK. Only the resulting URL and Cloudinary metadata are stored in MongoDB. Cloudinary API secrets stay server-side and must never be exposed to the React client.