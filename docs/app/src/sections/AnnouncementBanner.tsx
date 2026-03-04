import { ArrowRight } from 'lucide-react';

export default function AnnouncementBanner() {
  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-10 z-50 pointer-events-none">
      <a 
        href="/our-next-chapter" 
        className="pointer-events-auto inline-flex items-center gap-4 px-8 py-3.5 bg-white rounded-full shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_8px_16px_rgba(0,0,0,0.08)] text-sm font-medium text-black hover:shadow-lg transition-shadow"
      >
        Sana is now a part of Workday.
        <span className="font-semibold flex items-center gap-1">
          Read more <ArrowRight className="w-4 h-4" />
        </span>
      </a>
    </div>
  );
}
