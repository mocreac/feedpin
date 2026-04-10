(function () {
  var toggle = document.getElementById('toggle');
  var siteEl = document.getElementById('site');
  var row = document.querySelector('.row');
  var hostname = '';

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var tab = tabs[0];
    if (!tab || !tab.url || !/^https?:/.test(tab.url)) {
      siteEl.textContent = 'Not available on this page';
      row.classList.add('unavailable');
      toggle.checked = false;
      return;
    }

    hostname = new URL(tab.url).hostname;
    siteEl.textContent = hostname;

    chrome.storage.local.get('disabledHosts', function (data) {
      var disabled = data.disabledHosts || [];
      toggle.checked = disabled.indexOf(hostname) === -1;
    });
  });

  toggle.addEventListener('change', function () {
    if (!hostname) return;
    var enabled = toggle.checked;

    chrome.storage.local.get('disabledHosts', function (data) {
      var disabled = data.disabledHosts || [];
      var idx = disabled.indexOf(hostname);

      if (enabled && idx !== -1) disabled.splice(idx, 1);
      else if (!enabled && idx === -1) disabled.push(hostname);

      chrome.storage.local.set({ disabledHosts: disabled }, function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
              type: 'feedpin-toggle',
              enabled: enabled,
            });
          }
        });
      });
    });
  });
})();
