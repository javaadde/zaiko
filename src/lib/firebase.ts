declare const require: any;

type FirebaseLikeFn = (() => any) & {
  GoogleAuthProvider: { credential: (token: string) => any };
  AppleAuthProvider: { credential: (token: string) => any };
};

function createUnavailableClient(name: string) {
  return {
    onAuthStateChanged: (callback: (user: null) => void) => {
      callback(null);
      return () => {};
    },
    signInWithCredential: async () => {
      throw new Error(`${name} is unavailable in this build.`);
    },
    signInWithEmailAndPassword: async () => {
      throw new Error(`${name} is unavailable in this build.`);
    },
    createUserWithEmailAndPassword: async () => {
      throw new Error(`${name} is unavailable in this build.`);
    },
    signOut: async () => {},
  };
}

function createUnavailableFn(name: string): FirebaseLikeFn {
  const fn = (() => createUnavailableClient(name)) as FirebaseLikeFn;

  fn.GoogleAuthProvider = {
    credential: () => ({})
  };

  fn.AppleAuthProvider = {
    credential: () => ({})
  };

  return fn;
}

let app: any = null;
let auth: FirebaseLikeFn = createUnavailableFn('Firebase Auth');
let firestore: any = () => {
  throw new Error('Firebase Firestore is unavailable in this build.');
};
let storage: any = () => {
  throw new Error('Firebase Storage is unavailable in this build.');
};

try {
  const firebaseAppModule = require('@react-native-firebase/app');
  const firebaseAuthModule = require('@react-native-firebase/auth');
  const firebaseFirestoreModule = require('@react-native-firebase/firestore');
  const firebaseStorageModule = require('@react-native-firebase/storage');

  const firebaseApp = firebaseAppModule.default ?? firebaseAppModule;
  const firebaseAuth = firebaseAuthModule.default ?? firebaseAuthModule;
  const firebaseFirestore = firebaseFirestoreModule.default ?? firebaseFirestoreModule;
  const firebaseStorage = firebaseStorageModule.default ?? firebaseStorageModule;

  app = firebaseApp.getApp ? firebaseApp.getApp() : firebaseAppModule.getApp();
  auth = firebaseAuth;
  firestore = firebaseFirestore;
  storage = firebaseStorage;
} catch {
  // Fall back to no-op/native-unavailable shims so the app can boot.
}

export { app, auth, firestore, storage };
