export const e2eDatabaseUrl =
  process.env.E2E_DATABASE_URL ??
  "postgres://postgres:postgres@localhost:54329/playlists_e2e";
