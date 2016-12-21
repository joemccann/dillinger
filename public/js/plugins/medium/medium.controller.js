'use strict';

module.exports = angular
                  .module('plugins.medium', ['plugins.medium.service'])
                  .controller('Medium', function($rootScope, mediumService, documentsService){
                      var saveTo
                        , vm
                        ;
                      vm = this;
                      saveTo = function() {
                        var body
                          , title
                          ;
                        
                        title = documentsService.getCurrentDocumentTitle()
                        body = documentsService.getCurrentDocumentBody()
                        return mediumService.saveFile(title, body)
                      }
                      vm.saveTo = saveTo
                    }) // end controller
