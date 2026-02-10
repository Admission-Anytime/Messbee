// import React, { useState } from 'react';
// import { Eye, Search, X, ChevronDown } from 'lucide-react';

// const TemplateGallery = () => {
//   const [selectedCategory, setSelectedCategory] = useState('All');
//   const [selectedType, setSelectedType] = useState('All');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [previewTemplate, setPreviewTemplate] = useState(null);
//   const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
//   const [showTypeDropdown, setShowTypeDropdown] = useState(false);

//   // Categories
//   const categories = [
//     'All',
//     'Special Occasion',
//     'Festival Season',
//     'Food delivery',
//     'Travel',
//     'Commerce',
//     'Services',
//     'Education',
//     'Others'
//   ];

//   // Types
//   const types = ['All', 'Marketing', 'Utility'];

//   // Comprehensive templates data
//   const templates = [
//     {
//       id: 1,
//       name: 'new_food_menu',
//       category: 'Food delivery',
//       type: 'Marketing',
//       content: "Hey {{1}} We've just rolled out a brand new menu that's bursting with Italian flavors and culinary delights. 🍝 To celebrate this, we are offering an exclusive 10% discount. 💰 Just use code 'NEWMENU10' at checkout, and savor the taste of Italy from the comfort of your home. Offer Valid till 15th Sept.",
//     },
//     {
//       id: 2,
//       name: 'food_order_on_the_way',
//       category: 'Food delivery',
//       type: 'Marketing',
//       content: "Hey {{1}} Your pizza adventure is officially on its way! 🍕🚀 Expect the mouthwatering goodness to arrive at your doorstep by {{2}} Thank you for choosing to order from {{3}}. 🍕 We can't wait to see the joy on your face when your pizza arrives!🍕🍕",
//     },
//     {
//       id: 3,
//       name: 'food_order_delivered',
//       category: 'Food delivery',
//       type: 'Marketing',
//       content: "Hey {{1}} Your order from {{2}} has been successfully delivered to your doorstep. 🏠🍔🍟 We hope you're as hungry as we are excited! 😋 Thank you for choosing {{2}}. _Let the feast begin!_ 🧑‍🍳🍕",
//     },
//     {
//       id: 4,
//       name: 'food_order_confirmed',
//       category: 'Food delivery',
//       type: 'Marketing',
//       content: "Your Food Order is confirmed\nHey {{1}} Thank you for placing an order with {{2}}. Our talented chefs are busy cooking & we can already smell the deliciousness from here! 😋 👨‍🍳 Keep an eye out for your doorbell - your food will be arriving by {{3}} 😋",
//     },
//     {
//       id: 5,
//       name: 'birthday_wishes',
//       category: 'Special Occasion',
//       type: 'Marketing',
//       content: "🎉 Happy Birthday {{1}}! 🎂 Wishing you a day filled with joy, laughter, and all your favorite things. May this year bring you endless happiness and success! 🎈🎁 Enjoy your special day!",
//     },
//     {
//       id: 6,
//       name: 'diwali_greetings',
//       category: 'Festival Season',
//       type: 'Marketing',
//       content: "✨ Happy Diwali {{1}}! ✨ May this festival of lights bring prosperity, happiness, and success to you and your family. 🪔🎆 Wishing you a sparkling and joyous Diwali! 🌟",
//     },
//     {
//       id: 7,
//       name: 'order_confirmation',
//       category: 'Commerce',
//       type: 'Utility',
//       content: "Hi {{1}}, Your order #{{2}} has been confirmed! 📦 We're preparing your items and will notify you once they're shipped. Estimated delivery: {{3}}. Thank you for shopping with us! 🛍️",
//     },
//     {
//       id: 8,
//       name: 'appointment_reminder',
//       category: 'Services',
//       type: 'Utility',
//       content: "Hello {{1}}, This is a reminder about your appointment scheduled for {{2}} at {{3}}. Please arrive 10 minutes early. If you need to reschedule, please let us know. See you soon! 📅",
//     },
//     {
//       id: 9,
//       name: 'flight_booking_confirmation',
//       category: 'Travel',
//       type: 'Utility',
//       content: "✈️ Flight Confirmed! Hi {{1}}, Your flight booking is confirmed. Flight: {{2}}, Date: {{3}}, Time: {{4}}. PNR: {{5}}. Have a great journey! 🌍",
//     },
//     {
//       id: 10,
//       name: 'hotel_reservation',
//       category: 'Travel',
//       type: 'Marketing',
//       content: "🏨 Reservation Confirmed! Dear {{1}}, Your stay at {{2}} is confirmed from {{3}} to {{4}}. Booking ID: {{5}}. We look forward to hosting you! 🛎️",
//     },
//     {
//       id: 11,
//       name: 'course_enrollment',
//       category: 'Education',
//       type: 'Utility',
//       content: "📚 Welcome {{1}}! You're now enrolled in {{2}}. Course starts on {{3}}. Access your materials at {{4}}. Excited to have you learn with us! 🎓",
//     },
//     {
//       id: 12,
//       name: 'payment_received',
//       category: 'Commerce',
//       type: 'Utility',
//       content: "✅ Payment Received! Hi {{1}}, We've received your payment of {{2}} for invoice #{{3}}. Transaction ID: {{4}}. Thank you for your business! 💳",
//     },
//     {
//       id: 13,
//       name: 'new_year_wishes',
//       category: 'Festival Season',
//       type: 'Marketing',
//       content: "🎊 Happy New Year {{1}}! 🎉 May this new year bring you joy, success, and wonderful opportunities. Here's to new beginnings and amazing adventures! 🥂✨ Cheers to 2026!",
//     },
//     {
//       id: 14,
//       name: 'discount_offer',
//       category: 'Commerce',
//       type: 'Marketing',
//       content: "🎁 Special Offer for {{1}}! Get {{2}}% OFF on your next purchase. Use code: {{3}} at checkout. Valid till {{4}}. Shop now and save big! 🛒💰",
//     },
//     {
//       id: 15,
//       name: 'subscription_renewal',
//       category: 'Services',
//       type: 'Utility',
//       content: "Hi {{1}}, Your {{2}} subscription is expiring on {{3}}. Renew now to continue enjoying uninterrupted service. Click here to renew: {{4}} 🔄",
//     },
//   ];

