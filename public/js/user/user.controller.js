/* global localStorage */
/* global jQuery */

const template = require('../components/wtfisdillinger-modal.directive.html')

module.exports =
  angular
    .module('diUser', [
      'diUser.service',
      'diDocuments.service.wordcount',
      'diDocuments.service.charactercount'
    ])
    .controller('User', (
      $rootScope,
      $scope,
      $timeout,
      $modal,
      userService,
      documentsService,
      wordsCountService,
      charactersCountService,
      debounce) => {
      const vm = this
      vm.profile = userService.profile

      //
      // TODO: Move this to out of here (perhaps to its own directive).
      //
      const $editor = jQuery('.split-editor')

      const getPreviewElements = (() => {
        let elements = null
        return (recalculate) => {
          if (!elements || recalculate) {
            elements = Array.prototype.map.call(
              document.getElementsByClassName('has-line-data'),
              (element) => {
                const startLine = +element.getAttribute('data-line-start')
                const endLine = +element.getAttribute('data-line-end')
                return { element, startLine, endLine }
              })
              .filter((x) => {
                return !isNaN(x.startLine) && !isNaN(x.endLine)
              })
          }
          return elements
        }
      })()

      const getSourceLines = (() => {
        let elements = null
        return (recalculate) => {
          if (!elements || recalculate) {
            let nextLineNumber = 0
            let nextStartLine = 0
            elements = Array.prototype.map.call(
              document.getElementsByClassName('ace_gutter-cell'),
              (element) => {
                const startLine = nextStartLine
                const lineSpan = Math.round(Number(
                  element.style.getPropertyValue('height').slice(0, -2)) / 28)
                const endLine = startLine + lineSpan
                const lineNumber = nextLineNumber

                nextStartLine = endLine
                nextLineNumber++
                const sourceLines = {
                  lineNumber,
                  startOffsetLine: startLine,
                  endOffsetLine: endLine
                }
                return sourceLines
              })
          }
          return elements
        }
      })()

      $rootScope.editor.on('change', debounce(() => {
        // re-calculate source lines
        getSourceLines(true)
      }, 200))
      $rootScope.$on('preview.updated', () => {
        // re-calculate preview elements
        getPreviewElements(true)
      })
      window.addEventListener('resize', () => {
        // re-calculate source lines
        getSourceLines(true)
      })

      const $divs = jQuery('.split-editor, .split-preview')
      let $allowed = $divs
      const sync = (e) => {
        const $this = jQuery(this)

        // Prevents slow scrolling by only allows subsequent callbacks
        // on the element that the first scroll event was triggered on.
        // See #516 for details.
        if ($this.is($allowed)) {
          const
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

      // ------------------------------

      const toggleGitHubComment = (e) => {
        e.preventDefault()
        vm.profile.enableGitHubComment = !vm.profile.enableGitHubComment
        userService.save(vm.profile)

        return false
      }

      const toggleAutoSave = (e) => {
        e.preventDefault()
        vm.profile.enableAutoSave = !vm.profile.enableAutoSave
        userService.save(vm.profile)

        return false
      }

      const toggleWordsCount = (e) => {
        e.preventDefault()
        vm.profile.enableWordsCount = !vm.profile.enableWordsCount
        userService.save(vm.profile)

        return false
      }

      const toggleCharactersCount = (e) => {
        e.preventDefault()
        vm.profile.enableCharactersCount = !vm.profile.enableCharactersCount
        userService.save(vm.profile)

        return false
      }

      const toggleScrollSync = (e) => {
        e.preventDefault()
        vm.profile.enableScrollSync = !vm.profile.enableScrollSync
        doSync()
        userService.save(vm.profile)

        return false
      }

      const storeTabSize = () => {
        vm.profile.tabSize = $scope.tabsize
        userService.save(vm.profile)
        setTabSize()

        return false
      }

      const storeKeybindings = () => {
        vm.profile.keybindings = $scope.keybindings
        userService.save(vm.profile)
        setKeybindings()

        return false
      }

      const toggleNightMode = (e) => {
        e.preventDefault()
        vm.profile.enableNightMode = !vm.profile.enableNightMode
        userService.save(vm.profile)

        return false
      }

      const resetProfile = (e) => {
        e.preventDefault()
        localStorage.clear()
        window.location.reload()

        return false
      }

      const updateWords = () => {
        $rootScope.words = wordsCountService.count()

        return $timeout(() => {
          return $rootScope.$apply()
        }, 0)
      }

      const updateCharacters = () => {
        $rootScope.characters = charactersCountService.count()

        return $timeout(() => {
          return $rootScope.$apply()
        }, 0)
      }

      const setTabSize = () => {
        $scope.tabsize = vm.profile.tabSize
        $rootScope.editor.session.setTabSize($scope.tabsize)

        return false
      }

      const setKeybindings = () => {
        $scope.keybindings = vm.profile.keybindings
        $rootScope.editor.setKeyboardHandler($scope.allKeybindings[$scope.keybindings])

        return false
      }

      const pasteDetected = () => {
        // only change if the title if still set to the default
        if (documentsService.getCurrentDocumentTitle() ===
        'Untitled Document.md') {
          // wait for preview to process Markdown, but only run once then destroy
          const destroyListener = $rootScope.$on('preview.updated', () => {
            setDocumentTitleToFirstHeader()

            destroyListener()
          })
        }
      }

      const setDocumentTitleToFirstHeader = () => {
        // set the document's name to the first header if there is one
        try {
          documentsService.setCurrentDocumentTitle(angular.element(document).find('#preview').find('h1')[0].textContent + '.md')
        } catch (err) {} // don't do anything if there's no header
      }

      const doSync = () => {
        if (vm.profile.enableScrollSync) {
          $divs.on('scroll', sync)
        } else {
          $divs.off('scroll', sync)
        }

        return false
      }

      const showAbout = (e) => {
        e.preventDefault()
        $modal.open({
          template,
          controller: 'WTFisDillingerModalInstance',
          windowClass: 'modal--dillinger about'
        })

        return false
      }

      const scrollPreviewWithEditor = ($editor, $preview) => {
        const offset = $editor.scrollTop
        if (offset <= 0) {
          $preview.scrollTop = 0
          return false
        }

        const currentSourceLine = getSourceLineForEditorOffset(offset)
        const lineNumber = currentSourceLine.lineNumber
        const elements = getPreviewElementsForLineNumber(lineNumber)
        const current = elements.current
        const next = elements.next
        if (!current || !next) {
          return false
        }

        const currentStartSourceLine = getSourceLineForLineNumber(current.startLine)
        const nextStartSourceLine = getSourceLineForLineNumber(next.startLine)
        const currentTop = current.element.offsetTop
        const editorOffsetLine = offset / 28

        const betweenProgress =
          (editorOffsetLine - currentStartSourceLine.startOffsetLine) /
          (nextStartSourceLine.startOffsetLine -
            currentStartSourceLine.startOffsetLine)
        const elementAndSpanOffset = next.element.offsetTop - currentTop
        const scrollTop = currentTop + betweenProgress * elementAndSpanOffset

        $preview.scrollTop = scrollTop
      }

      const scrollEditorWithPreview = ($preview, $editor) => {
        const previewOffset = $preview.scrollTop
        if (previewOffset <= 0) {
          $editor.scrollTop = 0
          return false
        }

        const elements = getPreviewElementsForOffset(previewOffset)
        const current = elements.current
        const next = elements.next
        if (!current || !next) {
          return false
        }

        const betweenProgress =
          (previewOffset - current.element.offsetTop) /
          (next.element.offsetTop - current.element.offsetTop)
        const currentStartSourceLine = getSourceLineForLineNumber(current.startLine)
        const nextStartSourceLine = getSourceLineForLineNumber(next.startLine)
        const sourceLinesOffset = nextStartSourceLine.startOffsetLine - currentStartSourceLine.startOffsetLine
        const scrollTop = (currentStartSourceLine.startOffsetLine + betweenProgress * sourceLinesOffset) * 28

        $editor.scrollTop = scrollTop
      }

      const getPreviewElementsForLineNumber = (lineNumber) => {
        const elements = getPreviewElements()
        let current = elements[0] || null
        for (let i = 0; i < elements.length; i++) {
          const entry = elements[i]
          if (entry.startLine === lineNumber) {
            return { current: entry, next: elements[i + 1] }
          } else if (entry.startLine > lineNumber) {
            return { current: current, next: entry }
          }
          current = entry
        }

        return { current: current }
      }

      const getPreviewElementsForOffset = (offset) => {
        const previewElements = getPreviewElements()

        // binary search find current preview elements in view
        let low = -1
        let high = previewElements.length - 1
        while (low + 1 < high) {
          const mid = Math.floor((low + high) / 2)
          const midElement = previewElements[mid].element
          const midElementHeight = midElement.getBoundingClientRect().height
          if (midElement.offsetTop + midElementHeight >= offset) {
            high = mid
          } else {
            low = mid
          }
        }

        const currentIndex = previewElements[high].element.offsetTop < offset ? high : low
        return { current: previewElements[currentIndex], next: previewElements[currentIndex + 1] }
      }

      const getSourceLineForEditorOffset = (offset) => {
        const offsetLineNumber = Math.floor(offset / 28)
        const lines = getSourceLines()
        const lastIndex = lines.length - 1
        for (let i = offsetLineNumber < lastIndex ? offsetLineNumber : lastIndex; i > -1; i--) {
          const entry = lines[i]
          if (entry.startOffsetLine <= offsetLineNumber) {
            return entry
          }
        }
      }

      const getSourceLineForLineNumber = (lineNumber) => {
        return getSourceLines()[lineNumber]
      }

      $rootScope.$on('preview.updated', updateWords)
      $rootScope.$on('preview.updated', updateCharacters)
      $rootScope.editor.on('paste', pasteDetected)

      $scope.allKeybindings = {
        Ace: '',
        Vim: 'ace/keyboard/vim',
        Emacs: 'ace/keyboard/emacs'
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
    })
