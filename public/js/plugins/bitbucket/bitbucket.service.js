
/* global ga, localStorage */

module.exports =
  angular
    .module('plugins.bitbucket.service', [])
    .factory('bitbucketService', function ($http, diNotify) {
      const defaults = {
        orgs: {},
        repos: {},
        branches: {},
        files: {},
        user: {
          name: '',
          uri: ''
        },
        current: {
          tree: [],
          url: '',
          name: '',
          sha: '',
          path: '',
          branch: '',
          owner: '',
          repo: '',
          file: '',
          fileName: ''
        }
      }

      const getRepoUUID = function (name) {
        const repo = service.config.repos.find(function (r) {
          return r.name === name
        })
        service.config.current.repo_uuid = repo.uuid
        return repo.uuid
      }

      const service = {

        config: {},

        refreshToken: function () {
          $http.get('/refresh/bitbucket')
        },
        /**
     *    Add the User to the Organizations Array, as we want to let him
     *    search through his own Repos.
     */
        registerUserAsOrg: function () {
          return service.config.orgs.push({
            name: service.config.user.name
          })
        },

        /**
     *    Fetch the File from Bitbucket.
     *
     *    @param    {String}    url    URL to the File
     */
        fetchFile: function (url, path) {
          service.config.current.url = url
          return $http.post('import/bitbucket/file', {
            url: url
          }).then(function (response) {
            service.config.current.file = response.data.content
            return false
          }).catch(function (err) {
            return diNotify({
              message: 'An Error occured: ' + err
            })
          })
        },

        /**
     *    Fetches the File Tree of the current Branch.
     *
     *    @param    {String}    sha         SHA of the File
     *    @param    {String}    branch      Selected Branch
     *    @param    {String}    repo        Selected Repo
     *    @param    {String}    owner       Owner of the Repo
     *    @param    {String}    fileExts    File Extensions (.md,.markdown etc.)
     */
        fetchTreeFiles: function (sha, branch, repo, owner, fileExts) {
          const di = diNotify('Fetching Files...')
          return $http.post('import/bitbucket/tree_files', {
            repo_uuid: service.config.current.repo_uuid,
            owner: owner || service.config.current.owner,
            repo: repo || service.config.current.repo,
            branch: branch || service.config.current.branch,
            sha: sha || service.config.current.sha,
            fileExts: fileExts || 'md'
          }).then(function (response) {
            if (di != null) {
              di.$scope.$close()
            }
            service.config.files = response.data

            return service.config.files
          }).catch(function (err) {
            return diNotify({
              message: 'An Error occured: ' + err
            })
          })
        },

        /**
     *    Fetch the selected Branch.
     *
     *    @param    {String}    repo     Repo Name
     *    @param    {String}    owner    Owner of the Repo
     */
        fetchBranches: function (repo, owner, page, perPage) {
          const di = diNotify('Fetching Branches...')
          return $http.post('import/bitbucket/branches', {
            owner: owner || service.config.current.owner,
            repo: repo || service.config.current.repo,
            repo_uuid: getRepoUUID(repo || service.config.current.repo),
            page,
            per_page: perPage
          }).then(function (response) {
            if (di != null) {
              di.$scope.$close()
            }
            service.config.current.repo = repo
            service.config.current.owner = owner

            service.config.pagination = response.data.pagination
            service.config.branches = response.data.items

            return service.config.branches
          }).catch(function (err) {
            return diNotify({
              message: 'An Error occured: ' + err
            })
          })
        },

        /**
     *    Fetch Repos of the selected Organization.
     *
     *    @param    {String}    owner    Owner Name
     */
        fetchRepos: function (owner, page, perPage) {
          const di = diNotify('Fetching Repos...')
          return $http.post('import/bitbucket/repos', {
            owner,
            page,
            per_page: perPage
          }).then(function (response) {
            if (di != null) {
              di.$scope.$close()
            }
            service.config.current.owner = owner

            service.config.pagination = response.data.pagination
            service.config.repos = response.data.items

            return service.config.repos
          }).catch(function (err) {
            return diNotify({
              message: 'An Error occured: ' + err
            })
          })
        },

        /**
     *    Fetch all known Organizations from the User.
     */
        fetchOrgs: function () {
          const di = diNotify('Fetching Organizations...')
          return $http.post('import/bitbucket/orgs').then(function (response) {
            if (di != null) {
              di.$scope.$close()
            }
            service.config.orgs = response.data

            return service.config.orgs
          }).catch(function (err) {
            return diNotify({
              message: 'An Error occured: ' + err
            })
          })
        },

        /**
     *    Update Document on Bitbucket.
     *
     *    @param  {Object}  data  Object for POST Request.
     *
     *    @examples
     *    {
     *      uri: 'https://api.bitbucket.com/repos/pengwynn/octokit/contents/subdir/README.md',
     *      data: btoa('DOCUMENT_BODY'),
     *      path: 'subdir/README.md',
     *      sha: '3d21ec53a331a6f037a91c368710b99387d012c1',
     *      branch: 'master',
     *      repo: 'pengwynn',
     *      message: 'Commit message.',
     *      owner: 'octokit'
     *    }
     */
        saveToBitbucket: function (response) {
          const di = diNotify('Saving Document on Bitbucket...')
          return $http.post('save/bitbucket', {
            uri: response.uri,
            data: response.body,
            path: response.path,
            sha: response.sha,
            branch: response.branch,
            repo: response.repo,
            message: response.message,
            owner: response.owner
          }).then(function (result) {
            if (di.$scope != null) {
              di.$scope.$close()
            }
            diNotify({
              message: 'thenfully saved to ' + result.content.path + '!',
              duration: 5000
            })
            if (window.ga) {
              ga('send', 'event', 'click', 'Save To BitBucket', 'Save To...')
            }
            return result
          }).catch(function (err) {
            return diNotify({
              message: 'An Error occured: ' + err.error,
              duration: 5000
            })
          })
        },

        save: function () {
          localStorage.setItem('bitbucket', angular.toJson(service.config))
        },

        restore: function () {
          service.config = angular
            .fromJson(localStorage.getItem('bitbucket')) || defaults
          return service.config
        }

      }
      service.restore()
      return service
    })
