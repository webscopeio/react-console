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
}

export default class ReactConsole extends React.Component<Props, State> {

  formRef: any = null;
  inputRef: any = null;
  wrapperRef: any = null;

  static defaultProps = {
    prompt: '$',
    autoFocus: false,
  };

  state = {
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


  scrollToBottom = () => {
    this.wrapperRef.scrollTo(0, this.wrapperRef.scrollHeight)
  };

  onSubmit = async (e: any) => {
    const {prompt} = this.props
    e.preventDefault();
    const data = new FormData(e.target);
    const inputString: string = data.get('input') as string;
    if (inputString === null) {
      return
    }

    const log = `${prompt}\xa0${inputString}`;

    if(inputString === '') {
      this.setState({ output: [...this.state.output, log]})
      this.formRef.reset()
      return
    }

    const [cmd, ...args] = inputString.split(" ");

    if(cmd === 'clear') {
      this.formRef.reset()
      this.setState({output: []})
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
      this.scrollToBottom()

    } else {
      this.setState({
        output: [...this.state.output, log, `Command '${cmd}' does not exist`]
      }, this.scrollToBottom)
    }
    this.formRef.reset()
    this.setState({commandInProgress: false});
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
          ref={ref => this.formRef = ref}
          onSubmit={this.onSubmit}
        >
          <div className={styles.promptWrapper}>
            <span>{prompt}&nbsp;</span>
            <input
              disabled={this.state.commandInProgress}
              ref={ref => this.inputRef = ref}
              autoFocus={autoFocus}
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
