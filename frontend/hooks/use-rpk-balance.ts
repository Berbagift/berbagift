import { useQuery } from '@tanstack/react-query';
import * as StellarSdk from '@stellar/stellar-sdk';
import { config } from '@/lib/stellar/transactions';
import { useUserProfile } from './use-user-profile';

export function useRpkBalance() {
  const { data: userProfile } = useUserProfile();
  const walletAddress = userProfile?.wallet_address;

  return useQuery({
    queryKey: ['rpkBalance', walletAddress],
    queryFn: async () => {
      if (!walletAddress) return 0;
      
      const contractId = process.env.NEXT_PUBLIC_RPK_CONTRACT || process.env.NEXT_RPK_CONTRACT || "CAXMJUKELFC7THVUKVH4NA5RYUDLORCKSZ5HTOPOMEXRMZJLFHKZJCQZ";
      if (!contractId) {
        console.warn('RPK Contract ID not found in environment');
        return 0;
      }

      try {
        const rpcServer = new StellarSdk.rpc.Server(config.rpcUrl);
        const contract = new StellarSdk.Contract(contractId);
        
        // Dummy account for simulation (simulation doesn't require signature)
        const account = new StellarSdk.Account("GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5", "1");
        
        const tx = new StellarSdk.TransactionBuilder(account, {
          fee: "100",
          networkPassphrase: config.networkPassphrase,
        })
          .addOperation(
            contract.call("balance", StellarSdk.nativeToScVal(walletAddress, { type: "address" }))
          )
          .setTimeout(30)
          .build();

        const sim = await rpcServer.simulateTransaction(tx);
        
        if (StellarSdk.rpc.Api.isSimulationSuccess(sim) && sim.result) {
          const rawBalance = StellarSdk.scValToNative(sim.result.retval);
          // Token balances usually have 7 decimals on Stellar/Soroban
          return Number(rawBalance) / 10000000;
        }
        return 0;
      } catch (error) {
        console.error('Failed to fetch RPK balance:', error);
        return 0;
      }
    },
    enabled: !!walletAddress,
    refetchInterval: 15000, // Refetch every 15s
  });
}
