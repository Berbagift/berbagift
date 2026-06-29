// Mock Exchange Rates
export const EXCHANGE_RATES = {
  XLM_TO_USDC: 1.4,
  USDC_TO_XLM: 1 / 1.4,
};

// Mock Fiat Rates (Rp per token)
export const FIAT_RATES = {
  XLM: 549.33,
  USDC: 390.56,
};

/**
 * Validates if an input string is a valid decimal number (allows empty string, numbers, and a single comma/dot).
 */
export const isValidDecimalInput = (val: string): boolean => {
  return /^[0-9]*[.,]?[0-9]*$/.test(val);
};

/**
 * Parses a string amount (with possible comma) into a standard JS number.
 */
export const parseAmount = (val: string): number => {
  return parseFloat(val.replace(',', '.'));
};

/**
 * Formats a numeric string to remove trailing .00 and use comma as decimal separator.
 */
export const formatAmount = (numStr: string): string => {
  return numStr.replace(/\.00$/, '').replace('.', ',');
};

/**
 * Calculates the converted amount based on the provided token IDs.
 */
export const calculateConversion = (amount: number, fromTokenId: string, toTokenId: string): string => {
  if (isNaN(amount) || amount <= 0) return '';
  if (fromTokenId === toTokenId) return formatAmount(amount.toFixed(2));
  
  const rate =
    fromTokenId === 'XLM' && toTokenId === 'USDC'
      ? EXCHANGE_RATES.XLM_TO_USDC
      : EXCHANGE_RATES.USDC_TO_XLM;
  const converted = (amount * rate).toFixed(2);
  
  return formatAmount(converted);
};

/**
 * Formats the fiat equivalent of a given token amount.
 */
export const getFiatEquivalent = (amount: string, tokenId: string): string => {
  const numVal = parseAmount(amount);
  if (isNaN(numVal) || numVal === 0) return 'Rp 0';
  
  const rate = tokenId === 'XLM' ? FIAT_RATES.XLM : FIAT_RATES.USDC;
  const result = Math.round(numVal * rate);
  
  return `Rp ${result.toLocaleString('id-ID')}`;
};
