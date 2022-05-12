import App from "./App.svelte";

const name = "Wait for it...";

const app = new App({
  target: document.body,
  props: {
    name,
  },
});

export default app;
