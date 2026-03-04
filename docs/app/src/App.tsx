import Header from './sections/Header';
import Hero from './sections/Hero';
import PartnerLogos from './sections/PartnerLogos';
import ProductCards from './sections/ProductCards';
import Testimonial from './sections/Testimonial';
import EventSection from './sections/EventSection';
import AnnouncementBanner from './sections/AnnouncementBanner';
import Footer from './sections/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-[52px]">
        <Hero />
        <PartnerLogos />
        <ProductCards />
        <Testimonial />
        <EventSection />
      </main>
      <div className="pb-20">
        <Footer />
      </div>
      <AnnouncementBanner />
    </div>
  );
}

export default App;
