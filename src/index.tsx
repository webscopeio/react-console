/**
 * @class ReactConsole
 */

import * as React from 'react'

import styles from './styles.css'

export type Props = {
  text: string,
  prompt: React.Component,
  commands: any,
  welcomeMessage?: string,
  autoFocus: boolean,
}

type State = {
  output: Array<string>,
  commandInProgress: boolean,
  input: string,
}

export default class ReactConsole extends React.Component<Props, State> {

  inputRef: any = null;
  wrapperRef: any = null;

  static defaultProps = {
    prompt: '$',
    autoFocus: false,
  };

  state = {
    input: '',
    output: [],
    commandInProgress: false,
  };

  componentDidMount() {
    const {welcomeMessage} = this.props
    if (welcomeMessage) {
      this.setState({
        output: [welcomeMessage],
      })
    }
  }

  onSubmit = async (e: any) => {
    const {prompt} = this.props;
    e.preventDefault();

    const inputString: string = this.state.input
    if (inputString === null) {
      return
    }

    const log = `${prompt}\xa0${inputString}`;

    if(inputString === '') {
      this.setState({
        output: [...this.state.output, log],
        input: '',
      });
      return
    }

    const [cmd, ...args] = inputString.split(" ");

    if(cmd === 'clear') {
      this.setState({output: [], input: ''})
      return
    }

    const command = this.props.commands[cmd];


    await this.setState({commandInProgress: true});

    if (command) {
      try {
        const ret = await command.fn(...args);
        await this.setState({
          output: [...this.state.output, log, ret]
        })
      } catch (err) {

      }

    } else {
      this.setState({
        output: [...this.state.output, log, `Command '${cmd}' does not exist`]
      })
    }
    this.setState({commandInProgress: false, input: ''});
    this.inputRef.focus()
  };

  render() {
    const {
      prompt,
      autoFocus,
    } = this.props;

    return (
      <div className={styles.wrapper} onClick={this.focusConsole} ref={ref => this.wrapperRef = ref}>
        <div>
          {this.state.output.map((line, key) =>
            <pre key={key} className={styles.line}>{line}</pre>
          )}
        </div>
        <form
          onSubmit={this.onSubmit}
        >
          <div className={styles.promptWrapper}>
            <span>{prompt}&nbsp;</span>
            <input
              disabled={this.state.commandInProgress}
              ref={ref => this.inputRef = ref}
              autoFocus={autoFocus}
              value={this.state.input}
              onChange={this.onInputChange}
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

  onInputChange = (e: any) => {
    this.setState({
      input: e.target.value,
    })
  }

  focusConsole = () => {
    this.inputRef.focus()
  }
}
