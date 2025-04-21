'use strict';

module.exports =
  angular
    .module('diAds.service', [])
    .factory('adsService', ['$http', '$q', function($http, $q) {
      function loadAds() {
        // Use JSONP to avoid CORS issues
        return $http.jsonp('https://srv.buysellads.com/ads/CVADP53W.json?segment=placement:dillingerio&v=true&callback=JSON_CALLBACK')
          .then(function(response) {
            if (!response.data || !response.data.ads) {
              hideAdContainers();
              return $q.reject('No ads available');
            }
            return response.data;
          })
          .catch(function(err) {
            console.log('Ad loading error:', err);
            hideAdContainers();
            return $q.reject(err);
          });
      }

      function hideAdContainers() {
        var adContainers = document.querySelectorAll('.bsa-cpc');
        adContainers.forEach(function(container) {
          container.style.display = 'none';
        });
      }

      return {
        loadAds: loadAds,
        hideAds: hideAdContainers
      };
    }]); 