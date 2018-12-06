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
            c: {
              description: 'crashtest',
              fn: () => {
                return new Promise(resolve => {
                  var x = `
                  1234567890
                  1234567890
                  1234567890
                  1234567890
                  1234567890
                  1234567890
                  1234567890
                  1234567890
                  1234567890
                  1dsj kfljdsafjks ladf
                  1dsj kfljdsafjks ladf
                  1dsj kfljdsafjks ladf
                  1dsj kfljdsafjks ladf
                  1dsj kfljdsafjks ladf
                  1dsj kfljdsafjks ladf
                  1dsj kfljdsafjks ladf
                  1dsj kfljdsafjks ladf
                  1dsj kfljdsafjks ladf
                  1dsj kfljdsafjks ladf
                  1dsj kfljdsafjks ladf
                  1dsj kfljdsafjks ladf
                  1dsj kfljdsafjks ladf
                  1ksdl; fdsklajfklsadj fdsj kfljdsafjks ladf
                  sdafjsad
                  k fj asdpf234567890
                  sdafjsad
                  k fj asdpf234567890
                  sdafjsad
                  k fj asdpf234567890
                  sdafjsad
                  k fj asdpf234567890
                  sdafjsad
                  k fj asdpf234567890
                  sdafjsad
                  k fj asdpf234567890
                  sdafjsad
                  k fj asdpf234567890
                  sdafjsad
                  k fj asdpf234567890
                  sdafjsad
                  k fj asdpf234567890
                  sdafjsad
                  k fj asdpf234567890
                  sdafjsad
                  k fj asdpf234567890
                  sdafjsad
                  k fj asdpf234567890
                  sdafjsad
                  k fj asdpf234567890
                  1dsj kfljdsafjks ladf
                  sdafjsad
                  k fj asdpf234567890
                  sdafjsad
                  k fj asdpf234567890

                  `
                  resolve(x)
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
