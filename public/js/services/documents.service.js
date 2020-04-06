/**
 *    Documents Service.
 */

module.exports =
  angular
    .module('diDocuments.service', ['diDocuments.sheet'])
    .factory('documentsService', ($rootScope, $http, Sheet, diNotify) => {
      /**
     *    Get item from the files array.
     *
     *    @param  {Object}  item  The actual item.
     */
      const getItem = (item) => {
        return service.files[service.files.indexOf(item)]
      }

      /**
     *    Get item from the files array by index.
     *
     *    @param  {Integer}  index  The index number.
     */
      const getItemByIndex = (index) => {
        return service.files[index]
      }

      /**
     *    Get item from the files array by it's id.
     *
     *    @param  {Integer}  id  The id of the file (which is actually
     *                           Date().getTime())
     */
      const getItemById = (id) => {
        let tmp = null

        angular.forEach(service.files, (file) => {
          if (file.id === id) {
            tmp = file
            return false
          }
        })

        return tmp
      }

      /**
     *    Add item to the files array.
     *
     *    @param  {Object}  item  The item to add.
     */
      const addItem = (item) => {
        return service.files.push(item)
      }

      /**
     *    Remove item from the files array.
     *
     *    @param  {Object}  item  The item to remove.
     */
      const removeItem = (item) => {
        return service.files.splice(service.files.indexOf(item), 1)
      }

      /**
     *    Creates a new document item.
     *
     *    @param  {Object}  props  Item properties (`title`, `body`, `id`).
     */
      const createItem = (props) => {
        return new Sheet(props)
      }

      /**
     *    Get the files array length.
     */
      const size = () => {
        return service.files.length
      }

      /**
     *    Get all files.
     */
      const getItems = () => {
        return service.files
      }

      /**
     *    Remove all items frm the files array.
     */
      const removeItems = () => {
        service.files = []
        service.currentDocument = {}
        return false
      }

      /**
     *    Update the current document.
     *
     *    @param  {Object}  item  The document object.
     *                            Must have a `title`, `body` and `id` property
     *                            to work.
     */
      const setCurrentDocument = (item) => {
        service.currentDocument = item
        return item
      }

      /**
     *    Get the current document.
     */
      const getCurrentDocument = () => {
        return service.currentDocument
      }

      /**
     *    Update the current document title.
     *
     *    @param  {String}  title  The document title.
     */
      const setCurrentDocumentTitle = (title) => {
        service.currentDocument.title = title
        return title
      }

      /**
     *    Update the current document CI trigger setting.
     *
     *    @param  {Boolean}  skipCI  Weather or not to skip CI
     */
      // const setCurrentDocumentCI (skipCI) {
      //   service.currentDocument.skipCI = skipCI
      //   return skipCI
      // }

      /**
     *    Update the current document ID.
     *
     *    @param  {Boolean}  fileId  DocumentID
     */
      const setCurrentDocumentId = (fileId) => {
        service.currentDocument.fileId = fileId
        return fileId
      }
      /**
     *    Update the current document Github Commit Message
     *
     *    @param  {String}  githubCommitMessage  Github Commit Message
     */
      // const setCurrentDocumentGithubCommitMessage (message) {
      //   service.currentDocument.githubCommitMessage = message
      //   return message
      // }

      /**
     *    Get the current document title.
     */
      const getCurrentDocumentTitle = () => {
        return service.currentDocument.title.replace(/(\\|\/)/g, '_')
      }

      /**
     *    Update the current document body.
     *
     *    @param  {String}  body  The document body.
     */
      const setCurrentDocumentBody = (body) => {
        service.currentDocument.body = body
        return body
      }

      /**
     *    Get the current document body.
     */
      const getCurrentDocumentBody = () => {
        service.setCurrentDocumentBody($rootScope.editor.getSession().getValue())
        return service.currentDocument.body
      }

      /**
     *    Append current value to cursor location.
     */
      const setCurrentCursorValue = (value) => {
        const position = $rootScope.editor.getCursorPosition()
        $rootScope.editor.getSession().insert(position, value)
        return value
      }

      /**
     *    Loose/weak check for a binary file type
     *    @param  {String}  text  Supposedly the text of a file.
     *
     */
      const isBinaryFile = (text) => {
        const len = text.length
        let column = 0

        for (let i = 0; i < len; i++) {
          column = (text.charAt(i) === '\n' ? 0 : column + 1)
          if (column > 500) {
            return true
          }
        }

        return false
      }

      /**
     *    Import a md file into dillinger.
     *
     *    @param  {File}  file  The file to import
     *            (see: https://developer.mozilla.org/en/docs/Web/API/File).
     *
     */
      const mdFileReader = (file) => {
        const reader = new window.FileReader()

        reader.onload = (event) => {
          const text = event.target.result

          if (isBinaryFile(text)) {
            return diNotify({
              message: 'Importing binary files will cause dillinger to become unresponsive',
              duration: 4000
            })
          }

          // Create a new document.
          const item = createItem()
          addItem(item)
          setCurrentDocument(item)

          // Set the new documents title and body.
          setCurrentDocumentTitle(file.name)
          setCurrentDocumentBody(text)

          // Refresh the editor and proview.
          $rootScope.$emit('document.refresh')
        }

        reader.readAsText(file)
      }

      /**
     *    Import an HTML file into dillinger.
     *
     *    @param  {File}  file  The file to import
     *            (see: https://developer.mozilla.org/en/docs/Web/API/File).
     *
     */
      const htmlFileReader = (file) => {
        const reader = new window.FileReader()

        reader.onload = (event) => {
          const text = event.target.result

          // Create a new document.
          const item = createItem()
          addItem(item)
          setCurrentDocument(item)

          // Set the new document's title.
          setCurrentDocumentTitle(file.name)
          // Call breakdance method to convert HTML to MD

          convertHTMLtoMD(text)
        }

        reader.readAsText(file)
      }

      /**
     *    Convert HTML text to markdown.
     *
     *    @param  {text}  string  The html text to be converted
     *
     */
      const convertHTMLtoMD = (text) => {
      // Add page title
        const di = diNotify({
          message: 'Converting HTML to Markdown...',
          duration: 2500
        })
        return $http.post('factory/html_to_md', {
          html: text
        }).then((result) => {
          if (angular.isDefined(di.$scope)) {
            di.$scope.$close()
          }
          if (result.data.error) {
            return diNotify({
              message: 'An Error occured: ' + result.data.error.message,
              duration: 5000
            })
          } else {
          // Set the new document's body
          // console.log(result.data.convertedMd)
            setCurrentDocumentBody(result.data.convertedMd)

            // Refresh the editor and proview.
            $rootScope.$emit('document.refresh')

            // Track event in GA
            if (window.ga) {
              window.ga('send', 'event', 'click', 'Convert HTML to Markdown', 'Convert To...')
            }
          }
        }, (err) => {
          if (angular.isDefined(di.$scope)) {
            di.$scope.$close()
          }
          return diNotify({
            message: 'An Error occured: ' + err.data.error.message,
            duration: 5000
          })
        })
      }

      /**
     *    Generic file import method. Checks for images and markdown.
     *
     *    @param  {File}  file  The file to import
     *            (see: https://developer.mozilla.org/en/docs/Web/API/File).
     *
     *    @param {Boolean} showTip set to true to show a tip message
     *                      about dragging and dropping files.
     */

      const importFile = (file, showTip, isHTML) => {
        if (!file) {
          return console.log('No file passed to importFile const.')
        }

        const reader = new window.FileReader()

        // If it is text or image or something else
        reader.onloadend = (event) => {
          const data = event.target.result

          const firstFourBitsArray = (new Uint8Array(data)).subarray(0, 4)

          let type = ''

          let header = ''

          // Snag hex value
          for (let i = 0; i < firstFourBitsArray.length; i++) {
            header += firstFourBitsArray[i].toString(16)
          }

          // Determine image type or unknown
          switch (header) {
            case '89504e47':
              type = 'image/png'
              break
            case '47494638':
              type = 'image/gif'
              break
            case 'ffd8ffe0':
            case 'ffd8ffe1':
            case 'ffd8ffe2':
              type = 'image/jpeg'
              break
            default:
              type = 'unknown'
              break
          }

          if (showTip) {
            diNotify({
              message: 'You can also drag and drop files into dillinger'
            })
          }

          if (type === 'unknown') {
            if (isHTML) return htmlFileReader(file)
            else return mdFileReader(file)
          } else {
          // Do the upload of the image to cloud service
          // and return an URL of the image
            return imageUploader(file)
          }
        }

        // Read as array buffer so we can determine if image
        // from the bits
        reader.readAsArrayBuffer(file)
      }

      /**
     *    Upload a file to a cloud service and return a URL.
     *
     *    @param  {File}  file  The file object
     *            (see: https://developer.mozilla.org/en/docs/Web/API/File).
     *
     */

      const imageUploader = (file) => {
        const reader = new window.window.FileReader()

        const name = file.name

        reader.onloadend = () => {
          const di = diNotify({
            message: 'Uploading Image to Dropbox...',
            duration: 5000
          })
          return $http.post('save/dropbox/image', {
            image_name: name,
            fileContents: reader.result
          }).then((result) => {
            if (angular.isDefined(di.$scope)) {
              di.$scope.$close()
            }
            if (result.data.data && result.data.data.error) {
              return diNotify({
                message: 'An Error occured: ' + result.data.error,
                duration: 5000
              })
            } else {
              const publicUrl = result.data.data.url
              // Now take publicUrl and and wrap in markdown
              const template = '![' + name + '](' + publicUrl + ')'
              // Now take the ace editor cursor and make the current
              // value the template
              service.setCurrentCursorValue(template)

              // Track event in GA
              if (window.ga) {
                window.ga('send', 'event', 'click',
                  'Upload Image To Dropbox', 'Upload To...')
              }
              return diNotify({
                message: 'Successfully uploaded image to Dropbox.',
                duration: 4000
              })
            }
          }, (err) => {
            return diNotify({
              message: 'An Error occured: ' + err.message,
              duration: 5000
            })
          })
        }
        reader.readAsDataURL(file)
      }

      /**
     *    Update the current document SHA.
     *
     *    @param  {String}  sha  The document SHA.
     */
      const setCurrentDocumentSHA = (sha) => {
        service.currentDocument.github.sha = sha
        return sha
      }

      /**
     *    Get the current document SHA.
     */
      const getCurrentDocumentSHA = () => {
        return service.currentDocument.github.sha
      }

      const save = (manual) => {
        if (!angular.isDefined(manual)) {
          manual = false
        }

        if (manual) {
          diNotify('Documents Saved.')
        }

        window.localStorage.setItem('files', angular.toJson(service.files))
        return window.localStorage.setItem('currentDocument', angular.toJson(service.currentDocument))
      }

      const init = () => {
        let item = null
        let _ref = null
        service.files = angular.fromJson(window.localStorage.getItem('files')) || []
        service.currentDocument = angular.fromJson(window.localStorage.getItem('currentDocument')) || {}
        if (!((_ref = service.files) != null ? _ref.length : undefined)) {
          item = createItem()
          addItem(item)
          setCurrentDocument(item)
          return save()
        }
      }
      const service = {
        currentDocument: {},
        files: [],

        getItem: getItem,
        getItemByIndex: getItemByIndex,
        getItemById: getItemById,
        addItem: addItem,
        removeItem: removeItem,
        createItem: createItem,
        size: size,
        getItems: getItems,
        removeItems: removeItems,
        importFile: importFile,
        setCurrentDocument: setCurrentDocument,
        getCurrentDocument: getCurrentDocument,
        setCurrentDocumentTitle: setCurrentDocumentTitle,
        getCurrentDocumentTitle: getCurrentDocumentTitle,
        setCurrentDocumentBody: setCurrentDocumentBody,
        getCurrentDocumentBody: getCurrentDocumentBody,
        setCurrentDocumentId: setCurrentDocumentId,
        setCurrentDocumentSHA: setCurrentDocumentSHA,
        getCurrentDocumentSHA: getCurrentDocumentSHA,
        setCurrentCursorValue: setCurrentCursorValue,
        save: save,
        init: init
      }

      service.init()

      return service
    }) // end factory
