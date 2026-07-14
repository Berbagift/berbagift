with open("frontend/components/swap/swap-block.tsx", "r") as f:
    content = f.read()

content = content.replace(
    "export function SwapBlock({",
    "  availableTokens?: TokenConfig[];\n  onTokenSelect?: (tokenId: string) => void;\n}\n\nexport function SwapBlock({"
)

content = content.replace(
    "onPercentageSelect,\n}: SwapBlockProps)",
    "onPercentageSelect,\n  availableTokens,\n  onTokenSelect,\n}: SwapBlockProps)"
)

content = content.replace(
    "onTokenClick={() => {}}\n      size=\"md\"",
    "availableTokens={availableTokens}\n      onTokenSelect={onTokenSelect}\n      size=\"md\""
)

with open("frontend/components/swap/swap-block.tsx", "w") as f:
    f.write(content)

with open("frontend/components/swap/swap-module-client.tsx", "r") as f:
    content = f.read()

content = content.replace(
    "import { useSwapState } from '@/hooks/use-swap-state';",
    "import { useSwapState } from '@/hooks/use-swap-state';\nimport { useTokens } from '@/lib/api/queries';"
)

content = content.replace(
    "const state = useSwapState();",
    "const state = useSwapState();\n  const { data: tokenList } = useTokens();\n  const availableTokens = tokenList || [];"
)

content = content.replace(
    "onPercentageSelect={state.handlePercentage}\n        />",
    "onPercentageSelect={state.handlePercentage}\n          availableTokens={availableTokens}\n          onTokenSelect={(id) => state.setFromTokenId(id)}\n        />"
)

content = content.replace(
    "equivalentFiat={state.getFiatEquivalent(state.toAmount, state.toToken.id)}\n        />",
    "equivalentFiat={state.getFiatEquivalent(state.toAmount, state.toToken.id)}\n          availableTokens={availableTokens}\n          onTokenSelect={(id) => state.setToTokenId(id)}\n        />"
)

with open("frontend/components/swap/swap-module-client.tsx", "w") as f:
    f.write(content)
