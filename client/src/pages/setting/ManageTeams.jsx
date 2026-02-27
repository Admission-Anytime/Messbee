import { useState, useRef, useEffect } from "react";

// ─── Data ──────────────────────────────────────────────────────────────────────
const INITIAL_MEMBERS = [
  { id: 1,  name: "Marcus Chen",    email: "marcus.chen@example.com",  role: "ADMIN",   status: "Active",  dateAdded: "Feb 02, 2024", lastActive: "Just now",    avatar: "https://i.pravatar.cc/40?img=11" },
  { id: 2,  name: "Elena Soprano",  email: "elena.s@example.com",      role: "MANAGER", status: "Active",  dateAdded: "Oct 21, 2023", lastActive: "2 days ago",  avatar: "https://i.pravatar.cc/40?img=5"  },
  { id: 3,  name: "Julian Wyatt",   email: "julian.w@example.com",     role: "AGENT",   status: "Pending", dateAdded: "Mar 10, 2024", lastActive: "Never",       avatar: null },
  { id: 4,  name: "Sarah Jenkins",  email: "sarah.j@example.com",      role: "AGENT",   status: "Active",  dateAdded: "Jan 05, 2024", lastActive: "Yesterday",   avatar: "https://i.pravatar.cc/40?img=9"  },
  { id: 5,  name: "David Lu",       email: "david.lu@example.com",     role: "AGENT",   status: "Offline", dateAdded: "Nov 14, 2023", lastActive: "4 days ago",  avatar: "https://i.pravatar.cc/40?img=12" },
  { id: 6,  name: "James Wilson",   email: "james.wilson@messbee.com", role: "ADMIN",   status: "Active",  dateAdded: "Jan 12, 2024", lastActive: "5 mins ago",  avatar: "https://i.pravatar.cc/40?img=15" },
  { id: 7,  name: "Sarah Chen",     email: "s.chen@messbee.com",       role: "ADMIN",   status: "Active",  dateAdded: "Dec 08, 2023", lastActive: "1 hour ago",  avatar: "https://i.pravatar.cc/40?img=20" },
  { id: 8,  name: "Marcus Kenter",  email: "m.kenter@messbee.com",     role: "ADMIN",   status: "Active",  dateAdded: "Feb 02, 2024", lastActive: "Just now",    avatar: null },
  { id: 9,  name: "Elena Rodriguez",email: "e.rodriguez@messbee.com",  role: "ADMIN",   status: "Active",  dateAdded: "Oct 21, 2023", lastActive: "2 days ago",  avatar: "https://i.pravatar.cc/40?img=25" },
  { id: 10, name: "Tom Harris",     email: "t.harris@example.com",     role: "MANAGER", status: "Active",  dateAdded: "Sep 03, 2023", lastActive: "3 hours ago", avatar: "https://i.pravatar.cc/40?img=30" },
];

const MODULES = [
  { id: "conversations", label: "Conversations", desc: "Chats, templates & history" },
  { id: "contacts",      label: "Contacts",      desc: "User directory & tagging" },
  { id: "campaigns",     label: "Campaigns",     desc: "Broadcasting & scheduling" },
  { id: "settings",      label: "Settings & Billing", desc: "Plans, API & webhooks" },
];
const ACTIONS = ["view", "create", "edit", "delete", "export"];

const TEMPLATES = {
  "Admin":   { conversations:{view:true,create:true,edit:true,delete:true,export:true}, contacts:{view:true,create:true,edit:true,delete:true,export:true}, campaigns:{view:true,create:true,edit:true,delete:true,export:true}, settings:{view:true,create:true,edit:true,delete:true,export:true} },
  "Manager": { conversations:{view:true,create:true,edit:true,delete:false,export:false}, contacts:{view:true,create:true,edit:true,delete:false,export:true}, campaigns:{view:true,create:true,edit:false,delete:false,export:false}, settings:{view:true,create:false,edit:false,delete:false,export:false} },
  "Agent":   { conversations:{view:true,create:true,edit:false,delete:false,export:false}, contacts:{view:true,create:false,edit:false,delete:false,export:false}, campaigns:{view:false,create:false,edit:false,delete:false,export:false}, settings:{view:false,create:false,edit:false,delete:false,export:false} },
};
const BLANK_PERMS = { conversations:{view:false,create:false,edit:false,delete:false,export:false}, contacts:{view:false,create:false,edit:false,delete:false,export:false}, campaigns:{view:false,create:false,edit:false,delete:false,export:false}, settings:{view:false,create:false,edit:false,delete:false,export:false} };

const PERMISSION_CATEGORIES = [
  { id:"conversations", icon:"chat",     label:"CONVERSATIONS & MESSAGING",
    permissions:[{id:"view_conversations",label:"View Conversations",desc:"Allow reading all chat histories and active messages"},{id:"reply_messages",label:"Reply to Messages",desc:"Enable sending responses and initiating chats"},{id:"delete_conversations",label:"Delete Conversations",desc:"Permanent removal of chat threads from the system"},{id:"assign_conversations",label:"Assign Conversations",desc:"Route chats to specific agents or teams"}]},
  { id:"crm",           icon:"contacts", label:"CONTACT MANAGEMENT (CRM)",
    permissions:[{id:"import_contacts",label:"Import Contacts",desc:"Bulk upload of contact databases via CSV/Excel"},{id:"export_data",label:"Export Data",desc:"Downloading customer lists and interaction history"},{id:"edit_contacts",label:"Edit Contacts",desc:"Modify contact details, tags, and custom fields"},{id:"delete_contacts",label:"Delete Contacts",desc:"Permanently remove contacts from the system"}]},
  { id:"campaigns",     icon:"megaphone",label:"CAMPAIGNS & BROADCASTS",
    permissions:[{id:"create_campaigns",label:"Create Campaigns",desc:"Draft and schedule new WhatsApp broadcasts"},{id:"approve_broadcasts",label:"Approve Broadcasts",desc:"Quality check and final send authorization"},{id:"view_analytics",label:"View Analytics",desc:"Access campaign performance and delivery reports"}]},
  { id:"billing",       icon:"billing",  label:"SETTINGS & BILLING",
    permissions:[{id:"manage_billing",label:"Manage Billing",desc:"Update payment methods and subscription plans"},{id:"api_configuration",label:"API Configuration",desc:"Manage webhook endpoints and API keys"},{id:"manage_team",label:"Manage Team",desc:"Invite, edit, and remove team members"},{id:"audit_logs",label:"Security Audit Logs",desc:"View login history and system activity"}]},
];

const DEFAULT_ROLE_PERMISSIONS = {
  Admin:{"view_conversations":true,"reply_messages":true,"delete_conversations":true,"assign_conversations":true,"import_contacts":true,"export_data":true,"edit_contacts":true,"delete_contacts":true,"create_campaigns":true,"approve_broadcasts":true,"view_analytics":true,"manage_billing":true,"api_configuration":true,"manage_team":true,"audit_logs":true},
  Manager:{"view_conversations":true,"reply_messages":true,"delete_conversations":false,"assign_conversations":true,"import_contacts":true,"export_data":true,"edit_contacts":true,"delete_contacts":false,"create_campaigns":true,"approve_broadcasts":true,"view_analytics":true,"manage_billing":false,"api_configuration":false,"manage_team":false,"audit_logs":false},
  "Support Agent":{"view_conversations":true,"reply_messages":true,"delete_conversations":false,"assign_conversations":false,"import_contacts":false,"export_data":false,"edit_contacts":false,"delete_contacts":false,"create_campaigns":false,"approve_broadcasts":false,"view_analytics":false,"manage_billing":false,"api_configuration":false,"manage_team":false,"audit_logs":false},
  "Sales Lead":{"view_conversations":true,"reply_messages":true,"delete_conversations":false,"assign_conversations":true,"import_contacts":true,"export_data":true,"edit_contacts":true,"delete_contacts":false,"create_campaigns":true,"approve_broadcasts":false,"view_analytics":true,"manage_billing":false,"api_configuration":false,"manage_team":false,"audit_logs":false},
};

