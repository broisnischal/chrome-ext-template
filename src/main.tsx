import { h, render } from "preact";
import htm from "htm";

const html = htm.default.bind(h);

function App() {
  return html`<h1>Hello cool!</h1>`;
}

render(html`<${App} name="World" />`, document.body);
