import Header from '@/components/Header';
import MainContent from '@/components/MainContent';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen text-foreground font-sans overflow-x-hidden">
      <Header />
      <MainContent />
      <Footer />
    </div>
  );
}
