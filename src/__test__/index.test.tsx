import React from 'react'
import { mount } from 'enzyme'
import ReactConsole from '..'

const commands = {}

describe('@webscopeio/react-console', () => {
  it('Renders without crashing with expected props', () => {
    const wrapper = mount(
      <ReactConsole
        commands={commands}
      />
    )

    expect(wrapper.find(ReactConsole).exists()).toBeTruthy()
    expect(wrapper.find(ReactConsole).props()).toMatchObject({
      commands,
    })
  })
})
