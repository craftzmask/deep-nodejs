module.exports = class EventEmitter {
  events = {}; // Master object

  emit(eventName, ...args) {
    const listeners = (this.events[eventName] ?? []).slice();
    for (const listener of listeners) {
      listener(...args);
    }
  }

  on(eventName, listener) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }

    this.events[eventName].push(listener);

    return this;
  }

  off(eventName, listener) {
    if (this.events[eventName]) {
      this.events[eventName] = this.events[eventName].filter(
        (fn) => fn !== listener && fn.original !== listener,
      );

      if (this.events[eventName].length === 0) {
        delete this.events[eventName];
      }
    }

    return this;
  }

  once(eventName, listener) {
    const onceWrapper = (...args) => {
      this.off(eventName, onceWrapper);
      listener(...args);
    };

    onceWrapper.original = listener;

    this.on(eventName, onceWrapper);

    return this;
  }

  // Aliases
  addListener(eventName, listener) {
    return this.on(eventName, listener);
  }

  removeListener(eventName, listener) {
    return this.off(eventName, listener);
  }

  prependListener(eventName, listener) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }

    this.events[eventName].unshift(listener);

    return this;
  }

  prependOnceListener(eventName, listener) {
    const onceWrapper = (...args) => {
      this.off(eventName, onceWrapper);
      listener(...args);
    };

    onceWrapper.original = listener;

    this.prependListener(eventName, onceWrapper);

    return this;
  }

  listenerCount(eventName) {
    return (this.events[eventName] ?? []).length;
  }

  eventNames() {
    return [...Object.keys(this.events)];
  }

  listeners(eventName) {
    return (this.events[eventName] ?? []).slice();
  }

  removeAllListeners(eventName) {
    if (eventName) {
      delete this.events[eventName];
    } else {
      this.events = {};
    }

    return this;
  }
};
