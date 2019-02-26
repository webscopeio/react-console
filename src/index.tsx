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
  history?: Array<string>,
  historyPosition: number,
  reverseSearchString?: string,
  reverseSearchPosition: number,
}

export default class ReactConsole extends React.Component<Props, State> {

  inputRef: any = null;
  wrapperRef: any = null;
  reverseStringRef: any = null;

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
    history: [
      "hello1",
      "hello2",
      "ahojky",
      "ahoj",
      "hello3",
      "world",
    ],
    reverseSearchString: undefined,
    historyPosition: Infinity,
    reverseSearchPosition: Infinity,
  };

  componentDidMount() {
    const {welcomeMessage} = this.props;
    if (welcomeMessage) {
      this.setState({
        output: [welcomeMessage],
      })
    }
    this.setState({
      historyPosition: this.state.history.length,
    })
  }

  clear = () => {
    this.setState({output: [], input: ''})
  };

  scrollToBottom = () => {
    setTimeout(() => {
      this.wrapperRef.scrollTop = this.wrapperRef.scrollHeight
    })
  };

  /**
   * Get filtered history entries based on reverse search string
   */
  getReverseHistory = (): Array<boolean> => {
    const {reverseSearchString} = this.state;
    return this.state.history.map(entry => (reverseSearchString === undefined || reverseSearchString === '') ?
      // @ts-ignore
      false : entry.includes(reverseSearchString))
  };

  // TODO rename
  getLog = () => {
    const {prompt} = this.props;
    const inputString: string = this.state.input;
    return `${prompt}\xa0${inputString}`;
  };

  onSubmit = async (e: any) => {
    e.preventDefault();

    const inputString: string = this.state.input
    if (inputString === null) {
      return
    }

    const log = this.getLog();

    if (inputString === '') {
      this.setState({
        output: [...this.state.output, log],
        input: '',
      });
      this.scrollToBottom();
      return
    }

    this.addHistoryEntry(inputString);

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
          <div
            className={classnames([styles.promptWrapper, promptClassName])}
            style={promptStyle}
          >
            <span
              className={promptClass}
            >{prompt}&nbsp;</span>
            <input
              disabled={this.state.commandInProgress || this.isReverseSearchOn()}
              ref={ref => this.inputRef = ref}
              autoFocus={autoFocus}
              value={this.state.input}
              onChange={this.onInputChange}
              onKeyDown={this.onKeyDown}
              autoComplete={'off'}
              spellCheck={false}
              autoCapitalize={'false'}
              name="input"
              className={classnames([styles.input, inputClassName])}
              style={inputStyle}
            />
          </div>
        </form>
        {this.isReverseSearchOn() && <form onSubmit={this.onReverseSearchSubmit}>bck-i-search: <input
          value={this.state.reverseSearchString}
          ref={ref => this.reverseStringRef = ref}
          onKeyDown={this.onReverseKeyDown}
          className={classnames([styles.input, inputClassName])}
          onChange={this.onReverseStringInputChange}
        />
        </form>}
      </div>
    )
  }

  onReverseStringInputChange = (e: any) => {
    this.setState({
      reverseSearchString: e.target.value,
    }, () => {
      const history: Array<boolean> = this.getReverseHistory();
      const historyIndex: number = history.lastIndexOf(true);
      this.executeNextReverseSearch(historyIndex)
    })
  };

  nextReverseSearch = () => {
    const history: Array<boolean> = this.getReverseHistory();
    const endOffset = Math.max(0, this.state.reverseSearchPosition - 1); // so that we don't go from the end again
    const historyIndex: number = history.lastIndexOf(true, endOffset);
    this.executeNextReverseSearch(historyIndex)
  };

  private executeNextReverseSearch = (historyIndex: number) => {
    this.setState({
      reverseSearchPosition: historyIndex,
    });
    if (historyIndex !== -1) {
      this.setPreviewPosition(historyIndex)
    }
    if (this.state.reverseSearchString === '') {
      this.setPreviewPosition(Infinity);
    }
  };

  onReverseSearch = () => {
    // we enabled reverse search
    this.setState({
      reverseSearchString: '',
    }, () => {
      this.reverseStringRef.focus()
    })
  };

  onReverseSearchSubmit = (e: any) => {
    e.preventDefault();
    this.disableReverseSearch();
  };

  onInputChange = (e: any) => {
    this.setState({
      input: e.target.value,
    })
  };

  isReverseSearchOn = (): boolean => this.state.reverseSearchString !== undefined;

  disableReverseSearch = (reset: boolean = false) => {
    this.setState({
      reverseSearchString: undefined,
    });
    if (reset) {
      this.setState({
        input: '',
      })
    }
    setTimeout(() => {
      this.inputRef.focus();
    });
  };

  onReverseKeyDown = (e: any) => {
    if (e.which === 38 || e.which === 40) { // up or down
      this.disableReverseSearch()
    } else if (e.which === 67 && e.ctrlKey) { // ctrl + c
      this.disableReverseSearch(true);
    } else if (e.which === 82 && e.ctrlKey) { // ctrl + r
      this.nextReverseSearch();
    }
  };

  setPreviewPosition = (historyPosition: number) => {
    this.setState({
      historyPosition,
      input: this.state.history[historyPosition] || '',
    });
  };

  onKeyDown = (e: any) => {
    if (e.which === 38) { // key up
      const historyPosition = Math.max(0, this.state.historyPosition - 1);
      this.setPreviewPosition(historyPosition);
      e.preventDefault()
    } else if (e.which === 40) {
      const historyPosition = Math.min(this.state.history.length, this.state.historyPosition + 1);
      this.setPreviewPosition(historyPosition);
      e.preventDefault()
    } else if (e.which === 82 && e.ctrlKey) { // ctrl + r
      console.log('reverse search mode');
      this.onReverseSearch()
    } else if (e.which === 67 && e.ctrlKey) { // ctrl + c
      this.setState({
        output: [...this.state.output, this.getLog()],
        input: '',
      });
      this.scrollToBottom();
    }
  };

  focusConsole = () => {
    if (this.inputRef) {
      if (document.getSelection().isCollapsed) {
        this.inputRef.focus()
      }
    }
  };

  private addHistoryEntry(inputString: string) {
    const history: Array<string> = [...this.state.history, inputString];
    this.setState({
      history,
      historyPosition: history.length,
    })
  }
}
