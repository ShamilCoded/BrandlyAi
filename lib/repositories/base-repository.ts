import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy as firestoreOrderBy,
  limit as firestoreLimit,
  writeBatch,
  type QueryConstraint,
  type WhereFilterOp,
} from 'firebase/firestore';
import type { BaseEntity } from '@/lib/types/domain';
import { getFirestoreDb } from '@/lib/firebase/client';
import {
  DatabaseError,
  fromFirestoreDocument,
  normalizeFirebaseError,
  toFirestoreDocument,
} from '@/lib/firebase/converters';

export type FirestoreCollectionName =
  | 'users'
  | 'businesses'
  | 'creators'
  | 'creator_packages'
  | 'campaigns'
  | 'recommendations'
  | 'proposals'
  | 'demo_data';

export interface QueryFilter<T> {
  field: keyof T | string;
  operator:
    | '=='
    | '!='
    | '<'
    | '<='
    | '>'
    | '>='
    | 'array-contains'
    | 'in'
    | 'array-contains-any';
  value: unknown;
}

export interface QueryOptions<T> {
  filters?: QueryFilter<T>[];
  orderByField?: keyof T | string;
  orderDirection?: 'asc' | 'desc';
  limitCount?: number;
}

export interface BatchOperation<T extends BaseEntity = BaseEntity> {
  type: 'set' | 'update' | 'delete';
  collectionName: FirestoreCollectionName;
  id: string;
  data?: Partial<T>;
}

const memoryStore: Record<FirestoreCollectionName, Map<string, Record<string, unknown>>> = {
  users: new Map(),
  businesses: new Map(),
  creators: new Map(),
  creator_packages: new Map(),
  campaigns: new Map(),
  recommendations: new Map(),
  proposals: new Map(),
  demo_data: new Map(),
};

let isFirestoreUnavailable = false;

const STORAGE_PREFIX = 'brandly_firestore_v2_';

