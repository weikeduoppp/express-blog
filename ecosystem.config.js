module.exports = {
  apps: [
    {
      name: "blog",
      script: "./bin/www",
      env: {
        COMMON_VARIABLE: "true"
      },
      env_production: {
        NODE_ENV: "production"
      }
    }
  ],
  deploy: {
    // "production" is the environment name
    production: {
      user: "manager",
      host: ["47.104.88.94"],
      // 默认22
      // port: "",
      ref: "origin/master",
      repo: "git@github.com:weikeduoppp/express-blog.git",
      path: "/www/blog/production", // 部署服务器的目录 -> 根目录
      ssh_options: "StrictHostKeyChecking=no",
      // 发布脚本
      "post-deploy":
        "npm install --registry=https://registry.npm.taobao.org && pm2 startOrRestart ecosystem.config.js --env production",
      // Environment variables that must be injected in all applications on this env
      env: {
        NODE_ENV: "production"
      }
    }
  }
};