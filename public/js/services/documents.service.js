
'use strict';
module.exports = angular.module('diDocuments.service', ['diDocuments.sheet']).factory('documentsService', function($rootScope, Sheet, diNotify) {
  var currentDocument, files, service;
  currentDocument = {
    title: "",
    body: "",
    id: null
  };
  files = [];
  service = {
    currentDocument: {},
    files: [],
    getItem: function(item) {
      return service.files[service.files.indexOf(item)];
    },
    getItemByIndex: function(index) {
      return service.files[index];
    },
    getItemById: function(id) {
      var tmp;
      tmp = null;
      angular.forEach(service.files, function(file) {
        if (file.id === id) {
          return tmp = file;
        }
      });
      return tmp;
    },
    addItem: function(item) {
      return service.files.push(item);
    },
    removeItem: function(item) {
      return service.files.splice(service.files.indexOf(item), 1);
    },
    createItem: function(props) {
      return new Sheet(props);
    },
    size: function() {
      return service.files.length;
    },
    getItems: function() {
      return service.files;
    },
    removeItems: function() {
      service.files = [];
      service.currentDocument = {};
      return false;
    },
    setCurrentDocument: function(item) {
      return service.currentDocument = item;
    },
    getCurrentDocument: function() {
      return service.currentDocument;
    },
    setCurrentDocumentTitle: function(title) {
      return service.currentDocument.title = title;
    },
    getCurrentDocumentTitle: function() {
      return service.currentDocument.title;
    },
    setCurrentDocumentBody: function(body) {
      return service.currentDocument.body = body;
    },
    getCurrentDocumentBody: function() {
      service.setCurrentDocumentBody($rootScope.editor.getSession().getValue());
      return service.currentDocument.body;
    },
    save: function(manual) {
      if (manual == null) {
        manual = false;
      }
      if (manual) {
        diNotify('Documents Saved.');
      }
      localStorage.setItem('files', angular.toJson(service.files));
      return localStorage.setItem('currentDocument', angular.toJson(service.currentDocument));
    },
    init: function() {
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
  };
  service.init();
  return service;
});
