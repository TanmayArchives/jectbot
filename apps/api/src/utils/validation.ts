import { Web3 } from 'web3';

export const validateAddress = (address: string): boolean => {
  try {
    return Web3.utils.isAddress(address);
  } catch (error) {
    return false;
  }
};

export const validateAmount = (amount: string): boolean => {
  try {
    const value = parseFloat(amount);
    return !isNaN(value) && value > 0;
  } catch (error) {
    return false;
  }
};

export const sanitizeAddress = (address: string): string => {
  return Web3.utils.toChecksumAddress(address);
}; 