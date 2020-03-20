var env = process.env.NODE_ENV === 'production'
module.exports = {
  host: env ? '127.0.0.1' : 'localhost',
  port: env ? '19999' : '27017',
  db: 'blog'
};
