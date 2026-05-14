import { collection, doc, setDoc, getDocs, deleteDoc, updateDoc, query, where, orderBy, getDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface Project {
  id: string; // The firestore document ID
  title: string;
  code: string;
  description: string;
  ownerId: string;
  published: boolean;
  createdAt: any; // Timestamp or serverTimestamp
  updatedAt: any;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, authUser: any) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: authUser?.uid,
      email: authUser?.email,
      emailVerified: authUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Ensure the user entity exists
export async function syncUser(user: any) {
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName || 'Unknown',
        email: user.email || '',
        photoURL: user.photoURL || '',
        createdAt: serverTimestamp()
      });
    } else {
      // Optional: Update name/photo if they changed, skipping for brevity
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`, user);
  }
}

export async function publishProject(
  user: any,
  projectData: Omit<Project, 'id' | 'ownerId' | 'createdAt' | 'updatedAt' | 'published'>
) {
  const projectId = crypto.randomUUID();
  const projectRef = doc(db, 'projects', projectId);
  
  try {
    await setDoc(projectRef, {
      title: projectData.title,
      code: projectData.code,
      description: projectData.description,
      ownerId: user.uid,
      published: true, // "deploy it globally"
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return projectId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `projects/${projectId}`, user);
  }
}

export async function fetchPublishedProjects(user: any): Promise<Project[]> {
  try {
    // Only published projects
    const q = query(
      collection(db, 'projects'),
      where('published', '==', true)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Project));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'projects', user);
    return [];
  }
}
