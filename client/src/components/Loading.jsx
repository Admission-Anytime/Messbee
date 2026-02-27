import LodingLogo from "../assets/logo.svg";

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-[#fcfdfd]">
      <div className="flex flex-col items-center max-w-md text-center">
        {/* Logo and Name */}
        <div className="flex items-center gap-2 mb-12">
           <img src={LodingLogo} alt="MessBee" className="h-10 w-10" />
           <span className="text-2xl font-bold text-[#1e293b]">MessBee</span>
        </div>

        {/* Animated Loader Circle */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="h-20 w-20 rounded-full border-4 border-gray-100 border-t-green-500 animate-spin"></div>
          <div className="absolute h-2 w-2 bg-green-500 rounded-full"></div>
        </div>

        {/* Text Content */}
        <h2 className="text-xl font-semibold text-[#1e293b] mb-2">
          Optimizing your workspace...
        </h2>
        <p className="text-gray-500 text-sm px-8">
          Please wait while we sync your API data and secure your messaging environment.
        </p>

        {/* Bottom Status */}
        <div className="mt-20 px-4 py-1.5 bg-white border border-gray-100 rounded-full shadow-sm flex items-center gap-2">
          <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            System Secure & Operational
          </span>
        </div>
      </div>
    </div>
  );
};

export default Loading;