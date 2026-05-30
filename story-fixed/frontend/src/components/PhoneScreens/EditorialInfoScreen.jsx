export default function EditorialInfoScreen() {
  return (
    <div className="text-black">
      {/* Large overlapping text */}
      <div className="relative mb-3">
        <span className="text-xl font-black uppercase tracking-tighter block">PERFECT</span>
        <span className="text-xl font-black uppercase tracking-tighter block -mt-1 ml-4">MATCH</span>
      </div>

      {/* Overlapping images */}
      <div className="relative h-[130px] mb-3">
        <img
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=250&h=300&fit=crop"
          alt="Editorial fashion"
          className="grayscale absolute top-0 left-0 w-[55%] h-[120px] object-cover rounded"
        />
        <img
          src="https://images.unsplash.com/photo-1488161628813-04466f872be2?w=200&h=250&fit=crop"
          alt="Editorial fashion"
          className="grayscale absolute top-3 right-0 w-[50%] h-[110px] object-cover rounded"
        />
      </div>

      {/* Editorial paragraph */}
      <p className="text-[8px] text-gray-600 mb-3 leading-relaxed">
        Our curated collections bring together complementary pieces designed to work in harmony.
      </p>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <p className="text-[9px] font-bold">700+</p>
          <p className="text-[7px] text-gray-500 uppercase tracking-wider">Collection</p>
        </div>
        <div>
          <p className="text-[9px] font-bold">8</p>
          <p className="text-[7px] text-gray-500 uppercase tracking-wider">Category</p>
        </div>
        <div>
          <p className="text-[9px] font-bold">5+</p>
          <p className="text-[7px] text-gray-500 uppercase tracking-wider">Collaboration</p>
        </div>
        <div>
          <p className="text-[9px] font-bold">380</p>
          <p className="text-[7px] text-gray-500 uppercase tracking-wider">Trends</p>
        </div>
      </div>

      {/* Small product images */}
      <div className="flex gap-2">
        <img
          src="https://images.unsplash.com/photo-1581044777550-4cfa60707998?w=100&h=100&fit=crop"
          alt="Product"
          className="grayscale w-1/2 h-[50px] object-cover rounded"
        />
        <img
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
          alt="Product"
          className="grayscale w-1/2 h-[50px] object-cover rounded"
        />
      </div>
    </div>
  );
}
