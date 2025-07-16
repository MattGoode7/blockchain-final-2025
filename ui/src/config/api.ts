export const API_BASE_URL = 'http://localhost:5000';

export const API_ENDPOINTS = {
  HEALTH: '/health',
  CALLS: '/calls',
  REGISTER_PROPOSAL: '/register-proposal',
  PROPOSAL_DATA: '/proposal-data',
  CLOSING_TIME: '/closing-time',
  VERIFY_PROPOSAL: '/verify-proposal',
  CREATE_CALL: '/create',
  CONTRACT_ADDRESS: '/contract-address',
} as const; 