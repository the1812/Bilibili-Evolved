const { compilationInfo } = require('../../webpack/compilation-info')
const https = require('https')

const files = [
  'dist/bilibili-evolved.preview.user.js',
  'dist/bilibili-evolved.user.js',
]

files.forEach(file => {
  const path = `/gh/the1812/Bilibili-Evolved@${compilationInfo.branch}/${file}`
  console.log('path:', path)
  const request = https.request({
    hostname: 'purge.jsdelivr.net',
    path,
    method: 'GET',
  }, response => {
    response.on('data', data => console.log(data))
  })
  request.on('error', error => console.error(error))
  request.end()
})
