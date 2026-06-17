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
        <h1 className="text-[20px] font-semibold text-[var(--admin-text-primary)] tracking-[-0.01em]">Reviews</h1>
        <p className="mt-1 text-[13px] text-[var(--admin-text-secondary)]">
          Moderate reviews and track rating health across products.
        </p>
      </div>

      <div className="grid gap-[24px] lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-[24px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] border-t-[3px] border-t-[var(--admin-success)]">
          <div className="flex items-center gap-2 text-[14px] font-semibold text-[var(--admin-text-primary)]">
            <TrendingUp className="h-4 w-4 text-[var(--admin-success)]" />
            Most reviewed products
          </div>
          <div className="mt-[16px] space-y-[12px]">
            {analytics.topReviewed.length === 0 ? (
              <p className="text-[13px] text-[var(--admin-text-secondary)]">No review data yet.</p>
            ) : (
              analytics.topReviewed.map((item) => (
                <div key={item._id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={resolveImageUrl(item.imageUrl)}
                      alt={item.productName}
                      className="h-10 w-10 rounded-md border border-[var(--admin-border)] object-cover shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                    />
                    <div>
                      <p className="text-[13px] font-medium text-[var(--admin-text-primary)] line-clamp-1">
                        {item.productName}
                      </p>
                      <p className="text-[12px] text-[var(--admin-text-secondary)]">
                        {item.totalReviews} reviews
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[12px] font-semibold text-[var(--admin-warning)]">
                    <Star className="h-3.5 w-3.5" />
                    {item.averageRating?.toFixed(1) || "0.0"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-[24px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] border-t-[3px] border-t-[var(--admin-danger)]">
          <div className="flex items-center gap-2 text-[14px] font-semibold text-[var(--admin-text-primary)]">
            <TrendingDown className="h-4 w-4 text-[var(--admin-danger)]" />
            Lowest rated products
          </div>
          <div className="mt-[16px] space-y-[12px]">
            {analytics.lowestRated.length === 0 ? (
              <p className="text-[13px] text-[var(--admin-text-secondary)]">No review data yet.</p>
            ) : (
              analytics.lowestRated.map((item) => (
                <div key={item._id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={resolveImageUrl(item.imageUrl)}
                      alt={item.productName}
                      className="h-10 w-10 rounded-md border border-[var(--admin-border)] object-cover shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                    />
                    <div>
                      <p className="text-[13px] font-medium text-[var(--admin-text-primary)] line-clamp-1">
                        {item.productName}
                      </p>
                      <p className="text-[12px] text-[var(--admin-text-secondary)]">
                        {item.totalReviews} reviews
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[12px] font-semibold text-[var(--admin-warning)]">
                    <Star className="h-3.5 w-3.5" />
                    {item.averageRating?.toFixed(1) || "0.0"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-[12px] rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-[16px] py-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="flex flex-1 items-center gap-[12px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]" />
            <input
              type="text"
              placeholder="Search by product, title, or customer..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface-2)] py-[8px] pl-10 pr-3 text-[14px] text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] outline-none focus:border-[var(--admin-accent)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
            />
          </div>
          <button
            type="submit"
            className="rounded-md border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] px-[18px] py-[8px] text-[14px] font-medium text-[var(--admin-text-primary)] transition hover:bg-[var(--admin-surface-2)]"
          >
            Search
          </button>
        </form>
        <div className="flex items-center gap-[12px]">
          <select
            value={rating}
            onChange={(event) => {
              const next = event.target.value;
              setRating(next);
              setIsLoading(true);
              fetchReviews(1, search, next);
            }}
            className="rounded-md border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] py-[8px] pl-3 pr-8 text-[14px] text-[var(--admin-text-primary)] outline-none focus:border-[var(--admin-accent)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
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
            className="rounded-md border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] py-[8px] pl-3 pr-8 text-[14px] text-[var(--admin-text-primary)] outline-none focus:border-[var(--admin-accent)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
          >
            <option value="recent">Most recent</option>
            <option value="highest">Highest rated</option>
            <option value="lowest">Lowest rated</option>
            <option value="helpful">Most helpful</option>
          </select>
        </div>
      </div>

      <div className="space-y-[16px]">
        {isLoading ? (
          <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-[32px] text-center text-[14px] text-[var(--admin-text-secondary)]">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-[32px] text-center text-[14px] text-[var(--admin-text-secondary)]">
            No reviews match your filters.
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.reviewId}
              className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-[24px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={resolveImageUrl(review.imageUrl)}
                    alt={review.productName}
                    className="h-12 w-12 rounded-md border border-[var(--admin-border)] object-cover shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                  />
                  <div>
                    <p className="text-[14px] font-semibold text-[var(--admin-text-primary)]">{review.productName}</p>
                    <p className="text-[13px] text-[var(--admin-text-secondary)]">
                      {review.userName || "Customer"} • {review.userEmail || ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-[12px]">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--admin-warning-bg)] px-[10px] py-[3px] text-[12px] font-medium text-[var(--admin-warning)] border border-[#FDE68A]">
                    <Star className="h-3.5 w-3.5" /> {review.rating}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(review)}
                    className="inline-flex items-center gap-1 rounded-md border border-transparent px-[10px] py-[5px] text-[13px] font-medium text-[var(--admin-text-secondary)] transition hover:bg-[var(--admin-danger-bg)] hover:text-[var(--admin-danger)] hover:border-[#FECACA]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-[16px] pl-[60px]">
                <div className="flex flex-wrap items-center gap-2 text-[12px] text-[var(--admin-text-muted)]">
                  <MessageSquare className="h-4 w-4" />
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
                <h4 className="mt-[8px] text-[14px] font-medium text-[var(--admin-text-primary)]">{review.title}</h4>
                <p className="mt-[4px] text-[14px] text-[var(--admin-text-secondary)]">{review.comment}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-[24px] py-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] mt-[24px]">
          <p className="text-[13px] text-[var(--admin-text-secondary)]">
            Showing page <span className="font-medium text-[var(--admin-text-primary)]">{pagination.page}</span> of{" "}
            <span className="font-medium text-[var(--admin-text-primary)]">{pagination.pages}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
              className="rounded-md border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] px-[12px] py-[6px] text-[13px] font-medium text-[var(--admin-text-primary)] transition hover:bg-[var(--admin-surface-2)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(Math.min(pagination.pages, pagination.page + 1))}
              disabled={pagination.page === pagination.pages}
              className="rounded-md border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] px-[12px] py-[6px] text-[13px] font-medium text-[var(--admin-text-primary)] transition hover:bg-[var(--admin-surface-2)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
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