const ROLES_LIST = [{name:"Admin",desc:"Full system access"},{name:"Manager",desc:"Team and operations control"},{name:"Support Agent",desc:"Customer communication only"},{name:"Sales Lead",desc:"CRM and broadcasts focus"}];
const ROLES_CARDS = [
  {role:"Admin",   members:14,iconBg:"bg-green-50", iconColor:"text-green-500",checkColor:"text-green-500",permissions:["Full API Access","Manage Billing & Subscriptions","User & Role Management","Webhook Configuration","Security Audit Logs"]},
  {role:"Manager", members:8, iconBg:"bg-blue-50",  iconColor:"text-blue-400", checkColor:"text-blue-400", permissions:["Team Performance Analytics","Message Template Creation","Campaign Orchestration","Contact Export & Import","Flow Builder Access"]},
  {role:"Agent",   members:42,iconBg:"bg-gray-100", iconColor:"text-gray-400", checkColor:"text-gray-400", permissions:["Respond to Chats","View Assigned Contacts","Canned Response Usage","Personal Profile Settings","Basic Chat Labels"]},
];
const ROLE_QUICK_TIPS = {
  Admin:"Admins have full visibility and control over all organizational assets. Use \"Revoke Access\" to immediately terminate a user's session and platform entry.",
  Manager:"Managers can oversee campaigns and team activity. They cannot modify billing or system settings.",
  Agent:"Agents handle direct customer communication. Restrict sensitive data access to keep operations secure.",
};
const PAGE_SIZE = 5;
const PAGE_SIZE_ROLE = 4;

