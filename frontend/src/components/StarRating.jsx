import { AiFillStar, AiOutlineStar } from "react-icons/ai";

function StarRating({
  value = 0,
  size = 18,
  onChange,
  onHover,
  onLeave,
  readOnly = false,
  className = "",
  showValue = false,
}) {
  const safeValue = Math.max(0, Math.min(5, Number(value) || 0));
  const isInteractive = !readOnly && typeof onChange === "function";

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFull = safeValue >= star;
        const isHalf = !isFull && safeValue >= star - 0.5;

        return (
          <button
            key={star}
            type="button"
            disabled={!isInteractive}
            onClick={() => isInteractive && onChange(star)}
            onMouseEnter={() => isInteractive && onHover?.(star)}
            onMouseLeave={() => isInteractive && onLeave?.()}
            className={`relative inline-flex items-center justify-center transition ${
              isInteractive
                ? "cursor-pointer text-amber-500 hover:scale-105"
                : "cursor-default text-amber-400"
            }`}
            style={{ width: size, height: size }}
            aria-label={`${star} star rating`}
          >
            <AiOutlineStar size={size} className="text-amber-300" />
            {(isFull || isHalf) && (
              <span
                className="absolute left-0 top-0 overflow-hidden"
                style={{ width: isFull ? size : size / 2 }}
              >
                <AiFillStar size={size} className="text-amber-500" />
              </span>
            )}
          </button>
        );
      })}
      {showValue && (
        <span className="ml-2 text-sm font-semibold text-slate-600">
          {safeValue.toFixed(1)}
        </span>
      )}
    </div>
  );
}

export default StarRating;
