import fs from 'fs';
const file = 'c:/Users/prana/OneDrive/Desktop/Messbee/client/src/pages/PlanPricing/UpgradePlan.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<>₹\{Math\.round\(plan\.price \* 12 \* 0\.65\)\.toLocaleString/g,
  '<>₹<del className="text-slate-300 mr-1">{(plan.price * 12).toLocaleString("en-IN")}</del> ₹{Math.round(plan.price * 12 * 0.65).toLocaleString'
);

content = content.replace(
  /<>₹\{Math\.round\(plan\.price \* 0\.75 \* 3\)\.toLocaleString/g,
  '<>₹<del className="text-slate-300 mr-1">{(plan.price * 3).toLocaleString("en-IN")}</del> ₹{Math.round(plan.price * 0.75 * 3).toLocaleString'
);

fs.writeFileSync(file, content);
console.log("Done");
