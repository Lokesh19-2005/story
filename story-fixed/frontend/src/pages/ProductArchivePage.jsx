import { useEffect, useRef } from 'react';
import PhoneMockup from '../components/PhoneMockup.jsx';
import HeroArchiveScreen from '../components/PhoneScreens/HeroArchiveScreen.jsx';
import ProductGridScreen from '../components/PhoneScreens/ProductGridScreen.jsx';
import EditorialInfoScreen from '../components/PhoneScreens/EditorialInfoScreen.jsx';
import ProductListingScreen from '../components/PhoneScreens/ProductListingScreen.jsx';
import AccessoriesScreen from '../components/PhoneScreens/AccessoriesScreen.jsx';
import RecommendationScreen from '../components/PhoneScreens/RecommendationScreen.jsx';
import InformationScreen from '../components/PhoneScreens/InformationScreen.jsx';

export default function ProductArchivePage({ setPage, setCategory }) {
  const phonesRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-8');
          }
        });
      },
      { threshold: 0.1 }
    );

    phonesRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const setRef = (idx) => (el) => {
    phonesRef.current[idx] = el;
  };

  const phones = [
    { screen: <HeroArchiveScreen setCategory={setCategory} setPage={setPage} />, pos: 'lg:absolute lg:top-0 lg:left-[5%] lg:rotate-[-3deg]', delay: 'delay-0' },
    { screen: <ProductGridScreen setCategory={setCategory} setPage={setPage} />, pos: 'lg:absolute lg:top-[100px] lg:right-[8%] lg:rotate-[2deg]', delay: 'delay-100' },
    { screen: <EditorialInfoScreen />, pos: 'lg:absolute lg:top-[350px] lg:left-[25%] lg:rotate-[-1deg]', delay: 'delay-200' },
    { screen: <ProductListingScreen />, pos: 'lg:absolute lg:top-[500px] lg:right-[20%] lg:rotate-[3deg]', delay: 'delay-300' },
    { screen: <AccessoriesScreen />, pos: 'lg:absolute lg:top-[750px] lg:left-[10%] lg:rotate-[2deg]', delay: 'delay-500' },
    { screen: <RecommendationScreen />, pos: 'lg:absolute lg:top-[900px] lg:right-[5%] lg:rotate-[-2deg]', delay: 'delay-500' },
    { screen: <InformationScreen />, pos: 'lg:absolute lg:top-[1150px] lg:left-[30%] lg:rotate-[1deg]', delay: 'delay-700' },
  ];

  return (
    <div className="bg-[#0a0a0a] min-h-screen relative overflow-hidden">
      {/* Texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      />

      {/* Hero Title */}
      <div className="pt-24 md:pt-32 pb-16 text-center relative z-10">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase text-white tracking-tighter font-['Inter']">
          PRODUCT ARCHIVE PAGE
        </h1>
      </div>

      {/* Phone Mockups Section */}
      <div className="relative max-w-[1400px] mx-auto px-4 pb-32">
        {/* Desktop layout container */}
        <div className="flex flex-col items-center gap-12 lg:relative lg:min-h-[1600px]">
          {phones.map((phone, idx) => (
            <div
              key={idx}
              ref={setRef(idx)}
              className={`opacity-0 translate-y-8 transition-all duration-700 ease-out ${phone.delay} ${phone.pos}`}
            >
              <PhoneMockup>
                {phone.screen}
              </PhoneMockup>
            </div>
          ))}

          {/* Central star element */}
          <span className="hidden lg:block absolute top-[600px] left-1/2 -translate-x-1/2 text-[200px] text-white opacity-20 font-light leading-none select-none pointer-events-none">
            &#10033;
          </span>
        </div>
      </div>
    </div>
  );
}
