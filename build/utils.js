const fs = require('fs')
const path = require('path')

exports.isDevMode = (mode) =>  mode !== 'production'

exports.getMode = function (env) {
  env = env || {}
  return env.mode || 'production'
}

exports.pages = function (folder = '') {
  const rootPagesFolderName = 'pages'
  const viewsFolder = path.join(__dirname, '../src/views/', rootPagesFolderName, folder)
  let pages = {}

  fs.readdirSync(viewsFolder).forEach(file => {
    let [viewName, ext] = file.split('.')

    if (ext === undefined) return false

    const entryName = path.join(folder, viewName, 'index')
    pages[entryName] = path.join('views', rootPagesFolderName, folder, file)
  })

  return pages
}
