import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Home() {
  return (
    <>
      <Navbar />

      <section className="hero">
        <h1>Electronics Ecommerce Portal</h1>
        <p>Explore the latest electronic products and components.</p>

        <button className="mt-6 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 transition hover:-translate-y-0.5 hover:bg-slate-800">
          Shop Now
        </button>
      </section>

      <Footer />
    </>
  );
}

export default Home;