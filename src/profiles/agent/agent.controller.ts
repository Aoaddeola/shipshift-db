import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Patch,
  Query,
  ForbiddenException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AgentService } from './agent.service.js';
import { AgentCreateDto } from './agent-create.dto.js';
import { AgentUpdateDto } from './agent-update.dto.js';
import { AgentType, ConveyanceMeans } from './agent.types.js';
import { JwtDeliveryOpAuthGuard } from '../../guards/jwt-deliveryOp-auth.guard.js';
import { OperatorService } from '../../users/operator/operator.service.js';
import { resolveEd25519KeyHash } from '@meshsdk/core-cst';
import { Store, Trie } from '@aiken-lang/merkle-patricia-forestry';

@Controller('agent')
export class AgentController {
  constructor(
    private readonly agentService: AgentService,
    private readonly operatorService: OperatorService,
  ) {}

  @Post()
  async createAgent(@Body() agent: AgentCreateDto) {
    return this.agentService.createAgent(agent);
  }

  @Get(':id')
  async getAgent(@Param('id') id: string, @Query('include') include?: string) {
    const includeArray = include ? include.split(',') : [];
    return this.agentService.getAgent(id, includeArray);
  }

  @Get()
  async getAgents(
    @Query('operatorId') operatorId?: string,
    @Query('ownerId') ownerId?: string,
    @Query('type') type?: AgentType,
    @Query('conveyance') conveyance?: ConveyanceMeans,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];

