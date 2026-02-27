module.exports = {
  apps: [
    {
      name: "acd-preprod",
      script: ".output/server/index.mjs",
      cwd: "/var/www/acd-preprod",
      exec_mode: "fork",
      instances: 1,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOST: "0.0.0.0",
        BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
        BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
        GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
        DATABASE_URL: process.env.DATABASE_URL,
      }
    }
  ]
}