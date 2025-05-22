import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";

const navItems = [
  { path: "/", label: "Merkaz Dashboard" },
  { path: "/kabam-dashboard", label: "Kabam Dashboard" },
  { path: "/merkaz-tickets", label: "Merkaz Tickets" },
  { path: "/kabam-tickets", label: "Kabam Tickets" },
  { path: "/users", label: "Users" },
  { path: "/manage-rules", label: "Manage Rules" },
  { path: "/rules-performance", label: "Rules Performance" },
];

export default function Navbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-card border-b border-border fixed w-full z-10">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/">
              <div className="flex-shrink-0 flex items-center cursor-pointer">
                <span className="text-primary text-xl font-bold font-mono">Morfius</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-6 md:flex md:space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location === item.path
                      ? " border-b-2 border-primary"
                      : " hover:"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center">
            <div className="ml-3 relative">
              <div>
                <button
                  type="button"
                  className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  id="user-menu-button"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="profile-image">
                    AS
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="bg-card rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover: hover:bg-gray-800 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {mobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location === item.path
                    ? " bg-gray-900"
                    : " hover: hover:bg-gray-700"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
