/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, Logger } from '@nestjs/common';
import { Stats, StatsOptions, StatsResponse } from './stats.types.js';

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);

  /**
   * Get total stats for entities
   */
  getTotalStats(entities: any[], options: StatsOptions = {}): StatsResponse {
    try {
      const totalCount = entities.length;
      const change = this.calculateTotalChange(entities, totalCount, options);

      const entityName = options.entityName || 'Items';
      const statKey = entityName.toLowerCase();

      return {
        [statKey]: {
          title:
            options.totalTitle ||
            `Total ${this.capitalizeFirstLetter(entityName)}`,
          value: totalCount.toString(),
          change: change.percentage,
          changeType: change.type,
          description:
            options.totalDescription || `Active ${entityName.toLowerCase()}`,
        },
      };
    } catch (error) {
      this.logger.error('Error calculating total stats:', error);
      const entityName = options.entityName || 'Items';
      const statKey = entityName.toLowerCase();
      return {
        [statKey]: this.getNeutralStats(
          options.totalTitle ||
            `Total ${this.capitalizeFirstLetter(entityName)}`,
          options.totalDescription || `Active ${entityName.toLowerCase()}`,
        ),
      };
    }
  }

  /**
   * Get new entities this month stats
   */
  getNewThisMonthStats(entities: any[], options: StatsOptions = {}): Stats {
    try {
      const currentDate = new Date();
      const newThisMonth = this.countEntitiesByMonth(
        entities,
        currentDate,
        options.dateField,
      );

      // Calculate previous month
      const previousMonthDate = new Date(currentDate);
      previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);

      const newLastMonth = this.countEntitiesByMonth(
        entities,
        previousMonthDate,
        options.dateField,
      );
      const change = this.calculatePercentageChange(newThisMonth, newLastMonth);

      const entityName = options.entityName || 'Items';

      return {
        title: options.newThisMonthTitle || `New This Month`,
        value: newThisMonth.toString(),
        change: change.percentage,
        changeType: change.type,
        description:
          options.newThisMonthDescription ||
          `${this.capitalizeFirstLetter(entityName)} joined this month`,
      };
    } catch (error) {
      this.logger.error('Error calculating new this month stats:', error);
      const entityName = options.entityName || 'Items';
      return this.getNeutralStats(
        options.newThisMonthTitle || `New This Month`,
        options.newThisMonthDescription ||
          `${this.capitalizeFirstLetter(entityName)} joined this month`,
      );
    }
  }

  /**
   * Get both total and new this month stats in one call
   */
  getAllStats(entities: any[], options: StatsOptions = {}): StatsResponse {
    const totalStats = this.getTotalStats(entities, options);
    const newThisMonthStats = this.getNewThisMonthStats(entities, options);

    const entityName = options.entityName || 'Items';
    const statKey = entityName.toLowerCase();
    const newStatKey = `${statKey}NewThisMonth`;

    return {
      ...totalStats,
      [newStatKey]: newThisMonthStats,
    };
  }

  private calculateTotalChange(
    entities: any[],
    currentCount: number,
    options: StatsOptions,
  ): {
    percentage: string;
    type: 'increase' | 'decrease' | 'neutral';
  } {
    try {
      const currentDate = new Date();

      // Count all entities that existed at the end of previous month
      const previousCount = entities.filter((entity) => {
        const dateField = options.dateField || 'createdAt';
        const created = new Date(entity[dateField]);
        return (
          created <
          new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        );
      }).length;

      return this.calculatePercentageChange(currentCount, previousCount);
    } catch (error) {
      this.logger.error('Error calculating total change:', error);
      return { percentage: '0%', type: 'neutral' };
    }
  }

  /**
   * Count entities created in a specific month
   */
  private countEntitiesByMonth(
    entities: any[],
    date: Date,
    dateField: string = 'createdAt',
  ): number {
    const targetMonth = date.getMonth();
    const targetYear = date.getFullYear();

    return entities.filter((entity) => {
      const created = new Date(entity[dateField]);
      return (
        created.getMonth() === targetMonth &&
        created.getFullYear() === targetYear
      );
    }).length;
  }

  /**
   * Calculate percentage change between current and previous values
   */
  private calculatePercentageChange(
    current: number,
    previous: number,
  ): { percentage: string; type: 'increase' | 'decrease' | 'neutral' } {
    if (previous === 0) {
      if (current > 0) {
        return { percentage: '+100%', type: 'increase' };
      } else {
        return { percentage: '0%', type: 'neutral' };
      }
    }

    const percentageChange = ((current - previous) / previous) * 100;
    const roundedPercentage = Math.round(percentageChange);

    if (percentageChange > 0) {
      return { percentage: `+${roundedPercentage}%`, type: 'increase' };
    } else if (percentageChange < 0) {
      return { percentage: `${roundedPercentage}%`, type: 'decrease' };
    } else {
      return { percentage: '0%', type: 'neutral' };
    }
  }

  /**
   * Return neutral stats for error cases
   */
  private getNeutralStats(title: string, description: string): Stats {
    return {
      title,
      value: '0',
      change: '0%',
      changeType: 'neutral',
      description,
    };
  }

  /**
   * Capitalize first letter of a string
   */
  private capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}