    if (operatorId && ownerId && type && conveyance) {
      return this.agentService.getAgentsByAllFilters(
        operatorId,
        ownerId,
        type,
        conveyance,
        includeArray,
      );
    } else if (operatorId && ownerId && type) {
      return this.agentService.getAgentsByOperatorOwnerAndType(
        operatorId,
        ownerId,
        type,
        includeArray,
      );
    } else if (operatorId && ownerId && conveyance) {
      return this.agentService.getAgentsByOperatorOwnerAndConveyance(
        operatorId,
        ownerId,
        conveyance,
        includeArray,
      );
    } else if (operatorId && type && conveyance) {
      return this.agentService.getAgentsByOperatorTypeAndConveyance(
        operatorId,
        type,
        conveyance,
        includeArray,
      );
    } else if (ownerId && type && conveyance) {
      return this.agentService.getAgentsByOwnerTypeAndConveyance(
        ownerId,
        type,
        conveyance,
        includeArray,
      );
    } else if (operatorId && ownerId) {
      return this.agentService.getAgentsByOperatorAndOwner(
        operatorId,
        ownerId,
        includeArray,
      );
    } else if (operatorId && type) {
      return this.agentService.getAgentsByOperatorAndType(
        operatorId,
        type,
        includeArray,
      );
    } else if (operatorId && conveyance) {
      return this.agentService.getAgentsByOperatorAndConveyance(
        operatorId,
        conveyance,
        includeArray,
      );
    } else if (ownerId && type) {
      return this.agentService.getAgentsByOwnerAndType(
        ownerId,
        type,
        includeArray,
      );
    } else if (ownerId && conveyance) {
      return this.agentService.getAgentsByOwnerAndConveyance(
        ownerId,
        conveyance,
        includeArray,
      );
    } else if (type && conveyance) {
      return this.agentService.getAgentsByTypeAndConveyance(
        type,
        conveyance,
        includeArray,
      );
    } else if (operatorId) {
      return this.agentService.getAgentsByOperator(operatorId, includeArray);
    } else if (ownerId) {
      return this.agentService.getAgentsByOwner(ownerId, includeArray);
    } else if (type) {
      return this.agentService.getAgentsByType(type, includeArray);
    } else if (conveyance) {
      return this.agentService.getAgentsByConveyance(conveyance, includeArray);
    }
    return this.agentService.getAgents(includeArray);
  }

  @Get('operator/:operatorId')
  async getAgentsByOperator(
    @Param('operatorId') operatorId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.agentService.getAgentsByOperator(operatorId, includeArray);
  }

  @Get('owner/:ownerId')
  async getAgentsByOwner(
    @Param('ownerId') ownerId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.agentService.getAgentsByOwner(ownerId, includeArray);
  }

  @Get('type/:type')
  async getAgentsByType(
    @Param('type') type: AgentType,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.agentService.getAgentsByType(type, includeArray);
  }

  @Get('conveyance/:conveyance')
  async getAgentsByConveyance(
    @Param('conveyance') conveyance: ConveyanceMeans,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.agentService.getAgentsByConveyance(conveyance, includeArray);
  }

  @Put(':id')
  async updateAgent(@Param('id') id: string, @Body() agent: AgentCreateDto) {
    return this.agentService.updateAgent(id, agent);
  }

  @UseGuards(JwtDeliveryOpAuthGuard)
  @Patch('ban/:id')
  async banAgent(@Param('id') id: string, @Req() req: any) {
    const requesterId = req.user.sub;
    console.log('Authenticated user ID:', requesterId);

    const agent = await this.agentService.getAgent(id);

    if (agent.operatorId !== requesterId) {
      throw new ForbiddenException('Agent not under operator');
    }

    if (agent.verified) {
      return this.agentService.partialUpdateAgent(id, {
        ...agent,
        verified: false,
      });
    }
    throw new ForbiddenException('Agent is not yet verified');
  }

  @UseGuards(JwtDeliveryOpAuthGuard)
  @Patch('approve/:id')
  async approveAgent(@Param('id') id: string, @Req() req: any) {
    const requesterId = req.user.sub;
    console.log('Authenticated user ID:', requesterId);

    const agent = await this.agentService.getAgent(id);

    if (agent.operatorId !== requesterId) {
      throw new ForbiddenException('Agent not under operator');
    }

    const operator = await this.operatorService.getOperator(agent.operatorId);

    let trie: Trie;

    try {
      // const store = new Store(agent.operatorId);
      // await store.ready();
      // console.log('sdkfhsadfkjhasfkjhadskjfdas', store);
      trie = await Trie.load(new Store(agent.operatorId));
      // return new MPFService(trie as Trie);
    } catch (error) {
      console.log('sdkfhsadfkjhasfkjhadskjfdas', error);
      trie = await Trie.fromList([], new Store(agent.operatorId));
      console.log('trietrietrietrietrietrie', trie);
      // return new MPFService(trie);
    }

    if (agent.verified) {
      try {
        // const trie = await MPFService.load(agent.operatorId);
        await trie.insert(
          resolveEd25519KeyHash(agent.onChainAddress),
          resolveEd25519KeyHash(operator.onchain.opAddr),
        );
        const proof = await trie.prove(
          resolveEd25519KeyHash(agent.onChainAddress),
          false,
        );
        await this.agentService.partialUpdateAgent(id, {
          ...agent,
          active: true,
        });
        return {
          rootHash: trie.hash,
          proof: proof?.toCBOR().toString('hex'),
        };
      } catch (error) {
        console.log('Ertefasdfdsaf', error);
        throw new ForbiddenException(error.message);
      }
    }
    throw new ForbiddenException('Agent is not yet verified');
  }

  @UseGuards(JwtDeliveryOpAuthGuard)
  @Patch('disapprove/:id')
  async disapproveAgent(@Param('id') id: string, @Req() req: any) {
    const requesterId = req.user.sub;
    console.log('Authenticated user ID:', requesterId);

    const agent = await this.agentService.getAgent(id);

    if (agent.operatorId !== requesterId) {
      throw new ForbiddenException('Agent not under operator');
    }

    let trie: Trie;

    try {
      // const store = new Store(agent.operatorId);
      // await store.ready();
      // console.log('sdkfhsadfkjhasfkjhadskjfdas', store);
      trie = await Trie.load(new Store(agent.operatorId));
      // return new MPFService(trie as Trie);
    } catch (error) {
      console.log('sdkfhsadfkjhasfkjhadskjfdas', error);
      trie = await Trie.fromList([], new Store(agent.operatorId));
      console.log('trietrietrietrietrietrie', trie);
      // return new MPFService(trie);
    }

    if (agent.verified) {
      try {
        // trie = await MPFService.load(agent.operatorId);
        await trie.delete(resolveEd25519KeyHash(agent.onChainAddress));
        const proof = await trie.prove(
          resolveEd25519KeyHash(agent.onChainAddress),
          true,
        );
        await this.agentService.partialUpdateAgent(id, {
          ...agent,
          active: false,
        });
        return {
          rootHash: trie.hash,
          proof: proof?.toCBOR().toString('hex'),
        };
      } catch (error) {
        throw new ForbiddenException(error.message);
      }
    }
    throw new ForbiddenException('Agent is not yet verified');
  }

  @UseGuards(JwtDeliveryOpAuthGuard)
  @Patch('unban/:id')
  async unbanAgent(@Param('id') id: string, @Req() req: any) {
    const requesterId = req.user.sub;
    const agent = await this.agentService.getAgent(id);

    if (agent.operatorId !== requesterId) {
      throw new ForbiddenException(
        `Agent ${agent.id} not under operator ${requesterId}`,
      );
    }

    if (agent.verified) {
      return this.agentService.partialUpdateAgent(id, {
        ...agent,
        verified: true,
      });
    }
    throw new ForbiddenException('Agent is not yet verified');
  }

  @Patch(':id')
  async partialUpdateAgent(
    @Param('id') id: string,
    @Body() update: AgentUpdateDto,
  ) {
    return this.agentService.partialUpdateAgent(id, update);
  }

  @Delete(':id')
  async deleteAgent(@Param('id') id: string) {
    return this.agentService.deleteAgent(id);
  }
}
