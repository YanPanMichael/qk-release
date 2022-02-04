#!/usr/bin/env node

// const { exec } = require('process')
// exec('node ./src/release.js --skipBuild', (err, stdout, stderr) => {
//   if (err) {
//     // node couldn't execute the command
//     console.log('err', err)
//     return;
//   }
//   // the *entire* stdout and stderr (buffered)
//   console.log(`stdout: ${stdout}`);
//   console.log(`stderr: ${stderr}`);
// });
require('../lib/release.js')