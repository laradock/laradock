import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import store from "./store";
import ThemeApp from "./Theme";

ReactDOM.render(
  <Provider store={store}>
    <ThemeApp />
  </Provider>,
  document.querySelector('#root')
);
