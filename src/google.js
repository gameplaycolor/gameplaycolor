(function($) {

  App.Drive = function() {
    this.init();
  };

  App.Drive.State = {
    UNINITIALIZED:  0,
    LOADING_SDK:    1,
    SDK_LOADED:     2,
    AUTHENTICATING: 3,
    UNAUTHORIZED:   4,
    READY:          5
  };

  App.Drive.instance = undefined;

  App.Drive.QUERY = "trashed = false and mimeType = 'application/octet-stream'";

  App.Drive.getInstance = function() {
    if (App.Drive.instance === undefined) {
      App.Drive.instance = new App.Drive();
    }
    return App.Drive.instance;
  };

  jQuery.extend(App.Drive.prototype, {
        
      init: function() {
        var self = this;
        self.state = App.Drive.State.UNINITIALIZED;
        self.queue = [];
        self.stateChangeCallbacks = [];
      },

      onStateChange: function(callback) {
        var self = this;
        self.stateChangeCallbacks.push(callback);
      },

      setState: function(state) {
        var self = this;
        if (self.state != state) {
          self.state = state;

          // Fire the state change callbacks.
          for (var i = 0; i < self.stateChangeCallbacks.length; i++) {
            var callback = self.stateChangeCallbacks[i];
            callback(state);
          }
        }
      },

      // Progresses the state machine through the various
      // authentication steps.
      progress: function() {
        var self = this;

        if (self.state === App.Drive.State.UNINITIALIZED) {
          self.initialize();
        } else if (self.state === App.Drive.State.LOADING_SDK) {
          // Wait for the SDK to load (or fail to load).
        } else if (self.state === App.Drive.State.SDK_LOADED) {
          self.authorize(true);
        } else if (self.state === App.Drive.State.AUTHENTICATING) {
          // Wait for authentication.
        } else if (self.state === App.Drive.State.UNAUTHORIZED) {
          // The user hasn't yet authorized Google Drive.
        } else if (self.state === App.Drive.State.READY) {
          self.processQueue();
        }

      },

      // Execute an operation.
      // This function will ensure the relevant Google SDKs are correctly
      // initialized before executing the operation if required.
      run: function(operation) {
        var self = this;
        self.queue.push(operation);
        self.progress();
      },

      processQueue: function() {
        var self = this;
        while (self.queue.length > 0) {
          var operation = self.queue.shift();
          operation();
        }
      },

      initialize: function() {
        var self = this;

        self.setState(App.Drive.State.LOADING_SDK);

        // Fetch the Google Drive client configuration if we're online.
        // This effectively kicks off the Google SDK load and the update to the
        // game library.
        if (navigator.onLine) {
          jQuery.getJSON("settings.json", function(data) {
            self.clientID = data["client_id"];
            self.scopes = data["scopes"];

            // Load the Google SDK
            // This will call the function handleClientLoad when complete.
            (function(d){
               var js, id = 'google-sdk', ref = d.getElementsByTagName('script')[0];
               if (d.getElementById(id)) {return;}
               js = d.createElement('script'); js.id = id; js.async = true;
               js.src = "https://apis.google.com/js/client.js?onload=handleClientLoad";
               ref.parentNode.insertBefore(js, ref);
             }(document));

          });
        }
      },

      loadComplete: function() {
        var self = this;
        setTimeout(function() {
          self.setState(App.Drive.State.SDK_LOADED);
          self.progress();
        }, 0);
      },

      authorize: function(immediate) {
        var self = this;
        gapi.auth.authorize(
          {
            'client_id': self.clientID,
            'scope': self.scopes,
            'immediate': immediate
          },
          function(result) { self.handleAuthenticationResult(result); }
        );
      },

      handleAuthenticationResult: function(authResult) {
        var self = this;
        self.setState(App.Drive.State.AUTHENTICATING);

        if (authResult && !authResult.error) {

          // Access token has been successfully retrieved, requests can be sent to the API.
          self.setState(App.Drive.State.READY);
          self.processQueue();

        } else {

          // No access token could be retrieved, show the button to start the authorization flow.
          self.setState(App.Drive.State.UNAUTHORIZED);

        }

      },

      /**
       * Retrieve a list of File resources.
       *
       * @param {Function} callback Function to call when the request is complete.
       */
      files: function(operation) {
        var self = this;
        self.run(function() {

          operation.onStart();

          try {
            var retrievePageOfFiles = function(request, result) {
              request.execute(function(resp) {
                result = result.concat(resp.items);
                var nextPageToken = resp.nextPageToken;
                if (nextPageToken) {
                  request = gapi.client.request({
                    'path': '/drive/v2/files',
                    'method': 'GET',
                    'params': {
                      'maxResults': '100',
                      'q': App.Drive.QUERY,
                      'pageToken': nextPageToken
                    }
                  });
                  retrievePageOfFiles(request, result);
                } else {
                  operation.onSuccess(result);
                }
              });
            };
            var initialRequest = gapi.client.request({
              'path': '/drive/v2/files',
              'method': 'GET',
              'params': {
                'maxResults': '100',
                'q': App.Drive.QUERY
              }
            });
            retrievePageOfFiles(initialRequest, []);
          } catch (error) {
            operation.onError(error);
          }

        });
      }

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