function loadCollectionMap(name: FirestoreCollectionName): Map<string, Record<string, unknown>> {
  const map = memoryStore[name];
  if (typeof window !== 'undefined' && map.size === 0) {
    try {
      const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${name}`);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, Record<string, unknown>>;
        for (const [k, v] of Object.entries(parsed)) {
          map.set(k, v);
        }
      }
    } catch {
      // storage error ignored
    }
  }
  return map;
}

function persistCollectionMap(name: FirestoreCollectionName): void {
  if (typeof window !== 'undefined') {
    try {
      const map = memoryStore[name];
      const obj: Record<string, Record<string, unknown>> = {};
      map.forEach((val, key) => {
        obj[key] = val;
      });
      window.localStorage.setItem(`${STORAGE_PREFIX}${name}`, JSON.stringify(obj));
    } catch {
      // quota error ignored
    }
  }
}

function matchesFilter(docData: Record<string, unknown>, filter: QueryFilter<unknown>): boolean {
  const fieldVal = docData[String(filter.field)];
  const target = filter.value;

  switch (filter.operator) {
    case '==':
      return fieldVal === target;
    case '!=':
      return fieldVal !== target;
    case '<':
      return typeof fieldVal === 'number' && typeof target === 'number' && fieldVal < target;
    case '<=':
      return typeof fieldVal === 'number' && typeof target === 'number' && fieldVal <= target;
    case '>':
      return typeof fieldVal === 'number' && typeof target === 'number' && fieldVal > target;
    case '>=':
      return typeof fieldVal === 'number' && typeof target === 'number' && fieldVal >= target;
    case 'array-contains':
      return Array.isArray(fieldVal) && fieldVal.includes(target);
    case 'in':
      return Array.isArray(target) && target.includes(fieldVal);
    case 'array-contains-any':
      return (
        Array.isArray(fieldVal) &&
        Array.isArray(target) &&
        target.some((item) => fieldVal.includes(item))
      );
    default:
      return true;
  }
}

export class FirestoreRepository<T extends BaseEntity> {
  private readonly collectionName: FirestoreCollectionName;
  private readonly requiredFields: (keyof T)[];

  constructor(collectionName: FirestoreCollectionName, requiredFields: (keyof T)[] = []) {
    this.collectionName = collectionName;
    this.requiredFields = requiredFields;
  }

  async createDocument(entity: T): Promise<T> {
    const payload = toFirestoreDocument(entity);
    const store = loadCollectionMap(this.collectionName);
    store.set(entity.id, payload);
    persistCollectionMap(this.collectionName);

    if (!isFirestoreUnavailable) {
      const db = getFirestoreDb();
      if (db) {
        try {
          const ref = doc(db, this.collectionName, entity.id);
          await setDoc(ref, payload);
        } catch (err) {
          console.warn(`[Brandly.ai] Cloud Firestore createDocument unavailable for ${this.collectionName}/${entity.id}, using local persistence:`, err);
          isFirestoreUnavailable = true;
        }
      }
    }

    return fromFirestoreDocument<T>(
      entity.id,
      payload,
      this.collectionName,
      this.requiredFields
    );
  }

  async readDocument(id: string): Promise<T | null> {
    if (!id) return null;

    if (!isFirestoreUnavailable) {
      const db = getFirestoreDb();
      if (db) {
        try {
          const ref = doc(db, this.collectionName, id);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            return fromFirestoreDocument<T>(
              snap.id,
              snap.data() as Record<string, unknown>,
              this.collectionName,
              this.requiredFields
            );
          }
        } catch (err) {
          console.warn(`[Brandly.ai] Cloud Firestore readDocument unavailable for ${this.collectionName}/${id}, using local persistence:`, err);
          isFirestoreUnavailable = true;
        }
      }
    }

    const store = loadCollectionMap(this.collectionName);
    const raw = store.get(id);
    if (!raw) {
      return null;
    }
    return fromFirestoreDocument<T>(id, raw, this.collectionName, this.requiredFields);
  }

  async updateDocument(id: string, updates: Partial<T>): Promise<T> {
    const existing = await this.readDocument(id);
    if (!existing) {
      throw new DatabaseError(
        `Cannot update missing document ${this.collectionName}/${id}`,
        'NOT_FOUND',
        this.collectionName,
        id
      );
    }

    const merged: T = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };
    const payload = toFirestoreDocument(merged);
    const store = loadCollectionMap(this.collectionName);
    store.set(id, payload);
    persistCollectionMap(this.collectionName);

    if (!isFirestoreUnavailable) {
      const db = getFirestoreDb();
      if (db) {
        try {
          const ref = doc(db, this.collectionName, id);
          await updateDoc(ref, payload);
        } catch (err) {
          console.warn(`[Brandly.ai] Cloud Firestore updateDocument unavailable for ${this.collectionName}/${id}, using local persistence:`, err);
          isFirestoreUnavailable = true;
        }
      }
    }

    return fromFirestoreDocument<T>(id, payload, this.collectionName, this.requiredFields);
  }

  async deleteDocument(id: string): Promise<boolean> {
    const store = loadCollectionMap(this.collectionName);
    store.delete(id);
    persistCollectionMap(this.collectionName);

    if (!isFirestoreUnavailable) {
      const db = getFirestoreDb();
      if (db) {
        try {
          const ref = doc(db, this.collectionName, id);
          await deleteDoc(ref);
        } catch (err) {
          console.warn(`[Brandly.ai] Cloud Firestore deleteDocument unavailable for ${this.collectionName}/${id}:`, err);
          isFirestoreUnavailable = true;
        }
      }
    }

    return true;
  }

  async listDocuments(): Promise<T[]> {
    return this.queryDocuments({});
  }

  async queryDocuments(options: QueryOptions<T> = {}): Promise<T[]> {
    if (!isFirestoreUnavailable) {
      const db = getFirestoreDb();
      if (db) {
        try {
          const constraints: QueryConstraint[] = [];
          if (options.filters) {
            for (const f of options.filters) {
              constraints.push(
                where(String(f.field), f.operator as WhereFilterOp, f.value)
              );
            }
          }
          if (options.orderByField) {
            constraints.push(
              firestoreOrderBy(String(options.orderByField), options.orderDirection || 'asc')
            );
          }
          if (options.limitCount && options.limitCount > 0) {
            constraints.push(firestoreLimit(options.limitCount));
          }

          const q = query(collection(db, this.collectionName), ...constraints);
          const snap = await getDocs(q);
          const results: T[] = [];
          snap.forEach((docSnap) => {
            try {
              const item = fromFirestoreDocument<T>(
                docSnap.id,
                docSnap.data() as Record<string, unknown>,
                this.collectionName,
                this.requiredFields
              );
              results.push(item);
            } catch {
              // safely skip
            }
          });
          if (results.length > 0) {
            return results;
          }
        } catch (err) {
          console.warn(`[Brandly.ai] Cloud Firestore queryDocuments unavailable for ${this.collectionName}, using local store:`, err);
          isFirestoreUnavailable = true;
        }
      }
    }

    const store = loadCollectionMap(this.collectionName);
    let records: T[] = [];
    for (const [id, raw] of store.entries()) {
      try {
        const item = fromFirestoreDocument<T>(id, raw, this.collectionName, this.requiredFields);
        records.push(item);
      } catch (err) {
        console.warn(`[Brandly.ai] Skipped malformed local record ${this.collectionName}/${id}:`, err);
      }
    }

    if (options.filters && options.filters.length > 0) {
      records = records.filter((rec) =>
        options.filters!.every((f) =>
          matchesFilter(rec as unknown as Record<string, unknown>, f as QueryFilter<unknown>)
        )
      );
    }

    if (options.orderByField) {
      const fieldKey = String(options.orderByField);
      const dir = options.orderDirection === 'desc' ? -1 : 1;
      records.sort((a, b) => {
        const va = (a as unknown as Record<string, unknown>)[fieldKey];
        const vb = (b as unknown as Record<string, unknown>)[fieldKey];
        if (va === vb) return 0;
        if (va === undefined || va === null) return 1;
        if (vb === undefined || vb === null) return -1;
        return va > vb ? dir : -dir;
      });
    }

    if (options.limitCount && options.limitCount > 0) {
      records = records.slice(0, options.limitCount);
    }

    return records;
  }
}

export async function executeBatchOperations(
  operations: BatchOperation[]
): Promise<{ committedCount: number }> {
  if (!operations.length) {
    return { committedCount: 0 };
  }

  const now = new Date().toISOString();

  // Always write immediately to local memory/localStorage store
  const touchedCollections = new Set<FirestoreCollectionName>();
  for (const op of operations) {
    const store = loadCollectionMap(op.collectionName);
    touchedCollections.add(op.collectionName);

    if (op.type === 'set' && op.data) {
      store.set(op.id, {
        ...op.data,
        id: op.id,
        createdAt: op.data.createdAt || now,
        updatedAt: now,
      });
    } else if (op.type === 'update' && op.data) {
      const current = store.get(op.id) || { id: op.id, createdAt: now };
      store.set(op.id, {
        ...current,
        ...op.data,
        id: op.id,
        updatedAt: now,
      });
    } else if (op.type === 'delete') {
      store.delete(op.id);
    }
  }

  touchedCollections.forEach((col) => persistCollectionMap(col));

  // Mirror to Cloud Firestore if available
  if (!isFirestoreUnavailable) {
    const db = getFirestoreDb();
    if (db) {
      try {
        const batch = writeBatch(db);
        for (const op of operations) {
          const ref = doc(db, op.collectionName, op.id);
          if (op.type === 'set' && op.data) {
            batch.set(ref, {
              ...op.data,
              id: op.id,
              createdAt: op.data.createdAt || now,
              updatedAt: now,
            });
          } else if (op.type === 'update' && op.data) {
            batch.update(ref, {
              ...op.data,
              updatedAt: now,
            });
          } else if (op.type === 'delete') {
            batch.delete(ref);
          }
        }
        await batch.commit();
      } catch (err) {
        console.warn('[Brandly.ai] Cloud Firestore batch commit unavailable, preserved in local storage:', err);
        isFirestoreUnavailable = true;
      }
    }
  }

  return { committedCount: operations.length };
}
