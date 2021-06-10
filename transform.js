const fs = require('fs')
const pathModule = require('path')

module.exports = (file, api) => {
  const j = api.jscodeshift

  return j(file.source)
    .find(j.ImportDeclaration)
    .forEach(path => {
      const conditions = [
        '../',
        './',
        'coi-constants/',
        'coi-server/',
        'coi-client/',
        'coi-shared/',
        'coi-test/',
        'db/'
      ]
      const nullConditions = ['.css', '.js']
      if (
        conditions.some(e => path.node.source.value.startsWith(e)) &&
        !nullConditions.some(e => path.node.source.value.endsWith(e))
      ) {

        const newPath = path.node.source.value.startsWith('./') ? '.' + path.node.source.value : path.node.source.value
        const absolutePath = pathModule.resolve(file.path, newPath)

        if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isDirectory()) {
          const indexPath = pathModule.join(absolutePath, '/index.js')
          if (fs.existsSync(indexPath)) {
            path.node.source.value = path.node.source.value + '/index.js'
          }
        } else {
          path.node.source.value = path.node.source.value + '.js'
        }
      }
      j(path).replaceWith(path.node)
    })
    .toSource()
}
