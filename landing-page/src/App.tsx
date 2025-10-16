import HeroSection from './components/HeroSection';
import PlaygroundSection from './components/PlaygroundSection';
import FeaturesSection from './components/FeaturesSection';
import DevDocsSection from './components/DevDocsSection';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <div className="App">
      <HeroSection />
      <PlaygroundSection />
      <FeaturesSection />
      <DevDocsSection />
      <Footer />
    </div>
  );
}

export default App;