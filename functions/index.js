const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.database();
const { CloudTasksClient } = require("@google-cloud/tasks");

const config = functions.config();

console.log('ENV QUE SE MOSTRA', config.vars.name);

exports.createTask = async function (payload = 'Hello, im testing!') {
  const project = 'fir-test-e99ee';
  const queue = 'new-task';
  const location = 'us-central1';
  const url = 'https://us-central1-fir-test-e99ee.cloudfunctions.net/helloWorld';
  const email = 'taskcreator@fir-test-e99ee.iam.gserviceaccount.com';

  // Instantiates a client.
  const client = new CloudTasksClient();

  // Construct the fully qualified queue name.
  const parent = client.queuePath(project, location, queue);

  console.log('parent', parent)
  // Convert message to buffer.
  const convertedPayload = JSON.stringify(payload);
  const body = Buffer.from(convertedPayload).toString('base64');

  const task = {
    httpRequest: {
      httpMethod: 'POST',
      url,
      oidcToken: {
        serviceAccountEmail: email,
        audience: new URL(url).origin,
      },
      headers: {
        'Content-Type': 'text/html',
      },
      body,
    },
    scheduleTime: {
      seconds: 1 * 60 + Date.now() / 1000, // Represents 2 minutes in the future.
    },
  };

  try {
    // Send create task request.
    const [response] = await client.createTask({ parent, task });
    console.log(`Created task ${response.name}`);
    return response.name;
  } catch (error) {
    // Construct error for Stackdriver Error Reporting
    console.error(Error(error.message));
  }
}

exports.helloWorld = functions.https.onRequest((request, response) => {
  try {
    functions.logger.log("Hello logs!", { structuredData: true });
    response.set('Access-Control-Allow-Origin', '*');
    response.send("Hello from Firebase!");
  } catch (err) {
    console.log('HelloWorld error: ', err);
  }
});

exports.byeWorld = functions.https.onRequest((request, response) => {
  try {
    functions.logger.log("Hello logs!", { structuredData: true });
    response.set('Access-Control-Allow-Origin', '*');
    response.send("Bye from Firebase!");
  } catch (err) {
    console.log('ByeWorld error: ', err);
  }
});

exports.handleTask = functions.https.onRequest((request, response) => {
  try {
    response.set('Access-Control-Allow-Origin', '*');
    this.createTask();
    response.send("Task Created!");
    return;
  } catch (err) {
    console.log('handleTask error: ', err);
  }
})

exports.addMessage = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  const original = req.query.text;
  const writeResult = await admin.firestore().collection('messages').add({ original: original });

  res.json({ result: `Message with ID: ${writeResult.id} added.` });
});

// Listens for new messages added to /messages/:documentId/original and creates an
// uppercase version of the message to /messages/:documentId/uppercase
exports.makeUppercase = functions.firestore.document('/messages/{documentId}')
  .onCreate((snap, context) => {
    const original = snap.data().original;
    functions.logger.log('Uppercasing', context.params.documentId, original);
    const uppercase = original.toUpperCase();

    return snap.ref.set({ uppercase }, { merge: true });
  });

exports.updateName = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  const name = req.query.name;
  await admin.firestore().collection('contents').doc('home').update({ name }, { merge: true });

  res.json({ result: `Name updated to: ${name}.` });
});

exports.getName = functions.https.onRequest(async (req, res) => {
  try {
    res.set('Access-Control-Allow-Origin', '*');
    const coll = admin.firestore().collection('contents').doc('home');
    const doc = await coll.get();

    if (doc.exists) {
      res.json(doc.data());
    } else {
      console.log('NO DATA!!');
    }
  } catch (error) {
    console.log('getName error: ', error);
  }
});

exports.notifyNameChange = functions.firestore.document('/contents/home')
  .onUpdate(async (snap, context) => {
    // Grab the current value of what was written to Firestore.
    console.log('snap: ', snap)
    const currentName = snap.before.data().name;
    const newName = snap.after.data().name;

    return await admin.firestore().collection('notifications').add({ message: `Name changed from ${currentName} to ${newName}` });
  });


exports.getNotifications = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  let notifications = [];
  admin.firestore().collection('notifications').onSnapshot((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      notifications.push(doc.data());
    });

    res.json(notifications);
  });
});