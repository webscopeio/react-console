import React, { Component } from 'react'

import ReactConsole from 'react-console'

export default class App extends Component {
  render() {
    return (
      <div>
        <ReactConsole
          autoFocus
          welcomeMessage="This is a <b>welcome</b> message 🎉🎉🎉"
          prompt={'$'}
          commands={{
            echo: {
              description: 'Echo',
              fn: (...args) => {
                return new Promise((resolve, reject) => {
                  setTimeout(() => {
                    resolve(`${args.join(' ')}`)
                  }, 0)
                })
              }
            },
            sleep: {
              description: 'sleep',
              fn: (timeout) => {
                return new Promise((resolve, reject) => {
                  setTimeout(() => {
                    resolve('')
                  }, timeout)
                })
              }
            }
          }}
          noCommandFound={() => new Promise((resolve, reject) => {
            resolve('No command found')
          })}
        />
        <table>
          <tr>
            <td><code>echo ...args</code></td>
            <td>Echo</td>
          </tr>
          <tr>
            <td><code>sleep `ms`</code></td>
            <td>Sleeps for a number of milliseconds</td>
          </tr>
        </table>
      </div>
    )
  }
}
