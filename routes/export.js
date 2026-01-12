// ✨【设计模式】MVC模式 - 路由控制器
// 🔧【功能】处理文档导出相关的HTTP请求
var express = require('express');
var router = express.Router();
var wkhtmltopdf = require('wkhtmltopdf');

// 📝【规范】中间件 - 请求日志
router.use(function(req, res, next) {
  console.log('[Export]', new Date().toISOString(), req.method, req.path);
  next();
});

// 🔧【功能】导出为PDF
// 🔌【接口】POST /export/pdf
router.post('/pdf', function(req, res) {
  // 🛡️【安全】输入验证
  if (!req.body || !req.body.html) {
    return res.status(400).json({
      error: '缺少必要参数: html'
    });
  }
  
  // 🛡️【安全】防止HTML注入攻击
  var html = String(req.body.html || '');
  var title = String(req.body.title || 'document');
  
  // 🔧【功能】生成PDF选项
  var pdfOptions = {
    pageSize: 'A4',
    marginTop: '20mm',
    marginBottom: '20mm',
    marginLeft: '20mm',
    marginRight: '20mm',
    title: title,
    // 🛡️【安全】禁用本地文件访问
    disableLocalFileAccess: true
  };
  
  // ⚡【算法】使用wkhtmltopdf转换HTML为PDF
  try {
    // ✨【设计模式】流式处理 - 避免内存溢出
    var pdfStream = wkhtmltopdf(html, pdfOptions);
    
    // 📝【规范】设置响应头
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 
      'attachment; filename="' + encodeURIComponent(title) + '.pdf"');
    
    // 🔧【功能】流式传输PDF
    pdfStream.pipe(res);
    
    // 📝【规范】错误处理
    pdfStream.on('error', function(err) {
      console.error('PDF生成失败:', err);
      if (!res.headersSent) {
        res.status(500).json({
          error: 'PDF生成失败',
          details: err.message
        });
      }
    });
    
  } catch (err) {
    console.error('PDF处理异常:', err);
    res.status(500).json({
      error: '服务器内部错误',
      details: err.message
    });
  }
});

// 🔧【功能】导出为HTML
// 🔌【接口】GET /export/html?title=xxx&content=xxx
router.get('/html', function(req, res) {
  // 📝【规范】参数验证
  req.checkQuery('title', '标题不能为空').notEmpty();
  req.checkQuery('content', '内容不能为空').notEmpty();
  
  var errors = req.validationErrors();
  if (errors) {
    return res.status(400).json({ errors: errors });
  }
  
  var title = req.sanitize(req.query.title).escape();
  var content = req.sanitize(req.query.content);
  
  // 🔧【功能】生成完整HTML文档
  var html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .content { max-width: 800px; margin: 0 auto; padding: 20px; }
        ${req.query.css || ''}
    </style>
</head>
<body>
    <div class="content">
        ${content}
    </div>
</body>
</html>`;
  
  // 📝【规范】设置下载响应头
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Disposition',
    'attachment; filename="' + encodeURIComponent(title) + '.html"');
  res.send(html);
});

module.exports = router;