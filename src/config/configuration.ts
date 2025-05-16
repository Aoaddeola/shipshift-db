import { AppConfig } from './schema.js';

export default (): AppConfig => {
  return {
    nodeEnv: process.env.NODE_ENV as 'development' | 'production' | 'test',
    port: parseInt(process.env.PORT || '8033', 10),
    runMode: (process.env.RUN_MODE as 'node' | 'bootstrap') || 'node',
    debug: process.env.DEBUG || '',
    ipfs: {
      host: process.env.IPFS_HOST || '0.0.0.0',
      tcpPort: parseInt(process.env.TCP_PORT || '4001', 10),
      wsPort: parseInt(process.env.WS_PORT || '4002', 10),
    },
    orbitdb: {
      bootstrapNodes: process.env.BOOTSTRAP_NODES,
      directory:
        process.env.ORBITDB_DIRECTORY || `./data/${crypto.randomUUID()}`,
      swarmKey: process.env.SWARM_KEY,
      databases: {
        availabilities: process.env.AVAILABILITIES_DATABASE || 'availabilities',
        badges: process.env.BADGES_DATABASE || 'badges',
        colonies: process.env.COLONIES_DATABASE || 'colonies',
        journeys: process.env.JOURNEYS_DATABASE || 'journeys',
        operators: process.env.OPERATORS_DATABASE || 'operators',
        pending_multisig_tx_witnesses:
          process.env.PENDING_MULTISIG_TX_WITNESSES_DATABASE ||
          'pending_multisig_tx_witnesses',
        pending_multisig_txs:
          process.env.PENDING_MULTISIG_TXS_DATABASE || 'pending_multisig_txs',
        steps: process.env.STEPS_DATABASE || 'steps',
        step_transactions:
          process.env.STEP_TRANSACTIONS_DATABASE || 'step_transactions',
        shipments: process.env.SHIPMENTS_DATABASE || 'shipments',
        currencies: process.env.CURRENCIES_DATABASE || 'currencies',
      },
    },
  };
};
