/**
 * @class ReactConsole
 */

import React, { CSSProperties } from 'react'
import classnames from 'classnames'

import styles from './styles.css'

// @ts-ignore
const isIE11 = !!window.MSInputMethodContext && !!document.documentMode;

type CommandsProp = {
  [command: string]: {
    description?: string,
    fn: (...args: any[]) => Promise<any>
  }
}

export type ReactConsoleProps = {
  // general props
  commands: CommandsProp,
  noCommandFound: (...str: string[]) => Promise<string>,
  autoFocus: boolean,
  prompt: string,
  welcomeMessage?: string | undefined,
  // className props
  wrapperClassName?: string,
  promptWrapperClassName?: string,
  promptClassName?: string,
  lineClassName?: string,
  inputClassName?: string,
  // style props
  wrapperStyle: CSSProperties,
  promptWrapperStyle: CSSProperties,
  promptStyle: CSSProperties,
  lineStyle: CSSProperties,
  inputStyle: CSSProperties,
  // history props
  history?: string[],
  onAddHistoryItem?: (entry: string) => void,
  onSanitizeOutputLine?: (line: string) => string,
}

type ReactConsoleState = {
  output: string[],
  commandInProgress: boolean,
  input: string,
  historyPosition: number,
  reverseSearchString?: string,
  reverseSearchPosition: number,
}

export default class ReactConsole extends React.Component<ReactConsoleProps, ReactConsoleState> {

  inputRef: any = null;
  wrapperRef: any = null;
  reverseStringRef: any = null;

  static defaultProps = {
    prompt: '$',
    autoFocus: false,
    noCommandFound: (cmd: string) => Promise.resolve(`Command ${cmd} does not exist`),
    wrapperStyle: {},
    promptWrapperStyle: {},
    promptStyle: {},
    lineStyle: {},
    inputStyle: {},
  };

  state = {
    input: '',
    output: [],
    commandInProgress: false,
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
    if (this.props.history !== undefined) {
      this.setState({
        historyPosition: this.props.history.length,
      })
    }
  }

  public clear = () => {
    this.setState({output: [], input: ''})
  };

  public scrollToBottom = () => {
    setTimeout(() => {
      this.wrapperRef.scrollTop = this.wrapperRef.scrollHeight
    })
  };

  /**
   * Get filtered history entries based on reverse search string
   */
  private getReverseHistory = (): Array<boolean> => {
    const {reverseSearchString} = this.state;
    return this.props.history === undefined ?
      []
      : this.props.history.map(entry => (reverseSearchString === undefined || reverseSearchString === '') ?
        // @ts-ignore
        false : entry.indexOf(reverseSearchString) !== -1)
  };

  /**
   * Takes current text of a main input and generates a string that will be outputted as a log.
   * @param input the input string provided to the control; when omitted, retrieves from state.input
   */
  private getCurrentTextSnapshot = (input:string): string => {
    const {prompt} = this.props;
    const inputString: string = input;
    return `${prompt}\xa0${inputString}`;
  };

  /**
   * Accept an external command to run, and run it as if it were entered directly on the console
   * @param input command to run
   * @returns completion promise
   */
  public handleInput = async (input:string) => {
    return this.onProcessInput(input);
  }

  /**
   * Process input submitted from the input control
   * @param e input control reference
   * @returns completion promise
   */
  private onSubmit = async (e:any) => {
    e.preventDefault(); // stop event bubbling
    return this.onProcessInput(this.state.input);
  }

  /**
   * Process input (from any source) and execute it as a command
   * @param inputString command input string
   * @returns completiong promise
   */
  private onProcessInput = async (inputString:string) => {
    if (inputString === null) {
      return
    }

    const log = this.getCurrentTextSnapshot(inputString);

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
      promptWrapperClassName,
      promptClassName,
      lineClassName,
      inputClassName,
      wrapperStyle,
      promptWrapperStyle,
      promptStyle,
      lineStyle,
      inputStyle,
      prompt,
      autoFocus,
    } = this.props;

    const sanitizeOutputLine = (line: string): string => {
      const {onSanitizeOutputLine} = this.props;

      if (typeof onSanitizeOutputLine === 'function') {
        return onSanitizeOutputLine(line)
      }

      return line
    }

