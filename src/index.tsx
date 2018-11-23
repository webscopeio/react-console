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
  commandInProgress: boolean,
}

export default class ReactConsole extends React.Component<Props, State> {

  formRef : any = null;
  inputRef: any = null;
  wrapperRef: any = null;

  static defaultProps = {
    prompt: '$',
  };

  state = {
    output: [],
    commandInProgress: false,
  };

  scrollToBottom = () => {
      this.wrapperRef.scrollTo(0, this.wrapperRef.scrollHeight)
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

    const log = `${prompt}\xa0${inputString}`;

    await this.setState({ commandInProgress: true });

    if (command) {
      try {
        const ret = await command.fn(...args);
        await this.setState({
          output: [...this.state.output, log, ret]
        })
      } catch (err) {

      }
      this.scrollToBottom()

    } else {
      this.setState({
        output: [...this.state.output, log, `Command '${cmd}' does not exist`]
      }, this.scrollToBottom)
    }
    if(this.formRef) {
      this.formRef.reset()
    }
    this.setState({ commandInProgress: false });
    this.inputRef.focus()
  };

  render() {
    const {
      prompt,
    } = this.props;

    return (
      <div className={styles.wrapper} onClick={this.focusConsole} ref={ref => this.wrapperRef = ref}>
        <div
          className={styles.output}
        >
          {this.state.output.map((line, key) =>
            <div key={key}>{line}</div>
          )}
        </div>
        <form
          ref={ref => this.formRef = ref}
          onSubmit={this.onSubmit}
        >
          <div className={styles.promptWrapper}>
            <span>{prompt}&nbsp;</span>
            <input
              disabled={this.state.commandInProgress}
              ref={ref => this.inputRef = ref}
              autoFocus
              autoComplete={'off'}
              spellCheck={false}
              autoCapitalize={'false'}
              name="input"
              className={styles.input}
            />
          </div>
        </form>
      </div>
    )
  }

  focusConsole = () => {
    this.inputRef.focus()
  }
}
