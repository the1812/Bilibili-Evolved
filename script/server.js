const Koa = require('koa');
const path = require('path');
const fs = require('fs');
const app = new Koa();
const dirPath = path.resolve(__dirname);

app.use((ctx) => {
  ctx.body = fs.readFileSync(
    path.join(dirPath, '..', '/bilibili-evolved.dev.js'),
    'utf-8'
  );
});

app.listen(3000);
