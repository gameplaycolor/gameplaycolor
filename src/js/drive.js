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
    UNKNOWN: 0,
    UNAUTHORIZED: 1,
    AUTHORIZED: 2,
  };

  App.Drive.DOMAIN = "drive";

  App.Drive.Property = {
    TOKEN: 0
  };

  App.Drive.Instance = function() {
    if (window.drive === undefined) {
      window.drive = new App.Drive();
    }
    return window.drive;
  };

  jQuery.extend(App.Drive.prototype, {
        
      init: function(store) {
        var self = this;
        self.state = App.Drive.State.UNINITIALIZED;
        self.stateChangeCallbacks = [];
        self.logging = new App.Logging(App.Logging.Level.INFO, "drive");
        self.requestId = 0;

        self.store = new App.Store('com.gameplaycolor.drive');
        if (!self.store.open()) {
          alert("Unable to create database.\nPlease accept increased storage size when asked.");
          return;
        }
      },

      onStateChange: function(callback) {
        var self = this;
        self.stateChangeCallbacks.push(callback);
      },

      setState: function(state) {
        var self = this;

        if (self.state == state) {
          return;
        }

        self.state = state;

        for (var i = 0; i < self.stateChangeCallbacks.length; i++) {
          self.stateChangeCallbacks[i](state);
        }
      },

      scheduleOperation: function(operation) {
        var self = this;
        operation();
      },

      signOut: function() {
        var self = this;

        var deferred = jQuery.Deferred();
        self.track("signOut", deferred.promise());

        deferred.promise().then(function() {
          self.store.deleteProperty(App.Drive.DOMAIN, App.Drive.Property.TOKEN);
          self.setState(App.Drive.State.UNAUTHORIZED);
        });

        self.token().then(function(token) {

          $.ajax({
            type: 'GET',
            url: 'https://accounts.google.com/o/oauth2/revoke?token=' + token,
            async: false, // TODO Not neccessary?
            contentType: "application/json",
            dataType: 'jsonp',
            success: function(nullResponse) {
              deferred.resolve();
            },
            error: function(e) {
              deferred.reject(e);
            }
          });

        }).fail(function(e) {

          deferred.reject(e);

        });

        return deferred.promise();
      },

      loadSettings: function() {
        var self = this;

        if (self.settings) {
          return self.settings.promise();
        }

        var deferred = new jQuery.Deferred();
        self.track("loadSettings", deferred.promise());

        deferred.promise().fail(function(e) {
          self.settings = undefined;
        });

        self.settings = deferred;
        if (navigator.onLine) {
          jQuery.getJSON("settings.json", function(settings) {
            deferred.resolve(settings);
          }).fail(function() {
            deferred.reject();
          });
        } else {
          deferred.reject();
        }

        return deferred.promise();
      },

      didLoadSDK: function() {
        var self = this;
        self.logging.info("Google Drive SDK loaded");
        self.sdk.resolve();
      },

      signIn: function() {
        var self = this;

        self.logging.info("Signing in to Google Drive");
        self.authURL().then(function(url) {

          self.logging.info("Navigating to " + url);
          window.open(url, "_blank");

        });
      },

      authURL: function() {
        var self = this;

        var deferred = jQuery.Deferred();
        self.track("authURL", deferred.promise());

        self.loadSettings().then(function(settings) {

          var url = 'https://accounts.google.com/o/oauth2/auth' +
                    '?redirect_uri=' + encodeURIComponent(settings.redirect_uri) +
                    '&response_type=code' +
                    '&client_id=' + settings.client_id +
                    '&scope=' + settings.scopes.join(" ");
          deferred.resolve(url);

        }).fail(function() {

          deferred.reject();

        });

        return deferred.promise();
      },

      user: function() {
        var self = this;

        var deferred = jQuery.Deferred();
        self.track("user", deferred.promise());

        self.token().then(function(token) {

          $.ajax({
            url: "https://www.googleapis.com/oauth2/v1/userinfo",
            type: "GET",
            data: {
              "access_token": token
            },
            success: function(user, textStatus, jqXHR) {
              deferred.resolve(user);
            },
            error: function(jqXHR, textStatus, error) {
              deferred.reject(error);
            }
          });

        }).fail(function(e) {
          deferred.reject(e);
        });

        return deferred.promise();
      },

      nextRequestId: function() {
        var self = this;
        self.requestId++;
        return self.requestId;
      },

      log: function(requestId, message) {
        var self = this;
        self.logging.info("[" + requestId + "] " + message);
      },

      track: function(description, promise) {
        var self = this;
        var requestId = self.nextRequestId();
        self.log(requestId, description);
        promise.then(function() {
          self.log(requestId, description + " -> SUCCESS");
        }).fail(function(e) {
          self.log(requestId, description + " -> FAIL " + e);
        });
      },

      token: function() {
        var self = this;
        var deferred = jQuery.Deferred();
        self.store.property(App.Drive.DOMAIN, App.Drive.Property.TOKEN, function(token) {
          if (token) {
            deferred.resolve(token);
          } else {
            deferred.reject();
          }
        });
        return deferred.promise();
      },

      authorize: function() {
        var self = this;

        if (self.deferredAuthentication !== undefined) {
          return self.deferredAuthentication.promise();
        }

        var deferred = jQuery.Deferred();
        self.track("authorize", deferred.promise());

        deferred.promise().then(function() {
          self.setState(App.Drive.State.AUTHORIZED);
        }).fail(function(e) {
          self.deferredAuthentication = undefined;
          self.setState(App.Drive.State.UNAUTHORIZED);
        });

        self.deferredAuthentication = deferred;
        self.token().then(function(token) {
          deferred.resolve();
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

      redeemTokenV3: function(code) {
        var self = this;

        var deferred = jQuery.Deferred();
        self.track("redeemTokenV3", deferred.promise());

        self.loadSettings().then(function(settings) {

          $.ajax({
            url: "https://www.googleapis.com/oauth2/v3/token",
            type: "POST",
            data: {
              "code": code,
              "client_id": settings.client_id,
              "client_secret": settings.client_secret,
              "redirect_uri": settings.redirect_uri,
              "grant_type": "authorization_code",
              "state": "100000"
            },
            success: function(token, textStatus, jqXHR) {

              console.log(token);
              self.store.setProperty(App.Drive.DOMAIN, App.Drive.Property.TOKEN, token.access_token);

              var date = new Date();
              date.setTime(date.getTime()+(10*24*60*60*1000));
              document.cookie = 'access_token=' + token.access_token + '; expires=' + date.toGMTString() + '; path=/';

              deferred.resolve();

            },
            error: function(jqXHR, textStatus, error) {

              deferred.reject(error);

            }
          });

        }).fail(function() {

          deferred.reject();

        });

        return deferred.promise();

      },

      file: function(parent, title) {
        var self = this;

        var deferred = jQuery.Deferred();
        self.track("file", deferred.promise());

        self.scheduleOperation(function() {
          self.token().then(function(token) {
            $.ajax({
              url: "https://www.googleapis.com/drive/v2/files",
              type: "GET",
              data: {
                'maxResults': '1',
                'q': "trashed = false and '" + parent + "' in parents and title = '" + title.replace("'", "\\'") + "'",
                "access_token": token
              },
              success: function(result, textStatus, jqXHR) {
                if (result.items.length > 0) {
                  deferred.resolve(result.items[0]);
                } else {
                  deferred.reject();
                }
              },
              error: function(jqXHR, textStatus, error) {
                deferred.reject(error);
              }
            });
          }).fail(function(error) {
            deferred.reject(error);
          });
        });
        return deferred.promise();
      },

      files: function() {
        var self = this;

        var deferred = jQuery.Deferred();
        self.track("files", deferred.promise());

        self.scheduleOperation(function() {
          self.token().then(function(token) {

            var files = [];

            var retrievePageOfFiles = function(nextPageToken) {

              var params = {
                'maxResults': '100',
                  'q': "(fullText contains '*.gb' or fullText contains '*.gbc') and trashed = false and mimeType = 'application/octet-stream'",
                  "access_token": token
              };

              if (nextPageToken) {
                params["pageToken"] = nextPageToken;
              }

              $.ajax({
                url: "https://www.googleapis.com/drive/v2/files",
                type: "GET",
                data: params,
                success: function(result, textStatus, jqXHR) {

                  files = files.concat(result.items);
                  if (result.nextPageToken) {
                    retrievePageOfFiles(result.nextPageToken);
                  } else {
                    deferred.resolve(files);
                  }

                },
                error: function(jqXHR, textStatus, error) {
                  deferred.reject(error);
                }
              });

            };

            retrievePageOfFiles();

          }).fail(function(error) {
            deferred.reject(error);
          });

        });

        return deferred.promise();
      },

      downloadFileBase64: function(file, callback) {
        var self = this;
        self.token().then(function(token) {

          if (file.downloadUrl) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', file.downloadUrl);
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
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

        }).fail(function() {

          callback(null);

        });
      },

      downloadFile: function(file) {
        var self = this;

        var deferred = jQuery.Deferred();
        self.track("downloadFile", deferred.promise());

        if (file === undefined) {
          deferred.reject();
          return deferred.promise();
        }

        self.token().then(function(token) {

          if (file.downloadUrl) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', file.downloadUrl);
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            xhr.overrideMimeType('text/plain; charset=x-user-defined');
            xhr.onload = function() {
              deferred.resolve(xhr.responseText);
            };
            xhr.onerror = function() {
              deferred.reject();
            };
            xhr.send();
          } else {
            deferred.reject();
          }

        }).fail(function(e) {
          deferred.reject(e);
        });

        return deferred.promise();
      }


  });

})(jQuery);
