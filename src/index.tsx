/**
 * @class ReactConsole
 */

import * as React from 'react'

import styles from './styles.css'

export type Props = {
  text: string,
  prompt: React.Component,
  commands: any,
}

type State = {
  output: Array<string>,
}

export default class ReactConsole extends React.Component<Props, State> {

  formRef : any = null;
  inputRef: any = null;
  outputRef: any = null;

  static defaultProps = {
    prompt: '$',
  };

  state = {
    output: []
  };

  scrollToBottom = () => {
    this.outputRef.scrollTo(0, this.outputRef.scrollHeight)
  };

  onSubmit = async (e: any) => {
    const { prompt } = this.props
    e.preventDefault();
    const data = new FormData(e.target);
    const inputString: string = data.get('input') as string;
    if (inputString === null) {
      return
    }
    const [cmd, ...args] = inputString.split(" ");
    const command = this.props.commands[cmd];

    if (command) {
      try {
        const ret = await command.fn(...args)
        this.setState({
          output: [...this.state.output, `${prompt} ${ret}`]
        }, this.scrollToBottom)
      } catch (err) {

      }
    } else {
      this.setState({
        output: [...this.state.output, `${prompt} Command '${cmd}' does not exist`]
      }, this.scrollToBottom)
    }
    if(this.formRef) {
      this.formRef.reset()
    }
  };

  render() {
    const {
      prompt,
    } = this.props;

    return (
      <div className={styles.wrapper}>
        <div className={styles.output} ref={ref => this.outputRef = ref}>
          {this.state.output.map((line, key) =>
            <div key={key}>{line}</div>
          )}
        </div>
        <form
          ref={ref => this.formRef = ref}
          onSubmit={this.onSubmit}
        >
          <div className={styles.promptWrapper}>
            <span>{prompt}</span>
            <input
              ref={ref => this.inputRef = ref}
              autoFocus
              autoComplete={'off'}
              autoCapitalize={'false'}
              name="input"
              className={styles.input}
            />
          </div>
        </form>
      </div>
    )
  }
}
