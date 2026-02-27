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
        PORT: 3000
      }
    }
  ]
}