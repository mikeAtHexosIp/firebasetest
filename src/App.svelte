<script>
  export let name;
  let nameValue = "";
  let notifications = [];
  let today = new Date();

  async function helloWorld() {
    const res = await fetch(
      "https://us-central1-fir-test-e99ee.cloudfunctions.net/helloWorld"
    );
    const resText = await res.text();
    console.log("hello world", resText);
    return resText;
  }

  async function byeWorld() {
    const res = await fetch(
      "https://us-central1-fir-test-e99ee.cloudfunctions.net/byeWorld"
    );
    const resText = await res.text();
    console.log("bye world", resText);
    return resText;
  }

  async function getName() {
    await fetch("https://us-central1-fir-test-e99ee.cloudfunctions.net/getName")
      .then(async (response) => {
        const res = await response.json();
        return res;
      })
      .then((data) => {
        name = data.name;
      });
  }

  async function updateName(name) {
    const res = await fetch(
      "https://us-central1-fir-test-e99ee.cloudfunctions.net/updateName?name=" +
        name
    );
    console.log(`Name updated to: ${name}`);
  }

  async function getNotifications() {
    const res = await (
      await fetch(
        "https://us-central1-fir-test-e99ee.cloudfunctions.net/getNotifications"
      )
    ).json();
    notifications = res;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const name = nameValue;
    updateName(name);
  }

  async function createTask() {
    const res = await fetch(
      "https://us-central1-fir-test-e99ee.cloudfunctions.net/handleTask"
    );
    const resText = await res.text();
    console.log(`${resText} at: ${today.getHours()}:${today.getMinutes()}`);
    return resText;
  }

  getName();
</script>

<main>
  <h1>Hello {name}!</h1>
  <form id="update-name">
    <input
      type="text"
      name="name"
      id="name"
      placeholder="Insert name..."
      bind:value={nameValue}
    />
    <button on:click={handleSubmit}>Update name</button>
  </form>

  <button on:click={createTask}
    >Create task to execute HelloWorld in 1 minute</button
  >
  {#if notifications.length > 0}
    <ul class="notifications">
      {#each notifications as notification}
        <li>{notification?.message}</li>
      {/each}
    </ul>
  {/if}
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }
  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }
  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }

  .notifications {
    list-style: none;
    font-family: "Courier New", Courier, monospace;
    color: #999;
    background: #f2f2f2;
    border-radius: 5px;
    border: 1px solid #ccc;
    margin: 15px;
    padding: 15px;
    text-align: left;
  }
  .notifications li {
    margin-bottom: 5px;
    font-size: 14px;
  }
</style>
