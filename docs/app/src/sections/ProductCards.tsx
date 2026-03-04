export default function ProductCards() {
  return (
    <section className="py-10">
      <div className="max-w-[1496px] mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Sana Card */}
          <div className="product-card relative aspect-[352/317] bg-[#f5f5f5]">
            {/* Overlay Content */}
            <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-start p-8 pointer-events-none">
              <div>
                <p className="text-[22px] leading-[26.4px] tracking-[-0.22px] font-medium text-black">
                  Sana
                </p>
                <p className="text-[22px] leading-[26.4px] tracking-[-0.22px] font-medium text-black/60">
                  AI agents for every team
                </p>
              </div>
              <a 
                href="/products/sana" 
                className="pointer-events-auto inline-flex items-center px-4 py-2.5 bg-black text-white text-sm font-medium rounded-full hover:opacity-80 transition-opacity"
              >
                Explore
              </a>
            </div>
            
            {/* Image */}
            <a href="/products/sana" className="block w-full h-full">
              <img 
                src="/sana-product.jpg" 
                alt="Sana - AI agents for every team"
                className="w-full h-full object-cover"
              />
            </a>
          </div>

          {/* Sana Learn Card */}
          <div className="product-card relative aspect-[352/317] bg-[#f5f5f5]">
            {/* Overlay Content */}
            <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-start p-8 pointer-events-none">
              <div>
                <p className="text-[22px] leading-[26.4px] tracking-[-0.22px] font-medium text-black">
                  Sana Learn
                </p>
                <p className="text-[22px] leading-[26.4px] tracking-[-0.22px] font-medium text-black/60">
                  AI-native learning platform
                </p>
              </div>
              <a 
                href="/products/sana-learn" 
                className="pointer-events-auto inline-flex items-center px-4 py-2.5 bg-black text-white text-sm font-medium rounded-full hover:opacity-80 transition-opacity"
              >
                Explore
              </a>
            </div>
            
            {/* Image */}
            <a href="/products/sana-learn" className="block w-full h-full">
              <img 
                src="/sana-learn-product.jpg" 
                alt="Sana Learn - AI-native learning platform"
                className="w-full h-full object-cover"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
