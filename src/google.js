(function($) {

  // TODO Consider taking the client id
  App.Drive = function() {
    this.init();
  };

  App.Drive.instance = undefined;

  App.Drive.getInstance = function() {
    if (App.Drive.instance === undefined) {
      App.Drive.instance = new App.Drive();
    }
    return App.Drive.instance;
  };

  jQuery.extend(App.Drive.prototype, {
        
      init: function() {
        var self = this;
      },

      update: function() {
        var self = this;

        // TODO This should be a state engine which guarantees we only fetch
        // the SDK once even if update is called multiple times.

        // Fetch the Google Drive client configuration if we're online.
        // This effectively kicks off the Google SDK load and the update to the
        // game library.
        if (navigator.onLine) {
          jQuery.getJSON("settings.json", function(data) {
            self.clientID = data["client_id"];
            self.scopes = data["scopes"];
            self.loadSDK();
          });
        }
      },

      loadSDK: function() {
        var self = this;

        // Load the Google SDK
        // This will call the function handleClientLoad when complete.
        (function(d){
           var js, id = 'google-sdk', ref = d.getElementsByTagName('script')[0];
           if (d.getElementById(id)) {return;}
           js = d.createElement('script'); js.id = id; js.async = true;
           js.src = "https://apis.google.com/js/client.js?onload=handleClientLoad";
           ref.parentNode.insertBefore(js, ref);
         }(document));

      },

      loadComplete: function() {
        var self = this;
        setTimeout(function() {
          gapi.auth.authorize(
            {
              'client_id': self.clientID,
              'scope': self.scopes,
              'immediate': true
            },
            self.handleAuthenticationResult);
        }, 0);
      },

      handleAuthenticationResult: function(authResult) {
        var self = this;

        // TODO This should change state...
        var authButton = document.getElementById('authorizeButton');
        authButton.style.display = 'none';
        if (authResult && !authResult.error) {
          // Access token has been successfully retrieved, requests can be sent to the API.
        } else {
          // No access token could be retrieved, show the button to start the authorization flow.
          authButton.style.display = 'block';
          authButton.onclick = function() {
              gapi.auth.authorize(
                {
                  'client_id': self.clientID,
                  'scope': self.scopes,
                  'immediate': false
                },
                handleAuthResult);
          };
        }

      },

  });

})(jQuery);

// Called when the client library is loaded to start the auth flow.
function handleClientLoad() {
  App.Drive.getInstance().loadComplete();
}

/**
 * Download a file's content.
 *
 * @param {File} file Drive File instance.
 * @param {Function} callback Function to call when the request is complete.
 */
function downloadFile(file, callback) {
  if (file.downloadUrl) {
    var accessToken = gapi.auth.getToken().access_token;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', file.downloadUrl);
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.overrideMimeType('text/plain; charset=x-user-defined');
    xhr.onload = function() {
      callback(xhr.responseText);
    };
    xhr.onerror = function() {
      callback(null);
    };
    xhr.send();
  } else {
    callback(null);
  }
}


/**
 * Retrieve a list of File resources.
 *
 * @param {Function} callback Function to call when the request is complete.
 */
function retrieveAllFiles(callback) {
  try {
    var retrievePageOfFiles = function(request, result) {
      request.execute(function(resp) {
        result = result.concat(resp.items);
        var nextPageToken = resp.nextPageToken;
        if (nextPageToken) {
          request = gapi.client.request({
            'path': '/drive/v2/files',
            'method': 'GET',
            'params': {'maxResults': '100', 'pageToken': nextPageToken}
          });
          retrievePageOfFiles(request, result);
        } else {
          callback(result);
        }
      });
    }
    var initialRequest = gapi.client.request({
      'path': '/drive/v2/files',
      'method': 'GET',
      'params': {'maxResults': '100'}
    });
    retrievePageOfFiles(initialRequest, []);
  } catch (error) {
    callback();
  }
}
