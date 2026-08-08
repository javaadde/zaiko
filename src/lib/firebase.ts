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

function createUnavailableFirestoreClient() {
  const client: any = {
    collection: () => client,
    doc: () => client,
    get: async () => ({
      data: () => null,
      docs: [],
      exists: false,
    }),
    set: async () => {},
    update: async () => {},
    delete: async () => {},
    where: () => client,
    orderBy: () => client,
    limit: () => client,
    startAfter: () => client,
    onSnapshot: () => () => {},
    batch: () => ({
      set: () => {},
      update: () => {},
      delete: () => {},
      commit: async () => {},
    }),
  };

  return client;
}

function createUnavailableStorageClient() {
  const client: any = {
    ref: () => client,
    child: () => client,
    putFile: async () => ({ ref: client }),
    putString: async () => ({ ref: client }),
    getDownloadURL: async () => '',
    delete: async () => {},
  };

  return client;
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

function wrapFirebaseFn(nativeFn: any, name: string): FirebaseLikeFn {
  const fn = ((...args: any[]) => {
    try {
      return nativeFn(...args);
    } catch {
      return createUnavailableClient(name);
    }
  }) as FirebaseLikeFn;

  fn.GoogleAuthProvider = nativeFn.GoogleAuthProvider ?? {
    credential: () => ({}),
  };

  fn.AppleAuthProvider = nativeFn.AppleAuthProvider ?? {
    credential: () => ({}),
  };

  return fn;
}

function wrapFirestoreFn(nativeFn: any) {
  const fn: any = (...args: any[]) => {
    try {
      return nativeFn(...args);
    } catch {
      return createUnavailableFirestoreClient();
    }
  };

  fn.FieldValue = nativeFn.FieldValue ?? {
    serverTimestamp: () => ({ toMillis: () => Date.now() }),
    increment: (value: number) => value,
  };

  fn.Timestamp = nativeFn.Timestamp ?? {
    fromMillis: (ms: number) => ({ toMillis: () => ms }),
  };

  return fn;
}

function wrapStorageFn(nativeFn: any) {
  const fn: any = (...args: any[]) => {
    try {
      return nativeFn(...args);
    } catch {
      return createUnavailableStorageClient();
    }
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
  auth = wrapFirebaseFn(firebaseAuth, 'Firebase Auth');
  firestore = wrapFirestoreFn(firebaseFirestore);
  storage = wrapStorageFn(firebaseStorage);
} catch {
  // Fall back to no-op/native-unavailable shims so the app can boot.
}

export { app, auth, firestore, storage };
