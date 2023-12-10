import fs from 'fs';
import path from 'path';

const lsList = fs.readdirSync(path.resolve(__dirname + '../../../data/ls/dirs/'));

// (() => {
//   const id = 'wb6H7eglKyiTuQ';
//   console.log(id);
// })();

export default {
  list: lsList,
  get(filename: string) {
    if (filename.includes('./') || filename.includes('.\\')) {
      throw 'cannot read directory'
    }
    return JSON.parse(
      fs.readFileSync(path.resolve(__dirname + `../../../data/ls/dirs/${filename}`), 'utf8')
    )
  }
}