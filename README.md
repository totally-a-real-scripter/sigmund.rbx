# Sigmund RBX

Sigmund RBX is a Roblox Mac Downloader web app that fetches and serves the latest Roblox macOS download path without requiring the standard installer flow.

## Features

- Retrieves the latest Roblox macOS version information.
- Provides a simple web interface for downloading Roblox on Mac.
- Full-stack TypeScript layout with `client`, `server`, and `shared` code.
- Docker-ready for containerized deployment.

## Project Structure

```text
.
├── client/           # Frontend (Vite + React)
├── server/           # Backend server (Express + TypeScript)
├── shared/           # Shared types/schema used across app layers
├── Dockerfile        # Multi-stage production image
├── package.json      # Scripts and dependencies
└── .env.example      # Example environment configuration
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Install

```bash
npm install
```

### Development

Run the frontend dev server:

```bash
npm run dev
```

Run the backend server in development mode:

```bash
npm run dev:server
```

### Build

Build frontend assets:

```bash
npm run build
```

Build production server bundle (includes frontend build):

```bash
npm run build:server
```

### Start

Start the production server after building:

```bash
npm run start:server
```

### Other Scripts

```bash
npm run preview
npm run check
npm run db:push
```

## Docker

A production Dockerfile is included.

Build image:

```bash
docker build -t sigmund-rbx .
```

Run container:

```bash
docker run --rm -p 5000:5000 --env-file .env sigmund-rbx
```

## Coolify Deployment

This repository is suitable for Docker-based Coolify deployment:

- Use `Dockerfile` as the build source.
- Expose port `5000`.
- Provide required environment variables in Coolify.
- Use `npm run start:server` (already configured in container `CMD`).

## Environment Variables

Based on `.env.example`:

- `DATABASE_URL` (PostgreSQL connection string)
- `NODE_ENV` (for example: `development` or `production`)
- `PORT` (default app port, e.g. `5000`)
- Optional: external API keys as needed by your deployment

## Troubleshooting

- Build issues: run `npm install` again, then `npm run check` and `npm run build:server` to catch type/build errors.
- Docker issues: confirm `.env` values are set and port `5000` is available on the host.
- Download issues: verify the backend is running and outbound network access to Roblox endpoints is available.

## Credits

This project is based on and forked from `rbxmacdl/rbxmacdl.github.io`.

## License

No license file is currently present in this repository.
