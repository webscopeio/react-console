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
