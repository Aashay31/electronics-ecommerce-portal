import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  MessageSquare,
  Search,
  Star,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import api from "../../utils/api";
import { resolveImageUrl } from "../../utils/imageUrl";
import ConfirmModal from "../components/ConfirmModal";

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [analytics, setAnalytics] = useState({ topReviewed: [], lowestRated: [] });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState("");
  const [sort, setSort] = useState("recent");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchReviews = async (page = 1, searchQuery = search, ratingFilter = rating) => {
    try {
      const response = await api.get("/api/admin/reviews", {
        params: { page, limit: 10, search: searchQuery, rating: ratingFilter, sort },
      });
      setReviews(response.data.reviews || []);
      setPagination(response.data.pagination || { page: 1, pages: 1, total: 0 });
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get("/api/admin/reviews/analytics");
      setAnalytics(response.data.analytics || { topReviewed: [], lowestRated: [] });
    } catch {
      toast.error("Failed to load review analytics");
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchReviews(1, "", "");
      fetchAnalytics();
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchReviews(1, search, rating);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  const handleSearch = (event) => {
    event.preventDefault();
    setIsLoading(true);
    fetchReviews(1, search, rating);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setIsLoading(true);
      fetchReviews(newPage, search, rating);
    }
  };

  const handleDeleteClick = (review) => {
    setDeleteTarget(review);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/api/admin/reviews/${deleteTarget.productId}/${deleteTarget.reviewId}`);
      toast.success("Review deleted successfully");
      setIsDeleteModalOpen(false);
      fetchReviews(pagination.page, search, rating);
      fetchAnalytics();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete review");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reviews</h1>
        <p className="mt-1 text-sm text-slate-500">
          Moderate reviews and track rating health across products.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Most reviewed products
          </div>
          <div className="mt-4 space-y-3">
            {analytics.topReviewed.length === 0 ? (
              <p className="text-sm text-slate-500">No review data yet.</p>
            ) : (
              analytics.topReviewed.map((item) => (
                <div key={item._id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={resolveImageUrl(item.imageUrl)}
                      alt={item.productName}
                      className="h-10 w-10 rounded-xl border border-slate-100 object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                        {item.productName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.totalReviews} reviews
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                    <Star className="h-3.5 w-3.5" />
                    {item.averageRating?.toFixed(1) || "0.0"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <TrendingDown className="h-4 w-4 text-rose-500" />
            Lowest rated products
          </div>
          <div className="mt-4 space-y-3">
            {analytics.lowestRated.length === 0 ? (
              <p className="text-sm text-slate-500">No review data yet.</p>
            ) : (
              analytics.lowestRated.map((item) => (
                <div key={item._id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={resolveImageUrl(item.imageUrl)}
                      alt={item.productName}
                      className="h-10 w-10 rounded-xl border border-slate-100 object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                        {item.productName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.totalReviews} reviews
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                    <Star className="h-3.5 w-3.5" />
                    {item.averageRating?.toFixed(1) || "0.0"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product, title, or customer..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-xl border-none bg-slate-50 py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100"
          >
            Search
          </button>
        </form>
        <div className="flex items-center gap-2">
          <select
            value={rating}
            onChange={(event) => {
              const next = event.target.value;
              setRating(next);
              setIsLoading(true);
              fetchReviews(1, search, next);
            }}
            className="rounded-xl border-none bg-slate-50 py-2.5 pl-4 pr-8 text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All ratings</option>
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="rounded-xl border-none bg-slate-50 py-2.5 pl-4 pr-8 text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="recent">Most recent</option>
            <option value="highest">Highest rated</option>
            <option value="lowest">Lowest rated</option>
            <option value="helpful">Most helpful</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            No reviews match your filters.
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.reviewId}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={resolveImageUrl(review.imageUrl)}
                    alt={review.productName}
                    className="h-12 w-12 rounded-xl border border-slate-100 object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{review.productName}</p>
                    <p className="text-xs text-slate-500">
                      {review.userName || "Customer"} • {review.userEmail || ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
                    <Star className="h-3.5 w-3.5" /> {review.rating}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(review)}
                    className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <MessageSquare className="h-4 w-4" />
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
                <h4 className="mt-2 text-sm font-semibold text-slate-900">{review.title}</h4>
                <p className="mt-2 text-sm text-slate-600">{review.comment}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
            disabled={pagination.page === 1}
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-xs font-semibold text-slate-500">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            type="button"
            onClick={() => handlePageChange(Math.min(pagination.pages, pagination.page + 1))}
            disabled={pagination.page === pagination.pages}
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Review"
        message="Are you sure you want to remove this review? This cannot be undone."
      />
    </div>
  );
}

export default Reviews;
