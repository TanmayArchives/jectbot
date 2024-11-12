export const config = {
  RPC_URL: process.env.RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/your-api-key',
  API_URL: process.env.API_URL || 'http://localhost:3001/api',
  CHAIN_ID: parseInt(process.env.CHAIN_ID || '1'),
  DEX_CONTRACTS: {
    UNISWAP_V3_ROUTER: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    SUSHISWAP_ROUTER: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F'
  },
  TOKENS: {
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
  }
}; 