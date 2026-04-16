import React from "react";

const Introduction = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 md:p-12 text-slate-800 font-sans">
      <h1 className="text-4xl font-bold text-slate-900 mb-6">Introduction</h1>
      
      <div className="space-y-6 text-lg leading-relaxed text-slate-600">
        <p>
          <strong className="text-slate-900">Introducing Messbee Business,</strong> leveraging the WhatsApp Official
          Business API for seamless communication. Messbee Business offers robust
          solutions tailored to elevate your business through WhatsApp.
        </p>
        
        <p>
          Tailored for businesses seeking enhanced customer communication via
          WhatsApp, Messbee Business is a comprehensive application boasting an
          array of features designed to streamline interactions and enhance
          customer service.
        </p>
        
        <p>
          Ideal for small and medium-sized enterprises seeking efficiency without
          hefty investments in customer service software, Messbee Business
          automates tasks and delivers insightful analytics to empower businesses
          with a deeper understanding of customer behavior and WhatsApp
          communication dynamics.
        </p>
      </div>

      <div className="mt-12 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <h4 className="text-xl font-bold text-slate-900 mb-6">
          Messbee Business facilitates streamlined WhatsApp communication with features including:
        </h4>

        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">1</span>
            <p><strong className="text-slate-800">Business Messaging:</strong> Automate messages, quick replies, and warm greetings to engage customers effectively.</p>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">2</span>
            <p><strong className="text-slate-800">Chat Management:</strong> Seamlessly manage WhatsApp chats from a unified interface, ensuring efficient message tracking and prompt responses.</p>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">3</span>
            <p><strong className="text-slate-800">Message Scheduling:</strong> Plan and schedule messages for precise delivery timings, optimizing marketing campaigns and promotions.</p>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">4</span>
            <p><strong className="text-slate-800">WhatsApp Web Access:</strong> Gain desktop or laptop access to WhatsApp accounts, simplifying communication management.</p>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">5</span>
            <p><strong className="text-slate-800">Analytics and Reporting:</strong> Access comprehensive analytics and reports on WhatsApp communication metrics such as message volumes, response rates, and average response times.</p>
          </li>
        </ul>
      </div>

      <div className="mt-10 bg-slate-900 text-white rounded-xl p-6">
        <p className="font-medium text-lg leading-relaxed">
          Key highlights of Messbee Business include advanced business
          messaging, intuitive chat management, strategic message scheduling,
          seamless WhatsApp web access, and insightful analytics. Available on
          Android, Messbee Business can be downloaded for free from the
          respective app store.
        </p>
      </div>

      <p className="mt-8 text-slate-500 italic">
        In conclusion, Messbee Business stands as a sophisticated tool for
        businesses seeking to elevate WhatsApp communication and enhance
        customer service, offering invaluable support to businesses reliant on
        WhatsApp as a primary communication channel.
      </p>
    </div>
  );
};

export default Introduction;