
'use strict'

module.exports =
  angular
    .module('diUser', [
      'diUser.service',
      'diDocuments.service.wordcount',
      'diDocuments.service.charactercount'
    ])
    .controller('User', function ($rootScope, $scope, $timeout, $modal, userService, documentsService, wordsCountService, charactersCountService, debounce) {
      var vm = this

      vm.profile = userService.profile

      // TODO: Move this to out of here (perhaps to its own directive).
      var $editor = jQuery('.split-editor')
      var getPreviewElements = (function () {
        var elements
        return function (recalculate) {
          if (!elements || recalculate) {
            elements = Array.prototype.map.call(
              document.getElementsByClassName('has-line-data'),
              function (element) {
                var startLine = +element.getAttribute('data-line-start')
                var endLine = +element.getAttribute('data-line-end')
                return { element: element, startLine: startLine, endLine: endLine }
              })
              .filter(function (x) { return !isNaN(x.startLine) && !isNaN(x.endLine) })
          }
          return elements
        }
      })()

      var getSourceLines = (function () {
        var elements
        return function (recalculate) {
          if (!elements || recalculate) {
            var nextLineNumber = 0
            var nextStartLine = 0
            elements = Array.prototype.map.call(
              document.getElementsByClassName('ace_gutter-cell'),
              function (element) {
                var startLine = nextStartLine
                var lineSpan = Math.round(Number(element.style.getPropertyValue('height').slice(0, -2)) / 28)
                var endLine = startLine + lineSpan
                var lineNumber = nextLineNumber

                nextStartLine = endLine
                nextLineNumber++
                return { lineNumber: lineNumber, startOffsetLine: startLine, endOffsetLine: endLine }
              })
          }
          return elements
        }
      })()

      $rootScope.editor.on('change', debounce(function () {
        // re-calculate source lines
        getSourceLines(true)
      }, 200))
      $rootScope.$on('preview.updated', function () {
        // re-calculate preview elements
        getPreviewElements(true)
      })
      window.addEventListener('resize', function () {
        // re-calculate source lines
        getSourceLines(true)
      })

      var $divs = jQuery('.split-editor, .split-preview')
      var $allowed = $divs
      var sync = function (e) {
        var $this = jQuery(this)

        // Prevents slow scrolling by only allows subsequent callbacks
        // on the element that the first scroll event was triggered on.
        // See #516 for details.
        if ($this.is($allowed)) {
          var
            other = $divs.not(this)[0]


          if ($this.is($editor)) {
            scrollPreviewWithEditor(this, other)
          } else {
            scrollEditorWithPreview(this, other)
          }
          $allowed = $this
        } else {
          $allowed = $divs
        }

        return false
      }

      $rootScope.$on('preview.updated', updateWords)
      $rootScope.$on('preview.updated', updateCharacters)
      $rootScope.editor.on('paste', pasteDetected)

      $scope.allKeybindings = {
        "Ace": '',
        "Vim": 'ace/keyboard/vim',
        "Emacs": 'ace/keyboard/emacs'
      }

      // Methods on the Controller
      vm.toggleGitHubComment = toggleGitHubComment
      vm.toggleAutoSave = toggleAutoSave
      vm.toggleWordsCount = toggleWordsCount
      vm.toggleCharactersCount = toggleCharactersCount
      vm.storeTabSize = storeTabSize
      vm.storeKeybindings = storeKeybindings
      vm.toggleNightMode = toggleNightMode
      vm.toggleScrollSync = toggleScrollSync
      vm.resetProfile = resetProfile
      vm.showAbout = showAbout

      setTabSize()
      setKeybindings()
      doSync()

      // ------------------------------

      function toggleGitHubComment (e) {
        e.preventDefault()
        vm.profile.enableGitHubComment = !vm.profile.enableGitHubComment
        userService.save(vm.profile)

        return false
      }

      function toggleAutoSave (e) {
        e.preventDefault()
        vm.profile.enableAutoSave = !vm.profile.enableAutoSave
        userService.save(vm.profile)

        return false
      }

      function toggleWordsCount (e) {
        e.preventDefault()
        vm.profile.enableWordsCount = !vm.profile.enableWordsCount
        userService.save(vm.profile)

        return false
      }

      function toggleCharactersCount (e) {
        e.preventDefault()
        vm.profile.enableCharactersCount = !vm.profile.enableCharactersCount
        userService.save(vm.profile)

        return false
      }

      function toggleScrollSync (e) {
        e.preventDefault()
        vm.profile.enableScrollSync = !vm.profile.enableScrollSync
        doSync()
        userService.save(vm.profile)

        return false
      }

      function storeTabSize () {
        vm.profile.tabSize = $scope.tabsize
        userService.save(vm.profile)
        setTabSize()

        return false
      }

      function storeKeybindings () {
        vm.profile.keybindings = $scope.keybindings
        userService.save(vm.profile)
        setKeybindings()

        return false
      }

      function toggleNightMode (e) {
        e.preventDefault()
        vm.profile.enableNightMode = !vm.profile.enableNightMode
        userService.save(vm.profile)

        return false
      }

      function resetProfile (e) {
        e.preventDefault()
        localStorage.clear()
        window.location.reload()

        return false
      }

      function updateWords () {
        $rootScope.words = wordsCountService.count()

        return $timeout(function () {
          return $rootScope.$apply()
        }, 0)
      }

      function updateCharacters () {
        $rootScope.characters = charactersCountService.count()

        return $timeout(function () {
          return $rootScope.$apply()
        }, 0)
      }

      function setTabSize () {
        $scope.tabsize = vm.profile.tabSize
        $rootScope.editor.session.setTabSize($scope.tabsize)

        return false
      }

      function setKeybindings () {
        $scope.keybindings = vm.profile.keybindings
        $rootScope.editor.setKeyboardHandler( $scope.allKeybindings[ $scope.keybindings ] )

        return false
      }

      function pasteDetected () {
        // only change if the title if still set to the default
        if (documentsService.getCurrentDocumentTitle() == 'Untitled Document.md') {
          // wait for preview to process Markdown, but only run once then destroy
          var destroyListener = $rootScope.$on('preview.updated', function () {
            setDocumentTitleToFirstHeader()

            destroyListener()
          })
        }
      }

      function setDocumentTitleToFirstHeader () {
        // set the document's name to the first header if there is one
        try {
          documentsService.setCurrentDocumentTitle(angular.element(document).find('#preview').find('h1')[0].textContent + '.md')
        } catch (err) {} // don't do anything if there's no header
      }

      function doSync () {
        if (vm.profile.enableScrollSync) {
          $divs.on('scroll', sync)
        } else {
          $divs.off('scroll', sync)
        }

        return false
      }

      function showAbout (e) {
        e.preventDefault()
        $modal.open({
          template: require('raw!../components/wtfisdillinger-modal.directive.html'),
          controller: 'WTFisDillingerModalInstance',
          windowClass: 'modal--dillinger about'
        })

        return false
      }

      function scrollPreviewWithEditor ($editor, $preview) {
        var offset = $editor.scrollTop
        if (offset <= 0) {
          $preview.scrollTop = 0
          return false
        }

        var currentSourceLine = getSourceLineForEditorOffset(offset)
        var lineNumber = currentSourceLine.lineNumber
        var elements = getPreviewElementsForLineNumber(lineNumber)
        var current = elements.current
        var next = elements.next
        if (!current || !next) {
          return false
        }

        var currentStartSourceLine = getSourceLineForLineNumber(current.startLine)
        var nextStartSourceLine = getSourceLineForLineNumber(next.startLine)
        var currentTop = current.element.offsetTop
        var editorOffsetLine = offset / 28

        var betweenProgress =
          (editorOffsetLine - currentStartSourceLine.startOffsetLine) /
          (nextStartSourceLine.startOffsetLine -
            currentStartSourceLine.startOffsetLine)
        var elementAndSpanOffset = next.element.offsetTop - currentTop
        var scrollTop = currentTop + betweenProgress * elementAndSpanOffset

        $preview.scrollTop = scrollTop
      }

      function scrollEditorWithPreview ($preview, $editor) {
        var previewOffset = $preview.scrollTop
        if (previewOffset <= 0) {
          $editor.scrollTop = 0
          return false
        }

        var elements = getPreviewElementsForOffset(previewOffset)
        var current = elements.current
        var next = elements.next
        if (!current || !next) {
          return false
        }

        var betweenProgress =
          (previewOffset - current.element.offsetTop) /
          (next.element.offsetTop - current.element.offsetTop)
        var currentStartSourceLine = getSourceLineForLineNumber(current.startLine)
        var nextStartSourceLine = getSourceLineForLineNumber(next.startLine)
        var sourceLinesOffset = nextStartSourceLine.startOffsetLine - currentStartSourceLine.startOffsetLine
        var scrollTop = (currentStartSourceLine.startOffsetLine + betweenProgress * sourceLinesOffset) * 28

        $editor.scrollTop = scrollTop
      }

      function getPreviewElementsForLineNumber (lineNumber) {
        var elements = getPreviewElements()
        var current = elements[0] || null
        for (var i = 0; i < elements.length; i++) {
          var entry = elements[i]
          if (entry.startLine === lineNumber) {
            return { current: entry, next: elements[i + 1] }
          } else if (entry.startLine > lineNumber) {
            return { current: current, next: entry }
          }
          current = entry
        }

        return { current: current }
      }

      function getPreviewElementsForOffset (offset) {
        var previewElements = getPreviewElements()

        // binary search find current preview elements in view
        var low = -1
        var high = previewElements.length - 1
        while (low + 1 < high) {
          var mid = Math.floor((low + high) / 2)
          var midElement = previewElements[mid].element
          var midElementHeight = midElement.getBoundingClientRect().height
          if (midElement.offsetTop + midElementHeight >= offset) {
            high = mid
          } else {
            low = mid
          }
        }

        var currentIndex = previewElements[high].element.offsetTop < offset ? high : low
        return { current: previewElements[currentIndex], next: previewElements[currentIndex + 1] }
      }

      function getSourceLineForEditorOffset (offset) {
        var offsetLineNumber = Math.floor(offset / 28)
        var lines = getSourceLines()
        var lastIndex = lines.length - 1
        for (var i = offsetLineNumber < lastIndex ? offsetLineNumber : lastIndex; i > -1; i--) {
          var entry = lines[i]
          if (entry.startOffsetLine <= offsetLineNumber) {
            return entry
          }
        }
      }

      function getSourceLineForLineNumber (lineNumber) {
        return getSourceLines()[lineNumber]
      }
    })
