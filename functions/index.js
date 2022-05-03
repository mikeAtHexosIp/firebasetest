const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.database();
const { CloudTasksClient } = require("@google-cloud/tasks");

exports.createTask = async function (payload = 'Hello, im testing!') {
  console.log('START: ', new Date());
  const project = 'fir-test-e99ee';
  const queue = 'new-task';
  const location = 'us-central1';
  const url = 'https://us-central1-fir-test-e99ee.cloudfunctions.net/helloWorld';
  const email = 'fir-test-e99ee@appspot.gserviceaccount.com';

  // Instantiates a client.
  const client = new CloudTasksClient();

  // Construct the fully qualified queue name.
  const parent = client.queuePath(project, location, queue);

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
        'Content-Type': 'application/json',
      },
      body,
    },
    scheduleTime: {
      seconds: 1 * 60 + Date.now() / 1000, // Represents 2 minute in the future.
    },
  };

  console.log('TASK: ', task);

  try {
    // Send create task request.
    const [response] = await client.createTask({ parent, task });
    console.log('response', response);
    console.log(`Created task ${response.name}`);
    return response.name;
  } catch (error) {
    // Construct error for Stackdriver Error Reporting
    console.error(Error(error.message));
  }

}

this.createTask();


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
  try {
    functions.logger.log("Hello logs!", { structuredData: true });
    response.set('Access-Control-Allow-Origin', '*');
    response.json("Hello from Firebase!");
  } catch (err) {
    console.log('HelloWorld error: ', err);
  }
});

exports.byeWorld = functions.https.onRequest((request, response) => {
  functions.logger.log("Bye logs!", { structuredData: true });
  response.set('Access-Control-Allow-Origin', '*');
  response.send("Bye from Firebase!");
});

exports.addMessage = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  // Grab the text parameter.
  const original = req.query.text;
  // Push the new message into Firestore using the Firebase Admin SDK.
  const writeResult = await admin.firestore().collection('messages').add({ original: original });
  // Send back a message that we've successfully written the message
  res.json({ result: `Message with ID: ${writeResult.id} added.` });
});

// Listens for new messages added to /messages/:documentId/original and creates an
// uppercase version of the message to /messages/:documentId/uppercase
exports.makeUppercase = functions.firestore.document('/messages/{documentId}')
  .onCreate((snap, context) => {
    // Grab the current value of what was written to Firestore.
    const original = snap.data().original;

    // Access the parameter `{documentId}` with `context.params`
    functions.logger.log('Uppercasing', context.params.documentId, original);

    const uppercase = original.toUpperCase();

    // You must return a Promise when performing asynchronous tasks inside a Functions such as
    // writing to Firestore.
    // Setting an 'uppercase' field in Firestore document returns a Promise.
    return snap.ref.set({ uppercase }, { merge: true });
  });

exports.updateName = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  // Grab the text parameter.
  const name = req.query.name;
  // Push the new message into Firestore using the Firebase Admin SDK.
  const writeResult = await admin.firestore().collection('contents').doc('home').update({ name }, { merge: true });
  // Send back a message that we've successfully written the message
  res.json({ result: `Name updated to: ${name}.` });
});

exports.getName = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  // Grab the text parameter.
  admin.firestore().collection('contents').doc('home').onSnapshot((doc) => {
    console.log("Current data: ", doc.data());
    res.json(doc.data());
  });
  // Push the new message into Firestore using the Firebase Admin SDK.
});

exports.notifyNameChange = functions.firestore.document('/contents/home')
  .onUpdate(async (snap, context) => {
    // Grab the current value of what was written to Firestore.
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