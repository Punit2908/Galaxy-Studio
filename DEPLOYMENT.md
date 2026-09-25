# Galaxy Photography deployment

## Vercel

Deploy this repository to Vercel. The root `vercel.json` builds the React/Vite client from `client/`, publishes `client/dist`, and rewrites client-side routes to `index.html`.

If Vercel is configured with **Root Directory = client** instead, use:
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

## Render

The root `render.yaml` defines the Node/Express API service from `server/`.

Set these secret environment variables in Render:
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `SUPER_ADMIN_EMAIL`
- `SUPER_ADMIN_PASSWORD`

Set `CLIENT_URL` to the exact Vercel origin, such as `https://your-site.vercel.app`.

The API health endpoint is `/api/health`.

## Local production checks

Frontend:
```bash
cd client
npm install
npm run build
npm run preview
```

Backend:
```bash
cd server
npm install
npm start
```

Never commit production secrets. The repository ignores `.env` files.
