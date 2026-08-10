import { getApp } from '@react-native-firebase/app';
import { create } from 'zustand';
import Constants from 'expo-constants';
import type { User, Company, Environment } from '@/types';
import { getUserFriendlyError } from '@/lib/errors';
import { getActiveCompanyId, getActiveEnvironmentId, setActiveCompanyId, setActiveEnvironmentId, setUserName } from '@/lib/mmkv';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from '@react-native-firebase/auth';
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
  writeBatch,
} from '@react-native-firebase/firestore';

const firebaseApp = getApp();
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const googleWebClientId = '613503506472-c20jaa0nck646h9vmbbmocm7ird2iu9s.apps.googleusercontent.com';

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

let googleSignInConfigured = false;

export const useAuthStore = create<AuthState & AuthActions>()((set, get) => ({
  status: 'loading',
  currentUser: null,
  currentCompany: null,
  currentEnvironment: null,
  companies: [],
  environments: [],
  authError: null,

  initAuth: () => {
    if (!googleSignInConfigured) {
      googleSignInConfigured = true;
      void (async () => {
        try {
          const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
          GoogleSignin.configure({ webClientId: googleWebClientId });
          await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        } catch {
          // Google Sign-In config is best-effort; sign-in will still attempt.
        }
      })();
    }

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
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

        const immediateUser: User = {
          uid: fbUser.uid,
          displayName: fbUser.displayName ?? 'User',
          email: fbUser.email ?? '',
          personalColor: '#1F8A5B',
          photoURL: fbUser.photoURL ?? null,
          phoneNumber: fbUser.phoneNumber ?? null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          deletedAt: null,
        };

        // Keep status as 'loading' until profile + workspace data are loaded
        set({ currentUser: immediateUser, authError: null });

        const userRef = doc(db, 'users', fbUser.uid);
        const snap = await userRef.get();
        const data = snap.data() ?? {};
        const user: User = {
          ...immediateUser,
          displayName: data.displayName ?? immediateUser.displayName,
          email: data.email ?? immediateUser.email,
          personalColor: data.personalColor ?? immediateUser.personalColor,
          photoURL: data.photoURL ?? immediateUser.photoURL,
          phoneNumber: data.phoneNumber ?? immediateUser.phoneNumber,
          createdAt: data.createdAt?.toMillis() ?? Date.now(),
          updatedAt: data.updatedAt?.toMillis() ?? Date.now(),
          deletedAt: data.deletedAt?.toMillis() ?? null,
        };

          const companiesSnap = await getDocs(collection(userRef, 'companies'));
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

        const savedCompanyId = getActiveCompanyId();
        const activeCompanyId = companies.some((c) => c.id === savedCompanyId) ? savedCompanyId : (companies[0]?.id ?? null);
        const activeCompany = companies.find((c) => c.id === activeCompanyId) ?? null;

        let environments: Environment[] = [];
        if (activeCompany) {
          // Security rules require membership-based filtering when listing environments.
          // Query only environments where the current user is a member to satisfy rules.
          const envSnap = await doc(db, 'companies', activeCompany.id)
            .collection('environments')
            .where('members', 'array-contains', fbUser.uid)
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

        const savedEnvId = getActiveEnvironmentId();
        const activeEnvironment = environments.find((e) => e.id === savedEnvId) ?? environments[0] ?? null;

        set({
          currentUser: user,
          companies,
          currentCompany: activeCompany,
          environments,
          currentEnvironment: activeEnvironment,
          authError: null,
          status: 'authenticated',
        });
      } catch (err) {
        // If the user is signed in but data fetch failed (eg. Firestore perms),
        // keep the session and surface an error instead of logging out.
        if (auth.currentUser) {
          set({
            status: 'authenticated',
            authError: getUserFriendlyError(err, 'Auth initialization failed'),
          });
        } else {
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
      }
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
      // Ensure configured in case initAuth's best-effort setup hasn't run yet
      try {
        GoogleSignin.configure({ webClientId: googleWebClientId });
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      } catch {}
      const signInResult: any = await GoogleSignin.signIn();
      // Support multiple return shapes across library versions
      let idToken: string | undefined = signInResult?.data?.idToken ?? signInResult?.idToken;
      let accessToken: string | undefined = signInResult?.data?.accessToken ?? signInResult?.accessToken;
      if ((!idToken || !accessToken) && typeof GoogleSignin.getTokens === 'function') {
        try {
          const tokens = await GoogleSignin.getTokens();
          idToken = idToken ?? tokens?.idToken ?? undefined;
          accessToken = accessToken ?? tokens?.accessToken ?? undefined;
        } catch {}
      }
      if (!idToken && !accessToken) {
        // Try a hard refresh of Google session once
        try { await GoogleSignin.signOut(); } catch {}
        const retry = await GoogleSignin.signIn();
        idToken = retry?.data?.idToken ?? retry?.idToken ?? idToken;
        accessToken = retry?.data?.accessToken ?? retry?.accessToken ?? accessToken;
      }
      if (!idToken && !accessToken) throw new Error('Google Sign-In failed: no id or access token');
      const credential = GoogleAuthProvider.credential(idToken ?? undefined as any, accessToken ?? undefined as any);
      await signInWithCredential(auth, credential);
    } catch (err) {
      const message = getUserFriendlyError(err, 'Google Sign-In failed');
      set({ authError: message, status: 'unauthenticated' });
    }
  },

  signInWithEmail: async (email, password) => {
    set({ authError: null, status: 'loading' });
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const message = getUserFriendlyError(err, 'Email sign-in failed');
      set({ authError: message, status: 'unauthenticated' });
    }
  },

  signUpWithEmail: async (email, password, displayName) => {
    set({ authError: null, status: 'loading' });
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;
      await setDoc(doc(db, 'users', uid), {
        displayName,
        email,
        personalColor: '#1F8A5B',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      const message = getUserFriendlyError(err, 'Email sign-up failed');
      set({ authError: message, status: 'unauthenticated' });
    }
  },

  signOut: async () => {
    try {
      await firebaseSignOut(auth);
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
    const companyRef = doc(collection(db, 'companies'));
    const companyId = companyRef.id;

    try {
      const batch = writeBatch(db);
      batch.set(companyRef, {
        name,
        slug,
        ownerId: user.uid,
        members: [user.uid],
        admins: [user.uid],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      batch.set(doc(db, 'users', user.uid, 'companies', companyId), {
        name,
        slug,
        ownerId: user.uid,
        members: [user.uid],
        admins: [user.uid],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      batch.set(doc(db, 'companies', companyId, 'environments', 'development'), {
        companyId,
        name: 'Development',
        type: 'development',
        members: [user.uid],
        admins: [user.uid],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      batch.set(doc(db, 'companies', companyId, 'environments', 'production'), {
        companyId,
        name: 'Production',
        type: 'production',
        members: [user.uid],
        admins: [user.uid],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
    } catch (err) {
      console.error('createCompany batch failed', err);
      throw err;
    }

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

    const envRef = doc(collection(doc(db, 'companies', companyId), 'environments'));

    await setDoc(envRef, {
      companyId,
      name,
      type,
      members: [user.uid],
      admins: [user.uid],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
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

    const user = get().currentUser;
    if (!user) return;
    let environments: Environment[] = [];
    try {
      // Match Firestore rules by filtering environments by membership.
      const envSnap = await doc(db, 'companies', companyId)
        .collection('environments')
        .where('members', 'array-contains', user.uid)
        .get();

      environments = envSnap.docs.map((d) => {
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
    } catch (err) {
      // Gracefully handle rules issues; still switch company
      environments = [];
    }

    set({
      currentCompany: company,
      environments,
      currentEnvironment: environments[0] ?? null,
    });
    setActiveCompanyId(companyId);
  },

  switchEnvironment: async (environmentId) => {
    const env = get().environments.find((e) => e.id === environmentId) ?? null;
    if (!env) return;
    set({ currentEnvironment: env });
    setActiveEnvironmentId(environmentId);
  },

  refreshProfile: async () => {
    const user = get().currentUser;
    if (!user) return;
    const snap = await doc(db, 'users', user.uid).get();
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
