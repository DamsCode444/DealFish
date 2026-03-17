import { Link } from "react-router";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/clerk-react";
import {
  ShoppingBagIcon,
  PlusIcon,
  UserIcon,
  ShoppingCartIcon,
  LayoutDashboardIcon,
  Menu, // hamburger icon
} from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import { useCart } from "../hooks/useCart";

function Navbar() {
  const { isSignedIn } = useAuth();
  const { data: cartData } = useCart();
  const cartItemsCount = cartData?.data?.length || 0;

  return (
    <div className="navbar bg-base-300">
      <div className="max-w-5xl mx-auto w-full px-4 flex justify-between items-center">
        {/* LOGO */}
        <div className="flex-1 min-w-[120px] sm:min-w-0">
          <Link to="/" className="btn btn-ghost gap-2 px-2 sm:px-4">
            <ShoppingBagIcon className="size-5 text-primary" />
            <span className="text-base sm:text-lg font-bold font-mono tracking-wider truncate">
              DealFish🐟
            </span>
          </Link>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeSelector />

          {/* Cart – always visible */}
          {isSignedIn && (
            <Link
              to="/cart"
              className="btn btn-ghost btn-circle btn-xs sm:btn-sm relative"
            >
              <ShoppingCartIcon className="size-4 sm:size-5" />
              {cartItemsCount > 0 && (
                <span className="badge badge-primary badge-xs absolute -top-1 -right-1">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          )}

          {/* MOBILE HAMBURGER MENU (visible only on small screens) */}
          <div className="dropdown dropdown-end sm:hidden">
            <label tabIndex={0} className="btn btn-ghost btn-circle btn-sm">
              <Menu className="size-5" />
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              {isSignedIn ? (
                <>
                  <li>
                    <Link to="/create" className="gap-2">
                      <PlusIcon className="size-4" />
                      New Product
                    </Link>
                  </li>
                  <li>
                    <Link to="/dashboard" className="gap-2">
                      <LayoutDashboardIcon className="size-4" />
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/purchases" className="gap-2">
                      <ShoppingBagIcon className="size-4" />
                      My Purchases
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" className="gap-2">
                      <UserIcon className="size-4" />
                      Profile
                    </Link>
                  </li>
                  <li className="menu-title px-0">
                    <div className="flex items-center gap-2 px-4 py-2">
                      <UserButton />
                      <span className="text-sm">Account</span>
                    </div>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <SignInButton mode="modal">
                      <button className="gap-2 w-full text-left">Sign In</button>
                    </SignInButton>
                  </li>
                  <li>
                    <SignUpButton mode="modal">
                      <button className="gap-2 w-full text-left">Get Started</button>
                    </SignUpButton>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* DESKTOP BUTTONS (hidden on mobile) */}
          <div className="hidden sm:flex items-center gap-1 sm:gap-2">
            {isSignedIn ? (
              <>
                <Link
                  to="/create"
                  className="btn btn-primary btn-xs sm:btn-sm gap-1"
                >
                  <PlusIcon className="size-3 sm:size-4" />
                  <span className="hidden sm:inline">New Product</span>
                </Link>
                <Link
                  to="/dashboard"
                  className="btn btn-ghost btn-xs sm:btn-sm gap-1"
                >
                  <LayoutDashboardIcon className="size-3 sm:size-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <Link
                  to="/purchases"
                  className="btn btn-ghost btn-xs sm:btn-sm gap-1"
                >
                  <ShoppingBagIcon className="size-3 sm:size-4" />
                  <span className="hidden sm:inline">My Purchases</span>
                </Link>
                <Link
                  to="/profile"
                  className="btn btn-ghost btn-xs sm:btn-sm gap-1"
                >
                  <UserIcon className="size-3 sm:size-4" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>
                <UserButton />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="btn btn-ghost btn-xs sm:btn-sm">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="btn btn-primary btn-xs sm:btn-sm">
                    Get Started
                  </button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;