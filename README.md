# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Backend Setup

```bash
cd backend && npm ci && npm run dev
```

## Docker Development

Create a dummy secret and start the API:

```bash
mkdir -p secrets && echo '{}' > secrets/service-account.json
docker compose up --build
```

## Supplying Google credentials

The backend requires a Google service account key to access Drive and Sheets. Set
`SERVICE_ACCOUNT_JSON` to the path of your JSON key file (or mount it via Docker
compose as shown above). On startup the server will verify the key by fetching
the authenticated email.