// ─── Icons ─────────────────────────────────────────────────────────────────────
function ShieldIcon({className}){return<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>;}
function UsersCogIcon({className}){return<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;}
function HeadsetIcon({className}){return<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 18v-6a9 9 0 0118 0v6"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></svg>;}
function RoleIcon({role,className}){if(role==="Admin")return<ShieldIcon className={className}/>;if(role==="Manager"||role==="Sales Lead")return<UsersCogIcon className={className}/>;return<HeadsetIcon className={className}/>;}
function CategoryIcon({id,className}){
  if(id==="chat")return<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>;
  if(id==="contacts")return<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h2a2 2 0 002-2V4a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h2M9 12h6M9 8h6M9 16h4"/></svg>;
  if(id==="megaphone")return<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>;
  return<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getInitials(name){return name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2);}
function RoleBadge({role}){const map={ADMIN:"bg-green-100 text-green-700 border border-green-200",MANAGER:"bg-blue-100 text-blue-700 border border-blue-200",AGENT:"bg-gray-100 text-gray-600 border border-gray-200"};return<span className={`text-xs font-bold px-2.5 py-1 rounded-lg tracking-wide ${map[role]||map.AGENT}`}>{role}</span>;}
function StatusBadge({status}){const map={Active:"bg-green-100 text-green-700 border border-green-200",Pending:"bg-yellow-100 text-yellow-700 border border-yellow-200",Offline:"bg-gray-100 text-gray-500 border border-gray-200"};return<span className={`text-xs font-bold px-2.5 py-1 rounded-full tracking-wide uppercase ${map[status]||map.Offline}`}>{status}</span>;}
function StatusDot({status}){const map={Active:{dot:"bg-green-500",text:"text-gray-700"},Pending:{dot:"bg-yellow-400",text:"text-gray-700"},Offline:{dot:"bg-gray-300",text:"text-gray-400"}};const s=map[status]||map.Offline;return<span className="flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full inline-block ${s.dot}`}/><span className={`text-sm font-medium ${s.text}`}>{status}</span></span>;}
function Avatar({member,size="md"}){const sz=size==="md"?"w-10 h-10 text-sm":size==="sm"?"w-9 h-9 text-xs":"w-8 h-8 text-xs";if(member.avatar)return<img src={member.avatar} alt={member.name} className={`${sz} rounded-full object-cover flex-shrink-0`}/>;return<div className={`${sz} rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 flex-shrink-0`}>{getInitials(member.name)}</div>;}

// ─── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({checked,onChange,size="md"}){
  const w=size==="sm"?"w-9 h-5":"w-11 h-6";
  const dot=size==="sm"?"w-4 h-4":"w-5 h-5";
  const on=size==="sm"?"translateX(16px)":"translateX(22px)";
  return(
    <button onClick={()=>onChange(!checked)} className={`relative inline-flex items-center ${w} rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${checked?"bg-green-500":"bg-gray-200"}`}>
      <span className={`inline-block ${dot} bg-white rounded-full shadow transition-transform duration-200`} style={{transform:checked?on:"translateX(2px)"}}/>
      {checked&&<svg className="absolute right-1 w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
    </button>
  );
}

// ─── Toast ─────────────────────────────────────────────────────────────────────
function useToast(){
  const [toasts,setToasts]=useState([]);
  const show=(msg)=>{const id=Date.now();setToasts(t=>[...t,{id,msg}]);setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3000);};
  return{toasts,show};
}
function ToastContainer({toasts}){return(<div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">{toasts.map(t=>(<div key={t.id} className="bg-gray-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg flex items-center gap-2" style={{animation:"fadeUp 0.25s ease"}}><svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>{t.msg}</div>))}</div>);}

// ─── PermPreviewTable ──────────────────────────────────────────────────────────
function PermPreviewTable({perms}){
  const shortAction={view:"V",edit:"E",create:"C",delete:"D",export:"X"};
  const shownModules=MODULES.filter(m=>Object.values(perms[m.id]||{}).some(Boolean));
  return(
    <div>
      <div className="grid grid-cols-[1fr_repeat(5,_24px)] gap-x-3 mb-2 px-1">
        <span className="text-xs font-semibold text-gray-500">Module</span>
        {ACTIONS.map(a=><span key={a} className="text-xs font-bold text-gray-400 text-center">{shortAction[a]}</span>)}
      </div>
      {shownModules.length===0&&<p className="text-xs text-gray-400 italic px-1">No permissions selected yet.</p>}
      {shownModules.map(m=>(
        <div key={m.id} className="grid grid-cols-[1fr_repeat(5,_24px)] gap-x-3 py-1.5 px-1 border-b border-gray-100 last:border-0">
          <span className="text-xs font-medium text-gray-700 truncate">{m.label}</span>
          {ACTIONS.map(a=>(
            <div key={a} className="flex items-center justify-center">
              {perms[m.id]?.[a]
                ?<svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                :<svg className="w-4 h-4 text-gray-200" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1.293-5.293a1 1 0 001.414 0L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293a1 1 0 00-1.414 1.414L8.586 10 7.293 11.293a1 1 0 001.414 1.414L10 11.414l-.293.293a1 1 0 000 1.414z" clipRule="evenodd"/></svg>
              }
            </div>
          ))}
        </div>
      ))}
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 px-1">
        {[["V","VIEW"],["C","CREATE"],["E","EDIT"],["D","DELETE"],["X","EXPORT"]].map(([s,l])=>(
          <span key={s} className="text-xs text-gray-400">● {s}: {l}</span>
        ))}
      </div>
    </div>
  );
}

// ─── PermSummaryBar ────────────────────────────────────────────────────────────
function PermSummaryBar({perms}){
  const shortAction={view:"V",edit:"E",create:"C",delete:"D",export:"X"};
  const countFor=(mod)=>ACTIONS.filter(a=>perms[mod]?.[a]).length;
  return(
    <div>
      <div className="space-y-3 mb-5">
        {MODULES.map(m=>{
          const count=countFor(m.id);
          const pct=(count/5)*100;
          return(
            <div key={m.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700">{m.label}</span>
                <span className="text-xs font-bold text-gray-500">{count}/5</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all duration-300" style={{width:`${pct}%`}}/>
              </div>
            </div>
          );
        })}
      </div>
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1.2fr_repeat(5,_20px)] gap-x-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
          <span className="text-xs font-semibold text-gray-500">Module</span>
          {ACTIONS.map(a=><span key={a} className="text-xs font-bold text-gray-400 text-center">{shortAction[a].toUpperCase()}</span>)}
        </div>
        {MODULES.map(m=>(
          <div key={m.id} className="grid grid-cols-[1.2fr_repeat(5,_20px)] gap-x-2 px-3 py-2 border-b border-gray-100 last:border-0">
            <span className="text-xs text-gray-700 truncate">{m.label}</span>
            {ACTIONS.map(a=>(
              <div key={a} className="flex items-center justify-center">
                {perms[m.id]?.[a]
                  ?<svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  :<svg className="w-3.5 h-3.5 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                }
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 px-1">
        {[["V","VIEW"],["C","CREATE"],["E","EDIT"],["D","DELETE"],["X","EXPORT"]].map(([s,l])=>(
          <span key={s} className="text-xs text-gray-400">● {s}:{l}</span>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CREATE CUSTOM ROLE FLOW
// ═══════════════════════════════════════════════════════════════════════════════

function StepRoleBasics({form,setForm,onBack,onNext}){
  const [templateOpen,setTemplateOpen]=useState(false);
  const tRef=useRef(null);
  useEffect(()=>{
    const h=e=>{if(tRef.current&&!tRef.current.contains(e.target))setTemplateOpen(false);};
    document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);
  },[]);

  const applyTemplate=(name)=>{
    setForm(f=>({...f,template:name,perms:JSON.parse(JSON.stringify(TEMPLATES[name]||BLANK_PERMS))}));
    setTemplateOpen(false);
  };
  const canContinue=form.name.trim().length>0;

  return(
    <div className="min-h-screen bg-[#f0f4f0]">
      <div className="flex items-center justify-center pt-8 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
            </div>
            <span className="text-sm font-semibold text-gray-700">Role Basics</span>
          </div>
          <div className="w-16 h-0.5 bg-green-300 rounded"/>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-500">2</span>
            </div>
            <span className="text-sm font-medium text-gray-400">Permission Selection</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Custom Role</h2>
            <p className="text-sm text-gray-500 mb-7">Define role identity and starting permissions template.</p>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-bold text-green-600 tracking-widest mb-5">STEP 1: ROLE BASICS</p>

                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Role Name</label>
                  <input type="text" placeholder="e.g., Support Manager"
                    value={form.name}
                    onChange={e=>setForm(f=>({...f,name:e.target.value}))}
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition"/>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Role Description</label>
                  <textarea rows={4} placeholder="e.g., Team lead for customer queries"
                    value={form.desc}
                    onChange={e=>setForm(f=>({...f,desc:e.target.value}))}
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 resize-none transition placeholder-gray-300"/>
                </div>

                <div className="mb-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Based on Template</label>
                  <div className="relative" ref={tRef}>
                    <button onClick={()=>setTemplateOpen(v=>!v)}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition text-gray-600">
                      <span>{form.template||"Select a template..."}</span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                    </button>
                    {templateOpen&&(
                      <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-lg py-1" style={{animation:"popIn 0.15s ease"}}>
                        {["Admin","Manager","Agent"].map(t=>(
                          <button key={t} onClick={()=>applyTemplate(t)}
                            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition ${form.template===t?"bg-green-50 text-green-700":"text-gray-700 hover:bg-gray-50"}`}>
                            {t}
                          </button>
                        ))}
                        <button onClick={()=>{setForm(f=>({...f,template:"",perms:JSON.parse(JSON.stringify(BLANK_PERMS))}));setTemplateOpen(false);}}
                          className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-400 hover:bg-gray-50 transition border-t border-gray-100 mt-1">
                          No Template (Start blank)
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">Templates pre-fill permissions for quicker setup.</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  <p className="text-xs font-bold text-gray-500 tracking-widest">PERMISSION PREVIEW</p>
                </div>
                <PermPreviewTable perms={form.perms}/>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-8 py-5 border-t border-gray-100 bg-gray-50/50">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
              Back
            </button>
            <div className="flex items-center gap-4">
              <button className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition">Save as Draft</button>
              <button onClick={onNext} disabled={!canContinue}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed">
                Continue to Permissions
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-5 pb-8">
          {[
            {icon:"shield",title:"Granular Access",desc:"Control exactly what each user can see and do within the platform."},
            {icon:"clock",title:"Audit Ready",desc:"Changes to roles are logged for security compliance."},
            {icon:"users",title:"Team Focused",desc:"Easily assign multiple users to a single role."},
          ].map(f=>(
            <div key={f.title} className="bg-white rounded-2xl border border-gray-200 p-5 flex items-start gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                {f.icon==="shield"&&<ShieldIcon className="w-5 h-5 text-green-500"/>}
                {f.icon==="clock"&&<svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
                {f.icon==="users"&&<UsersCogIcon className="w-5 h-5 text-green-500"/>}
              </div>
              <div><p className="text-sm font-bold text-gray-800">{f.title}</p><p className="text-xs text-gray-500 mt-0.5">{f.desc}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepPermissions({form,setForm,onBack,onCreate}){
  const setModulePerm=(mod,action,val)=>{
    setForm(f=>({...f,perms:{...f.perms,[mod]:{...f.perms[mod],[action]:val}}}));
  };
  const toggleAll=(mod)=>{
    const allOn=ACTIONS.every(a=>form.perms[mod]?.[a]);
    const updated={};
    ACTIONS.forEach(a=>{updated[a]=!allOn;});
    setForm(f=>({...f,perms:{...f.perms,[mod]:updated}}));
  };

  return(
    <div className="min-h-screen bg-[#f0f4f0]">
      <div className="flex items-center justify-center pt-8 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
            </div>
            <span className="text-sm font-semibold text-gray-500">Role Basics</span>
          </div>
          <div className="w-16 h-0.5 bg-green-400 rounded"/>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-sm font-bold text-white">2</span>
            </div>
            <span className="text-sm font-bold text-gray-800">Permission Selection</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Permission Selection</h2>
            <p className="text-sm text-gray-500 mb-7">
              Configure granular access levels for the{" "}
              <span className="font-bold text-gray-800">{form.name||"new role"}</span> role.
            </p>

            <div className="flex gap-6">
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-[2fr_repeat(5,_1fr)_0.8fr] gap-x-2 px-4 mb-3">
                  <span className="text-xs font-bold text-gray-400 tracking-widest">MODULE CATEGORY</span>
                  {["VIEW","CREATE","EDIT","DELETE","EXPORT"].map(h=><span key={h} className="text-xs font-bold text-gray-400 tracking-wider text-center">{h}</span>)}
                  <span className="text-xs font-bold text-gray-400 tracking-wider text-center">TOGGLE ALL</span>
                </div>

                <div className="space-y-3">
                  {MODULES.map(mod=>(
                    <div key={mod.id} className="grid grid-cols-[2fr_repeat(5,_1fr)_0.8fr] gap-x-2 items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-100">
                      <div>
                        <p className="text-sm font-bold text-gray-800">{mod.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{mod.desc}</p>
                      </div>
                      {ACTIONS.map(action=>(
                        <div key={action} className="flex justify-center">
                          <Toggle size="sm" checked={!!form.perms[mod.id]?.[action]} onChange={val=>setModulePerm(mod.id,action,val)}/>
                        </div>
                      ))}
                      <div className="flex justify-center">
                        <button onClick={()=>toggleAll(mod.id)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg transition ${ACTIONS.every(a=>form.perms[mod.id]?.[a])?"text-orange-600 hover:text-orange-700":"text-green-600 hover:text-green-700"}`}>
                          {ACTIONS.every(a=>form.perms[mod.id]?.[a])?"NONE":"ALL"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-64 flex-shrink-0">
                <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 sticky top-4">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    <p className="text-xs font-bold text-gray-500 tracking-widest">REAL-TIME PREVIEW</p>
                  </div>
                  <p className="text-xs font-bold text-gray-400 tracking-widest mb-3">ACTIVE PERMISSIONS SUMMARY</p>
                  <PermSummaryBar perms={form.perms}/>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-8 py-5 border-t border-gray-100 bg-gray-50/50">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
              Back to Basics
            </button>
            <div className="flex items-center gap-4">
              <button className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition">Save as Draft</button>
              <button onClick={onCreate}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-xl transition">
                Create Custom Role
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-5 pb-8">
          {[
            {icon:"shield",title:"Granular Access",desc:"Control exactly what each user can see and do within the platform."},
            {icon:"clock",title:"Audit Ready",desc:"All changes to role permissions are logged for security compliance."},
            {icon:"users",title:"Team Focused",desc:"Changes to this role will instantly apply to all assigned team members."},
          ].map(f=>(
            <div key={f.title} className="bg-white rounded-2xl border border-gray-200 p-5 flex items-start gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                {f.icon==="shield"&&<ShieldIcon className="w-5 h-5 text-green-500"/>}
                {f.icon==="clock"&&<svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
                {f.icon==="users"&&<UsersCogIcon className="w-5 h-5 text-green-500"/>}
              </div>
              <div><p className="text-sm font-bold text-gray-800">{f.title}</p><p className="text-xs text-gray-500 mt-0.5">{f.desc}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepSuccess({roleName,onAssign,onGoToRoles}){
  return(
    <div className="min-h-screen bg-[#f0f4f0] flex flex-col" style={{animation:"fadeUp 0.4s ease"}}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="relative mb-8">
          <div className="w-36 h-36 rounded-full bg-white shadow-lg flex items-center justify-center" style={{background:"radial-gradient(circle at 40% 30%, #e8f5e9 0%, #c8e6c9 100%)"}}>
            <div className="w-20 h-20 rounded-2xl bg-gray-900 flex items-center justify-center shadow-xl">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">New Role Created Successfully!</h1>
        <p className="text-base text-gray-500 text-center max-w-sm">Your custom permissions have been saved and the new role is ready for deployment.</p>

        <div className="mt-8 w-full max-w-lg bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <UsersCogIcon className="w-6 h-6 text-green-500"/>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 tracking-widest mb-0.5">ROLE DETAILS</p>
              <p className="text-lg font-bold text-gray-900">{roleName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-gray-400 inline-block"/>
            <span className="text-sm font-semibold text-gray-600">Members Assigned: 0</span>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-8">
          <button onClick={onAssign}
            className="flex items-center gap-2 px-7 py-3 text-sm font-bold text-white bg-green-500 hover:bg-green-600 rounded-xl shadow-sm transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
            Assign Members Now
          </button>
          <button onClick={onGoToRoles}
            className="flex items-center gap-2 px-7 py-3 text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition">
            Go to Roles Overview
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>

        <div className="mt-8 w-full max-w-lg bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">What happens next?</p>
              <p className="text-sm text-gray-500 mt-1">The '{roleName}' role is now active. You can find it in the invitation flow and member edit menus to grant these permissions to your team members.</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="py-5 text-center border-t border-gray-200 bg-white/60">
        <p className="text-xs text-gray-400">© 2024 MessBee Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}

function CreateCustomRoleFlow({onBack,onSuccess}){
  const [step,setStep]=useState(1);
  const [form,setForm]=useState({name:"",desc:"",template:"",perms:JSON.parse(JSON.stringify(BLANK_PERMS))});

  if(step===3){
    return<StepSuccess roleName={form.name} onAssign={()=>onSuccess(form.name,form.desc,form.perms)} onGoToRoles={()=>onSuccess(form.name,form.desc,form.perms)}/>;
  }
  if(step===2){
    return<StepPermissions form={form} setForm={setForm} onBack={()=>setStep(1)} onCreate={()=>setStep(3)}/>;
  }
  return<StepRoleBasics form={form} setForm={setForm} onBack={onBack} onNext={()=>setStep(2)}/>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODALS
// ═══════════════════════════════════════════════════════════════════════════════

function ChangeRoleDropdown({member,onChangeRole,onClose}){
  const ref=useRef(null);
  useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))onClose();};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[onClose]);
  const roles=[{key:"ADMIN",label:"Admin",desc:"Full platform access & settings",icon:<ShieldIcon className="w-4 h-4 text-gray-500"/>},{key:"MANAGER",label:"Manager",desc:"Team oversight & broadcasts",icon:<UsersCogIcon className="w-4 h-4 text-gray-400"/>},{key:"AGENT",label:"Agent",desc:"Chat & Contacts only",icon:<HeadsetIcon className="w-4 h-4 text-gray-400"/>}];
  return(
    <div ref={ref} className="absolute right-10 top-0 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl w-60 py-2 overflow-hidden" style={{animation:"popIn 0.15s ease"}}>
      <p className="text-xs font-bold text-gray-400 tracking-widest px-4 py-2">CHANGE ROLE TO...</p>
      <div className="border-t border-gray-100 mt-1"/>
      {roles.map(r=>(
        <button key={r.key} onClick={()=>{onChangeRole(member.id,r.key);onClose();}} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">{r.icon}</div>
          <div className="flex-1 text-left"><p className="text-sm font-semibold text-gray-800">{r.label}</p><p className="text-xs text-gray-400">{r.desc}</p></div>
          {member.role===r.key&&<svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>}
        </button>
      ))}
    </div>
  );
}

// ─── NEW: Revoke Access Modal ──────────────────────────────────────────────────
function RevokeAccessModal({member, open, onClose, onRevoke, toast}) {
  const [deleteScheduled, setDeleteScheduled] = useState(false);

  // Reset checkbox when modal opens
  useEffect(() => {
    if (open) setDeleteScheduled(false);
  }, [open]);

  if (!open || !member) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        style={{animation:"popIn 0.2s ease"}}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h3 className="text-lg font-bold text-gray-900">Revoke Access</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          {/* Warning block */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 mb-1.5">
                Are you sure you want to revoke access for{" "}
                <span className="text-gray-900">{member.name}</span>?
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">
                This user will be immediately logged out and will no longer have access to the MessBee workspace. This action can be undone by re-inviting them.
              </p>
            </div>
          </div>

          {/* Optional: delete scheduled campaigns */}
          <button
            onClick={() => setDeleteScheduled(v => !v)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition mb-6 text-left ${
              deleteScheduled
                ? "border-red-300 bg-red-50"
                : "border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300"
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              deleteScheduled ? "border-red-500 bg-red-500" : "border-gray-300 bg-white"
            }`}>
              {deleteScheduled && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              )}
            </div>
            <span className="text-sm font-medium text-gray-700">Delete all scheduled campaigns by this user</span>
          </button>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onRevoke(member.id, deleteScheduled);
                onClose();
                toast(`${member.name}'s access has been revoked`);
              }}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
              </svg>
              Revoke Access
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── RoleMembersView (with Revoke Access integrated) ──────────────────────────
function RoleMembersView({roleName,roleMembers,allMembers,onChangeRole,onRemove,onBack,toast}){
  const [search,setSearch]=useState("");
  const [statusFilter,setStatusFilter]=useState("All");
  const [openDropdown,setOpenDropdown]=useState(null);
  const [revokeTarget,setRevokeTarget]=useState(null);
  const [page,setPage]=useState(1);
  const [showStatusMenu,setShowStatusMenu]=useState(false);
  const statusRef=useRef(null);
  useEffect(()=>{const h=e=>{if(statusRef.current&&!statusRef.current.contains(e.target))setShowStatusMenu(false);};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);
  const members=(roleMembers&&roleMembers.length>0?roleMembers:allMembers).filter(m=>{const ms=m.name.toLowerCase().includes(search.toLowerCase())||m.email.toLowerCase().includes(search.toLowerCase());const sf=statusFilter==="All"||m.status===statusFilter;return ms&&sf;});
  const totalPages=Math.max(1,Math.ceil(members.length/PAGE_SIZE_ROLE));
  const paginated=members.slice((page-1)*PAGE_SIZE_ROLE,page*PAGE_SIZE_ROLE);
  const tip=ROLE_QUICK_TIPS[roleName]||ROLE_QUICK_TIPS["Admin"];
  const totalCount=roleMembers?.length||members.length||14;
  const displayRole=roleName.charAt(0).toUpperCase()+roleName.slice(1);

  const handleRevoke=(memberId, deleteScheduled)=>{
    // Remove the member from the list (revoke = remove access)
    if(onRemove) onRemove(memberId);
  };

  return(
    <div style={{animation:"fadeUp 0.25s ease"}}>
      {/* Revoke Access Modal */}
      <RevokeAccessModal
        member={revokeTarget}
        open={!!revokeTarget}
        onClose={()=>setRevokeTarget(null)}
        onRevoke={handleRevoke}
        toast={toast}
      />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg></button>
          <h2 className="text-2xl font-bold text-gray-900">Role: {displayRole}</h2>
          <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">{totalCount}</span>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl shadow-sm transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
          Add {displayRole}
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input type="text" placeholder="Search members..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} className="pl-9 pr-12 py-2.5 text-sm border border-gray-200 rounded-xl bg-white outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition w-80"/>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-300 font-mono bg-gray-100 px-1.5 py-0.5 rounded">⌘K</span>
        </div>
        <div className="relative" ref={statusRef}>
          <button onClick={()=>setShowStatusMenu(v=>!v)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition">
            Status: {statusFilter}
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
          </button>
          {showStatusMenu&&(
            <div className="absolute right-0 top-full mt-1 z-40 bg-white border border-gray-200 rounded-xl shadow-lg w-40 py-1" style={{animation:"popIn 0.15s ease"}}>
              {["All","Active","Pending","Offline"].map(s=>(
                <button key={s} onClick={()=>{setStatusFilter(s);setShowStatusMenu(false);setPage(1);}} className={`w-full text-left px-4 py-2.5 text-sm font-medium transition ${statusFilter===s?"text-green-600 bg-green-50":"text-gray-700 hover:bg-gray-50"}`}>{s}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-visible shadow-sm mb-5">
        {/* Table header */}
        <div className="grid grid-cols-[2.5fr_1.2fr_1.2fr_1fr_1fr] px-6 py-3 border-b border-gray-100 bg-gray-50/60">
          {["MEMBER","DATE ADDED","LAST ACTIVE","STATUS","ACTIONS"].map(h=>(
            <p key={h} className="text-xs font-bold text-gray-400 tracking-wider">{h}</p>
          ))}
        </div>

        {paginated.length===0 ? (
          <div className="py-16 text-center text-gray-400"><p className="font-semibold">No members found</p></div>
        ) : (
          paginated.map((member,idx)=>(
            <div key={member.id} className={`relative grid grid-cols-[2.5fr_1.2fr_1.2fr_1fr_1fr] px-6 py-4 items-center hover:bg-gray-50/40 transition ${idx<paginated.length-1?"border-b border-gray-100":""}`}>
              {/* Member info */}
              <div className="flex items-center gap-3">
                <Avatar member={member} size="sm"/>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{member.name}</p>
                  <p className="text-xs text-gray-400">{member.email}</p>
                </div>
              </div>

              <p className="text-sm text-gray-600">{member.dateAdded||"—"}</p>
              <p className={`text-sm ${member.lastActive==="Never"?"text-gray-400 italic":"text-gray-600"}`}>{member.lastActive}</p>
              <div><StatusBadge status={member.status}/></div>

              {/* Actions */}
              <div className="flex items-center gap-1 relative">
                {/* Change role */}
                <button
                  onClick={()=>setOpenDropdown(openDropdown===member.id?null:member.id)}
                  title="Change Role"
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                </button>

                {/* Revoke Access button */}
                <button
                  title="Revoke Access"
                  onClick={()=>setRevokeTarget(member)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition border border-transparent hover:border-red-100"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                  </svg>
                  Revoke
                </button>

                {openDropdown===member.id&&(
                  <ChangeRoleDropdown
                    member={member}
                    onChangeRole={(id,nr)=>{onChangeRole(id,nr);toast(`${member.name}'s role changed`);}}
                    onClose={()=>setOpenDropdown(null)}
                  />
                )}
              </div>
            </div>
          ))
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-gray-100 bg-gray-50/40">
          <p className="text-sm text-gray-500">Showing {Math.min((page-1)*PAGE_SIZE_ROLE+1,members.length)}–{Math.min(page*PAGE_SIZE_ROLE,members.length)} of {totalCount} members</p>
          <div className="flex items-center gap-1">
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 transition text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page>=totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 transition text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Tip */}
      <div className="bg-green-50 border border-green-100 rounded-2xl px-6 py-5 flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Quick Tip</p>
            <p className="text-sm text-gray-600 mt-0.5 max-w-2xl">{tip}</p>
          </div>
        </div>
        <button className="ml-6 flex-shrink-0 text-sm font-bold text-green-600 hover:text-green-700 transition whitespace-nowrap">View Logs</button>
      </div>
    </div>
  );
}

function EditPermissionsView({initialRole,toast}){
  const [selectedRole,setSelectedRole]=useState(initialRole);
  const [allPerms,setAllPerms]=useState(()=>{const i={};ROLES_LIST.forEach(r=>{i[r.name]={...DEFAULT_ROLE_PERMISSIONS[r.name]};});return i;});
  const [savedPerms,setSavedPerms]=useState(()=>{const i={};ROLES_LIST.forEach(r=>{i[r.name]={...DEFAULT_ROLE_PERMISSIONS[r.name]};});return i;});
  const perms=allPerms[selectedRole]||{};
  const isDirty=JSON.stringify(allPerms[selectedRole])!==JSON.stringify(savedPerms[selectedRole]);
  const setPerms=(updater)=>setAllPerms(prev=>({...prev,[selectedRole]:updater(prev[selectedRole])}));
  const handleSave=()=>{setSavedPerms(prev=>({...prev,[selectedRole]:{...allPerms[selectedRole]}}));toast(`${selectedRole} permissions saved`);};
  const handleDiscard=()=>setAllPerms(prev=>({...prev,[selectedRole]:{...savedPerms[selectedRole]}}));
  return(
    <div className="flex gap-5" style={{animation:"fadeUp 0.25s ease"}}>
      <div className="w-56 flex-shrink-0 flex flex-col gap-2">
        {ROLES_LIST.map(r=>(<button key={r.name} onClick={()=>setSelectedRole(r.name)} className={`w-full text-left px-4 py-3.5 rounded-xl border transition ${selectedRole===r.name?"bg-green-50 border-green-200 shadow-sm":"bg-white border-gray-200 hover:bg-gray-50"}`}><div className="flex items-center justify-between"><div><p className={`text-sm font-semibold ${selectedRole===r.name?"text-gray-900":"text-gray-700"}`}>{r.name}</p><p className="text-xs text-gray-400 mt-0.5">{r.desc}</p></div>{selectedRole===r.name&&<div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 ml-2"><svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg></div>}</div></button>))}
        <button className="w-full text-left px-4 py-3.5 rounded-xl border border-dashed border-gray-300 bg-white hover:bg-gray-50 transition flex items-center gap-2 text-gray-400 hover:text-gray-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg><span className="text-sm font-medium">Create New Role</span></button>
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 mb-4 flex items-center justify-between shadow-sm"><div><h3 className="text-base font-bold text-gray-900">Role Details: {selectedRole}</h3><p className="text-sm text-gray-400 mt-0.5">Configure granular platform access for this role</p></div><div className="flex items-center gap-2"><button onClick={handleDiscard} disabled={!isDirty} className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed">Discard</button><button onClick={handleSave} disabled={!isDirty} className="px-5 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed">Save Changes</button></div></div>
        <div className="space-y-4">
          {PERMISSION_CATEGORIES.map(cat=>(<div key={cat.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"><div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100 bg-gray-50/50"><CategoryIcon id={cat.icon} className="w-5 h-5 text-gray-400"/><p className="text-xs font-bold text-gray-500 tracking-widest">{cat.label}</p></div>{cat.permissions.map((perm,idx)=>(<div key={perm.id} className={`flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition ${idx<cat.permissions.length-1?"border-b border-gray-100":""}`}><div><p className="text-sm font-semibold text-gray-800">{perm.label}</p><p className="text-xs text-gray-400 mt-0.5">{perm.desc}</p></div><div className="ml-6 flex-shrink-0"><Toggle checked={!!perms[perm.id]} onChange={val=>setPerms(p=>({...p,[perm.id]:val}))}/></div></div>))}</div>))}
        </div>
      </div>
    </div>
  );
}

function InviteModal({open,onClose,onInvite,toast}){
  const [form,setForm]=useState({name:"",email:"",role:"Admin",message:""});const[errors,setErrors]=useState({});const[sending,setSending]=useState(false);
  const validate=()=>{const e={};if(!form.name.trim())e.name="Full name is required";if(!form.email.trim())e.email="Work email is required";else if(!/\S+@\S+\.\S+/.test(form.email))e.email="Enter a valid email";return e;};
  const handleSubmit=async()=>{const e=validate();if(Object.keys(e).length){setErrors(e);return;}setSending(true);await new Promise(r=>setTimeout(r,1000));setSending(false);onInvite({name:form.name,email:form.email,role:form.role.toUpperCase()});setForm({name:"",email:"",role:"Admin",message:""});setErrors({});onClose();toast(`Invitation sent to ${form.email}`);};
  const handleClose=()=>{setForm({name:"",email:"",role:"Admin",message:""});setErrors({});onClose();};
  if(!open)return null;
  return(<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm" onClick={handleClose}><div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4" style={{animation:"popIn 0.2s ease"}} onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between px-6 pt-6 pb-4"><h3 className="text-xl font-bold text-gray-900">Invite Team Member</h3><button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition text-lg">×</button></div><div className="px-6 pb-6 space-y-5"><div><label className="block text-sm font-semibold text-gray-800 mb-1.5">Full Name</label><input type="text" placeholder="e.g. John Doe" value={form.name} onChange={e=>{setForm(f=>({...f,name:e.target.value}));setErrors(er=>({...er,name:""}));}} className={`w-full px-4 py-2.5 text-sm border rounded-xl outline-none transition ${errors.name?"border-red-400 focus:ring-2 focus:ring-red-100":"border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100"}`}/>{errors.name&&<p className="text-xs text-red-500 mt-1">{errors.name}</p>}</div><div><label className="block text-sm font-semibold text-gray-800 mb-1.5">Work Email</label><input type="email" placeholder="name@company.com" value={form.email} onChange={e=>{setForm(f=>({...f,email:e.target.value}));setErrors(er=>({...er,email:""}));}} className={`w-full px-4 py-2.5 text-sm border rounded-xl outline-none transition ${errors.email?"border-red-400 focus:ring-2 focus:ring-red-100":"border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100"}`}/>{errors.email&&<p className="text-xs text-red-500 mt-1">{errors.email}</p>}</div><div><label className="block text-sm font-semibold text-gray-800 mb-1.5">Select Role</label><div className="relative"><select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-green-400 appearance-none bg-white transition"><option>Admin</option><option>Manager</option><option>Agent</option></select><svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg></div></div><div><div className="flex items-center justify-between mb-1.5"><label className="text-sm font-semibold text-gray-800">Personal Message</label><span className="text-xs font-semibold text-gray-400 tracking-wider">OPTIONAL</span></div><textarea rows={3} placeholder="Welcome to the team!" value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-green-400 resize-none transition placeholder-gray-300"/></div><div className="flex items-center justify-end gap-3 pt-1"><button onClick={handleClose} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 transition">Cancel</button><button onClick={handleSubmit} disabled={sending} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-xl transition disabled:opacity-60">{sending&&<svg className="w-4 h-4" style={{animation:"spin 0.8s linear infinite"}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>}{sending?"Sending...":"Send Invitation"}</button></div></div></div></div>);
}

function EditMemberModal({member,open,onClose,onSave,toast}){
  const[role,setRole]=useState(member?.role||"AGENT");const[status,setStatus]=useState(member?.status||"Active");
  const handleSave=()=>{onSave(member.id,{role,status});onClose();toast(`${member.name} updated successfully`);};
  if(!open||!member)return null;
  return(<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm" onClick={onClose}><div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6" style={{animation:"popIn 0.2s ease"}} onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between mb-5"><h3 className="text-lg font-bold text-gray-900">Edit Member</h3><button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition text-lg">×</button></div><div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-xl border border-gray-100"><Avatar member={member}/><div><p className="text-sm font-semibold text-gray-800">{member.name}</p><p className="text-xs text-gray-400">{member.email}</p></div></div><div className="space-y-4"><div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Role</label><div className="relative"><select value={role} onChange={e=>setRole(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-green-400 appearance-none bg-white"><option value="ADMIN">Admin</option><option value="MANAGER">Manager</option><option value="AGENT">Agent</option></select><svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg></div></div><div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label><div className="relative"><select value={status} onChange={e=>setStatus(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-green-400 appearance-none bg-white"><option>Active</option><option>Offline</option><option>Pending</option></select><svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg></div></div></div><div className="flex gap-3 mt-6"><button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition">Cancel</button><button onClick={handleSave} className="flex-1 py-2.5 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-xl transition">Save Changes</button></div></div></div>);
}

function RemoveMemberModal({member,open,onClose,onConfirm,toast}){
  if(!open||!member)return null;
  return(<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm" onClick={onClose}><div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6" style={{animation:"popIn 0.2s ease"}} onClick={e=>e.stopPropagation()}><div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4"><svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"/></svg></div><h3 className="text-lg font-bold text-gray-900 text-center mb-1">Remove Member?</h3><p className="text-sm text-gray-500 text-center mb-5">Remove <span className="font-semibold text-gray-700">{member.name}</span> from the team?</p><div className="flex gap-3"><button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition">Cancel</button><button onClick={()=>{onConfirm(member.id);onClose();toast(`${member.name} removed from team`);}} className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition">Remove</button></div></div></div>);
}

function RoleCard({data,onEdit,onView}){
  return(
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col" style={{animation:"fadeUp 0.3s ease"}}>
      <div className="flex items-center gap-3 mb-5"><div className={`w-12 h-12 rounded-2xl ${data.iconBg} flex items-center justify-center flex-shrink-0`}><RoleIcon role={data.role} className={`w-6 h-6 ${data.iconColor}`}/></div><div><h3 className="text-lg font-bold text-gray-900">{data.role}</h3><p className="text-sm text-gray-400">{data.members} members</p></div></div>
      <div className="mb-5"><p className="text-xs font-bold text-gray-400 tracking-widest mb-3">CORE PERMISSIONS</p><ul className="space-y-2">{data.permissions.map(p=>(<li key={p} className="flex items-center gap-2"><svg className={`w-4 h-4 flex-shrink-0 ${data.checkColor}`} fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg><span className="text-sm text-gray-600">{p}</span></li>))}</ul></div>
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
        <button onClick={()=>onEdit(data.role)} className="text-sm font-semibold text-green-600 hover:text-green-700 transition">Edit Permissions</button>
        <button onClick={()=>onView(data.role)} className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-600 transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>View</button>
      </div>
    </div>
  );
}

function CustomRoleCard({data,onDelete,onView}){
  const enabledPerms=[];
  if(data.perms){
    Object.entries(data.perms).forEach(([mod,actions])=>{
      Object.entries(actions).forEach(([action,on])=>{
        if(on) enabledPerms.push(`${action.charAt(0).toUpperCase()+action.slice(1)} ${mod.charAt(0).toUpperCase()+mod.slice(1)}`);
      });
    });
  }
  const preview=enabledPerms.slice(0,5);

  return(
    <div className="bg-white border-2 border-dashed border-purple-200 rounded-2xl p-6 shadow-sm flex flex-col relative" style={{animation:"fadeUp 0.3s ease"}}>
      <div className="absolute top-4 right-4">
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-600 border border-purple-200 tracking-wide">CUSTOM</span>
      </div>

      <div className="flex items-center gap-3 mb-5 pr-16">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">{data.name}</h3>
          <p className="text-sm text-gray-400">{data.members} members · Created {data.createdAt}</p>
        </div>
      </div>

      {data.desc&&<p className="text-xs text-gray-500 mb-4 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 italic">"{data.desc}"</p>}

      <div className="mb-5">
        <p className="text-xs font-bold text-gray-400 tracking-widest mb-3">PERMISSIONS</p>
        {preview.length===0
          ? <p className="text-xs text-gray-400 italic">No permissions assigned</p>
          : <ul className="space-y-2">
              {preview.map(p=>(
                <li key={p} className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0 text-purple-400" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  <span className="text-sm text-gray-600">{p}</span>
                </li>
              ))}
              {enabledPerms.length>5&&<li className="text-xs text-gray-400 pl-6">+{enabledPerms.length-5} more permissions</li>}
            </ul>
        }
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
        <button onClick={onView} className="flex items-center gap-1.5 text-sm font-semibold text-purple-500 hover:text-purple-600 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          View Members
        </button>
        <button onClick={onDelete}
          className="flex items-center gap-1 text-sm font-semibold text-red-400 hover:text-red-600 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          Delete
        </button>
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function ManageTeams(){
  const [activeTab,setActiveTab]=useState("Members");
  const [members,setMembers]=useState(INITIAL_MEMBERS);
  const [search,setSearch]=useState("");
  const [page,setPage]=useState(1);
  const [showInvite,setShowInvite]=useState(false);
  const [editTarget,setEditTarget]=useState(null);
  const [removeTarget,setRemoveTarget]=useState(null);
  const [rolesView,setRolesView]=useState(null);
  const [customRoles,setCustomRoles]=useState([]);
  const {toasts,show:showToast}=useToast();
  const CARD_TO_PERM={Admin:"Admin",Manager:"Manager",Agent:"Support Agent"};
  const filtered=members.filter(m=>m.name.toLowerCase().includes(search.toLowerCase())||m.email.toLowerCase().includes(search.toLowerCase()));
  const totalPages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
  const paginated=filtered.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE);
  const admins=members.filter(m=>m.role==="ADMIN"&&m.status==="Active").length;
  const managers=members.filter(m=>m.role==="MANAGER"&&m.status==="Active").length;
  const agents=members.filter(m=>m.role==="AGENT").length;
  const handleChangeRole=(id,nr)=>setMembers(prev=>prev.map(m=>m.id===id?{...m,role:nr}:m));
  const handleRemoveMember=(id)=>setMembers(prev=>prev.filter(m=>m.id!==id));
  const getRoleMembers=(role)=>{const rm={Admin:"ADMIN",Manager:"MANAGER",Agent:"AGENT"};return members.filter(m=>m.role===(rm[role]||role.toUpperCase()));};
  const isViewMode=rolesView?.startsWith("view:");
  const isEditView=rolesView?.startsWith("edit:");
  const isCreateView=rolesView==="create";
  const viewRoleName=rolesView?.split(":")?.[1]||"";

  if(isCreateView){
    return(
      <>
        <style>{`@keyframes popIn{from{transform:scale(0.94);opacity:0}to{transform:scale(1);opacity:1}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeUp{from{transform:translateY(8px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
        <ToastContainer toasts={toasts}/>
        <CreateCustomRoleFlow
          onBack={()=>setRolesView(null)}
          onSuccess={(name,desc,perms)=>{
            setCustomRoles(prev=>[...prev,{name,desc,perms,members:0,createdAt:new Date().toLocaleDateString("en-US",{month:"short",day:"2-digit",year:"numeric"})}]);
            showToast(`Role "${name}" created successfully!`);
            setRolesView(null);
            setActiveTab("Roles & Permissions");
          }}
        />
      </>
    );
  }

  return(
    <>
      <style>{`@keyframes popIn{from{transform:scale(0.94);opacity:0}to{transform:scale(1);opacity:1}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeUp{from{transform:translateY(8px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
      <ToastContainer toasts={toasts}/>
      <InviteModal open={showInvite} onClose={()=>setShowInvite(false)} onInvite={d=>setMembers(p=>[...p,{id:Date.now(),...d,status:"Pending",lastActive:"Never",dateAdded:"Just now",avatar:null}])} toast={showToast}/>
      <EditMemberModal member={editTarget} open={!!editTarget} onClose={()=>setEditTarget(null)} onSave={(id,u)=>setMembers(p=>p.map(m=>m.id===id?{...m,...u}:m))} toast={showToast}/>
      <RemoveMemberModal member={removeTarget} open={!!removeTarget} onClose={()=>setRemoveTarget(null)} onConfirm={id=>setMembers(p=>p.filter(m=>m.id!==id))} toast={showToast}/>

      <div className="min-h-screen bg-[#f8fafc] p-6">
        {!isViewMode&&(
          <div className="flex items-start justify-between mb-6">
            <div><h1 className="text-2xl font-bold text-gray-900">Team Management</h1><p className="text-sm text-gray-400 mt-0.5">Manage user access and organizational permissions</p></div>
            {activeTab==="Members"?(
              <button onClick={()=>setShowInvite(true)} className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl shadow-sm transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>Invite Member</button>
            ):isEditView?(
              <button onClick={()=>setRolesView(null)} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl shadow-sm transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>Back to Roles</button>
            ):(
              <button onClick={()=>setRolesView("create")} className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl shadow-sm transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
                Create Custom Role
              </button>
            )}
          </div>
        )}

        {!isViewMode&&(
          <div className="flex gap-6 border-b border-gray-200 mb-6">
            {["Members","Roles & Permissions"].map(tab=>(
              <button key={tab} onClick={()=>{setActiveTab(tab);setRolesView(null);}} className={`pb-3 text-sm font-semibold transition-all relative whitespace-nowrap ${activeTab===tab?"text-green-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-green-500 after:rounded-t":"text-gray-400 hover:text-gray-600"}`}>{tab}</button>
            ))}
          </div>
        )}

        {activeTab==="Members"?(
          <>
            <div className="mb-4"><div className="relative inline-block"><svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg><input type="text" placeholder="Search by name or email..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} className="pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition w-72"/></div></div>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6 shadow-sm" style={{animation:"fadeUp 0.3s ease"}}>
              <div className="grid grid-cols-[2fr_1fr_1fr_1.2fr_1.2fr] px-6 py-3 border-b border-gray-100 bg-gray-50/60">{["NAME","ROLE","STATUS","LAST ACTIVE","ACTIONS"].map(h=><p key={h} className="text-xs font-bold text-gray-400 tracking-wider">{h}</p>)}</div>
              {paginated.length===0?(<div className="py-16 text-center text-gray-400"><p className="font-semibold">No members found</p></div>):(paginated.map((member,idx)=>(<div key={member.id} className={`grid grid-cols-[2fr_1fr_1fr_1.2fr_1.2fr] px-6 py-4 items-center hover:bg-gray-50/50 transition ${idx<paginated.length-1?"border-b border-gray-100":""}`}><div className="flex items-center gap-3"><Avatar member={member}/><div><p className="text-sm font-semibold text-gray-800">{member.name}</p><p className="text-xs text-gray-400">{member.email}</p></div></div><div><RoleBadge role={member.role}/></div><div><StatusDot status={member.status}/></div><p className={`text-sm ${member.lastActive==="Never"?"text-gray-400 italic":"text-gray-600"}`}>{member.lastActive}</p><div className="flex items-center gap-2">{member.status==="Pending"?(<><button onClick={()=>showToast(`Invitation resent to ${member.email}`)} className="text-sm font-semibold text-green-600 hover:text-green-700 transition">Resend Invite</button><button onClick={()=>setRemoveTarget(member)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button></>):(<><button onClick={()=>setEditTarget(member)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button><button onClick={()=>setRemoveTarget(member)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"/></svg></button></>)}</div></div>)))}
              <div className="flex items-center justify-between px-6 py-3.5 border-t border-gray-100 bg-gray-50/40"><p className="text-sm text-gray-500">Showing {paginated.length} of {filtered.length} members</p><div className="flex items-center gap-1"><button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition">Previous</button>{Array.from({length:Math.max(totalPages,3)},(_,i)=>i+1).map(p=>(<button key={p} onClick={()=>setPage(p)} className={`w-8 h-8 text-xs font-semibold rounded-lg transition ${page===p?"bg-green-500 text-white":"text-gray-600 border border-gray-200 hover:bg-gray-100"}`}>{p}</button>))}<button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page>=totalPages} className="px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition">Next</button></div></div>
            </div>
            <div className="grid grid-cols-3 gap-4">{[{label:"ADMINS",count:admins,sub:"Total active",icon:"🛡️",color:"text-green-600 bg-green-50"},{label:"MANAGERS",count:managers,sub:"Total active",icon:"👥",color:"text-blue-600 bg-blue-50"},{label:"AGENTS",count:agents,sub:"Across 3 teams",icon:"🎧",color:"text-purple-600 bg-purple-50"}].map(({label,count,sub,icon,color})=>(<div key={label} className="bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm flex items-center justify-between"><div><p className="text-xs font-bold text-gray-400 tracking-widest mb-1">{label}</p><div className="flex items-baseline gap-2"><span className="text-3xl font-black text-gray-900">{count}</span><span className="text-sm text-gray-400">{sub}</span></div></div><div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${color}`}>{icon}</div></div>))}</div>
          </>
        ):isViewMode?(
          <RoleMembersView
            roleName={viewRoleName}
            roleMembers={getRoleMembers(viewRoleName)}
            allMembers={members}
            onChangeRole={handleChangeRole}
            onRemove={handleRemoveMember}
            onBack={()=>setRolesView(null)}
            toast={showToast}
          />
        ):isEditView?(
          <EditPermissionsView initialRole={viewRoleName} toast={showToast}/>
        ):(
          <div>
            <div className="grid grid-cols-3 gap-5 mb-5">
              {ROLES_CARDS.map(r=>(<RoleCard key={r.role} data={r} onEdit={role=>setRolesView(`edit:${CARD_TO_PERM[role]||role}`)} onView={role=>setRolesView(`view:${role}`)}/>))}
              {customRoles.map(r=>(
                <CustomRoleCard key={r.name} data={r}
                  onDelete={()=>setCustomRoles(prev=>prev.filter(x=>x.name!==r.name))}
                  onView={()=>setRolesView(`view:${r.name}`)}
                />
              ))}
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl px-6 py-5 shadow-sm flex items-center justify-between"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0"><svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg></div><div><p className="text-sm font-bold text-gray-900">Custom Role Capability</p><p className="text-sm text-gray-500 mt-0.5">Need more specific access control? Enterprise plans can create up to 25 unique custom roles with granular permission toggles.</p></div></div><button className="ml-6 flex-shrink-0 px-4 py-2 text-sm font-bold text-green-600 hover:text-green-700 transition whitespace-nowrap">Upgrade Plan</button></div>
          </div>
        )}
      </div>
    </>
  );
}

