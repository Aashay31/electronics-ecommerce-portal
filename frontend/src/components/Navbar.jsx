import { Link } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import { useCart } from "../context/CartContext";

function Navbar() {
  const { itemCount } = useCart();

  return (
    <nav className="navbar">
      <Link to="/" className="text-lg font-semibold">
        ElectroMart
      </Link>

      <div>
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
        <Link to="/cart" className="relative inline-flex items-center">
          <FiShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -right-2 -top-2 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;