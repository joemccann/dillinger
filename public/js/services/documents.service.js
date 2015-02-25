
'use strict';

/**
 *    Documents Service.
 */

module.exports =
  angular
  .module('diDocuments.service', ['diDocuments.sheet'])
  .factory('documentsService', function($rootScope, Sheet, diNotify) {

  var service = {
    currentDocument: {},
    files:           [],

    getItem:                 getItem,
    getItemByIndex:          getItemByIndex,
    getItemById:             getItemById,
    addItem:                 addItem,
    removeItem:              removeItem,
    createItem:              createItem,
    size:                    size,
    getItems:                getItems,
    removeItems:             removeItems,
    setCurrentDocument:      setCurrentDocument,
    getCurrentDocument:      getCurrentDocument,
    setCurrentDocumentTitle: setCurrentDocumentTitle,
    getCurrentDocumentTitle: getCurrentDocumentTitle,
    setCurrentDocumentBody:  setCurrentDocumentBody,
    getCurrentDocumentBody:  getCurrentDocumentBody,
    setCurrentDocumentSHA:   setCurrentDocumentSHA,
    getCurrentDocumentSHA:   getCurrentDocumentSHA,
    save:                    save,
    init:                    init
  };

  service.init();

  return service;

  //////////////////////////////

  /**
   *    Get item from the files array.
   *
   *    @param  {Object}  item  The actual item.
   */
  function getItem(item) {
    return service.files[service.files.indexOf(item)];
  }

  /**
   *    Get item from the files array by index.
   *
   *    @param  {Integer}  index  The index number.
   */
  function getItemByIndex(index) {
    return service.files[index];
  }

  /**
   *    Get item from the files array by it's id.
   *
   *    @param  {Integer}  id  The id of the file (which is actually
   *                           Date().getTime())
   */
  function getItemById(id) {
    var tmp = null;

    angular.forEach(service.files, function(file) {
      if (file.id === id) {
        tmp = file;
        return false;
      }
    });

    return tmp;
  }

  /**
   *    Add item to the files array.
   *
   *    @param  {Object}  item  The item to add.
   */
  function addItem(item) {
    return service.files.push(item);
  }

  /**
   *    Remove item from the files array.
   *
   *    @param  {Object}  item  The item to remove.
   */
  function removeItem(item) {
    return service.files.splice(service.files.indexOf(item), 1);
  }

  /**
   *    Creates a new document item.
   *
   *    @param  {Object}  props  Item properties (`title`, `body`, `id`).
   */
  function createItem(props) {
    return new Sheet(props);
  }

  /**
   *    Get the files array length.
   */
  function size() {
    return service.files.length;
  }

  /**
   *    Get all files.
   */
  function getItems() {
    return service.files;
  }

  /**
   *    Remove all items frm the files array.
   */
  function removeItems() {
    service.files = [];
    service.currentDocument = {};
    return false;
  }

  /**
   *    Update the current document.
   *
   *    @param  {Object}  item  The document object.
   *                            Must have a `title`, `body` and `id` property
   *                            to work.
   */
  function setCurrentDocument(item) {
    service.currentDocument = item;
    return item;
  }

  /**
   *    Get the current document.
   */
  function getCurrentDocument() {
    return service.currentDocument;
  }

  /**
   *    Update the current document title.
   *
   *    @param  {String}  title  The document title.
   */
  function setCurrentDocumentTitle(title) {
    service.currentDocument.title = title;
    return title;
  }

  /**
   *    Get the current document title.
   */
  function getCurrentDocumentTitle() {
    return service.currentDocument.title;
  }

  /**
   *    Update the current document body.
   *
   *    @param  {String}  body  The document body.
   */
  function setCurrentDocumentBody(body) {
    service.currentDocument.body = body;
    return body;
  }

  /**
   *    Get the current document body.
   */
  function getCurrentDocumentBody() {
    service.setCurrentDocumentBody($rootScope.editor.getSession().getValue());
    return service.currentDocument.body;
  }

/**
 *    Update the current document SHA.
 *
 *    @param  {String}  sha  The document SHA.
 */
function setCurrentDocumentSHA(sha) {
  service.currentDocument.github.sha = sha;
  return sha;
}

/**
 *    Get the current document SHA.
 */
function getCurrentDocumentSHA() {
  return service.currentDocument.github.sha;
}

  function save(manual) {
    if (!angular.isDefined(manual)) {
      manual = false;
    }

    if (manual) {
      diNotify('Documents Saved.');
    }

    localStorage.setItem('files', angular.toJson(service.files));
    return localStorage.setItem('currentDocument', angular.toJson(service.currentDocument));
  }

  function init() {
    var item, _ref;
    service.files = angular.fromJson(localStorage.getItem('files')) || [];
    service.currentDocument = angular.fromJson(localStorage.getItem('currentDocument')) || {};
    if (!((_ref = service.files) != null ? _ref.length : void 0)) {
      item = this.createItem();
      this.addItem(item);
      this.setCurrentDocument(item);
      return this.save();
    }
  }

});
