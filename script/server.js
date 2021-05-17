const Koa = require('koa');
const path = require('path');
const fs = require('fs');
const app = new Koa();

app.use((ctx) => {
  ctx.body = fs.readFileSync(
    path.resolve(__dirname, '../bilibili-evolved.dev.js'),
    'utf-8'
  );
});
console.log('Serve running at - Local: http://localhost:3050');
app.listen(3050);
