import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import AudioBooks from '../components/AudioBooks';
import FAQ from '../components/FAQ';
import Download from '../components/Download';
import Footer from '../components/Footer';

function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Features />
      {/* <AudioBooks /> */}
      <FAQ />
      <Download />
      <Footer />
    </div>
  );
}

export default Home;