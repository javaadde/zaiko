import { create } from 'zustand';
import Constants from 'expo-constants';
import type { User, Company, Environment } from '@/types';
import { auth, firestore } from '@/lib/firebase';
import { getUserFriendlyError } from '@/lib/errors';
import { setUserName } from '@/lib/mmkv';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

export type AuthState = {
  status: AuthStatus;
  currentUser: User | null;
  currentCompany: Company | null;
  currentEnvironment: Environment | null;
  companies: Company[];
  environments: Environment[];
  authError: string | null;
};

export type AuthActions = {
  initAuth: () => () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  createCompany: (name: string) => Promise<Company>;
  createEnvironment: (companyId: string, name: string, type: Environment['type']) => Promise<Environment>;
  switchCompany: (companyId: string) => Promise<void>;
  switchEnvironment: (environmentId: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
};

export const useAuthStore = create<AuthState & AuthActions>()((set, get) => ({
  status: 'loading',
  currentUser: null,
  currentCompany: null,
  currentEnvironment: null,
  companies: [],
  environments: [],
  authError: null,

  initAuth: () => {
    const unsub = auth().onAuthStateChanged((fbUser) => {
      void (async () => {
        try {
          if (!fbUser) {
            set({
              status: 'unauthenticated',
              currentUser: null,
              currentCompany: null,
              currentEnvironment: null,
              companies: [],
              environments: [],
              authError: null,
            });
            return;
          }

          const userRef = firestore().collection('users').doc(fbUser.uid);
          const snap = await userRef.get();
          const data = snap.data() ?? {};
          const user: User = {
            uid: fbUser.uid,
            displayName: data.displayName ?? fbUser.displayName ?? 'User',
            email: data.email ?? fbUser.email ?? '',
            personalColor: data.personalColor ?? '#1F8A5B',
            photoURL: data.photoURL ?? fbUser.photoURL ?? null,
            phoneNumber: data.phoneNumber ?? fbUser.phoneNumber ?? null,
            createdAt: data.createdAt?.toMillis() ?? Date.now(),
            updatedAt: data.updatedAt?.toMillis() ?? Date.now(),
            deletedAt: data.deletedAt?.toMillis() ?? null,
          };

          const companiesSnap = await userRef.collection('companies').get();
          const companies: Company[] = companiesSnap.docs.map((d) => {
            const c = d.data();
            return {
              id: d.id,
              name: c.name ?? '',
              slug: c.slug ?? '',
              ownerId: c.ownerId ?? '',
              members: c.members ?? [],
              admins: c.admins ?? [],
              createdAt: c.createdAt?.toMillis() ?? Date.now(),
              updatedAt: c.updatedAt?.toMillis() ?? Date.now(),
              deletedAt: c.deletedAt?.toMillis() ?? null,
            };
          });

          const activeCompanyId = companies[0]?.id ?? null;
          const activeCompany = companies.find((c) => c.id === activeCompanyId) ?? null;

          let environments: Environment[] = [];
          if (activeCompany) {
            const envSnap = await firestore()
              .collection('companies')
              .doc(activeCompany.id)
              .collection('environments')
              .get();
            environments = envSnap.docs.map((d) => {
              const e = d.data();
              return {
                id: d.id,
                companyId: e.companyId ?? activeCompany.id,
                name: e.name ?? '',
                type: e.type ?? 'development',
                members: e.members ?? [],
                admins: e.admins ?? [],
                createdAt: e.createdAt?.toMillis() ?? Date.now(),
                updatedAt: e.updatedAt?.toMillis() ?? Date.now(),
                deletedAt: e.deletedAt?.toMillis() ?? null,
              };
            });
          }

          const activeEnvironment = environments[0] ?? null;

          set({
            status: 'authenticated',
            currentUser: user,
            companies,
            currentCompany: activeCompany,
            environments,
            currentEnvironment: activeEnvironment,
            authError: null,
          });
        } catch (err) {
          set({
            status: 'unauthenticated',
            currentUser: null,
            currentCompany: null,
            currentEnvironment: null,
            companies: [],
            environments: [],
            authError: getUserFriendlyError(err, 'Auth initialization failed'),
          });
        }
      })();
    });

    return unsub;
  },

  signInWithGoogle: async () => {
    set({ authError: null, status: 'loading' });
    try {
      if (Constants.appOwnership === 'expo') {
        throw new Error('Google Sign-In requires a development build, not Expo Go.');
      }
      const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (!response.data?.idToken) {
        throw new Error('Google Sign-In failed: no id token');
      }
      const credential = auth.GoogleAuthProvider.credential(response.data.idToken);
      await auth().signInWithCredential(credential);
    } catch (err) {
      const message = getUserFriendlyError(err, 'Google Sign-In failed');
      set({ authError: message, status: 'unauthenticated' });
    }
  },

  signInWithEmail: async (email, password) => {
    set({ authError: null, status: 'loading' });
    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (err) {
      const message = getUserFriendlyError(err, 'Email sign-in failed');
      set({ authError: message, status: 'unauthenticated' });
    }
  },

  signUpWithEmail: async (email, password, displayName) => {
    set({ authError: null, status: 'loading' });
    try {
      const cred = await auth().createUserWithEmailAndPassword(email, password);
      const uid = cred.user.uid;
      await firestore().collection('users').doc(uid).set({
        displayName,
        email,
        personalColor: '#1F8A5B',
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (err) {
      const message = getUserFriendlyError(err, 'Email sign-up failed');
      set({ authError: message, status: 'unauthenticated' });
    }
  },

  signOut: async () => {
    try {
      await auth().signOut();
      setUserName('');
      set({
        status: 'unauthenticated',
        currentUser: null,
        currentCompany: null,
        currentEnvironment: null,
        companies: [],
        environments: [],
        authError: null,
      });
    } catch (err) {
      set({ authError: getUserFriendlyError(err, 'Sign out failed') });
    }
  },

  clearError: () => set({ authError: null }),

  createCompany: async (name) => {
    const user = get().currentUser;
    if (!user) throw new Error('Not authenticated');

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const companyRef = firestore().collection('companies').doc();
    const companyId = companyRef.id;

    const batch = firestore().batch();
    batch.set(companyRef, {
      name,
      slug,
      ownerId: user.uid,
      members: [user.uid],
      admins: [user.uid],
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    batch.set(companyRef.collection('environments').doc('development'), {
      companyId,
      name: 'Development',
      type: 'development',
      members: [user.uid],
      admins: [user.uid],
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    batch.set(companyRef.collection('environments').doc('production'), {
      companyId,
      name: 'Production',
      type: 'production',
      members: [user.uid],
      admins: [user.uid],
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();

    const company: Company = {
      id: companyId,
      name,
      slug,
      ownerId: user.uid,
      members: [user.uid],
      admins: [user.uid],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    };

    set((state) => ({
      companies: [...state.companies, company],
      currentCompany: company,
      environments: [
        {
          id: 'development',
          companyId,
          name: 'Development',
          type: 'development',
          members: [user.uid],
          admins: [user.uid],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          deletedAt: null,
        },
        {
          id: 'production',
          companyId,
          name: 'Production',
          type: 'production',
          members: [user.uid],
          admins: [user.uid],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          deletedAt: null,
        },
      ],
      currentEnvironment: {
        id: 'development',
        companyId,
        name: 'Development',
        type: 'development',
        members: [user.uid],
        admins: [user.uid],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        deletedAt: null,
      },
    }));

    return company;
  },

  createEnvironment: async (companyId, name, type) => {
    const user = get().currentUser;
    if (!user) throw new Error('Not authenticated');

    const envRef = firestore()
      .collection('companies')
      .doc(companyId)
      .collection('environments')
      .doc();

    await envRef.set({
      companyId,
      name,
      type,
      members: [user.uid],
      admins: [user.uid],
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    const environment: Environment = {
      id: envRef.id,
      companyId,
      name,
      type,
      members: [user.uid],
      admins: [user.uid],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    };

    set((state) => ({
      environments: [...state.environments, environment],
    }));

    return environment;
  },

  switchCompany: async (companyId) => {
    const company = get().companies.find((c) => c.id === companyId) ?? null;
    if (!company) return;

    const envSnap = await firestore()
      .collection('companies')
      .doc(companyId)
      .collection('environments')
      .get();

    const environments: Environment[] = envSnap.docs.map((d) => {
      const e = d.data();
      return {
        id: d.id,
        companyId: e.companyId ?? companyId,
        name: e.name ?? '',
        type: e.type ?? 'development',
        members: e.members ?? [],
        admins: e.admins ?? [],
        createdAt: e.createdAt?.toMillis() ?? Date.now(),
        updatedAt: e.updatedAt?.toMillis() ?? Date.now(),
        deletedAt: e.deletedAt?.toMillis() ?? null,
      };
    });

    set({
      currentCompany: company,
      environments,
      currentEnvironment: environments[0] ?? null,
    });
  },

  switchEnvironment: async (environmentId) => {
    const env = get().environments.find((e) => e.id === environmentId) ?? null;
    if (!env) return;
    set({ currentEnvironment: env });
  },

  refreshProfile: async () => {
    const user = get().currentUser;
    if (!user) return;
    const snap = await firestore().collection('users').doc(user.uid).get();
    const data = snap.data() ?? {};
    set({
      currentUser: {
        ...user,
        displayName: data.displayName ?? user.displayName,
        photoURL: data.photoURL ?? user.photoURL,
        updatedAt: data.updatedAt?.toMillis() ?? user.updatedAt,
      },
    });
  },
}));
