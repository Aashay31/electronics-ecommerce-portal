import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";

function Home() {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/api/products");
      setProducts(response.data.products);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="flex-1">
        {/* Hero Section */}
        <section className="flex min-h-[50vh] flex-col items-center justify-center bg-gray-100 px-6 pb-12 pt-36 text-center md:min-h-[60vh] md:pt-28">
          <h1 className="text-4xl font-bold sm:text-5xl">
            Welcome to ElectroMart
          </h1>
          <p className="mt-4 text-slate-600">
            Explore the latest electronic products and components.
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Shop Now
          </Link>
        </section>

        {/* Featured Products Section */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
          <div className="product-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

export default Home;