//   // Filter templates
//   const filteredTemplates = templates.filter(template => {
//     const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
//     const matchesType = selectedType === 'All' || template.type === selectedType;
//     const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                         template.content.toLowerCase().includes(searchQuery.toLowerCase());
    
//     return matchesCategory && matchesType && matchesSearch;
//   });

//   const handlePreview = (template) => {
//     setPreviewTemplate(template);
//   };

//   const closePreview = () => {
//     setPreviewTemplate(null);
//   };

//   return (
//     <div className="flex flex-col h-screen bg-white overflow-hidden">
//       {/* Modern Minimalistic Header */}
//       <div className="bg-white border-b border-gray-100">
//         <div className="px-8 py-5">
//           <div className="flex items-center justify-between gap-8">
//             {/* Title */}
//             <h1 className="text-2xl font-light text-gray-900 tracking-tight">Template Gallery</h1>

//             {/* Filters Container */}
//             <div className="flex items-center gap-3">
//               {/* Search */}
//               <div className="relative">
//                 <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
//                 <input
//                   type="text"
//                   placeholder="Search templates..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="w-72 pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
//                 />
//               </div>

//               {/* Category Dropdown */}
//               <div className="relative">
//                 <button
//                   onClick={() => {
//                     setShowCategoryDropdown(!showCategoryDropdown);
//                     setShowTypeDropdown(false);
//                   }}
//                   className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-full text-sm font-medium text-gray-700 transition-all"
//                 >
//                   <span className="text-gray-500">Category:</span>
//                   <span>{selectedCategory}</span>
//                   <ChevronDown 
//                     size={16} 
//                     className={`text-gray-400 transform transition-transform duration-300 ${showCategoryDropdown ? 'rotate-180' : ''}`}
//                   />
//                 </button>

//                 {/* Category Dropdown Menu with smooth animation */}
//                 <div 
//                   className={`absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 transition-all duration-300 ease-out origin-top ${
//                     showCategoryDropdown 
//                       ? 'opacity-100 scale-y-100 translate-y-0' 
//                       : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'
//                   }`}
//                 >
//                   <div className="py-2 max-h-96 overflow-y-auto">
//                     {categories.map((category, index) => (
//                       <button
//                         key={category}
//                         onClick={() => {
//                           setSelectedCategory(category);
//                           setShowCategoryDropdown(false);
//                         }}
//                         className={`w-full text-left px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
//                           selectedCategory === category
//                             ? 'bg-gray-900 text-white'
//                             : 'text-gray-700 hover:bg-gray-50'
//                         }`}
//                         style={{
//                           transitionDelay: showCategoryDropdown ? `${index * 20}ms` : '0ms'
//                         }}
//                       >
//                         {category}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               {/* Type Dropdown */}
//               <div className="relative">
//                 <button
//                   onClick={() => {
//                     setShowTypeDropdown(!showTypeDropdown);
//                     setShowCategoryDropdown(false);
//                   }}
//                   className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-full text-sm font-medium text-gray-700 transition-all"
//                 >
//                   <span className="text-gray-500">Type:</span>
//                   <span>{selectedType}</span>
//                   <ChevronDown 
//                     size={16} 
//                     className={`text-gray-400 transform transition-transform duration-300 ${showTypeDropdown ? 'rotate-180' : ''}`}
//                   />
//                 </button>

