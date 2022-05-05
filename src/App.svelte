<script>
  export let name;
  let nameValue = "";
  let notifications = [];

  async function helloWorld() {
    const res = await fetch(
      "https://us-central1-fir-test-e99ee.cloudfunctions.net/getNotifications/helloWorld"
    );
    const resText = await res.text();
    console.log("hello world", resText);
    return resText;
  }

  async function byeWorld() {
    const res = await fetch(
      "https://us-central1-fir-test-e99ee.cloudfunctions.net/getNotifications/byeWorld"
    );
    const resText = await res.text();
    console.log("bye world", resText);
    return resText;
  }

  async function getName() {
    await fetch('https://us-central1-fir-test-e99ee.cloudfunctions.net/getNotifications/getName').then(async(response) => {
      const res = await response.json();
      return res;
    }).then((data) => {
      name = data.name;
    })
  
  }

  async function updateName(name) {
    const res = await fetch("https://us-central1-fir-test-e99ee.cloudfunctions.net/getNotifications/updateName?name=" + name);
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
    const res = await fetch("https://us-central1-fir-test-e99ee.cloudfunctions.net/getNotifications/handleTask");
    const resText = await res.text();
    console.log("Response:", resText);
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
  
  <button on:click={createTask}>Create task to execute HelloWorld in 2 minutes</button>
  {#if notifications.length > 0}
    <ul class="notifications">
      {#each notifications as notification}
        <li>{notification?.message}</li>
      {/each}
    </ul>
  {/if}
</main>

<!-- <script>
  export let name;

  let nameValue = "";
  let notifications = [];

/*   async function helloWorld() {
    const res = await fetch(
      "http://localhost:5001/fir-test-e99ee/us-central1/helloWorld"
    );
    const resText = await res.text();

    console.log("hello world", resText);
    return resText;
  } */

/*   async function byeWorld() {
    const res = await fetch(
      "http://localhost:5001/fir-test-e99ee/us-central1/byeWorld"
    );
    const resText = await res.text();

    console.log("bye world", resText);
    return resText;
  } */

  /*   async function sendMessage(message) {
    return await fetch('http://localhost:5001/fir-test-e99ee/us-central1/addMessage?text=' + message);    
  } */

  async function getName() {
  const res = await (await fetch('http://localhost:5001/fir-test-e99ee/us-central1/getName')).json();
  name = res.name;
}

  async function updateName(name) {
    const res = await fetch(
      "http://localhost:5000/fir-test-e99ee/us-central1/updateName?name=" + name
    ).json();
    console.log(res);
  }

  async function getNotifications() {
    const res = await (
      await fetch(
        "http://localhost:5000/fir-test-e99ee/us-central1/getNotifications"
      )
    ).json();
    console.log("notif", res);
    notifications = res;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const name = nameValue;
    console.log("name", name);
    updateName(name);
  }

  getName();
</script>

<main>
  <h1>Hello {name}!</h1>
  <p>
    Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn
    how to build Svelte apps.
  </p>
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
 -->
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
