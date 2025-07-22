export const API_BASE_URL = 'http://localhost:3000';

export const API_ENDPOINTS = {
  // Health
  HEALTH: '/health',
  
  // Calls
  CALLS: '/calls',
  CREATE_CALL: '/create',
  CLOSING_TIME: '/closing-time',
  PROPOSAL_COUNTS: '/proposal-counts',
  
  // Proposals
  REGISTER_PROPOSAL: '/register-proposal',
  REGISTER_PROPOSAL_WITH_SIGNATURE: '/register-proposal-with-signature',
  PROPOSAL_DATA: '/proposal-data',
  VERIFY_PROPOSAL: '/verify-proposal',
  
  // Contracts
  CONTRACT_ADDRESS: '/contracts/addresses',
  
  // Authorization
  REGISTER: '/register',
  AUTHORIZED: '/authorized',
  AUTHORIZE: '/authorize',
  
  // ENS
  ENS_REGISTER_USER: '/ens/register-user',
  ENS_REGISTER_CALL: '/ens/register-call',
  ENS_RESOLVE_NAME: '/ens/resolve-name',
  ENS_RESOLVE_ADDRESS: '/ens/resolve-address',
  ENS_RESOLVE_ADDRESSES: '/ens/resolve-addresses',
  ENS_NAME_INFO: '/ens/name-info',
  ENS_CHECK_AVAILABILITY: '/ens/check-availability',
  ENS_REGISTERED_NAMES: '/ens/registered-names',
} as const; 