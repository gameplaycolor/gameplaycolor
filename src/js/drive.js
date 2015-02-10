/*
 * Copyright (C) 2012-2015 InSeven Limited.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
 
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

  App.Drive.QUERY = "(fullText contains '*.gb' or fullText contains '*.gbc') and trashed = false and mimeType = 'application/octet-stream'";

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

      run: function(operation) {
        var self = this;
        self.queue.push(operation);
        self.processQueue();
      },

      processQueue: function() {
        var self = this;
        while (self.queue.length > 0) {
          var operation = self.queue.shift();
          self.authorize().always(function() {
            operation();
          });
        }
      },

      loadSDK: function() {
        var self = this;

        if (self.sdk) {
          return self.sdk.promise();
        }

        var deferred = new jQuery.Deferred();
        self.sdk = deferred;

        if (navigator.onLine) {
          jQuery.getJSON("settings.json", function(data) {
            self.clientID = data["client_id"];
            self.scopes = data["scopes"];
            self.clientSecret = data["client_secret"];
            self.redirectURI = data["redirect_uri"];
            (function(d){
               var js, id = 'google-sdk', ref = d.getElementsByTagName('script')[0];
               if (d.getElementById(id)) {return;}
               js = d.createElement('script'); js.id = id; js.async = true;
               js.src = "https://apis.google.com/js/client.js?onload=handleClientLoad";
               ref.parentNode.insertBefore(js, ref);
             }(document));
          });
        } else {
          deferred.reject();
        }
        return deferred.promise();
      },

      showAuthenticationFrame: function() {
        var self = this;
        var frame = $('<iframe />', {
          name: 'authFrame',
          id: 'authFrame',
          src: 'authorize.html'
        });
        frame.addClass('authframe');
        frame.appendTo('body');
        frame.load(function() {
          console.log("iFrame Redirected: " + frame.attr("src"));
          var url = document.getElementById("authFrame").contentWindow.href;
        });
      },

      signIn: function() {
        var self = this;
        self.loadSDK().then(function() {
          var href = 'https://accounts.google.com/o/oauth2/auth' +
                        '?redirect_uri=' + encodeURIComponent(self.redirectURI) +
                        '&response_type=code&client_id=' + self.clientID +
                        '&scope=' + self.scopes;
          window.location.href = href;
        }).fail(function() {
          console.log("Unable to navigate to Google sign-in page");
        });
      },

      authorize: function() {
        var self = this;

        if (self.deferredAuthentication !== undefined) {
          return self.deferredAuthentication;
        }

        var deferred = jQuery.Deferred();
        self.deferredAuthentication = deferred;
        self.loadSDK().then(function() {
          console.log("authorize");
          gapi.auth.authorize(
            {
              'client_id': self.clientID,
              'scope': self.scopes,
              'immediate': true
            },
            function(result) {
              if (result && !result.error) {
                deferred.resolve(result);
                self.processQueue();
              } else {
                if (self.deferredAuthentication == deferred) {
                  self.deferredAuthentication = undefined;
                }
                deferred.reject();
              }
            }
          );
        }).fail(function() {
          deferred.reject();
        });
        return deferred.promise();
      },

      getParameters: function() {
        var self = this;

        var url = window.location.href;
        if (url.indexOf('?') === -1) {
          return {};
        }

        var parameters = {};
        var pairs = url.slice(url.indexOf('?') + 1).split('&');
        $.each(pairs, function(index, value) {
          var pair = value.split('=');
          parameters[pair[0]] = pair[1];
        });

        return parameters;

      },

      redeemToken: function(code) {
        var self = this;
        var deferred = $.Deferred();
        self.loadSDK().then(function() {

          $.ajax({
            url: "https://www.googleapis.com/oauth2/v3/token",
            type: "POST",
            data: {
              "code": code,
              "client_id": self.clientID,
              "client_secret": self.clientSecret,
              "redirect_uri": self.redirectURI,
              "grant_type": "authorization_code",
              "state": "100000"
            },
            success: function(data, textStatus, jqXHR) {
              deferred.resolve();
            },
            error: function(jqXHR, textStatus, error) {
              deferred.reject(error);
            }
          });

        });

        return deferred.promise();

      },

      redeemOutstandingTokens: function() {
        var self = this;
        var deferred = $.Deferred();

        var code = self.getParameters().code;
        if (code === undefined) {
          deferred.resolve();
          return deferred.promise();
        }

        self.redeemToken(code).then(function() {
          deferred.resolve();
        }).fail(function(error) {
          deferred.reject(error);
        });

        return deferred.promise();
      },

      checkAuthentication: function() {
        var self = this;

        var deferred = $.Deferred();

        self.redeemOutstandingTokens().then(function() {
          self.authorize().then(function() {
            deferred.resolve();
          }).fail(function() {
            deferred.reject();
          });
        }).fail(function() {
          deferred.reject();
        });

        return deferred.promise();
      },

      // Retrieve single file which matches a given filename in a specific parent container.
      file: function(parent, title, operation) {
        var self = this;
        self.run(function() {
          operation.onStart();

          try {
            var retrievePageOfFiles = function(request) {
              request.execute(function(resp) {
                if (resp.items.length > 0) {
                  operation.onSuccess(resp.items[0]);
                } else {
                  operation.onSuccess(undefined);
                }
              });
            };
            var initialRequest = gapi.client.request({
              'path': '/drive/v2/files',
              'method': 'GET',
              'params': {
                'maxResults': '1',
                'q': "trashed = false and '" + parent + "' in parents and title = '" + title.replace("'", "\\'") + "'"
              }
            });
            retrievePageOfFiles(initialRequest);
          } catch (error) {
            operation.onError(error);
          }

        });
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
  setTimeout(function() {
    App.Drive.getInstance().sdk.resolve();
  }, 0);
}

function downloadFileBase64(file, callback) {
  if (file.downloadUrl) {
    var accessToken = gapi.auth.getToken().access_token;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', file.downloadUrl);
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function(e) {
      var uInt8Array = new Uint8Array(xhr.response);
      var i = uInt8Array.length;
      var binaryString = new Array(i);
      while (i--) {
        binaryString[i] = String.fromCharCode(uInt8Array[i]);
      }
      var data = binaryString.join('');
      var base64 = window.btoa(data);
      callback(base64);
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


