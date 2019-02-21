/**
 * @class ReactConsole
 */

import * as React from 'react'
import classnames from 'classnames'

import styles from './styles.css'

// @ts-ignore
const isIE11 = !!window.MSInputMethodContext && !!document.documentMode;

export type Props = {
  prompt: string,
  commands: any,
  welcomeMessage?: string,
  autoFocus: boolean,
  noCommandFound: (...str: string[]) => Promise<string>,
  promptClassName?: string,
  wrapperClassName?: string,
  inputClassName?: string,
  wrapperStyle?: object,
  promptStyle?: object,
  inputStyle?: object,
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
    noCommandFound: (cmd: string) => Promise.resolve(`Command ${cmd} does not exist`),
    wrapperStyle: {},
    promptStyle: {},
    inputStyle: {},
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

  clear = () => {
    this.setState({output: [], input: ''})
  };

  scrollToBottom = () => {
    setTimeout(() => {
      this.wrapperRef.scrollTop = this.wrapperRef.scrollHeight
    })
  };

  onSubmit = async (e: any) => {
    const {prompt} = this.props;
    e.preventDefault();

    const inputString: string = this.state.input
    if (inputString === null) {
      return
    }

    const log = `${prompt}\xa0${inputString}`;

    if (inputString === '') {
      this.setState({
        output: [...this.state.output, log],
        input: '',
      });
      this.scrollToBottom()
      return
    }

    const [cmd, ...args] = inputString.split(" ");

    if (cmd === 'clear') {
      this.clear();
      return
    }

    const command = this.props.commands[cmd];

    this.setState({commandInProgress: true});

    if (command) {
      const ret = await command.fn(...args);
      this.setState({
        output: [...this.state.output, log, ret]
      })
    } else {
      const cmdNotFound = await this.props.noCommandFound(cmd, ...args);
      this.setState({
        output: [...this.state.output, log, cmdNotFound]
      })
    }
    this.setState({commandInProgress: false, input: ''});
    this.inputRef.focus()
    this.scrollToBottom()
  };

  render() {
    const {
      wrapperClassName,
      promptClassName,
      inputClassName,
      wrapperStyle,
      promptStyle,
      inputStyle,
      prompt,
      autoFocus,
    } = this.props;

    const promptClass = promptClassName
      ? `${styles.prompt} ${promptClassName}`
      : styles.prompt;

    return (
      <div
        className={classnames([styles.wrapper, wrapperClassName])}
        style={{
          overflowY: isIE11 ? "scroll" : "auto",
          ...wrapperStyle,
        }}
        onClick={this.focusConsole}
        ref={ref => this.wrapperRef = ref}
      >
        <div>
          {this.state.output.map((line, key) =>
            <code>
              <pre
                key={key}
                className={styles.line}
                dangerouslySetInnerHTML={{__html: line}}
              />
            </code>
          )}
        </div>
        <form
          onSubmit={this.onSubmit}
        >
          <div
            className={classnames([styles.promptWrapper, promptClassName])}
            style={promptStyle}
          >
            <span
              className={promptClass}
            >{prompt}&nbsp;</span>
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
              className={classnames([styles.input, inputClassName])}
              style={inputStyle}
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
  };

  focusConsole = () => {
    if (this.inputRef) {
      if (document.getSelection().isCollapsed) {
        this.inputRef.focus()
      }
    }
  }
}
