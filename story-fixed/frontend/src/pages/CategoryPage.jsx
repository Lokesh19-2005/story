import Footer from '../components/Footer.jsx';
export default function CategoryPage({ selectedCategory, setPage, openDetail, quickAdd, isWish, togWish }) {
  return (
    <div className="min-h-screen bg-[#f8f5f0] py-20 px-8">
      <h1 className="font-[Cormorant_Garamond] text-4xl text-center text-[#111]">
        {selectedCategory ? selectedCategory.toUpperCase() : 'CATEGORY'}
      </h1>
      <p className="text-center text-[#777] mt-4 font-[Montserrat] text-sm">Coming soon...</p>
      <Footer setPage={setPage} />
    </div>
  );
}