//                 {/* Type Dropdown Menu with smooth animation */}
//                 <div 
//                   className={`absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 transition-all duration-300 ease-out origin-top ${
//                     showTypeDropdown 
//                       ? 'opacity-100 scale-y-100 translate-y-0' 
//                       : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'
//                   }`}
//                 >
//                   <div className="py-2">
//                     {types.map((type, index) => (
//                       <button
//                         key={type}
//                         onClick={() => {
//                           setSelectedType(type);
//                           setShowTypeDropdown(false);
//                         }}
//                         className={`w-full text-left px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
//                           selectedType === type
//                             ? 'bg-gray-900 text-white'
//                             : 'text-gray-700 hover:bg-gray-50'
//                         }`}
//                         style={{
//                           transitionDelay: showTypeDropdown ? `${index * 30}ms` : '0ms'
//                         }}
//                       >
//                         {type}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="flex flex-1 overflow-hidden">
//         {/* Main Content - Templates Grid */}
//         <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
//           <div className="max-w-7xl mx-auto">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
//               {filteredTemplates.map((template) => (
//                 <div
//                   key={template.id}
//                   onClick={() => handlePreview(template)}
//                   className="group bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-900 hover:shadow-lg transition-all duration-300 cursor-pointer"
//                 >
//                   {/* Template Header */}
//                   <div className="flex justify-between items-start mb-2">
//                     <h4 className="text-sm font-semibold text-gray-900 group-hover:text-gray-900 transition-colors">
//                       {template.name}
//                     </h4>
//                     <button
//                       className="p-2 text-gray-400 group-hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-all"
//                       title="Preview template"
//                     >
//                       <Eye size={16} />
//                     </button>
//                   </div>

//                   {/* Template Content */}
//                   <div className="mb-4">
//                     <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
//                       {template.content}
//                     </p>
//                   </div>

//                   {/* Template Footer */}
//                   <div className="flex justify-between items-center pt-2 border-t border-gray-100">
//                     <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1.5 rounded-full">
//                       {template.type}
//                     </span>
//                     <button className="text-xs font-semibold text-gray-900 hover:text-gray-700 transition-colors">
//                       Create →
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* No Results */}
//             {filteredTemplates.length === 0 && (
//               <div className="flex flex-col items-center justify-center h-96">
//                 <p className="text-gray-400 text-sm font-medium">No templates found</p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Right Sidebar - Preview Section */}
//         <div className="w-[100px] bg-white border-l border-gray-100 flex flex-col">
//           {previewTemplate ? (
//             <div className="flex-1 flex flex-col">
//               {/* Preview Header */}
//               <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100">
//                 <h3 className="text-lg font-light text-gray-900">Preview</h3>
//                 <button
//                   onClick={closePreview}
//                   className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all"
//                 >
//                   <X size={18} />
//                 </button>
//               </div>

//               {/* Preview Content */}
//               <div className="flex-1 overflow-y-auto px-8 py-6">
//                 {/* Template Name */}
//                 <div className="mb-6">
//                   <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Template Name</p>
//                   <p className="text-sm text-gray-900 font-medium">{previewTemplate.name}</p>
//                 </div>

//                 {/* Template Message */}
//                 <div className="mb-6">
//                   <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Message</p>
//                   <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
//                     <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
//                       {previewTemplate.content}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Template Details */}
//                 <div className="space-y-4">
//                   <div className="flex justify-between items-center">
//                     <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</span>
//                     <span className="text-sm font-medium text-gray-900">{previewTemplate.category}</span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</span>
//                     <span className="text-sm font-medium text-gray-900">{previewTemplate.type}</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Use Template Button */}
//               <div className="px-8 py-6 border-t border-gray-100">
//                 <button className="w-full bg-gray-900 text-white py-3.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition-all shadow-sm">
//                   Use Template
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <div className="flex-1 flex flex-col items-center justify-center text-center px-12">
//               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
//                 <Eye size={24} className="text-gray-300" />
//               </div>
//               <p className="text-gray-400 text-sm font-medium">Select template to see the preview.</p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Click outside overlay to close dropdowns */}
//       {(showCategoryDropdown || showTypeDropdown) && (
//         <div 
//           className="fixed inset-0 z-40" 
//           onClick={() => {
//             setShowCategoryDropdown(false);
//             setShowTypeDropdown(false);
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default TemplateGallery;




