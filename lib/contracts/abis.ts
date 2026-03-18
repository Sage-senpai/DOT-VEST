// ─── DotVestVault ABI ────────────────────────────────────────────────

export const vaultAbi = [
  // Core functions
  {
    name: 'deposit',
    type: 'function',
    stateMutability: 'payable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'withdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'shares', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'fundVault',
    type: 'function',
    stateMutability: 'payable',
    inputs: [],
    outputs: [],
  },
  // View functions
  {
    name: 'getPosition',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'shares', type: 'uint256' },
      { name: 'depositTimestamp', type: 'uint256' },
      { name: 'totalUserDeposited', type: 'uint256' },
      { name: 'currentValue', type: 'uint256' },
    ],
  },
  {
    name: 'getTVL',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getDepositorCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getMinimumDeposit',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'totalShares',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'totalDeposited',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'depositCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'owner',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  // Events
  {
    name: 'Deposited',
    type: 'event',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'shares', type: 'uint256', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'Withdrawn',
    type: 'event',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'shares', type: 'uint256', indexed: false },
    ],
  },
] as const

// ─── DotVestStrategy ABI ─────────────────────────────────────────────

export const strategyAbi = [
  // Core functions
  {
    name: 'createStrategy',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'targetApy', type: 'uint256' },
      { name: 'riskLevel', type: 'uint8' },
    ],
    outputs: [{ name: 'strategyId', type: 'bytes32' }],
  },
  {
    name: 'deactivateStrategy',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'id', type: 'bytes32' }],
    outputs: [],
  },
  // View functions
  {
    name: 'getStrategy',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'id', type: 'bytes32' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'id', type: 'bytes32' },
          { name: 'creator', type: 'address' },
          { name: 'name', type: 'string' },
          { name: 'targetApy', type: 'uint256' },
          { name: 'riskLevel', type: 'uint8' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'active', type: 'bool' },
          { name: 'creatorAccountId', type: 'bytes32' },
        ],
      },
    ],
  },
  {
    name: 'getUserStrategies',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'bytes32[]' }],
  },
  {
    name: 'getStrategyCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'computeBlake2Hash',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'data', type: 'bytes' }],
    outputs: [{ name: '', type: 'bytes32' }],
  },
  {
    name: 'getPolkadotAccountId',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'evmAddr', type: 'address' }],
    outputs: [{ name: '', type: 'bytes32' }],
  },
  {
    name: 'totalStrategies',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  // Events
  {
    name: 'StrategyCreated',
    type: 'event',
    inputs: [
      { name: 'id', type: 'bytes32', indexed: true },
      { name: 'creator', type: 'address', indexed: true },
      { name: 'name', type: 'string', indexed: false },
      { name: 'targetApy', type: 'uint256', indexed: false },
      { name: 'riskLevel', type: 'uint8', indexed: false },
      { name: 'creatorAccountId', type: 'bytes32', indexed: false },
    ],
  },
] as const

// ─── DotVestBridge ABI ───────────────────────────────────────────────

export const bridgeAbi = [
  {
    name: 'estimateXcmWeight',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'message', type: 'bytes' }],
    outputs: [
      { name: 'refTime', type: 'uint64' },
      { name: 'proofSize', type: 'uint64' },
    ],
  },
  {
    name: 'sendXcmTransfer',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'destination', type: 'bytes' },
      { name: 'message', type: 'bytes' },
    ],
    outputs: [],
  },
  {
    name: 'executeXcmLocal',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'message', type: 'bytes' }],
    outputs: [],
  },
  {
    name: 'getTransfer',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'sender', type: 'address' },
          { name: 'destination', type: 'bytes' },
          { name: 'amount', type: 'uint256' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'executed', type: 'bool' },
        ],
      },
    ],
  },
  {
    name: 'getUserTransfers',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
  },
  {
    name: 'totalTransfers',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getRemainingWeight',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'refTime', type: 'uint64' },
      { name: 'proofSize', type: 'uint64' },
    ],
  },
  {
    name: 'isDirectCaller',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }],
  },
  // Events
  {
    name: 'XcmTransferInitiated',
    type: 'event',
    inputs: [
      { name: 'transferId', type: 'uint256', indexed: true },
      { name: 'sender', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'estimatedRefTime', type: 'uint64', indexed: false },
      { name: 'estimatedProofSize', type: 'uint64', indexed: false },
    ],
  },
] as const
