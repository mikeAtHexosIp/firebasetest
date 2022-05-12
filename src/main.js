import App from "./App.svelte";
import "./firebase";
const functions = require("firebase-functions");

const config = functions.config();

const app = new App({
  target: document.body,
  props: {
    name: config.vars.name,
  },
});

export default app;
