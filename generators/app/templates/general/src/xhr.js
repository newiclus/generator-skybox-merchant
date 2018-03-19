const _ = require('underscore');
//Js para la comunicacion con Servicios.
module.exports = {
  get: function (url) {
    return new Promise(function (resolve, reject) {
      var req = new XMLHttpRequest();
      req.open('GET', url);

      req.onload = function () {
        if (req.status == 200) {
          //console.log(req.response);
          resolve(req);
        }
        else {
          try{
            reject(403);
          }
          catch(error){
            reject(Error('Error:: '+ url));
          }
        }
      };

      req.onerror = function () {
        reject(Error("Network Error"));
      };

      req.send();
    });
  },

  getH: function (url, header) {
    return new Promise(function (resolve, reject) {
      var req = new XMLHttpRequest();
      req.open('GET', url);
      
      if (_.isObject(header)) {
        let i = 0;
        _.keys(header).forEach(function(element)  {
          req.setRequestHeader(element, _.values(header)[i]);
          i++;
        });
      } else {
        req.setRequestHeader("Content-type", "application/json");
      }

      req.onload = function () {
        if (req.status == 200) {
          //console.log(req.response);
          resolve(req.response);
        }
        else if(req.status == 401){
            //token 
            reject(401);
        }
        else {
          //console.log(req.statusText);
          reject(Error(req.response));
        }
      };

      req.onerror = function () {
        reject(Error("Network Error"));
      }; 
      req.send();
    });
  },

  post: function (url, parametro, header) {
    return new Promise(function (resolve, reject) {
      var req = new XMLHttpRequest();
      req.open('POST', url, true);
      if (_.isObject(header)) {
        let i = 0;
        _.keys(header).forEach(function(element) {
          req.setRequestHeader(element, _.values(header)[i]);
          i++;
        });
      } else {
        req.setRequestHeader("Content-type", "application/json");
      }

      req.onload = function () {
        if (req.status == 200) {
          //console.log(req.response);
          resolve(req);
        }
        else if(req.status == 401){
          //token 
          reject(401);
        }
        else {
          //console.log(req.statusText);
          reject(Error(req.response));
        }
      };

      req.onerror = function () {
        reject(Error("Network Error"));
      };

      req.send(JSON.stringify(parametro));
    });
  },

  delete: function (url, header) {
    return new Promise(function (resolve, reject) {
      var req = new XMLHttpRequest();
      req.open('DELETE', url, true);
      if (_.isObject(header)) {
        let i = 0;
        _.keys(header).forEach(function(element) {
          req.setRequestHeader(element, _.values(header)[i]);
          i++;
        });
      } else {
        req.setRequestHeader("Content-type", "application/json");
      }

      req.onload = function () {
        if (req.status == 200) {
          //console.log(req.response);
          resolve(req);
        }
        else {
          //console.log(req.statusText);
          reject(Error(req.response));
        }
      };

      req.onerror = function () {
        reject(Error("Network Error"));
      };

      req.send(null);
    });
  },

  put: function (url, parametro, header) {
    return new Promise(function (resolve, reject) {
      var req = new XMLHttpRequest();
      req.open('PUT', url, true);
      if (_.isObject(header)) {
        let i = 0;
        _.keys(header).forEach(function(element) {
          req.setRequestHeader(element, _.values(header)[i]);
          i++;
        });
      } else {
        req.setRequestHeader("Content-type", "application/json");
      }

      req.onload = function () {
        if (req.status == 200 || req.status == 204) {
          //console.log(req.response);
          resolve(req);
        }
        else {
          //console.log(req.statusText);
          reject(Error(req.response));
        }
      };

      req.onerror = function () {
        reject(Error("Network Error"));
      };

      req.send(JSON.stringify(parametro));
    });
  }
};