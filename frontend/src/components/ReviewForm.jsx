import { useMemo, useState } from "react";
import StarRating from "./StarRating";

function ReviewForm({ initialReview, onSubmit, onCancel, isSubmitting }) {
  const [rating, setRating] = useState(initialReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(null);
  const [title, setTitle] = useState(initialReview?.title || "");
  const [comment, setComment] = useState(initialReview?.comment || "");

  const [prevInitialReview, setPrevInitialReview] = useState(initialReview);

  if (initialReview !== prevInitialReview) {
    setPrevInitialReview(initialReview);
    setRating(initialReview?.rating || 0);
    setHoverRating(null);
    setTitle(initialReview?.title || "");
    setComment(initialReview?.comment || "");
  }

  const displayRating = useMemo(() => {
    return hoverRating ?? rating;
  }, [hoverRating, rating]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ rating, title, comment });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-slate-100 bg-white dark:bg-slate-900 p-6 shadow-sm"
    >
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {initialReview ? "Update your review" : "Write a review"}
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
          Share your experience to help other buyers.
        </p>
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 dark:text-slate-200">Overall rating</p>
        <div className="mt-2 flex items-center gap-3">
          <StarRating
            value={displayRating}
            size={22}
            onChange={(value) => setRating(value)}
            onHover={(value) => setHoverRating(value)}
            onLeave={() => setHoverRating(null)}
          />
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 dark:text-slate-500">
            {displayRating ? `${displayRating} / 5` : "Select rating"}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 dark:text-slate-200">Review title</label>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Summarize your experience"
            className="mt-2 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            maxLength={120}
            required
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 dark:text-slate-200">Quick tips</label>
          <div className="mt-2 rounded-xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 p-3 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
            Keep it honest, highlight what you loved, and mention any deal-breakers.
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 dark:text-slate-200">Review details</label>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Tell us about quality, usability, and performance."
          rows={4}
          className="mt-2 w-full resize-none rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          maxLength={2000}
          required
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
          Verified purchases get a badge automatically when available.
        </p>
        <div className="flex items-center gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-slate-200 dark:border-white/10 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className={`rounded-full px-5 py-2 text-xs font-semibold text-white transition ${
              isSubmitting || rating === 0
                ? "bg-slate-300"
                : "bg-slate-900 hover:bg-slate-800"
            }`}
          >
            {isSubmitting ? "Saving..." : initialReview ? "Update Review" : "Submit Review"}
          </button>
        </div>
      </div>
    </form>
  );
}

export default ReviewForm;
