import { LitElement, html, css } from 'https://unpkg.com/lit@latest?module';

class MyApp extends LitElement {
  constructor() {
    super();
    console.log('MyApp initialized');
  }

  connectedCallback() {
    super.connectedCallback();
    console.log('MyApp connected to the DOM', this.shadowRoot);
  }

  static styles = css`
    h1 {
      color: red;
    }
  `
  render() {
    return html`
    <h1>Hello</h1>
    `;
  }
}
customElements.define('my-app', MyApp);