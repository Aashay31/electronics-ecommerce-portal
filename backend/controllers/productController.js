const Product = require("../models/Product");


// Add Product
const addProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
    res.status(500).json({
      success: false,
      message: error.message,
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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  addProduct,
  getAllProducts,
  getSingleProduct,
};