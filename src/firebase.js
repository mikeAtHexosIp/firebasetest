import firebase from 'firebase/app';
import 'firebase/firebase-firestore'
import 'firebase/firebase-auth';
import 'firebase/firebase-functions';
import 'firebase/firebase-storage';
import { firebaseConfig } from './settings';

firebase.initializeApp(firebaseConfig);

const Firestore = firebase.firestore();
Firestore.settings({ host: "localhost:8080", ssl: false });

const Auth = firebase.auth();
const Functions = firebase.app().functions('us-central1');
const Storage = firebase.storage();

export { Firestore, Auth, Functions, Storage };