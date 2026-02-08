import React from "react";

const Faq = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <details key={i} className="group bg-slate-50 p-4 rounded-xl cursor-pointer border border-transparent hover:border-slate-200 open:bg-white open:shadow-sm">
            <summary className="font-bold text-slate-700 flex justify-between items-center list-none">
              <span>How do I reset my API key?</span>
              <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              You can reset your API key by going to Settings {'>'} Developer API and clicking on the "Regenerate Key" button. Warning: This will invalidate your old key.
            </p>
          </details>
        ))}
      </div>
    </div>
  );
};
export default Faq;