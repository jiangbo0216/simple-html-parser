## tsconfig

outDir tsc编译之后得文件保存路径

sourceMap: true 开启sourceMap, debug的时候可以值映射到对应的ts文件

[esModuleInterop](https://stackoverflow.com/questions/56238356/understanding-esmoduleinterop-in-tsconfig-file)

# Problem statement

Problem occurs when we want to import CommonJS module into ES6 module codebase.

Before these flags we had to import CommonJS modules with star (`* as something`) import:

```js
// node_modules/moment/index.js
exports = moment
// index.ts file in our app
import * as moment from 'moment'
moment(); // not compliant with es6 module spec

// transpiled js (simplified):
const moment = require("moment");
moment();
```

We can see that `*` was somehow equivalent to `exports` variable. It worked fine, but it wasn't compliant with es6 modules spec. In spec, the namespace record in star import (`moment` in our case) can be only a plain object, not callable (`moment()` is not allowed).

# Solution

With flag `esModuleInterop` we can import CommonJS modules in compliance with `es6` modules spec. Now our import code looks like this:

```js
// index.ts file in our app
import moment from 'moment'
moment(); // compliant with es6 module spec

// transpiled js with esModuleInterop (simplified):
const moment = __importDefault(require('moment'));
moment.default();
```

It works and it's perfectly valid with es6 modules spec, because `moment` is not namespace from star import, it's default import.

But how does it work? As you can see, because we did a default import, we called the `default` property on a `moment` object. But we didn't declare a `default` property on the `exports` object in the moment library. The key is the `__importDefault` function. It assigns module (`exports`) to the `default` property for CommonJS modules:

```js
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
```

As you can see, we import es6 modules as they are, but CommonJS modules are wrapped into an object with the `default` key. This makes it possible to import defaults on CommonJS modules.

`__importStar` does the similar job - it returns untouched esModules, but translates CommonJS modules into modules with a `default` property:

```js
// index.ts file in our app
import * as moment from 'moment'

// transpiled js with esModuleInterop (simplified):
const moment = __importStar(require("moment"));
// note that "moment" is now uncallable - ts will report error!
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
```

# Synthetic imports

And what about `allowSyntheticDefaultImports` - what is it for? Now the docs should be clear:

```
Allow default imports from modules with no default export. This does not affect code emit, just typechecking.
```

In `moment` typings we don't have specified default export, and we shouldn't have, because it's available only with flag `esModuleInterop` on. So `allowSyntheticDefaultImports` will not report an error if we want to import default from a third-party module which doesn't have a default export.

## 监控文件修改自动生成

ctrl shift b

## ts项目断点调试

生成调试配置文件launch.json,
配置如下

program 为调试入口文件

[预定义变量](https://code.visualstudio.com/docs/editor/variables-reference)

* ${workspaceFolder} - the path of the folder opened in VS Code
* ${workspaceFolderBasename} - the name of the folder opened in VS Code without any slashes (/)
* ${file} - the current opened file
* ${fileWorkspaceFolder} - the current opened file's workspace folder
* ${relativeFile} - the current opened file relative to workspaceFolder
* ${relativeFileDirname} - the current opened file's dirname relative to workspaceFolder
* ${fileBasename} - the current opened file's basename
* ${fileBasenameNoExtension} - the current opened file's basename with no file extension
* ${fileDirname} - the current opened file's dirname
* ${fileExtname} - the current opened file's extension
* ${cwd} - the task runner's current working directory on startup
* ${lineNumber} - the current selected line number in the active file
* ${selectedText} - the current selected text in the active file
* ${execPath} - the path to the running VS Code executable
* ${defaultBuildTask} - the name of the default build task
* ${pathSeparator} - the character used by the operating system to separate components in file paths

```json
{
  // Use IntelliSense to learn about possible attributes.
  // Hover to view descriptions of existing attributes.
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "type": "pwa-node",
      "request": "launch",
      "name": "Launch Program",
      "skipFiles": [
        "<node_internals>/**"
      ],
      "program": "${workspaceFolder}/build/index.js",
      "outFiles": [
        "${workspaceFolder}/**/*.js"
      ]
    }
  ]
}
```

## ts bug

```ts
let d = ''
const f = d[9]
```

f 推断为string
