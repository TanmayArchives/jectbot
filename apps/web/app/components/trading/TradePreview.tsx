interface TradePreviewProps {
  quote: {
    expectedOutput: string;
    priceImpact: string;
    minimumReceived: string;
    fee: string;
  };
}

export function TradePreview({ quote }: TradePreviewProps) {
  return (
    <div className="trade-preview">
      <h3>Trade Preview</h3>
      <div className="preview-details">
        <div className="preview-row">
          <span>Expected Output</span>
          <span>{quote.expectedOutput}</span>
        </div>
        <div className="preview-row">
          <span>Price Impact</span>
          <span className={parseFloat(quote.priceImpact) > 5 ? 'warning' : ''}>
            {quote.priceImpact}%
          </span>
        </div>
        <div className="preview-row">
          <span>Minimum Received</span>
          <span>{quote.minimumReceived}</span>
        </div>
        <div className="preview-row">
          <span>Fee</span>
          <span>{quote.fee}</span>
        </div>
      </div>
    </div>
  );
} 