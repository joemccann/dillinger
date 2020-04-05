
const body = require('../../../README.md')

module.exports =
  angular
    .module('diDocuments.sheet', [])
    .factory('Sheet', () => {
      return (sheetData) => {
        angular.extend(this, {
          id: new Date().getTime(),
          title: 'Untitled Document.md',
          body
        })

        return angular.extend(this, sheetData)
      }
    })
