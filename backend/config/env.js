require('dotenv').config();

function requireEnv(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(
      `[Startup Error] Missing required environment variable "${name}". ` +
        `Set "${name}" in backend/.env (see .env.example) or in the deployment environment before starting the server.`
    );
  }
  return value;
}

const JWT_SECRET = requireEnv('JWT_SECRET');

const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGINS ||
  'http://localhost:3000,http://localhost:5000,http://127.0.0.1:5000,http://localhost:5500,http://127.0.0.1:5500'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

module.exports = { JWT_SECRET, ALLOWED_ORIGINS };
