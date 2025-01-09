import * as fs from 'fs';
import * as vm from 'vm';

var script = new vm.Script(fs.readFileSync('output/sample.js', 'utf8'));
script.runInThisContext();

var main = new Buildsys();

console.log(main);

