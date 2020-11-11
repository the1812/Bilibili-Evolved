const fs = require('fs')
const path = './node_modules/vue/types/umd.d.ts'
if (fs.existsSync(path)) {
  fs.unlinkSync(path)
}
