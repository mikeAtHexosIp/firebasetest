const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.database();
const { CloudTasksClient } = require("@google-cloud/tasks");
const client = new CloudTasksClient();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.log("Hello logs!", { structuredData: true });
  response.set('Access-Control-Allow-Origin', '*');
  response.send("Hello from Firebase!");
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
  this.createTask('hello im testing2')
  res.set('Access-Control-Allow-Origin', '*');
  // Grab the text parameter.
  const name = req.query.name;
  // Push the new message into Firestore using the Firebase Admin SDK.
  await admin.firestore().collection('contents').doc('home').update({ name }, { merge: true });
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


exports.createTask = async function (payload = 'Hello, im testing!') {
  const MAX_SCHEDULE_LIMIT = 30 * 60 * 60 * 24; // Represents 30 days in seconds.
  const project = 'fir-test-e99ee';
  const queue = 'new-task';
  const location = 'us-central1';
  const url = 'https://us-central1-fir-test-e99ee.cloudfunctions.net/getTask';
  const email = 'fir-test-e99ee@appspot.gserviceaccount.com';
  const date = new Date('04/28/22 18:35'); // Intended date to schedule task

  // Imports the Google Cloud Tasks firebase --debug deploylibrary.
  const { v2beta3 } = require('@google-cloud/tasks');

  // Instantiates a client.
  const client = new v2beta3.CloudTasksClient();

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
  };

  const convertedDate = new Date(date);
  const currentDate = new Date();
  console.log({convertedDate, currentDate})

  // Schedule time can not be in the past.
  if (convertedDate < currentDate) {
    console.error('Scheduled date in the past.');
  } else if (convertedDate > currentDate) {
    const date_diff_in_seconds = (convertedDate - currentDate) / 1000;
    // Restrict schedule time to the 30 day maximum.
    if (date_diff_in_seconds > MAX_SCHEDULE_LIMIT) {
      console.error('Schedule time is over 30 day maximum.');
    }
    // Construct future date in Unix time.
    const date_in_seconds =
      Math.min(date_diff_in_seconds, MAX_SCHEDULE_LIMIT) + Date.now() / 1000;
    // Add schedule time to request in Unix time using Timestamp structure.
    // https://googleapis.dev/nodejs/tasks/latest/google.protobuf.html#.Timestamp
    task.scheduleTime = {
      seconds: date_in_seconds,
    };
  }

  console.log('task.scheduleTime', task.scheduleTime.seconds)

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

exports.getTask = async (req, res) => {
  req.set('no-cors')
  console.log('task res en index: ', res);
}
