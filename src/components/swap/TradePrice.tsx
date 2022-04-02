import { Trans } from '@lingui/macro'
import { Currency, Price } from '@uniswap/sdk-core'
import useUSDCPrice from 'hooks/useUSDCPrice'
import { useCallback, useContext } from 'react'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components/macro'
import { ThemedText } from 'theme'

interface TradePriceProps {
  price: Price<Currency, Currency>
  showInverted: boolean
  setShowInverted: (showInverted: boolean) => void
}

const StyledPriceContainer = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  align-items: center;
  justify-content: flex-start;
  padding: 0;
  grid-template-columns: 1fr auto;
  grid-gap: 0.25rem;
  display: flex;
  flex-direction: row;
  text-align: left;
  flex-wrap: wrap;
  padding: 8px 0;
  user-select: text;
`

export default function TradePrice({ price, showInverted, setShowInverted }: TradePriceProps) {
  const theme = useContext(ThemeContext)

  const usdcPrice = useUSDCPrice(price.quoteCurrency)

  let priceInFiat = ' '
  let formattedPrice: string
  try {
    const tokenRatioAfterTrade = showInverted ? price : price.invert()
    formattedPrice = tokenRatioAfterTrade.toSignificant(4)
    if (usdcPrice) {
      if (showInverted) {
        // if we're showing the inverted price the token price gets recalculated since it's price in fiat can potentially change a lot due to the price impact
        const baseTokensInQuoteToken = +tokenRatioAfterTrade.toSignificant(4)
        const usdcPriceOfBaseToken = +usdcPrice.toSignificant(4)
        priceInFiat = (baseTokensInQuoteToken * usdcPriceOfBaseToken).toPrecision(4).toString()
      } else {
        priceInFiat = usdcPrice?.toSignificant(6, { groupSeparator: ',' }) ?? priceInFiat
      }
    }
  } catch (error) {
    formattedPrice = '0'
  }

  const label = showInverted ? `${price.quoteCurrency?.symbol}` : `${price.baseCurrency?.symbol} `
  const labelInverted = showInverted ? `${price.baseCurrency?.symbol} ` : `${price.quoteCurrency?.symbol}`
  const flipPrice = useCallback(() => setShowInverted(!showInverted), [setShowInverted, showInverted])

  const text = `${'1 ' + labelInverted + ' = ' + formattedPrice ?? '-'} ${label}`

  return (
    <StyledPriceContainer
      onClick={(e) => {
        e.stopPropagation() // dont want this click to affect dropdowns / hovers
        flipPrice()
      }}
      title={text}
    >
      <Text fontWeight={500} color={theme.text1}>
        {text}
      </Text>
      <ThemedText.DarkGray>
        <Trans>(${priceInFiat})</Trans>
      </ThemedText.DarkGray>
    </StyledPriceContainer>
  )
}
