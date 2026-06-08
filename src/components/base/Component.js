/**
 * Base Component class for vanilla JS components
 * Provides state management, event binding, and mount/unmount lifecycle
 */
export class Component {
  constructor(props = {}) {
    this.props = props;
    this.state = {};
    this.element = null;
    this._eventHandlers = [];
  }

  /**
   * Create a shallow copy of the event handlers to prevent mutation during iteration
   */
  addEventListener(element, event, handler) {
    element.addEventListener(event, handler);
    this._eventHandlers.push({ element, event, handler });
  }

  setState(newState) {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...newState };
    
    // Store reference to element for re-render
    if (this.element && typeof this.rerender === 'function') {
      this.rerender();
    }
  }

  /**
   * Mount the component to a container element
   */
  mount(container) {
    if (typeof this.render === 'function') {
      this.element = this.render();
      if (this.element instanceof Node) {
        container.appendChild(this.element);
      }
    }
    return this.element;
  }

  /**
   * Unmount and cleanup event handlers
   */
  unmount() {
    this._eventHandlers.forEach(({ element, event, handler }) => {
      try {
        element.removeEventListener(event, handler);
      } catch (e) {
        // Ignore errors during cleanup
      }
    });
    this._eventHandlers = [];

    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }

    if (typeof this.onUnmount === 'function') {
      this.onUnmount();
    }
  }
}