export default function PartnerLogos() {
  const partners = [
    { name: 'voi.', svg: (
      <svg viewBox="0 0 120 40" className="h-8 w-auto">
        <text x="0" y="28" className="text-2xl font-bold" fill="currentColor" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '28px' }}>voi.</text>
      </svg>
    )},
    { name: 'B Lab Europe', svg: (
      <svg viewBox="0 0 80 50" className="h-10 w-auto">
        <circle cx="25" cy="25" r="18" fill="none" stroke="currentColor" strokeWidth="2"/>
        <text x="22" y="30" textAnchor="middle" fill="currentColor" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600 }}>B</text>
        <text x="48" y="22" fill="currentColor" style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px' }}>Lab</text>
        <text x="48" y="34" fill="currentColor" style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px' }}>Europe</text>
      </svg>
    )},
    { name: 'KEARNEY', svg: (
      <svg viewBox="0 0 140 40" className="h-6 w-auto">
        <text x="0" y="28" fill="currentColor" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '22px', letterSpacing: '0.15em' }}>KEARNEY</text>
      </svg>
    )},
    { name: 'foodora', svg: (
      <svg viewBox="0 0 120 40" className="h-7 w-auto">
        <circle cx="12" cy="20" r="10" fill="currentColor"/>
        <text x="28" y="26" fill="currentColor" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '20px' }}>foodora</text>
      </svg>
    )},
    { name: 'Electrolux Group', svg: (
      <svg viewBox="0 0 160 40" className="h-8 w-auto">
        <rect x="0" y="12" width="20" height="16" fill="none" stroke="currentColor" strokeWidth="2"/>
        <text x="26" y="20" fill="currentColor" style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600 }}>Electrolux</text>
        <text x="26" y="32" fill="currentColor" style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px' }}>Group</text>
      </svg>
    )},
    { name: 'MERCK', svg: (
      <svg viewBox="0 0 100 40" className="h-7 w-auto">
        <path d="M5 20 L15 8 L25 20 L15 32 Z" fill="currentColor"/>
        <text x="32" y="26" fill="currentColor" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '18px' }}>MERCK</text>
      </svg>
    )},
    { name: 'ahlsell', svg: (
      <svg viewBox="0 0 120 40" className="h-7 w-auto">
        <text x="0" y="28" fill="currentColor" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '24px', fontStyle: 'italic' }}>ahlsell</text>
      </svg>
    )},
  ];

  return (
    <section className="py-10">
      <div className="max-w-[1496px] mx-auto px-8">
        <div className="grid grid-cols-7 gap-5 items-center justify-items-center">
          {partners.map((partner, index) => (
            <div 
              key={partner.name} 
              className="flex items-center justify-center h-[100px] w-full partner-logo"
              style={{ opacity: index === 1 ? 0.2 : 1 }}
            >
              <div className="text-black">
                {partner.svg}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
