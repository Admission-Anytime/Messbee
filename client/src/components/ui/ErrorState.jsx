import { useNavigate } from 'react-router-dom';

const ErrorState = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-white p-6">
      <div className="max-w-md w-full text-center">
        {/* Error Icon (Cloud with Slash) */}
        <div className="mb-6 flex justify-center">
          <div className="h-40 w-40 bg-[#f0f9f4] rounded-full flex items-center justify-center relative">
             {/* Cloud Icon SVG */}
             <svg className="w-20 h-20 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z m11-4l-4 4m0-4l4 4" />
             </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[#1e293b] mb-3">Oops! Something went wrong</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          We were unable to load your data. This might be due to a temporary connection issue. 
          Please try again or contact support if the problem persists.
        </p>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-4">
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-[#10b981] hover:bg-[#0da371] text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Try Again
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-all shadow-sm"
          >
            Go to Dashboard
          </button>
        </div>

        {/* Details Toggle */}
        <button className="mt-12 text-gray-400 text-sm flex items-center gap-1 mx-auto">
          Show error details <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
        </button>
      </div>
    </div>
  );
};

export default ErrorState;