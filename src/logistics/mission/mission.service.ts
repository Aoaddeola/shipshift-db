import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Database } from '../../orbitdb/database.js';
import { InjectDatabase } from '../../orbitdb/inject-database.decorator.js';
import { MissionCreateDto } from './mission-create.dto.js';
import { MissionUpdateDto } from './mission-update.dto.js';
import { Mission, MissionStatus } from './mission.types.js';

@Injectable()
export class MissionService {
  private readonly logger = new Logger(MissionService.name);

  constructor(@InjectDatabase('mission') private database: Database<Mission>) {}

  async createMission(mission: Omit<Mission, 'id'>): Promise<Mission> {
    const id = randomUUID();
    this.logger.log(`Creating mission: ${id}`);

    // Handle default values
    const missionWithDefaults = {
      ...mission,
      journeyIds: mission.journeyIds || [],
      status: mission.status || MissionStatus.DRAFT,
      id,
    };

    await this.database.put(missionWithDefaults);
    return missionWithDefaults;
  }

  async getMission(id: string): Promise<Mission> {
    const entry = await this.database.get(id);
    if (!entry) {
      throw new NotFoundException('Mission not found');
    }
    return entry;
  }

  async updateMission(id: string, mission: MissionCreateDto): Promise<Mission> {
    // First check if mission exists
    await this.getMission(id);

    // Create updated mission with ID preserved
    const updatedMission = {
      ...mission,
      id,
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

    // Create updated mission by merging existing with update
    const updatedMission = {
      ...existingMission,
      ...update,
      // Handle special cases if needed
      journeyIds:
        update.journeyIds !== undefined
          ? update.journeyIds
          : existingMission.journeyIds,
    };

    this.logger.log(`Partially updating mission: ${id}`);
    await this.database.put(updatedMission);
    return updatedMission;
  }

  async getMissions(): Promise<Mission[]> {
    return this.database.all();
  }

  async getMissionsByCurator(curatorId: string): Promise<Mission[]> {
    const all = await this.database.all();
    return all.filter((mission) => mission.curatorId === curatorId);
  }

  async getMissionsByStatus(status: MissionStatus): Promise<Mission[]> {
    const all = await this.database.all();
    return all.filter((mission) => mission.status === status);
  }

  async getMissionsByCuratorAndStatus(
    curatorId: string,
    status: MissionStatus,
  ): Promise<Mission[]> {
    const all = await this.database.all();
    return all.filter(
      (mission) => mission.curatorId === curatorId && mission.status === status,
    );
  }

  async deleteMission(id: string): Promise<{ message: string }> {
    const mission = await this.getMission(id);
    await this.database.del(id);
    return {
      message: `Mission "${id}" for curator ${mission.curatorId} deleted successfully`,
    };
  }
}
