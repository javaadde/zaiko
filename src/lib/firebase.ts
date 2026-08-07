import { getApp, initializeApp, type FirebaseApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

const app: FirebaseApp = getApp();

export { app, auth, firestore, storage };
