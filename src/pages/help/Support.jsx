import React from "react";

const Support = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-slate-800">Contact Support</h2>
      <p className="text-slate-600 mb-8">Having trouble? Fill out the form below.</p>
      <form className="max-w-lg space-y-4">
        <input type="text" className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-red-500" placeholder="Subject" />
        <textarea className="w-full p-3 border border-slate-200 rounded-lg h-32 outline-none focus:border-red-500" placeholder="Describe your issue..."></textarea>
        <button className="bg-[#ba2525] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#a01f1f]">Submit Ticket</button>
      </form>
    </div>
  );
};
export default Support;