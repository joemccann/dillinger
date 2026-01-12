// ✨【设计模式】MVC模式 - Controller层
// 🔧【功能】Dillinger应用主控制器，负责协调视图和模型
angular.module('dillinger').controller('DillingerCtrl', [
    '$scope', '$timeout', '$modal', 'Storage', 'Markdown', 'Dropbox', 'Github',
    function($scope, $timeout, $modal, Storage, Markdown, Dropbox, Github) {
      
      // ✨【设计模式】观察者模式 - $scope变量监控
      // 🔧【功能】监控markdown内容变化，触发实时预览
      $scope.$watch('currentDoc.text', function(newVal, oldVal) {
        if (newVal !== oldVal) {
          // ⚡【性能】使用$timeout防抖，避免频繁渲染
          $timeout.cancel($scope.previewTimeout);
          $scope.previewTimeout = $timeout(function() {
            // 🚀【性能】异步更新预览，避免阻塞主线程
            updatePreview();
          }, 150);
        }
      });
      
      // 🔧【功能】初始化文档
      $scope.init = function() {
        // 📝【规范】使用严格相等判断
        if ($scope.currentDoc === null || $scope.currentDoc === undefined) {
          // 🔧【功能】创建默认文档结构
          $scope.currentDoc = {
            title: 'Untitled',
            text: '# Welcome to Dillinger\n\nA simple Markdown editor.',
            html: '',
            created: new Date()
          };
        }
        // 🔌【接口】调用Storage服务保存
        Storage.save($scope.currentDoc);
      };
      
      // 🔧【功能】更新Markdown预览
      function updatePreview() {
        if (!$scope.currentDoc || !$scope.currentDoc.text) return;
        
        // ⚡【算法】使用marked.js转换Markdown
        // 📝【规范】错误处理使用try-catch
        try {
          $scope.currentDoc.html = Markdown.convert($scope.currentDoc.text);
        } catch (e) {
          console.error('Markdown转换错误:', e);
          $scope.currentDoc.html = '<p class="error">转换失败: ' + e.message + '</p>';
        }
        
        // 🚀【性能】触发Angular脏检查
        $scope.$apply();
      }
      
      // 🔧【功能】导出文档
      $scope.exportDocument = function(format) {
        // ✨【设计模式】策略模式 - 根据格式选择导出策略
        var exportStrategies = {
          'pdf': exportToPDF,
          'html': exportToHTML,
          'md': exportToMarkdown
        };
        
        if (exportStrategies[format]) {
          exportStrategies[format]();
        } else {
          console.warn('不支持的导出格式:', format);
        }
      };
      
      // 🔧【功能】导出为PDF
      function exportToPDF() {
        // 🔌【接口】调用后端PDF生成接口
        $http.post('/export/pdf', {
          html: $scope.currentDoc.html,
          title: $scope.currentDoc.title
        }).then(function(response) {
          // 🔧【功能】下载文件
          downloadFile(response.data, 'application/pdf');
        }).catch(function(error) {
          // 📝【规范】统一错误处理
          showError('PDF导出失败', error);
        });
      }
    }
  ]);