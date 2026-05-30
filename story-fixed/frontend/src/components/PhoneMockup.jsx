export default function PhoneMockup({ children, tilt = 0, className = '' }) {
  const rotateStyle = tilt ? { transform: `rotate(${tilt}deg)` } : {};

  return (
    <div
      className={`w-[280px] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_25px_60px_rgba(0,0,0,0.4)] shadow-2xl rounded-[40px] bg-black p-3 ${className}`}
      style={rotateStyle}
    >
      {/* Dynamic Island */}
      <div className="bg-white rounded-[32px] overflow-hidden relative">
        <div className="w-20 h-5 bg-black rounded-full mx-auto mt-2 mb-1" />
        {/* Screen content */}
        <div className="px-3 pb-4">
          {children}
        </div>
      </div>
    </div>
  );
}
