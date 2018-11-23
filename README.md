# react-console

> React component that emulates console behaviour

[![NPM](https://img.shields.io/npm/v/react-console.svg)](https://www.npmjs.com/package/react-console) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save @webscopeio/react-console
```

## Usage

```tsx
import React, { Component } from 'react'

import ReactConsole from 'react-console'

export default class App extends Component {
  render () {
    return (
      <div>
        <ReactConsole
          autoFocus
          welcomeMessage="Welcome"
          commands={{
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
}

```

## License

MIT © [jvorcak](https://github.com/jvorcak)