import React, { useState, useEffect } from 'react';
import { Eye, Search, X, ChevronDown } from 'lucide-react';

const TemplateGallery = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [previewWidth, setPreviewWidth] = useState(420);
  const [isResizing, setIsResizing] = useState(false);

  // Categories
  const categories = [
    'All',
    'Special Occasion',
    'Festival Season',
    'Food delivery',
    'Travel',
    'Commerce',
    'Services',
    'Education',
    'Others'
  ];

  // Types
  const types = ['All', 'Marketing', 'Utility'];

  // Comprehensive templates data
  const templates = [
    {
      id: 1,
      name: 'new_food_menu',
      category: 'Food delivery',
      type: 'Marketing',
      content: "Hey {{1}} We've just rolled out a brand new menu that's bursting with Italian flavors and culinary delights. 🍝 To celebrate this, we are offering an exclusive 10% discount. 💰 Just use code 'NEWMENU10' at checkout, and savor the taste of Italy from the comfort of your home. Offer Valid till 15th Sept.",
    },
    {
      id: 2,
      name: 'food_order_on_the_way',
      category: 'Food delivery',
      type: 'Marketing',
      content: "Hey {{1}} Your pizza adventure is officially on its way! 🍕🚀 Expect the mouthwatering goodness to arrive at your doorstep by {{2}} Thank you for choosing to order from {{3}}. 🍕 We can't wait to see the joy on your face when your pizza arrives!🍕🍕",
    },
    {
      id: 3,
      name: 'food_order_delivered',
      category: 'Food delivery',
      type: 'Marketing',
      content: "Hey {{1}} Your order from {{2}} has been successfully delivered to your doorstep. 🏠🍔🍟 We hope you're as hungry as we are excited! 😋 Thank you for choosing {{2}}. _Let the feast begin!_ 🧑‍🍳🍕",
    },
    {
      id: 4,
      name: 'food_order_confirmed',
      category: 'Food delivery',
      type: 'Marketing',
      content: "Your Food Order is confirmed\nHey {{1}} Thank you for placing an order with {{2}}. Our talented chefs are busy cooking & we can already smell the deliciousness from here! 😋 👨‍🍳 Keep an eye out for your doorbell - your food will be arriving by {{3}} 😋",
    },
    {
      id: 5,
      name: 'birthday_wishes',
      category: 'Special Occasion',
      type: 'Marketing',
      content: "🎉 Happy Birthday {{1}}! 🎂 Wishing you a day filled with joy, laughter, and all your favorite things. May this year bring you endless happiness and success! 🎈🎁 Enjoy your special day!",
    },
    {
      id: 6,
      name: 'diwali_greetings',
      category: 'Festival Season',
      type: 'Marketing',
      content: "✨ Happy Diwali {{1}}! ✨ May this festival of lights bring prosperity, happiness, and success to you and your family. 🪔🎆 Wishing you a sparkling and joyous Diwali! 🌟",
    },
    {
      id: 7,
      name: 'order_confirmation',
      category: 'Commerce',
      type: 'Utility',
      content: "Hi {{1}}, Your order #{{2}} has been confirmed! 📦 We're preparing your items and will notify you once they're shipped. Estimated delivery: {{3}}. Thank you for shopping with us! 🛍️",
    },
    {
      id: 8,
      name: 'appointment_reminder',
      category: 'Services',
      type: 'Utility',
      content: "Hello {{1}}, This is a reminder about your appointment scheduled for {{2}} at {{3}}. Please arrive 10 minutes early. If you need to reschedule, please let us know. See you soon! 📅",
    },
    {
      id: 9,
      name: 'flight_booking_confirmation',
      category: 'Travel',
      type: 'Utility',
      content: "✈️ Flight Confirmed! Hi {{1}}, Your flight booking is confirmed. Flight: {{2}}, Date: {{3}}, Time: {{4}}. PNR: {{5}}. Have a great journey! 🌍",
    },
    {
      id: 10,
      name: 'hotel_reservation',
      category: 'Travel',
      type: 'Marketing',
      content: "🏨 Reservation Confirmed! Dear {{1}}, Your stay at {{2}} is confirmed from {{3}} to {{4}}. Booking ID: {{5}}. We look forward to hosting you! 🛎️",
    },
    {
      id: 11,
      name: 'course_enrollment',
      category: 'Education',
      type: 'Utility',
      content: "📚 Welcome {{1}}! You're now enrolled in {{2}}. Course starts on {{3}}. Access your materials at {{4}}. Excited to have you learn with us! 🎓",
    },
    {
      id: 12,
      name: 'payment_received',
      category: 'Commerce',
      type: 'Utility',
      content: "✅ Payment Received! Hi {{1}}, We've received your payment of {{2}} for invoice #{{3}}. Transaction ID: {{4}}. Thank you for your business! 💳",
    },
    {
      id: 13,
      name: 'new_year_wishes',
      category: 'Festival Season',
      type: 'Marketing',
      content: "🎊 Happy New Year {{1}}! 🎉 May this new year bring you joy, success, and wonderful opportunities. Here's to new beginnings and amazing adventures! 🥂✨ Cheers to 2026!",
    },
    {
      id: 14,
      name: 'discount_offer',
      category: 'Commerce',
      type: 'Marketing',
      content: "🎁 Special Offer for {{1}}! Get {{2}}% OFF on your next purchase. Use code: {{3}} at checkout. Valid till {{4}}. Shop now and save big! 🛒💰",
    },
    {
      id: 15,
      name: 'subscription_renewal',
      category: 'Services',
      type: 'Utility',
      content: "Hi {{1}}, Your {{2}} subscription is expiring on {{3}}. Renew now to continue enjoying uninterrupted service. Click here to renew: {{4}} 🔄",
    },
  ];

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesType = selectedType === 'All' || template.type === selectedType;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        template.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesType && matchesSearch;
  });

  const handlePreview = (template) => {
    setPreviewTemplate(template);
  };

  const closePreview = () => {
    setPreviewTemplate(null);
  };

  // Handle resizing
  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isResizing) return;
    
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth >= 350 && newWidth <= 600) {
      setPreviewWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Modern Minimalistic Header */}
      <div className="bg-white border-b border-gray-100 flex-shrink-0">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Left Side - Title, Search, and Filters */}
            <h1 className="text-2xl font-light text-gray-900 tracking-tight whitespace-nowrap">Template Gallery</h1>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 pl-9 pr-4 py-2 bg-gray-50 border-0 rounded-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
              />
            </div>

            {/* Category Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowCategoryDropdown(!showCategoryDropdown);
                  setShowTypeDropdown(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-full text-sm font-medium text-gray-700 transition-all whitespace-nowrap"
              >
                <span className="text-gray-500">Category:</span>
                <span className="max-w-[100px] truncate">{selectedCategory}</span>
                <ChevronDown 
                  size={16} 
                  className={`text-gray-400 transform transition-transform duration-300 flex-shrink-0 ${showCategoryDropdown ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Category Dropdown Menu */}
              <div 
                className={`absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 transition-all duration-300 ease-out origin-top ${
                  showCategoryDropdown 
                    ? 'opacity-100 scale-y-100 translate-y-0' 
                    : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'
                }`}
              >
                <div className="py-2 max-h-80 overflow-y-auto">
                  {categories.map((category, index) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setShowCategoryDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm font-medium transition-all duration-200 ${
                        selectedCategory === category
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Type Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowTypeDropdown(!showTypeDropdown);
                  setShowCategoryDropdown(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-full text-sm font-medium text-gray-700 transition-all whitespace-nowrap"
              >
                <span className="text-gray-500">Type:</span>
                <span>{selectedType}</span>
                <ChevronDown 
                  size={16} 
                  className={`text-gray-400 transform transition-transform duration-300 flex-shrink-0 ${showTypeDropdown ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Type Dropdown Menu */}
              <div 
                className={`absolute left-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 transition-all duration-300 ease-out origin-top ${
                  showTypeDropdown 
                    ? 'opacity-100 scale-y-100 translate-y-0' 
                    : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'
                }`}
              >
                <div className="py-2">
                  {types.map((type, index) => (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedType(type);
                        setShowTypeDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm font-medium transition-all duration-200 ${
                        selectedType === type
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Empty Space */}
            <div className="flex-1"></div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content - Templates Grid */}
        <div 
          className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{ 
            background: 'linear-gradient(to bottom, #f9fafb 0%, #f3f4f6 100%)'
          }}
        >
          <div className="p-4 sm:p-6">
            {/* Responsive Grid */}
            <div 
              className="grid gap-4 auto-rows-max"
              style={{
                gridTemplateColumns: previewTemplate 
                  ? 'repeat(auto-fill, minmax(280px, 1fr))' 
                  : 'repeat(auto-fill, minmax(320px, 1fr))'
              }}
            >
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handlePreview(template)}
                  className="group bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-900 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full"
                >
                  {/* Template Header */}
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <h4 className="text-sm font-semibold text-gray-900 group-hover:text-gray-900 transition-colors truncate flex-1">
                      {template.name}
                    </h4>
                    <button
                      className="p-1.5 text-gray-400 group-hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                      title="Preview template"
                    >
                      <Eye size={16} />
                    </button>
                  </div>

                  {/* Template Content */}
                  <div className="mb-3 flex-1">
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-4 break-words">
                      {template.content}
                    </p>
                  </div>

                  {/* Template Footer */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100 gap-2">
                    <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full truncate">
                      {template.type}
                    </span>
                    <button className="text-xs font-semibold text-gray-900 hover:text-gray-700 transition-colors whitespace-nowrap flex-shrink-0">
                      Create →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredTemplates.length === 0 && (
              <div className="flex flex-col items-center justify-center h-96">
                <p className="text-gray-400 text-sm font-medium">No templates found</p>
              </div>
            )}
          </div>
        </div>

        {/* Resizable Divider */}
        {previewTemplate && (
          <div
            onMouseDown={handleMouseDown}
            className="w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors relative group flex-shrink-0"
            style={{ touchAction: 'none' }}
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-12 bg-gray-400 group-hover:bg-blue-500 rounded-full transition-colors"></div>
          </div>
        )}

        {/* Right Sidebar - WhatsApp Style Preview */}
        {previewTemplate && (
          <div 
            className="bg-white flex flex-col overflow-hidden flex-shrink-0"
            style={{ 
              width: `${previewWidth}px`,
              minWidth: '350px',
              maxWidth: '600px'
            }}
          >
            {/* WhatsApp Header */}
            <div className="bg-[#008069] px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold flex-shrink-0">
                  C
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-white font-medium text-sm truncate">Customer</h3>
                  <p className="text-gray-200 text-xs">online</p>
                </div>
              </div>
              <button
                onClick={closePreview}
                className="p-2 text-white hover:bg-[#00695c] rounded-full transition-all flex-shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* WhatsApp Chat Background */}
            <div 
              className="flex-1 overflow-y-auto p-4"
              style={{
                backgroundColor: '#efeae2',
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d9d9d9' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            >
              {/* WhatsApp Message Bubble */}
              <div className="flex justify-start mb-4">
                <div className="max-w-[90%]">
                  <div className="bg-white rounded-lg shadow-sm p-3 relative">
                    {/* Message Triangle */}
                    <div className="absolute left-0 top-0 w-0 h-0 border-t-[10px] border-t-white border-r-[10px] border-r-transparent -ml-2"></div>
                    
                    {/* Template Content */}
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                      {previewTemplate.content}
                    </p>
                    
                    {/* Timestamp */}
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-xs text-gray-500">12:30 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Template Info Footer */}
            <div className="bg-white border-t border-gray-200 p-4 space-y-3 flex-shrink-0">
              {/* Template Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="text-gray-500 font-medium flex-shrink-0">Template Name:</span>
                  <span className="text-gray-900 font-semibold truncate text-right">{previewTemplate.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="text-gray-500 font-medium flex-shrink-0">Category:</span>
                  <span className="text-gray-900 truncate text-right">{previewTemplate.category}</span>
                </div>
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="text-gray-500 font-medium flex-shrink-0">Type:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    previewTemplate.type === 'Marketing' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {previewTemplate.type}
                  </span>
                </div>
              </div>

              {/* Use Template Button */}
              <button className="w-full bg-[#25D366] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#20bd5a] transition-all shadow-sm flex items-center justify-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                </svg>
                <span>Use This Template</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Click outside overlay to close dropdowns */}
      {(showCategoryDropdown || showTypeDropdown) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowCategoryDropdown(false);
            setShowTypeDropdown(false);
          }}
        />
      )}

      {/* Resizing Overlay */}
      {isResizing && (
        <div className="fixed inset-0 z-50 cursor-col-resize" style={{ userSelect: 'none' }} />
      )}
    </div>
  );
};

export default TemplateGallery;

