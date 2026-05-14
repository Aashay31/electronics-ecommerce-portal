function ProductCard({ product }) {
  return (
    <div className="bg-white shadow-lg rounded-xl p-4 hover:shadow-2xl transition duration-300">
      <img
        src={product.imageUrl}
        alt={product.productName}
        className="w-full h-48 object-cover rounded-lg"
      />

      <h2 className="text-xl font-semibold mt-4">
        {product.productName}
      </h2>

      <p className="text-gray-600 mt-2">
        {product.description}
      </p>

      <div className="flex justify-between items-center mt-4">
        <span className="text-lg font-bold text-blue-600">
          ₹{product.price}
        </span>

        <span className="text-sm text-gray-500">
          Stock: {product.stock}
        </span>
      </div>
    </div>
  );
}

export default ProductCard;