interface OrderSummaryProps {
  summaryText: string;
  onCopy: () => void;
}

export function OrderSummary({ summaryText, onCopy }: OrderSummaryProps) {
  return (
    <div className="copy-wrapper">
      <div className="text-copy-box">
        <pre>{summaryText}</pre>
      </div>
      <button
        onClick={onCopy}
        disabled={!summaryText}
        style={{
          opacity: summaryText ? 1 : 0.5,
          cursor: summaryText ? "pointer" : "not-allowed",
        }}
      >
        Copy Text
      </button>
    </div>
  );
}