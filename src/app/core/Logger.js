/* eslint-disable no-console */
const LABEL_CSS = 'color:indigo;background-color:lavender;font-weight:bold;';
const TIMER_CSS = 'color:green;background-color:honeydew;';

export default class Logger {
  constructor(name) {
    this.name = name;
    this.timers = {};
  }

  output(method, args) {
    if (process.env.NODE_ENV !== 'production') {
      const label = ['%c%s%c', LABEL_CSS, this.name, 'color:black'];

      // If format specifiers are defined, merge with label
      if (args.length && typeof args[0] === 'string' && /%[sidfoOc]/.test(args[0])) {
        label[0] += ` ${args[0]}`;
        // eslint-disable-next-line no-param-reassign
        args = args.slice(1);
      }

      method.apply(console, label.concat(args));
    }
  }

  log(...args) {
    this.output(console.log, args);
  }

  info(...args) {
    this.output(console.info, args);
  }

  warn(...args) {
    this.output(console.warn, args);
  }

  error(...args) {
    this.output(console.error, args);
  }

  trace(...args) {
    this.output(console.trace, args);
  }

  time(id) {
    this.timers[id] = window.performance.now();
  }

  timeEnd(id, ...args) {
    const timer = this.timers[id];

    if (timer) {
      const t = (window.performance.now() - timer) / 1000;
      const val = t < 1 ? `${~~(t * 1000)}ms` : `${t.toFixed(2)}s`;

      this.output(console.log, ['%c+%s', TIMER_CSS, val].concat(args));
    }
  }
}
