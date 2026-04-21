// import React from "react";
// import { Routes, Route } from "react-router-dom";

// // Layout & Main Pages
// import HelpLayout from "./help";
// import Introduction from "./introduction";
// import Faq from "./Faq";
// import ApiDocs from "./ApiDocs";
// import Support from "./Support";

// // Support Sub-pages
// import GetStarted from "./support/GetStarted";
// import ApiWebhooks from "./support/ApiWebhooks";
// import BillingPlans from "./support/BillingPlans";
// import CampaignsHelp from "./support/Campaigns";
// import Troubleshooting from "./support/Troubleshooting";
// import WhatsappCompliance from "./support/Whatsapp"; // ✅ Added this missing import!

// const HelpRoutes = () => {
//   return (
//     <Routes>
//       <Route path="/" element={<HelpLayout />}>
//         {/* Default route */}
//         <Route index element={<Introduction />} />
        
//         {/* Top-level tabs */}
//         <Route path="introduction" element={<Introduction />} />
//         <Route path="faq" element={<Faq />} />
//         <Route path="api-docs" element={<ApiDocs />} />
        
//         {/* Support Section and nested articles */}
//         <Route path="support">
//           <Route index element={<Support />} />
//           <Route path="get-started" element={<GetStarted />} />
//           <Route path="api-webhooks" element={<ApiWebhooks />} />
//           <Route path="billing-plans" element={<BillingPlans />} />
//           <Route path="whatsapp-compliance" element={<WhatsappCompliance />} />
//           <Route path="campaigns" element={<CampaignsHelp />} />
//           <Route path="troubleshooting" element={<Troubleshooting />} />
//         </Route>
//       </Route>
//     </Routes>
//   );
// };

// export default HelpRoutes;