export default function InformationScreen() {
  return (
    <div className="text-black">
      {/* Small product cards */}
      <div className="flex gap-2 mb-3">
        <img
          src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=120&h=120&fit=crop"
          alt="Product"
          className="grayscale w-1/2 h-[60px] object-cover rounded"
        />
        <img
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=120&h=120&fit=crop"
          alt="Product"
          className="grayscale w-1/2 h-[60px] object-cover rounded"
        />
      </div>

      {/* Large text */}
      <h2 className="text-lg font-black uppercase tracking-tight text-center mb-4">
        BEYOND BOUNDARIES
      </h2>

      {/* Footer sections */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-[7px] uppercase tracking-wider font-bold mb-1">Information</p>
          <p className="text-[7px] uppercase tracking-wider text-gray-500">Email</p>
          <p className="text-[7px] uppercase tracking-wider text-gray-500">Store</p>
          <p className="text-[7px] uppercase tracking-wider text-gray-500">FAQ</p>
        </div>
        <div>
          <p className="text-[7px] uppercase tracking-wider font-bold mb-1">Contact Us</p>
          <p className="text-[7px] uppercase tracking-wider text-gray-500">Instagram</p>
          <p className="text-[7px] uppercase tracking-wider text-gray-500">Pinterest</p>
        </div>
        <div>
          <p className="text-[7px] uppercase tracking-wider font-bold mb-1">Shipping</p>
        </div>
        <div>
          <p className="text-[7px] uppercase tracking-wider font-bold mb-1">Social Media</p>
        </div>
      </div>

      {/* Micro footer */}
      <p className="text-[6px] text-gray-400 text-center border-t border-gray-100 pt-2">
        STORY | RETURNS | EMAIL
      </p>
    </div>
  );
}
