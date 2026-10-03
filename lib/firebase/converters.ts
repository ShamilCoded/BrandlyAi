import type { BaseEntity } from '@/lib/types/domain';

export type DatabaseErrorCode =
  | 'NOT_FOUND'
  | 'INVALID_RECORD'
  | 'NETWORK_ERROR'
  | 'PERMISSION_DENIED'
  | 'UNKNOWN_ERROR';

export class DatabaseError extends Error {
  public readonly code: DatabaseErrorCode;
  public readonly collection: string;
  public readonly documentId?: string;

  constructor(
    message: string,
    code: DatabaseErrorCode,
    collection: string,
    documentId?: string
  ) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    this.collection = collection;
    this.documentId = documentId;
  }
}

export function normalizeFirebaseError(
  err: unknown,
  collection: string,
  documentId?: string
): DatabaseError {
  if (err instanceof DatabaseError) {
    return err;
  }
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();

  if (lower.includes('permission-denied') || lower.includes('insufficient permissions')) {
    return new DatabaseError(
      `Permission denied accessing ${collection}${documentId ? `/${documentId}` : ''}.`,
      'PERMISSION_DENIED',
      collection,
      documentId
    );
  }

  if (lower.includes('unavailable') || lower.includes('network') || lower.includes('offline')) {
    return new DatabaseError(
      `Network error while communicating with Firestore collection ${collection}.`,
      'NETWORK_ERROR',
      collection,
      documentId
    );
  }

  if (lower.includes('not-found') || lower.includes('no document')) {
    return new DatabaseError(
      `Document ${documentId || ''} not found in ${collection}.`,
      'NOT_FOUND',
      collection,
      documentId
    );
  }

  return new DatabaseError(
    `Database operation failed on ${collection}: ${message}`,
    'UNKNOWN_ERROR',
    collection,
    documentId
  );
}

export function toFirestoreDocument<T extends BaseEntity>(
  entity: T
): Record<string, unknown> {
  if (!entity || typeof entity !== 'object' || !entity.id) {
    throw new DatabaseError(
      'Cannot serialize invalid entity: missing required id.',
      'INVALID_RECORD',
      'unknown'
    );
  }

  const now = new Date().toISOString();
  const clone: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(entity)) {
    if (value !== undefined) {
      clone[key] = value;
    }
  }

  clone.createdAt = entity.createdAt || now;
  clone.updatedAt = now;
  clone.isDemo = Boolean(entity.isDemo);

  return clone;
}

export function fromFirestoreDocument<T extends BaseEntity>(
  id: string,
  raw: Record<string, unknown> | undefined | null,
  collectionName: string,
  requiredFields: (keyof T)[] = []
): T {
  if (!raw || typeof raw !== 'object') {
    throw new DatabaseError(
      `Missing or malformed document payload in ${collectionName}/${id}`,
      'NOT_FOUND',
      collectionName,
      id
    );
  }

  for (const field of requiredFields) {
    const key = String(field);
    if (raw[key] === undefined || raw[key] === null) {
      throw new DatabaseError(
        `Invalid record in ${collectionName}/${id}: missing required field "${key}"`,
        'INVALID_RECORD',
        collectionName,
        id
      );
    }
  }

  const now = new Date().toISOString();
  return {
    ...raw,
    id: String(raw.id || id),
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : now,
    isDemo: Boolean(raw.isDemo),
  } as T;
}
