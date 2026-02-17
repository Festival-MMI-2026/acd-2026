module.exports = {
    apps: [
      {
        name: "acd-preprod",
        script: ".output/server/index.mjs",
        exec_mode: "fork",
        instances: 1,
        env: {
          NODE_ENV: "production",
          PORT: 3000
        }
      }
    ]
  }
  