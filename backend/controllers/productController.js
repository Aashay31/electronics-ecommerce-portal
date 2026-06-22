const Product = require("../models/Product");
const Order = require("../models/Order");

const buildRatingStats = (reviews = []) => {
  const totals = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  reviews.forEach((review) => {
    const rating = Number(review.rating) || 0;
    if (totals[rating] !== undefined) {
      totals[rating] += 1;
    }
    sum += rating;
  });
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 ? sum / totalReviews : 0;

  return {
    totalReviews,
    averageRating: Number(averageRating.toFixed(2)),
    ratingBreakdown: totals,
  };
};

const syncProductRatings = (product) => {
  const stats = buildRatingStats(product.reviews || []);
  product.averageRating = stats.averageRating;
  product.totalReviews = stats.totalReviews;
  product.rating = stats.averageRating;
  product.ratingCount = stats.totalReviews;
  return stats;
};

const getReviewUserId = (review) => {
  if (!review?.user) {
    return "";
  }
  if (review.user._id) {
    return review.user._id.toString();
  }
  return review.user.toString();
};


// Add Product
const addProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error in productController.js:", error);
    console.error("Error in productController.js:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};


// Get All Products (with search, filters, sort, pagination)
const getAllProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      rating,
      featured,
      stock,
      sort,
      page = 1,
      limit = 12,
      newArrival,
      suggest,
    } = req.query;

    const filter = {};

    if (search) {
      const searchRegex = new RegExp(search, "i");
      filter.$or = [
        { productName: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
      ];
    }

    if (category) {
      const categories = category
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      if (categories.length > 0) {
        filter.category = { $in: categories };
      }
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    if (rating) {
      filter.rating = { $gte: Number(rating) };
    }

    if (featured === "true") {
      filter.featured = true;
    }

    if (stock === "in") {
      filter.stock = { $gt: 0 };
    }
    if (stock === "out") {
      filter.stock = { $lte: 0 };
    }

    if (newArrival === "true") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      filter.createdAt = { $gte: cutoff };
    }

    let sortOption = { createdAt: -1 };
    switch (sort) {
      case "price-asc":
        sortOption = { price: 1 };
        break;
      case "price-desc":
        sortOption = { price: -1 };
        break;
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      case "popular":
        sortOption = { soldCount: -1 };
        break;
      case "best-selling":
        sortOption = { soldCount: -1 };
        break;
      case "rating":
        sortOption = { rating: -1 };
        break;
      case "newest":
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    const safeLimit = Math.min(Number(limit) || 12, 48);
    const pageNumber = Math.max(Number(page) || 1, 1);
    const skip = (pageNumber - 1) * safeLimit;

    const total = await Product.countDocuments();
    const filteredCount = await Product.countDocuments(filter);

    const productsQuery = Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(safeLimit);

    if (suggest === "true") {
      productsQuery.select("productName category imageUrl price rating");
    }

    const products = await productsQuery;

    const filterForCategories = { ...filter };
    delete filterForCategories.category;
    const categoryAggregation = await Product.aggregate([
      { $match: filterForCategories },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const categories = categoryAggregation.map((entry) => ({
      name: entry._id,
      count: entry.count,
    }));

    res.status(200).json({
      success: true,
      products,
      categories,
      pagination: {
        total,
        filteredCount,
        page: pageNumber,
        pages: Math.ceil(filteredCount / safeLimit) || 1,
        limit: safeLimit,
      },
    });
  } catch (error) {
    console.error("Error in productController.js:", error);
    console.error("Error in productController.js:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};


// Get Single Product
const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error in productController.js:", error);
    console.error("Error in productController.js:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      sort = "recent",
      page = 1,
      limit = 6,
      rating,
      withImages,
    } = req.query;

    const product = await Product.findById(id).populate(
      "reviews.user",
      "fullName email"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let reviews = product.reviews ? [...product.reviews] : [];

    if (rating) {
      const ratingValue = Number(rating);
      reviews = reviews.filter((review) => review.rating === ratingValue);
    }

    if (withImages === "true") {
      reviews = reviews.filter((review) => (review.images || []).length > 0);
    }

    switch (sort) {
      case "highest":
        reviews = reviews.sort(
          (a, b) => b.rating - a.rating || b.createdAt - a.createdAt
        );
        break;
      case "lowest":
        reviews = reviews.sort(
          (a, b) => a.rating - b.rating || b.createdAt - a.createdAt
        );
        break;
      case "helpful":
        reviews = reviews.sort(
          (a, b) => b.helpfulCount - a.helpfulCount || b.createdAt - a.createdAt
        );
        break;
      case "recent":
      default:
        reviews = reviews.sort((a, b) => b.createdAt - a.createdAt);
        break;
    }

    const safeLimit = Math.min(Number(limit) || 6, 20);
    const pageNumber = Math.max(Number(page) || 1, 1);
    const start = (pageNumber - 1) * safeLimit;
    const end = start + safeLimit;

    const mapReview = (review) => ({
      _id: review._id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      images: review.images || [],
      verifiedPurchase: review.verifiedPurchase,
      helpfulCount: review.helpfulCount,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      user: review.user
        ? {
            _id: review.user._id,
            fullName: review.user.fullName,
            email: review.user.email,
          }
        : null,
      isHelpfulByUser: req.user
        ? review.helpfulBy.some(
            (entry) => entry.toString() === req.user.id
          )
        : false,
    });

    const paginated = reviews.slice(start, end).map(mapReview);
    const userReview = req.user
      ? product.reviews.find(
          (review) => getReviewUserId(review) === req.user.id
        )
      : null;

    const stats = buildRatingStats(product.reviews || []);

    return res.status(200).json({
      success: true,
      reviews: paginated,
      userReview: userReview ? mapReview(userReview) : null,
      stats,
      pagination: {
        page: pageNumber,
        limit: safeLimit,
        total: reviews.length,
        pages: Math.ceil(reviews.length / safeLimit) || 1,
      },
    });
  } catch (error) {
    console.error("Error in productController.js:", error);
    return console.error("Error in productController.js:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, comment } = req.body;

    if (!rating || !title || !comment) {
      return res.status(400).json({
        success: false,
        message: "Rating, title, and comment are required",
      });
    }

    const ratingValue = Number(rating);
    if (Number.isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const existingReview = product.reviews.find(
      (review) => review.user.toString() === req.user.id
    );
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    const verifiedPurchase = await Order.exists({
      user: req.user.id,
      "items.product": product._id,
      orderStatus: { $ne: "Cancelled" },
    });

    product.reviews.push({
      user: req.user.id,
      rating: ratingValue,
      title: title.trim(),
      comment: comment.trim(),
      verifiedPurchase: Boolean(verifiedPurchase),
    });

    const stats = syncProductRatings(product);
    await product.save();

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      stats,
    });
  } catch (error) {
    console.error("Error in productController.js:", error);
    return console.error("Error in productController.js:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

const updateReview = async (req, res) => {
  try {
    const { id, reviewId } = req.params;
    const { rating, title, comment } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const review = product.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this review",
      });
    }

    if (rating) {
      const ratingValue = Number(rating);
      if (Number.isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
      }
      review.rating = ratingValue;
    }
    if (title) {
      review.title = title.trim();
    }
    if (comment) {
      review.comment = comment.trim();
    }

    const stats = syncProductRatings(product);
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      stats,
    });
  } catch (error) {
    console.error("Error in productController.js:", error);
    return console.error("Error in productController.js:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id, reviewId } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const review = product.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this review",
      });
    }

    review.deleteOne();
    const stats = syncProductRatings(product);
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      stats,
    });
  } catch (error) {
    console.error("Error in productController.js:", error);
    return console.error("Error in productController.js:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

const markReviewHelpful = async (req, res) => {
  try {
    const { id, reviewId } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const review = product.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const existingIndex = review.helpfulBy.findIndex(
      (entry) => entry.toString() === req.user.id
    );

    let isHelpful = false;
    if (existingIndex >= 0) {
      review.helpfulBy.splice(existingIndex, 1);
    } else {
      review.helpfulBy.push(req.user.id);
      isHelpful = true;
    }

    review.helpfulCount = review.helpfulBy.length;
    await product.save();

    return res.status(200).json({
      success: true,
      helpfulCount: review.helpfulCount,
      isHelpful,
    });
  } catch (error) {
    console.error("Error in productController.js:", error);
    return console.error("Error in productController.js:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};


module.exports = {
  addProduct,
  getAllProducts,
  getSingleProduct,
  getProductReviews,
  addReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
};