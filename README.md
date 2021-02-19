MIT-licensed console emulator in React. Documentation and more advanced features coming soon!

# react-console

> React component that emulates console behaviour

[![NPM](https://img.shields.io/npm/v/react-console.svg)](https://www.npmjs.com/package/react-console)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
![license-sh badge](https://img.shields.io/endpoint?label=license-sh&url=https%3A%2F%2Flicense.sh%2Fapi%2Fshield%3Fowner%3Dwebscopeio%26repo%3Dreact-console%26repoID%3D158874576%26token_type%3Dbearer%26type%3Dgithub)


## Install

```bash
npm install --save @webscopeio/react-console
```

## Demo

https://webscopeio.github.io/react-console/

## Screenshot

![Webscope React Console](https://user-images.githubusercontent.com/1083817/48961581-14dce380-ef76-11e8-9d89-66c3815e46fe.png)

## Props


| Props                  | Type                                                                  | Description |
| :--------------------- | :-------------------------------------------------------------------- |:--------------|
| **commands***          | **CommandsProp** |
| prompt                 | string |
| welcomeMessage         | string |
| autoFocus              | boolean|
| noCommandFound         | (...str: string[]) => Promise<string> |
| wrapperStyle           | React.CSSProperties | styles for `wrapper` |
| promptWrapperStyle     | React.CSSProperties | styles for `promptWrapper` |
| promptStyle            | React.CSSProperties | styles for `prompt` |
| lineStyle              | React.CSSProperties | styles for `line` |
| inputStyle             | React.CSSProperties | styles for `input` |
| wrapperClassName       | string | className for `wrapper` |
| promptWrapperClassName | string | className for `promptWrapper` |
| promptClassName        | string | className for `prompt` |
| lineClassName          | string | className for `line` |
| inputClassName         | string | className for `input` |
| history                | string[] | history array |
| onAddHistoryItem       | (entry: string) => void | callback called when a new history entry is created |
| onSanitizeOutputLine   | (line: string) => string | callback called before a new output line is inserted to DOM |

\*_are mandatory_

## Usage

```tsx
import React, { Component } from 'react'

import ReactConsole from 'react-console'

const App = () => {
  const [history, setHistory] = useState([
    "echo hello world",
    "sleep 1000",
    "sleep 2000",
    "sleep 3000",
    "echo ola",
    "not found",
  ])

  return (
    <div>
      <ReactConsole
        autoFocus
        welcomeMessage="Welcome"
        commands={{
          history: {
            description: 'History',
            fn: () => new Promise(resolve => {
               resolve(`${history.join('\r\n')}`)
            })
          },
          echo: {
            description: 'Echo',
            fn: (...args) => {
              return new Promise((resolve, reject) => {
                setTimeout(() => {
                  resolve(`${args.join(' ')}`)
                }, 2000)
              })
            }
          },
          test: {
            description: 'Test',
            fn: (...args) => {
              return new Promise((resolve, reject) => {
                setTimeout(() => {
                  resolve('Hello world \n\n hello \n')
                }, 2000)
              })
            }
          }
        }}
      />
    </div>
  )
}
export default App
```

## History implementation

You can provide your own history implementation by providing `onAddHistoryItem` and `history` properties.
If you don't provide `history`, up/down arrows & reverse search won't work.


## License

[MIT](https://opensource.org/licenses/MIT) © [jvorcak](https://github.com/jvorcak)
