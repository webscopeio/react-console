MIT-licensed console emulator in React. Documentation and more advanced features coming soon!

# react-console

> React component that emulates console behaviour

[![NPM](https://img.shields.io/npm/v/react-console.svg)](https://www.npmjs.com/package/react-console) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

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
| **commands***          | Object |
| prompt                 | string |
| welcomeMessage         | string |
| autoFocus              | boolean|
| noCommandFound         | (...str: string[]) => Promise<string> |
| wrapperStyle           | Object                                                          | styles for the wrapper |
| promptStyle            | Object                                                          | styles for the prompt |
| inputStyle             | Object                                                          | styles for the input |
| wrapperClassName       | string                                                          | className for the wrapper |
| promptClassName        | string                                                          | className for the prompt |
| inputClassName         | string                                                          | className for the input |
| history                | Array<string>                                                   | history array           |
| onAddHistoryItem       | (entry: string) => void                                         | callback called when a new history entry should be created | 

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

IT © [jvorcak](https://github.com/jvorcak)
