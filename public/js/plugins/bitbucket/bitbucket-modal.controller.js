module.exports =
  angular
    .module('plugins.bitbucket.modal', [
      'plugins.bitbucket.service'
    ])
    .controller('BitbucketModal', function ($modalInstance, bitbucketService) {
      const setFile = () => {
        return $modalInstance.close()
      }

      const closeModal = () => {
        return $modalInstance.dismiss('cancel')
      }

      const setRepos = () => {
        vm.step = 2
        vm.lastStep = vm.step
        vm.title = 'Repositories'
        vm.pagination = bitbucketService.config.pagination

        if (String(vm.pagination) === 'null') {
          vm.totalItems = 1 * vm.itemsPerPage
        } else {
          vm.totalItems = vm.pagination.last.page * vm.itemsPerPage
        }

        vm.repos = bitbucketService.config.repos.sort((a, b) => {
          if (a.name < b.name) {
            return -1
          } else if (a.name > b.name) {
            return 1
          } else {
            return 0
          }
        })

        return vm.repos
      }

      const fetchRepos = (name) => {
        if (vm.lastStep !== 2) {
          vm.currentPage = 1
        }
        if (name) {
          vm.org_name = name
        }
        bitbucketService.fetchRepos(
          vm.org_name, vm.currentPage, vm.itemsPerPage
        ).then(setRepos)

        return false
      }

      const setBranches = () => {
        vm.step = 3
        vm.lastStep = vm.step
        vm.title = 'Branches'
        vm.branches = bitbucketService.config.branches
        vm.pagination = bitbucketService.config.pagination

        if (String(vm.pagination) === 'null') {
          vm.totalItems = 1 * vm.itemsPerPage
        } else {
          vm.totalItems = vm.pagination.last.page * vm.itemsPerPage
        }

        vm.repos = bitbucketService.config.branches.sort((a, b) => {
          if (a.name < b.name) {
            return -1
          } else if (a.name > b.name) {
            return 1
          } else {
            return 0
          }
        })

        return vm.branches
      }

      const fetchBranches = (name) => {
        if (vm.lastStep !== 3) {
          vm.currentPage = 1
        }
        if (name) {
          vm.branch_name = name
        }
        bitbucketService.config.current.branch = name
        bitbucketService.fetchBranches(
          vm.branch_name, vm.org_name, vm.currentPage, vm.itemsPerPage
        ).then(setBranches)

        return false
      }

      const setTreeFiles = () => {
        vm.step = 4
        vm.lastStep = vm.step
        vm.title = 'Files'
        vm.files = bitbucketService.config.files
        /* Set totalItems to 1 for now until it's determined that pagination is even required... in which case it must be handled differently because the
     * underlying Bitbucket API is 1.0 not 2.0 (not available) for file listing.
     */
        vm.totalItems = 1

        return vm.files
      }

      const fetchTreeFiles = (sha, branch) => {
        if (vm.lastStep !== 4) {
          vm.currentPage = 1
        }
        bitbucketService.config.current.sha = sha
        bitbucketService.config.current.branch = branch
        bitbucketService.fetchTreeFiles(sha).then(setTreeFiles)

        return false
      }

      const fetchFile = (url, path) => {
        bitbucketService.config.current.fileName = path.split('/').pop()
        bitbucketService.config.current.path = path
        bitbucketService.fetchFile(url).then(setFile)

        return false
      }

      var vm = this

      vm.title = 'Organizations'
      vm.orgs = bitbucketService.config.orgs
      vm.step = 1
      vm.lastStep = null

      vm.fetchRepos = fetchRepos
      vm.fetchBranches = fetchBranches
      vm.fetchTreeFiles = fetchTreeFiles
      vm.fetchFile = fetchFile
      vm.close = closeModal

      vm.itemsPerPage = 10
      vm.currentPage = 1
      vm.repos = []
      vm.org_name = null
      vm.branch_name = null

      /// ///////////////////////////

      vm.onPageChange = (step) => {
        switch (step) {
          case 2: vm.fetchRepos(null); break
          case 3: vm.fetchBranches(null); break
        }
      }
    })
