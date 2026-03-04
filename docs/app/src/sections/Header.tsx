import { useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-400">
      <div className="max-w-[1496px] mx-auto px-8">
        <div className="flex items-center justify-between h-[52px]">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <svg 
              viewBox="0 0 66 24" 
              className="h-5 w-auto"
              fill="currentColor"
            >
              <path d="M8.486 0c4.178 0 7.806 2.332 8.032 6.057h-3.012c-0.227-2.462-2.429-3.919-5.15-3.919-2.947 0-4.761 1.879-4.761 3.951 0 2.462 2.073 3.206 6.121 4.049 4.47 0.943 6.252 2.886 6.252 6.19 0 3.66-3.207 6.283-7.709 6.283-4.178 0-7.806-2.332-8.032-6.057h3.012c0.227 2.462 2.429 3.919 5.15 3.919 2.947 0 4.761-1.879 4.761-3.951 0-2.462-2.073-3.206-6.121-4.049-4.47-0.943-6.252-2.886-6.252-6.19 0-3.66 3.207-6.283 7.709-6.283z"/>
              <path d="M23.709 24c-2.915 0-5.441-1.717-5.441-4.696v-2.3h2.785v2.3c0 1.587 1.115 2.689 2.656 2.689 1.556 0 2.656-1.102 2.656-2.689v-10.721h2.623v10.721c0 2.979-2.267 4.696-5.279 4.696z"/>
              <path d="M36.486 7.587c3.723 0 5.922 2.202 5.922 5.636v10.721h-2.623v-2.073c-0.79 1.372-2.539 2.279-4.838 2.279-2.915 0-5.441-1.717-5.441-4.696 0-2.979 2.526-4.696 5.441-4.696h4.299v-1.535c0-1.587-1.115-2.689-2.656-2.689-1.556 0-2.656 1.102-2.656 2.689h-2.785c0.324-2.721 2.559-4.988 6.348-4.988zM40.185 17.846v-2.3h-4.299c-1.556 0-2.656 1.102-2.656 2.689s1.1 2.689 2.656 2.689c1.556 0 2.656-1.102 2.656-2.689h1.643z"/>
              <path d="M53.83 24c-2.915 0-5.441-1.717-5.441-4.696v-2.3h2.785v2.3c0 1.587 1.115 2.689 2.656 2.689 1.556 0 2.656-1.102 2.656-2.689v-10.721h2.623v10.721c0 2.979-2.267 4.696-5.279 4.696z"/>
              <path d="M60.026 1.018h-0.602v3.014h-1.017v-0.5h2.636v0.5h-1.017v-3.014z"/>
              <path d="M64.124 0.518h0.917v4.512h-0.596v-2.893l-0.908 2.893h-0.581l-0.928-2.889v2.889h-0.587v-4.512h0.933l0.884 2.893 0.886-2.893z"/>
            </svg>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            <div 
              className="relative dropdown-trigger"
              onMouseEnter={() => setProductsOpen(true)}
              onMouseLeave={() => setProductsOpen(false)}
            >
              <button className="flex items-center gap-1 px-2 py-1 text-sm text-black hover:opacity-60 transition-opacity">
                Products
                <ChevronDown className="w-4 h-4 chevron-icon" />
              </button>
              <div className={`absolute top-full left-0 pt-2 ${productsOpen ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'}`} style={{ transform: productsOpen ? 'translateY(0)' : 'translateY(-8px)', transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                <div className="bg-white rounded-xl shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_8px_16px_rgba(0,0,0,0.08)] p-1 min-w-[240px]">
                  <a href="/products/sana" className="flex items-center px-3 py-2.5 text-sm text-black hover:bg-gray-50 rounded-md transition-colors">
                    Sana
                  </a>
                  <a href="/products/sana-learn" className="flex items-center px-3 py-2.5 text-sm text-black hover:bg-gray-50 rounded-md transition-colors">
                    Sana Learn
                  </a>
                </div>
              </div>
            </div>
            <a href="/about" className="px-2 py-1 text-sm text-black hover:opacity-60 transition-opacity">
              Mission
            </a>
            <a href="/careers" className="px-2 py-1 text-sm text-black hover:opacity-60 transition-opacity">
              Careers
            </a>
          </nav>

          {/* Book an intro button */}
          <div className="hidden md:block">
            <div className="relative dropdown-trigger">
              <button className="flex items-center gap-1 px-4 py-1.5 bg-black text-white text-sm font-medium rounded-full hover:opacity-80 transition-opacity">
                Book an intro
                <ChevronDown className="w-4 h-4 chevron-icon" />
              </button>
              <div className="dropdown-menu absolute top-full right-0 pt-2">
                <div className="bg-white rounded-xl shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_8px_16px_rgba(0,0,0,0.08)] p-1 min-w-[240px]">
                  <a href="/products/sana/book-intro" className="flex items-center px-3 py-2.5 text-sm text-black hover:bg-gray-50 rounded-md transition-colors">
                    Sana
                  </a>
                  <a href="/products/sana-learn/book-intro" className="flex items-center px-3 py-2.5 text-sm text-black hover:bg-gray-50 rounded-md transition-colors">
                    Sana Learn
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 p-6">
          <div className="space-y-4">
            <div>
              <button 
                className="flex items-center justify-between w-full py-2 text-base"
                onClick={() => setProductsOpen(!productsOpen)}
              >
                Products
                <ChevronDown className={`w-5 h-5 transition-transform ${productsOpen ? 'rotate-180' : ''}`} />
              </button>
              {productsOpen && (
                <div className="pl-4 mt-2 space-y-2">
                  <a href="/products/sana" className="block py-2 text-sm opacity-60">Sana</a>
                  <a href="/products/sana-learn" className="block py-2 text-sm opacity-60">Sana Learn</a>
                </div>
              )}
            </div>
            <a href="/about" className="block py-2 text-base">Mission</a>
            <a href="/careers" className="block py-2 text-base">Careers</a>
          </div>
        </div>
      )}
    </header>
  );
}
