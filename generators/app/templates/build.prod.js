const conf = require('./config/store.json');
const file = require('file-system');
const fs = require('fs');
const readDirFiles = require('read-dir-files');

console.log('Generando BUILD.....');

readDirFiles.list('dist', function (err, filenames) {
  if (err) return console.dir(err);  
  if(filenames[0] === 'dist/'){
    let nameFileOrigin = filenames[1].split('\\')[1];
    file.copyFile('dist/' + nameFileOrigin, 'build/' + nameFileOrigin, {
      done: function(err) {
        console.log('BUILD GENERADO PARA ' + filenames[1].split('\\')[1].split('.')[1].toLocaleUpperCase().trim());
      }
    });
  }
});