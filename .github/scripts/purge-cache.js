import fetch from 'node-fetch'
import { compilationInfo } from '../../webpack/compilation-info.js'

const files = [
  'dist/bilibili-evolved.preview.user.js',
  'dist/bilibili-evolved.user.js',
]

files.forEach(file => {
  const url = `https://purge.jsdelivr.net/gh/the1812/Bilibili-Evolved@${compilationInfo.branch}/${file}`

  console.log('url:', url)
  fetch(url)
    .then(response => response.json()).then(json => console.log(json))
    .catch(error => console.error(error))
})
