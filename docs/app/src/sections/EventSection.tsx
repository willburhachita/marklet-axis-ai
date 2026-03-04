export default function EventSection() {
  return (
    <section className="py-10">
      <div className="max-w-[1496px] mx-auto px-8">
        <div className="relative rounded-3xl overflow-hidden border border-black/10">
          {/* Content Overlay */}
          <div className="relative z-10 flex flex-col items-start gap-[120px] p-10 pointer-events-none">
            {/* Location Badge */}
            <div className="inline-flex items-center px-3 py-1.5 bg-white border border-black/10 rounded-full text-[15px] text-black mb-5 pointer-events-auto">
              New York
            </div>

            {/* Title and Button */}
            <div>
              <h2 className="text-[48px] leading-[48px] tracking-[-0.96px] font-medium text-black mb-6">
                Sana AI Summit<br />
                <span className="text-black/40">May 21, 2026</span>
              </h2>
              <a 
                href="/events/sana-ai-summit-2026" 
                className="pointer-events-auto inline-flex items-center px-4 py-2.5 bg-black text-white text-sm font-medium rounded-full hover:opacity-80 transition-opacity"
              >
                Register interest
              </a>
            </div>
          </div>

          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/event-collage.jpg" 
              alt="Sana AI Summit"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
