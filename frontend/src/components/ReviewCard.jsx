import { useMemo, useState } from "react";
import { FiCheckCircle, FiThumbsUp, FiEdit2, FiTrash2 } from "react-icons/fi";
import StarRating from "./StarRating";

function getInitials(name = "") {
  const parts = name.trim().split(" ").filter(Boolean);
  if (!parts.length) return "U";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
}

function ReviewCard({ review, isOwner, onHelpful, onEdit, onDelete, isBusy }) {
  const [expanded, setExpanded] = useState(false);
  const initials = useMemo(() => getInitials(review.user?.fullName || ""), [review.user]);

  const isLong = (review.comment || "").length > 240;
  const visibleComment = !isLong || expanded
    ? review.comment
    : `${review.comment.slice(0, 220)}...`;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {review.user?.fullName || "Customer"}
            </p>
            <p className="text-xs text-slate-500">
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {review.verifiedPurchase && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
              <FiCheckCircle className="h-3.5 w-3.5" />
              Verified Purchase
            </span>
          )}
          <StarRating value={review.rating} readOnly size={16} />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">
            {review.title}
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {visibleComment}
          </p>
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onHelpful?.(review._id)}
            disabled={isBusy}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              review.isHelpfulByUser
                ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                : "border-slate-200 text-slate-600 hover:border-emerald-200 hover:text-emerald-600"
            } ${isBusy ? "opacity-60" : ""}`}
          >
            <FiThumbsUp className="h-3.5 w-3.5" />
            Helpful ({review.helpfulCount})
          </button>

          {isOwner && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onEdit?.(review)}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600"
              >
                <FiEdit2 className="h-3.5 w-3.5" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete?.(review)}
                className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                <FiTrash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReviewCard;
