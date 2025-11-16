/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { AgentMetrics, DeliveryRecord } from './agent-metrics.types.js';
import { Step, StepState } from '../../onchain/step/step.types.js';
import { calculateDistanceBetweenCoordinates } from '../../common/location/location.service.js';
import { StepTxService } from '../../onchain/step_tx/step-tx.service.js';

/**
 * Calculate agent metrics from raw delivery data
 */
export function calculateAgentMetrics(
  deliveries: DeliveryRecord[],
): AgentMetrics {
  if (deliveries.length === 0) {
    throw new Error('No deliveries to calculate metrics.');
  }

  const agentId = deliveries[0].agentId;

  const totalDeliveries = deliveries.length;
  const successfulDeliveries = deliveries.filter(
    (d) => d.status === 'SUCCESS',
  ).length;
  const failedDeliveries = deliveries.filter(
    (d) => d.status === 'FAILED',
  ).length;
  const pendingDeliveries = deliveries.filter(
    (d) => d.status === 'PENDING',
  ).length;
  const totalEarnings = deliveries.reduce((sum, d) => sum + d.earningAda, 0);
  const totalDistanceKm = deliveries.reduce((sum, d) => sum + d.distanceKm, 0);
  const totalDeliveryTimeMinutes = deliveries.reduce(
    (sum, d) => sum + d.durationMinutes,
    0,
  );
  const averageDeliveryTimeMinutes =
    totalDeliveryTimeMinutes / successfulDeliveries;
  const ratings = deliveries
    .map((d) => d.rating)
    .filter((r): r is number => r !== undefined);
  const averageRating =
    ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;
  const activeDays = new Set(deliveries.map((d) => d.date.split('T')[0])).size;

  return {
    agentId,
    totalDeliveries,
    successfulDeliveries,
    failedDeliveries,
    pendingDeliveries,
    totalEarnings,
    totalDistanceKm,
    totalDeliveryTimeMinutes,
    averageDeliveryTimeMinutes,
    averageRating,
    activeDays,
  };
}

/**
 * Calculate overall performance score for an agent (example metric)
 */
export function calculatePerformanceScore(metrics: AgentMetrics): number {
  const successRate = metrics.successfulDeliveries / metrics.totalDeliveries;
  const efficiency = metrics.totalDistanceKm / metrics.totalDeliveryTimeMinutes; // km per minute
  const ratingWeight = metrics.averageRating / 5;

  // Simple weighted formula (you can tune this)
  const score =
    (successRate * 0.5 + efficiency * 0.3 + ratingWeight * 0.2) * 100;
  return Number(score.toFixed(2));
}

export async function generateDeliveryRecord(
  step: Step,
  stepTxService: StepTxService,
): Promise<DeliveryRecord> {
  const delRec: DeliveryRecord = {
    deliveryId: step.shipmentId,
    agentId: step.agentId,
    distanceKm: calculateDistanceBetweenCoordinates(
      step.journey?.fromLocation?.coordinates!,
      step.journey?.toLocation?.coordinates!,
    ),
    durationMinutes:
      (
        await stepTxService.getStepTxsByStateAndStepId(
          StepState.FULFILLED,
          step.id,
        )
      )[0].createdAt?.getUTCMinutes()! -
      (
        await stepTxService.getStepTxsByStateAndStepId(
          StepState.COMMENCED,
          step.id,
        )
      )[0].createdAt?.getUTCMinutes()!,
    earningAda: step.journey?.price!,
    status:
      step.state === StepState.FULFILLED ||
      step.state === StepState.COMPLETED ||
      step.state === StepState.CLAIMED
        ? 'SUCCESS'
        : step.state === StepState.ACCEPTED ||
            step.state === StepState.PENDING ||
            step.state === StepState.COMMENCED ||
            step.state === StepState.INITIALIZED
          ? 'PENDING'
          : 'FAILED',
    rating: 0, // optional user rating for the delivery
    date: (
      await stepTxService.getStepTxsByStateAndStepId(
        StepState.FULFILLED,
        step.id,
      )
    )[0].createdAt?.toISOString()!, // ISO date string for active day tracking
  };
  return delRec;
}
