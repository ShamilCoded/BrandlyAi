import { FirestoreRepository } from '@/lib/repositories/base-repository';
import type {
  User,
  Business,
  Creator,
  CreatorPackage,
  Campaign,
  Recommendation,
  Proposal,
  DemoScenario,
} from '@/lib/types/domain';

export const usersRepository = new FirestoreRepository<User>('users', [
  'id',
  'email',
  'displayName',
  'role',
]);

export const businessesRepository = new FirestoreRepository<Business>('businesses', [
  'id',
  'name',
  'category',
  'industry',
]);

export const creatorsRepository = new FirestoreRepository<Creator>('creators', [
  'id',
  'name',
  'creatorType',
  'location',
  'primaryNiche',
  'platforms',
]);

export const creatorPackagesRepository = new FirestoreRepository<CreatorPackage>(
  'creator_packages',
  ['id', 'creatorId', 'title', 'pricePKR']
);

export const campaignsRepository = new FirestoreRepository<Campaign>('campaigns', [
  'id',
  'businessId',
  'title',
  'category',
  'budget',
  'currency',
]);

export const recommendationsRepository = new FirestoreRepository<Recommendation>(
  'recommendations',
  ['id', 'campaignId', 'creatorId', 'whyThisCreator']
);

export const proposalsRepository = new FirestoreRepository<Proposal>('proposals', [
  'id',
  'campaignId',
  'businessId',
  'creatorId',
  'status',
]);

export const demoDataRepository = new FirestoreRepository<DemoScenario>('demo_data', [
  'id',
  'seedVersion',
  'seededAt',
]);
