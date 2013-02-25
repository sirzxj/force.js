(function(window, document, undefined) {
  "use strict";

  var head = document.getElementsByTagName('head')[0];
  var modules = {};
  var injects = {};
  var callbacks = {};
  var anonymous = 0;

  var registerModule = function(id, callback, args) {
    var key, i, l, deps;
    if(!modules[id]) {
      modules[id] = callback.apply(null, args);
      delete(callbacks[id]);
    }
    loop: for(key in callbacks) {
      deps = [];
      for(i = 2, l = callbacks[key].length; i < l; i++) {
        if(modules[callbacks[key][i]]) {
          deps.push(modules[callbacks[key][i]]);
        } else {
          continue loop;
        }
      }
      if(callbacks[key][0]) {
        registerModule(key, callbacks[key][1], deps);
      } else {
        callbacks[key][1].apply(null, deps);
        delete(callbacks[key]);
      }
    }
  };

  var injectModule = function(id) {
    var node;
    if(!injects[id]) {
      node = document.createElement('script');
      node.type = 'text/javascript';
      node.async = 'true';
      node.src = id + '.js';
      node.onload = function() {
        head.removeChild(node);
      };
      injects[id] = true;
      head.appendChild(node);
    }
  };

  var defineModule = function(id, dependencies, callback) {
    var i, l = dependencies.length;
    for(i = 0; i < l; i++) {
      if(!modules[dependencies[i]]) {
        callbacks[id] = [true, callback].concat(dependencies);
        for(i = 0; i < l; i++) {
          injectModule(dependencies[i]);
        }
        return;
      }
    }
    registerModule(id, callback, []);
  };

  var requireModule = function(dependencies, callback) {
    var id, i, l = dependencies.length;
    for(i = 0; i < l; i++) {
      if(!modules[dependencies[i]]) {
        id = 'require/' + (anonymous++);
        callbacks[id] = [false, callback].concat(dependencies);
        for(i = 0; i < l; i++) {
          injectModule(dependencies[i]);
        }
        return;
      }
    }
    callback();
  };

  var init = function() {
    var config = document.createElement('script');
    window.define = defineModule;
    window.require = requireModule;
    config.type = 'text/javascript';
    config.async = 'true';
    config.src = document.getElementsByTagName('script')[0].getAttribute('data-main') + '.js';
    config.onload = function() {
      head.removeChild(config);
    };
    head.appendChild(config);
  };

  init();

})(window, document);