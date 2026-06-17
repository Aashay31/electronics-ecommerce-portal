import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FiFilter, FiRefreshCw } from "react-icons/fi";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import StarRating from "./StarRating";
import RatingBreakdown from "./RatingBreakdown";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";

const defaultStats = {
  averageRating: 0,
  totalReviews: 0,
  ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

function ReviewsSection({ productId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(defaultStats);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHelpfulLoading, setIsHelpfulLoading] = useState(false);
  const [sort, setSort] = useState("recent");
  const [ratingFilter, setRatingFilter] = useState("");
  const [withImages, setWithImages] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [userReview, setUserReview] = useState(null);

  const fetchReviews = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/api/products/${productId}/reviews`, {
        params: {
          sort,
          page,
          limit: 6,
          rating: ratingFilter || undefined,
          withImages: withImages ? "true" : undefined,
        },
      });
      setReviews(response.data.reviews || []);
      setStats(response.data.stats || defaultStats);
      setPagination(response.data.pagination || { page: 1, pages: 1, total: 0 });
      setUserReview(response.data.userReview || null);
    } catch (error) {
      toast.error("Unable to load reviews");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, sort, ratingFilter, withImages]);

  const handleSubmitReview = async (payload) => {
    try {
      if (userReview && !editingReview) {
        toast.error("You have already reviewed this product. Edit your review instead.");
        setEditingReview(userReview);
        return;
      }
      setIsSubmitting(true);
      if (editingReview) {
        await api.put(`/api/products/${productId}/reviews/${editingReview._id}`, payload);
        toast.success("Review updated successfully");
      } else {
        await api.post(`/api/products/${productId}/reviews`, payload);
        toast.success("Review submitted successfully");
      }
      setEditingReview(null);
      fetchReviews(1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (review) => {
    try {
      await api.delete(`/api/products/${productId}/reviews/${review._id}`);
      toast.success("Review deleted");
      setEditingReview(null);
      fetchReviews(1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete review");
    }
  };

  const handleHelpful = async (reviewId) => {
    try {
      setIsHelpfulLoading(true);
      const response = await api.post(`/api/products/${productId}/reviews/${reviewId}/helpful`);
      setReviews((current) =>
        current.map((review) =>
          review._id === reviewId
            ? {
                ...review,
                helpfulCount: response.data.helpfulCount,
                isHelpfulByUser: response.data.isHelpful,
              }
            : review
        )
      );
    } catch (error) {
      toast.error("Unable to update helpful count");
    } finally {
      setIsHelpfulLoading(false);
    }
  };

  const currentUserReview = useMemo(() => {
    if (!user) return null;
    return userReview || reviews.find((review) => review.user?._id === user._id) || null;
  }, [reviews, user, userReview]);

  const totalReviews = stats.totalReviews || 0;

  return (
    <section className="mt-12 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Reviews & Ratings
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            Customer feedback
          </h2>
        </div>
        <button
          type="button"
          onClick={() => fetchReviews(1)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300"
        >
          <FiRefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
        <div className="rounded-2xl border border-slate-100 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="text-4xl font-semibold text-slate-900 dark:text-white">
              {stats.averageRating?.toFixed(1) || "0.0"}
            </div>
            <div>
              <StarRating value={stats.averageRating || 0} readOnly size={18} />
              <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                {totalReviews} ratings
              </p>
            </div>
          </div>
          <div className="mt-6">
            <RatingBreakdown stats={stats} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Filter reviews</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">Sort by relevance and sentiment.</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <FiFilter className="h-4 w-4" />
              {pagination.total} results
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="recent">Most recent</option>
              <option value="highest">Highest rated</option>
              <option value="lowest">Lowest rated</option>
              <option value="helpful">Most helpful</option>
            </select>
            <select
              value={ratingFilter}
              onChange={(event) => setRatingFilter(event.target.value)}
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">All ratings</option>
              <option value="5">5 star only</option>
              <option value="4">4 star only</option>
              <option value="3">3 star only</option>
              <option value="2">2 star only</option>
              <option value="1">1 star only</option>
            </select>
          </div>
          <label className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <input
              type="checkbox"
              checked={withImages}
              onChange={(event) => setWithImages(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            With images
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <ReviewForm
          initialReview={editingReview}
          onSubmit={handleSubmitReview}
          onCancel={editingReview ? () => setEditingReview(null) : null}
          isSubmitting={isSubmitting}
        />

        {currentUserReview && !editingReview && (
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs font-semibold text-indigo-600">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>You already reviewed this product.</span>
              <button
                type="button"
                onClick={() => setEditingReview(currentUserReview)}
                className="rounded-full border border-indigo-200 px-3 py-1 text-[11px] font-semibold text-indigo-600 transition hover:bg-indigo-100"
              >
                Edit your review
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-5">
        {isLoading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-2xl border border-slate-100 bg-slate-50 dark:bg-slate-900 dark:bg-slate-800"
              />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white dark:bg-slate-900 p-8 text-center text-slate-500 dark:text-slate-400">
            No reviews yet. Be the first to share your experience.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {reviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                isOwner={review.user?._id === user?._id}
                onHelpful={handleHelpful}
                onEdit={(value) => setEditingReview(value)}
                onDelete={handleDeleteReview}
                isBusy={isHelpfulLoading}
              />
            ))}
          </div>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => fetchReviews(Math.max(1, pagination.page - 1))}
            disabled={pagination.page === 1}
            className="rounded-full border border-slate-200 dark:border-white/10 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            type="button"
            onClick={() => fetchReviews(Math.min(pagination.pages, pagination.page + 1))}
            disabled={pagination.page === pagination.pages}
            className="rounded-full border border-slate-200 dark:border-white/10 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}

export default ReviewsSection;