    return (
      <div
        className={classnames(styles.wrapper, wrapperClassName)}
        style={{
          overflowY: isIE11 ? "scroll" : "auto",
          ...wrapperStyle,
        }}
        onClick={this.focusConsole}
        ref={ref => this.wrapperRef = ref}
      >
        <div>
          {this.state.output
            .map(line => sanitizeOutputLine(line))
            .map((line, key) =>
              <pre
                key={key}
                className={classnames(styles.line, lineClassName)}
                style={lineStyle}
                dangerouslySetInnerHTML={{__html: line}}
              />
          )}
        </div>
        <form
          onSubmit={this.onSubmit}
        >
          <div
            className={classnames(styles.promptWrapper, promptWrapperClassName)}
            style={promptWrapperStyle}
          >
            <span
              className={classnames(styles.prompt, promptClassName)}
              style={promptStyle}
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

  /**
   * Reverse search input handler
   * @param event
   */
  private onReverseStringInputChange = (event: any) => {
    this.setState({
      reverseSearchString: event.target.value,
    }, () => {
      const history: Array<boolean> = this.getReverseHistory();
      const historyIndex: number = history.lastIndexOf(true);
      this.executeNextReverseSearch(historyIndex)
    })
  };

  /**
   * Invoked when pressed ctrl+r and already in a reverse search mode.
   */
  private nextReverseSearch = () => {
    const history: Array<boolean> = this.getReverseHistory();
    const endOffset = Math.max(0, this.state.reverseSearchPosition - 1); // so that we don't go from the end again
    const historyIndex: number = history.lastIndexOf(true, endOffset);
    this.executeNextReverseSearch(historyIndex)
  };

  /**
   * Helper function that sets the history preview based on a requested history index.
   * @param historyIndex
   */
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

  /**
   * This function sets a given history entry as a main input element content.
   * It's called when changing the preview of a 'current' history entry e.g. by ctrl+r call, or
   * when pressing up/down arrow.
   * @param historyPosition
   */
  private setPreviewPosition = (historyPosition: number) => {
    if(this.props.history === undefined) {
      return
    }
    this.setState({
      historyPosition,
      input: this.props.history[historyPosition] || '', // if an element history is out of bounds, we just set ''
    });
  };

  /**
   * Enables reverse search.
   * The side effect is that we focus o reverse search input.
   */
  private onReverseSearch = () => {
    // we enabled reverse search
    this.setState({
      reverseSearchString: '',
    }, () => {
      this.reverseStringRef.focus()
    })
  };

  /**
   * When reverse search is confirmed, we disable reverse search mode and keep the result.
   * @param e
   */
  private onReverseSearchSubmit = (event: any) => {
    event.preventDefault();
    this.disableReverseSearch();
  };

  /**
   * Main input change handler.
   * @param event
   */
  private onInputChange = (event: any) => {
    this.setState({
      input: event.target.value,
    })
  };

  /**
   * Helper function to determine whether reverse search is active or not.
   */
  private isReverseSearchOn = (): boolean => this.state.reverseSearchString !== undefined;

  /**
   * Disables reverse search mode.
   * @param keepPreviewString - determines whether the result of a reverse search should be kept or not
   */
  private disableReverseSearch = (keepPreviewString: boolean = true) => {
    this.setState({
      reverseSearchString: undefined,
    });
    if (!keepPreviewString) {
      this.setState({
        input: '',
      })
    }
    setTimeout(() => {
      this.inputRef.focus();
    });
  };

  /**
   * onKeyDown implementation of a reverse search input.
   * @param event
   */
  private onReverseKeyDown = (event: any) => {
    if (event.which === 38 || event.which === 40) { // up or down
      this.disableReverseSearch()
      event.preventDefault();
    } else if (event.which === 67 && event.ctrlKey) { // ctrl + c
      this.disableReverseSearch(false);
      event.preventDefault();
    } else if (event.which === 82 && event.ctrlKey) { // ctrl + r
      this.nextReverseSearch();
      event.preventDefault();
    }
  };

  /**
   * onKeyDown implementation of a main input.
   * @param event
   */
  private onKeyDown = (event: any) => {
    if (event.which === 38) { // key up
      if(this.props.history === undefined) {
        return
      }

      const currentPos = Math.min(this.state.historyPosition, this.props.history.length);
      const historyPosition = Math.max(0, currentPos - 1);
      this.setPreviewPosition(historyPosition);
      event.preventDefault()
    } else if (event.which === 40) {
      if(this.props.history === undefined) {
        return
      }
      const historyPosition = Math.min(this.props.history.length, this.state.historyPosition + 1);
      this.setPreviewPosition(historyPosition);
      event.preventDefault()
    } else if (event.which === 82 && event.ctrlKey) { // ctrl + r
      if(this.props.history === undefined) {
        return
      }
      this.onReverseSearch()
      event.preventDefault()
    } else if (event.which === 67 && event.ctrlKey) { // ctrl + c
      this.setState({
        output: [...this.state.output, this.getCurrentTextSnapshot(this.state.input)],
        input: '',
      });
      this.scrollToBottom();
      event.preventDefault()
    }
  };

  /**
   * Focuses console input.
   * Whenever an user clicks on a terminal, we want to focus an actual input where he/she can type.
   */
  public focusConsole = () => {
    if (this.inputRef) {
      if (document.getSelection()!.isCollapsed) {
        this.inputRef.focus()
      }
    }
  };

  /**
   * Calls onAddHistoryItem property and sets historyPosition to a default value.
   * @param inputString
   */
  private addHistoryEntry = (inputString: string) => {
    const {onAddHistoryItem} = this.props;
    if (typeof onAddHistoryItem === 'function') {
      onAddHistoryItem(inputString);
    }
    this.setState({
      historyPosition: Infinity,
    })
  }
}
