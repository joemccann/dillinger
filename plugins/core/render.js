var page = require('webpage').create();
var system = require('system');
var address, output;

if (system.args.length == 3) {
  address = system.args[1];
  output = system.args[2];
  page.viewportSize = { width: 1024, height: 768 };
  page.paperSize = { format: 'A4', orientation: 'portrait', margin: '1cm' };

  page.open(address, function (status) {
    if (status !== 'success') {
      console.log('Unable to load the address!');
      phantom.exit();
    } else {
      window.setTimeout(function () {
        page.render(output);
        phantom.exit();
      }, 200);
    }
  });
} else {
  phantom.exit(1);
}