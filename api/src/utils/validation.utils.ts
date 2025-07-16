import { isAddress } from 'ethers';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export function isValidHexHash(value: string, length: number) {
  const regex = new RegExp(`^0x[a-fA-F0-9]{${length}}$`);
  return typeof value === 'string' && regex.test(value);
}

export function isValidAddress(value: string) {
  return typeof value === 'string' && isAddress(value);
}

export function isValidSignature(signature: string) {
  return typeof signature === 'string' && /^0x[a-fA-F0-9]{130}$/.test(signature);
} 