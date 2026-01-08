import { Shipment } from '../../logistics/shipment/shipment.types.js';
import { Operator } from '../../users/operator/operator.types.js';
import { OperatorBadge } from '../operator-badge/operator-badge.types.js';
import { Requester, Step, StepOnChain, StepState } from './step.types.js';
import { Journey } from '../../logistics/journey/journey.types.js';
import { Injectable, Logger, Inject } from '@nestjs/common';
import assert from 'assert';
import { JourneyService } from '../../logistics/journey/journey.service.js';
import { AgentService } from '../../profiles/agent/agent.service.js';
import { OperatorService } from '../../users/operator/operator.service.js';
import { OperatorBadgeService } from '../operator-badge/operator-badge.service.js';

interface Operator_Badge {
  operator: Operator;
  operatorBadge: OperatorBadge;
  operatorAgentAddr: string | null;
}

@Injectable()
export class StepFactory {
  private readonly logger = new Logger(StepFactory.name);

  constructor(
    @Inject(JourneyService)
    private readonly journeyService: JourneyService,
    @Inject(AgentService)
    private readonly agentService: AgentService,
    @Inject(OperatorService)
    private readonly operatorService: OperatorService,
    @Inject(OperatorBadgeService)
    private readonly operatorBadgeService: OperatorBadgeService,
  ) {}

  private async getOperatorDetails(journeyId: string): Promise<Operator_Badge> {
    this.logger.log(`Fetching operator details for journey ${journeyId}`);
    const journeyDbEntry = await this.journeyService.getJourney(journeyId);
    const agent = await this.agentService.getAgentsByOwner(
      journeyDbEntry.agentId,
    );
    const operatorId = agent[0].operatorId;
    const operator = await this.operatorService.getOperator(operatorId, [
      'badge',
    ]);
    const operatorBadge =
      await this.operatorBadgeService.getOperatorBadgesByWalletAddress(
        operator.onchain.opAddr,
      );
    return {
      operator: operator,
      operatorBadge: operatorBadge[0],
      operatorAgentAddr: operatorBadge[0].operatorAgentAddr || null,
    };
  }

  stepFactory = async (shipment: Shipment): Promise<Omit<Step, 'id'>[]> => {
    this.logger.log(`Creating steps for shipment ${shipment.id}`);
    assert(shipment.journey || shipment.mission, 'No missions/journeys found');
    let _journeys: Journey[] = [];
    let senderWalletAddress: string;
    let requester: Requester;

    if (shipment.journey) {
      _journeys = [shipment.journey];
      senderWalletAddress = shipment.senderWalletAddress!;
      requester = [senderWalletAddress, null];
    } else if (shipment.mission) {
      _journeys = shipment.mission?.journeys || [];
      senderWalletAddress = shipment.mission?.curator?.onchain.opAddr || '';
      requester = [
        senderWalletAddress,
        shipment.mission?.curator!.offchain.badge!.policyId,
      ];
    } else {
      return [];
    }

    const steps: Omit<Step, 'id'>[] = await Promise.all(
      _journeys.map(async (journey, index, journeys) => {
        const op = await this.getOperatorDetails(journey.id);
        this.logger.log(
          `Generating step for journey ${journey.id} with operator ${op.operator.id}`,
        );
        let recipientId: string = '';
        let holderId: string = '';

        const stepParams: StepOnChain = {
          spCost: journey.price,
          spPerformer: [
            op.operatorAgentAddr || op.operator.onchain.opAddr,
            op.operatorBadge.policyId,
          ],
          spRequester: requester,
          spOperator: op.operator.onchain.opAddr,
          spETA: new Date(journey.availableTo).toISOString(),
          spStartTime: new Date(journey.availableFrom).toISOString(),
        };

        if (index === 0) {
          // First journey
          holderId = shipment.senderId;
          stepParams.spHolder = senderWalletAddress;
          if (journeys.length > 1) {
            const _op = await this.getOperatorDetails(journeys[index + 1].id);
            stepParams.spRecipient =
              _op.operatorAgentAddr || _op.operator.onchain.opAddr;
            recipientId = journeys[index + 1].agentId;
          } else {
            recipientId = holderId;
            stepParams.spRecipient = senderWalletAddress;
          }
        } else if (index === journeys.length - 1) {
          // Last journey
          const _op = await this.getOperatorDetails(journeys[index - 1].id);
          stepParams.spHolder =
            _op.operatorAgentAddr || _op.operator.onchain.opAddr;
          stepParams.spRecipient = senderWalletAddress;
          holderId = journeys[index - 1].agentId;
          recipientId = shipment.senderId;
        } else {
          // Intermediate journeys
          const _op = await this.getOperatorDetails(journeys[index - 1].id);
          stepParams.spHolder =
            _op.operatorAgentAddr || _op.operator.onchain.opAddr;
          holderId = journeys[index - 1].agentId;

          const __op = await this.getOperatorDetails(journeys[index + 1].id);
          stepParams.spRecipient =
            __op.operatorAgentAddr || __op.operator.onchain.opAddr;
          recipientId = journeys[index + 1].agentId;
        }

        const stepDbEntry: Omit<Step, 'id'> = {
          stepParams: stepParams,
          shipmentId: shipment.id,
          journeyId: journey.id || '',
          index: index,
          state: StepState.PENDING,
          operatorId: op.operator.id,
          colonyId: op.operator.offchain.colonyNodeId,
          agentId: journey.agentId,
          senderId: shipment.senderId,
          recipientId: recipientId,
          holderId: holderId,
        };
        return stepDbEntry;
      }),
    );

    return steps || [];
  };
}
