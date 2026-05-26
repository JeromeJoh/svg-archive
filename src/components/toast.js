class MyToast extends HTMLElement {
  static get observedAttributes() {
    return ["position", "animation"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.container = document.createElement("div");
    this.container.className = "toast-container";
    this.shadowRoot.appendChild(this.container);

    const style = document.createElement("style");
    style.textContent = `
          :host {
            position: fixed;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
          }
          /* 位置 */
          :host([position="top-right"]) { top: 20px; right: 20px; align-items: flex-end; }
          :host([position="top-left"]) { top: 20px; left: 20px; align-items: flex-start; }
          :host([position="bottom-right"]) { bottom: 20px; right: 20px; align-items: flex-end; }
          :host([position="bottom-left"]) { bottom: 20px; left: 20px; align-items: flex-start; }

          .toast-container {
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
            align-items: inherit;
          }

          .toast {
            position: relative;
            display: inline-flex;
            width: fit-content;
            max-width: 70vh;
            padding: 20px 48px 20px 20px;
            border-radius: 4px;
            color: var(--theme-color);
            font-size: 14px;
            opacity: 0;
            pointer-events: auto;
            border: solid 0.4px var(--theme-color);
          }

          .toast-type {
            font-weight: bold;
            margin-right: 4px;
          }

          .close-btn {
            position: absolute;
            width: 24px;
            height: 24px;
            top: 50%;
            right: 16px;
            transform: translateY(-50%);
            background: none;
            border: none;
            opacity: 0.2;
            cursor: pointer;
          }

          .close-btn::before, .close-btn::after {
            content: '';
            position: absolute;
            width: 14px;
            height: 3px;
            background: black;
            transition: background .2s;
          }

          .close-btn::before {
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(45deg);
          }

          .close-btn::after {
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
          }

          /* 颜色类型 */
          .info { background: #cce8f4; --theme-color: #417897; }
          .success { background: #def2d6; --theme-color: #516549; }
          .error { background: #edc8c2 ; --theme-color: #a53f3b; }
          .warning { background: #f8f3d6; --theme-color: #977b3a; }

          /* 动画 fade-slide */
          .fade-slide { transform: translateY(-20px); transition: opacity .3s, transform .3s; }
          :host([position^="bottom"]) .fade-slide { transform: translateY(20px); }
          .fade-slide.show { opacity: 1; transform: translateY(0); }

          /* 动画 fade-scale */
          .fade-scale { transform: scale(0.9); transition: opacity .3s, transform .3s; }
          .fade-scale.show { opacity: 1; transform: scale(1); }
        `;
    this.shadowRoot.appendChild(style);

    // 默认值
    if (!this.hasAttribute("position")) this.setAttribute("position", "top-right");
    if (!this.hasAttribute("animation")) this.setAttribute("animation", "fade-slide");
  }

  connectedCallback() {
    if (!document.querySelector("my-toast")) {
      document.body.appendChild(this);
    }
  }

  static show(message, { type = "info", duration = 3000, position = "top-right", animation = "fade-slide" } = {}) {
    const instance = document.querySelector("my-toast") || new MyToast();
    if (!instance.isConnected) document.body.appendChild(instance);
    instance.setAttribute("position", position);
    instance.setAttribute("animation", animation);
    instance._addToast(message, type, duration, animation);
  }

  _addToast(message, type, duration, animation) {
    const el = document.createElement("div");
    el.className = `toast ${type} ${animation}`;
    el.textContent = message;
    const span = document.createElement("span");
    span.className = "toast-type";
    span.textContent = type.charAt(0).toUpperCase() + type.slice(1) + ":";
    const btn = document.createElement("button");
    btn.className = "close-btn";
    btn.onclick = () => this._cleanupToast(el);
    el.prepend(span);
    el.appendChild(btn);

    this.container.appendChild(el);

    requestAnimationFrame(() => el.classList.add("show"));

    setTimeout(() => this._cleanupToast(el), duration);
  }

  _cleanupToast(el) {
    el.classList.remove("show");
    el.addEventListener("transitionend", () => el.remove(), { once: true });
  }
}

customElements.define("my-toast", MyToast);

// 快捷方法
const api = {
  show: MyToast.show,
  info: (msg, opt) => MyToast.show(msg, { ...opt, type: "info" }),
  success: (msg, opt) => MyToast.show(msg, { ...opt, type: "success" }),
  error: (msg, opt) => MyToast.show(msg, { ...opt, type: "error" }),
  warning: (msg, opt) => MyToast.show(msg, { ...opt, type: "warning" }),
  test: () => {
    const types = [
      { fn: api.info, msg: "Welcome to use What They Toast To!", opt: { duration: 5000 } },
      { fn: api.success, msg: "You have successfully logged in!", opt: {} },
      { fn: api.error, msg: "An error occurred while processing your request.", opt: {} },
      { fn: api.warning, msg: "Your subscription is about to expire.", opt: {} }
    ];
    const random = types[Math.floor(Math.random() * types.length)];
    random.fn(random.msg, random.opt);
  }
};
window.toast = api;