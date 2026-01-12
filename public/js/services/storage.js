// ✨【设计模式】工厂模式 - 创建Storage服务实例
// 🔧【功能】统一数据存储管理，支持本地和云端存储
angular.module('dillinger').factory('Storage', [
    '$window', '$q', 'Dropbox', 'Github',
    function($window, $q, Dropbox, Github) {
      
      // ✨【设计模式】单例模式 - 全局存储实例
      var storageInstance = null;
      
      // 📝【规范】私有方法以下划线开头
      var _getLocalStorageKey = function(docId) {
        return 'dillinger-doc-' + (docId || 'default');
      };
      
      // 🔧【功能】保存文档到本地存储
      var _saveToLocal = function(doc) {
        // 🛡️【安全】数据序列化前验证
        if (!doc || typeof doc !== 'object') {
          return $q.reject(new Error('无效的文档数据'));
        }
        
        // 📝【规范】添加时间戳和版本
        doc.updated = new Date();
        doc.version = doc.version ? doc.version + 1 : 1;
        
        try {
          // 🔧【功能】使用localStorage持久化
          var key = _getLocalStorageKey(doc.id);
          var data = JSON.stringify(doc);
          $window.localStorage.setItem(key, data);
          
          return $q.resolve({
            success: true,
            message: '保存成功',
            timestamp: doc.updated
          });
        } catch (e) {
          // 🛡️【安全】处理localStorage配额溢出
          if (e.name === 'QuotaExceededError') {
            return $q.reject(new Error('存储空间不足，请清理缓存'));
          }
          return $q.reject(e);
        }
      };
      
      // 🔧【功能】从本地存储加载文档
      var _loadFromLocal = function(docId) {
        return $q(function(resolve, reject) {
          try {
            var key = _getLocalStorageKey(docId);
            var data = $window.localStorage.getItem(key);
            
            if (!data) {
              return reject(new Error('文档不存在'));
            }
            
            // 🛡️【安全】JSON解析异常处理
            var doc = JSON.parse(data);
            
            // 📝【规范】数据验证
            if (!doc.text || !doc.title) {
              return reject(new Error('文档数据不完整'));
            }
            
            resolve(doc);
          } catch (e) {
            reject(new Error('加载失败: ' + e.message));
          }
        });
      };
      
      // ✨【设计模式】外观模式 - 统一存储接口
      return {
        // 🔧【功能】保存文档（自动选择存储位置）
        save: function(doc, options) {
          options = options || {};
          
          // ✨【设计模式】责任链模式 - 依次尝试不同存储
          var saveChain = [_saveToLocal(doc)];
          
          // 如果配置了云端存储，添加到责任链
          if (options.saveToCloud) {
            if (options.provider === 'dropbox') {
              saveChain.push(Dropbox.save(doc));
            } else if (options.provider === 'github') {
              saveChain.push(Github.save(doc));
            }
          }
          
          // ⚡【算法】并行执行保存操作
          return $q.all(saveChain)
            .then(function(results) {
              // 🔧【功能】合并保存结果
              return {
                local: results[0],
                cloud: results[1],
                timestamp: new Date()
              };
            })
            .catch(function(error) {
              // 📝【规范】部分失败时的优雅处理
              console.warn('部分保存失败:', error);
              return {
                success: false,
                error: error,
                message: '保存过程中出现错误'
              };
            });
        },
        
        // 🔧【功能】加载文档
        load: function(docId, options) {
          // ✨【设计模式】策略模式 - 根据来源选择加载策略
          var loadStrategy = options && options.fromCloud 
            ? (options.provider === 'dropbox' ? Dropbox.load : Github.load)
            : _loadFromLocal;
            
          return loadStrategy(docId)
            .then(function(doc) {
              // 📝【规范】数据格式化
              if (!doc.created) doc.created = new Date();
              return doc;
            });
        },
        
        // 🔧【功能】列出所有本地文档
        listLocal: function() {
          return $q(function(resolve) {
            var docs = [];
            var prefix = 'dillinger-doc-';
            
            // ⚡【算法】遍历localStorage获取所有文档
            for (var i = 0; i < $window.localStorage.length; i++) {
              var key = $window.localStorage.key(i);
              if (key.startsWith(prefix)) {
                try {
                  var doc = JSON.parse($window.localStorage.getItem(key));
                  docs.push({
                    id: key.replace(prefix, ''),
                    title: doc.title,
                    created: doc.created,
                    updated: doc.updated
                  });
                } catch (e) {
                  console.error('解析文档失败:', key, e);
                }
              }
            }
            
            // 📝【规范】按修改时间排序
            docs.sort(function(a, b) {
              return new Date(b.updated) - new Date(a.updated);
            });
            
            resolve(docs);
          });
        }
      };
    }
  ]);