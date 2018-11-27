/**
 * @class ReactConsole
 */

import * as React from 'react'

import styles from './styles.css'

export type Props = {
  text: string,
  prompt: string,
  commands: any,
  welcomeMessage?: string,
  autoFocus: boolean,
  noCommandFound: (...str: string[]) => Promise<string>,
  promptClassName?: string,
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
      this.clear();
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
      const cmdNotFound = await this.props.noCommandFound(cmd, ...args);
      this.setState({
        output: [...this.state.output, log, cmdNotFound]
      })
    }
    this.setState({commandInProgress: false, input: ''});
    this.inputRef.focus()
  };

  render() {
    const {
      prompt,
      autoFocus,
      promptClassName,
    } = this.props;

    const promptClass = promptClassName
      ? `${styles.prompt} ${promptClassName}`
      : styles.prompt;

    return (
      <div className={styles.wrapper} onClick={this.focusConsole} ref={ref => this.wrapperRef = ref}>
        <div>
          {this.state.output.map((line, key) =>
            <pre
              key={key}
              className={styles.line}
              dangerouslySetInnerHTML={{__html: line}}
            />
          )}
        </div>
        <form
          onSubmit={this.onSubmit}
        >
          <div className={styles.promptWrapper}>
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
