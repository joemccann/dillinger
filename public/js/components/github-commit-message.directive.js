
'use strict';

module.exports =
  angular
  .module('diBase.directives.githubCommitMessage', [])
  .directive('githubCommitMessage', function() {

  var directive = {
    restrict: 'E',
    template: require('raw!./github-commit-message.directive.html')
  };

  return directive;
});
