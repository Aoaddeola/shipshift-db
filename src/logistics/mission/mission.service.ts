import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDatabase } from '../../orbitdb/inject-database.decorator.js';
import { Mission, MissionStatus } from './mission.types.js';
import { Database } from '../../orbitdb/database.js';
import { randomUUID } from 'node:crypto';
import { MissionCreateDto } from './mission-create.dto.js';
import { MissionUpdateDto } from './mission-update.dto.js';
import { JourneyService } from '../journey/journey.service.js';
import { CuratorService } from '../../users/curator/curator.service.js';

@Injectable()
export class MissionService {
  private readonly logger = new Logger(MissionService.name);

  constructor(
    @InjectDatabase('mission') private database: Database<Mission>,
    @Inject(CuratorService) private curatorService: CuratorService,
    @Inject(JourneyService) private journeyService: JourneyService,
  ) {}

  async createMission(
    mission: Omit<
      Mission,
      'id' | 'createdAt' | 'updatedAt' | 'curator' | 'journeys'
    >,
  ): Promise<Mission> {
    const id = randomUUID();
    const now = new Date().toISOString();

    this.logger.log(`Creating mission: ${id}`);
    const newMission: Mission = {
      id,
      createdAt: now,
      updatedAt: now,
      ...mission,
      journeyIds: mission.journeyIds || [],
      status: mission.status || MissionStatus.DRAFT,
    };

    await this.database.put(newMission);
    return newMission;
  }

  async getMission(id: string, include?: string[]): Promise<Mission> {
    const entry = await this.database.get(id);
    if (!entry) {
      throw new NotFoundException('Mission not found');
    }

    return this.populateRelations(entry, include);
  }

  async getMissions(include?: string[]): Promise<Mission[]> {
    const all = await this.database.all();
    return Promise.all(
      all.map((mission) => this.populateRelations(mission, include)),
    );
  }

  async getMissionsByCurator(
    curatorId: string,
    include?: string[],
  ): Promise<Mission[]> {
    const all = await this.database.all();
    const missions = all.filter((mission) => mission.curatorId === curatorId);

    return Promise.all(
      missions.map((mission) => this.populateRelations(mission, include)),
    );
  }

  async getMissionsByStatus(
    status: MissionStatus,
    include?: string[],
  ): Promise<Mission[]> {
    const all = await this.database.all();
    const missions = all.filter((mission) => mission.status === status);

    return Promise.all(
      missions.map((mission) => this.populateRelations(mission, include)),
    );
  }

  async getMissionsByCuratorAndStatus(
    curatorId: string,
    status: MissionStatus,
    include?: string[],
  ): Promise<Mission[]> {
    const all = await this.database.all();
    const missions = all.filter(
      (mission) => mission.curatorId === curatorId && mission.status === status,
    );

    return Promise.all(
      missions.map((mission) => this.populateRelations(mission, include)),
    );
  }

  private async populateRelations(
    mission: Mission,
    include?: string[],
  ): Promise<Mission> {
    // Clone the mission to avoid modifying the original
    const populatedMission = { ...mission };

    // Handle curator population
    if (include?.includes('curator')) {
      try {
        const curator = await this.curatorService.getCurator(mission.curatorId);
        if (curator) {
          populatedMission.curator = curator;
        }
      } catch (error) {
        this.logger.warn(
          `Could not fetch curator for ${mission.curatorId}`,
          error,
        );
      }
    }

    // Handle journeys population
    if (include?.includes('journeys')) {
      try {
        const journeys = await Promise.all(
          mission.journeyIds.map((journeyId) =>
            this.journeyService.getJourney(journeyId).catch(() => null),
          ),
        );
        populatedMission.journeys = journeys.filter(
          (journey) => journey !== null,
        );
      } catch (error) {
        this.logger.warn(
          `Could not fetch journeys for mission ${mission.id}`,
          error,
        );
      }
    }

    return populatedMission;
  }

  async updateMission(id: string, mission: MissionCreateDto): Promise<Mission> {
    // First check if mission exists
    await this.getMission(id);

    const now = new Date().toISOString();

    // Create updated mission with ID preserved
    const updatedMission: Mission = {
      id,
      createdAt: now,
      updatedAt: now,
      ...mission,
      journeyIds: mission.journeyIds || [],
      status: mission.status || MissionStatus.DRAFT,
    };

    this.logger.log(`Updating mission: ${id}`);
    await this.database.put(updatedMission);
    return updatedMission;
  }

  async partialUpdateMission(
    id: string,
    update: MissionUpdateDto,
  ): Promise<Mission> {
    const existingMission = await this.getMission(id);
    const now = new Date().toISOString();

    // Create updated mission by merging existing with update
    const updatedMission = {
      ...existingMission,
      ...update,
      updatedAt: now,
      journeyIds:
        update.journeyIds !== undefined
          ? update.journeyIds
          : existingMission.journeyIds,
    };

    this.logger.log(`Partially updating mission: ${id}`);
    await this.database.put(updatedMission);
    return updatedMission;
  }

  async deleteMission(id: string): Promise<{ message: string }> {
    const mission = await this.getMission(id);
    await this.database.del(id);
    return {
      message: `Mission "${id}" for curator ${mission.curatorId} deleted successfully`,
    };
  }
}
