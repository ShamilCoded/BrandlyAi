import { AppConfig } from '@/lib/config/env';
import {
  executeBatchOperations,
  type BatchOperation,
} from '@/lib/repositories/base-repository';
import {
  demoDataRepository,
  creatorsRepository,
  businessesRepository,
  campaignsRepository,
} from '@/lib/repositories/collections';
import {
  DEMO_USERS,
  DEMO_BUSINESSES,
  DEMO_CREATORS,
  DEMO_CREATOR_PACKAGES,
  DEMO_CAMPAIGNS,
  DEMO_RECOMMENDATIONS,
  DEMO_PROPOSALS,
} from '@/lib/seed/demo-dataset';
import type { DemoScenario } from '@/lib/types/domain';

const MANIFEST_DOC_ID = AppConfig.seedVersion;

let seedPromise: Promise<DemoScenario> | null = null;

export async function seedDemoDataIfNeeded(forceReseed = false): Promise<DemoScenario> {
  if (seedPromise && !forceReseed) {
    return seedPromise;
  }

  seedPromise = (async () => {
    if (!forceReseed) {
      const existingManifest = await demoDataRepository.readDocument(MANIFEST_DOC_ID);
      if (existingManifest && existingManifest.seedVersion === AppConfig.seedVersion) {
        const creatorCount = (await creatorsRepository.listDocuments()).length;
        const bizCount = (await businessesRepository.listDocuments()).length;
        if (creatorCount >= 40 && bizCount >= 4) {
          return existingManifest;
        }
      }
    }

    const now = new Date().toISOString();
    const ops: BatchOperation[] = [];

    for (const user of DEMO_USERS) {
      ops.push({
        type: 'set',
        collectionName: 'users',
        id: user.id,
        data: user,
      });
    }

    for (const biz of DEMO_BUSINESSES) {
      ops.push({
        type: 'set',
        collectionName: 'businesses',
        id: biz.id,
        data: biz,
      });
    }

    for (const creator of DEMO_CREATORS) {
      ops.push({
        type: 'set',
        collectionName: 'creators',
        id: creator.id,
        data: creator,
      });
    }

    for (const pkg of DEMO_CREATOR_PACKAGES) {
      ops.push({
        type: 'set',
        collectionName: 'creator_packages',
        id: pkg.id,
        data: pkg,
      });
    }

    for (const campaign of DEMO_CAMPAIGNS) {
      if (!forceReseed) {
        const existingCamp = await campaignsRepository.readDocument(campaign.id);
        if (existingCamp) continue;
      }
      ops.push({
        type: 'set',
        collectionName: 'campaigns',
        id: campaign.id,
        data: campaign,
      });
    }

    for (const rec of DEMO_RECOMMENDATIONS) {
      ops.push({
        type: 'set',
        collectionName: 'recommendations',
        id: rec.id,
        data: rec,
      });
    }

    for (const prop of DEMO_PROPOSALS) {
      ops.push({
        type: 'set',
        collectionName: 'proposals',
        id: prop.id,
        data: prop,
      });
    }

    const manifest: DemoScenario = {
      id: MANIFEST_DOC_ID,
      seedVersion: AppConfig.seedVersion,
      seededAt: now,
      totalCreators: DEMO_CREATORS.length,
      totalBusinesses: DEMO_BUSINESSES.length,
      totalCampaigns: DEMO_CAMPAIGNS.length,
      primaryBusinessId: 'biz-spacewise-pk',
      mandatoryCreatorId: 'creator-shamil-karachi',
      notes:
        'Idempotent fictional demo seed for Brandly.ai. SpaceWise is the primary demo business; Shamil is the mandatory Karachi Technology Influencer.',
      createdAt: now,
      updatedAt: now,
      isDemo: true,
      demoLabel: 'Fictional Demo Seed Manifest',
    };

    ops.push({
      type: 'set',
      collectionName: 'demo_data',
      id: MANIFEST_DOC_ID,
      data: manifest,
    });

    await executeBatchOperations(ops);
    return manifest;
  })();

  try {
    return await seedPromise;
  } finally {
    seedPromise = null;
  }
}
