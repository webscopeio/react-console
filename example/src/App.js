import React, { Component } from 'react'

import ReactConsole from 'react-console'

export default class App extends Component {
  render () {
    return (
      <div>
        <ReactConsole
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
            }
          }}
        />
      </div>
    )
  }
}
