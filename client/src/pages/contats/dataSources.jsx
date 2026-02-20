// ─── Data ────────────────────────────────────────────────────────────────────
export const ALL_CONTACTS = [
  { id:1,  initials:"AT", color:"#4CAF50", name:"Akshay Tomar",       whatsapp:"+919318489945", status:"ACTIVE",   labels:["Enterprise","+2"],       email:"akshay.t@ent...",  institute:"IIT Delhi",        address:"New Delhi, India",  phone:"+91 98765 43210", company:"EnterpriseCo",   city:"New Delhi",  country:"India" },
  { id:2,  initials:"PR", color:"#FF9800", name:"Priyanshu Raguvnsi", whatsapp:"+919310309967", status:"WARM",     labels:["New Lead"],               email:"p.raghu@gma...",   institute:"Delhi University", address:"Gurgaon, India",    phone:"+91 97654 32109", company:"StartupX",       city:"Gurgaon",    country:"India" },
  { id:3,  initials:"MS", color:"#607D8B", name:"Manjeet Singh",      whatsapp:"+918512832018", status:"INACTIVE", labels:[],                         email:"manjeet.s@co...",  institute:"BITS Pilani",      address:"Pune, India",       phone:"+91 85128 32018", company:"CorpSolutions",  city:"Pune",       country:"India" },
  { id:4,  initials:"DM", color:"#5C6BC0", name:"Dhiraj Mishra",      whatsapp:"+919741185662", status:"COLD",     labels:["Follow-up"],              email:"dhiraj.m@outl...", institute:"NIT Trichy",       address:"Bangalore, India",  phone:"+91 97411 85662", company:"OutlookTech",    city:"Bangalore",  country:"India" },
  { id:5,  initials:"RK", color:"#E91E63", name:"Rohit Kumar",        whatsapp:"+919876543210", status:"ACTIVE",   labels:["Enterprise"],             email:"rohit.k@corp...",  institute:"IIM Ahmedabad",    address:"Mumbai, India",     phone:"+91 98765 43211", company:"TechCorp",       city:"Mumbai",     country:"India" },
  { id:6,  initials:"SA", color:"#009688", name:"Sneha Arora",        whatsapp:"+919765432109", status:"WARM",     labels:["New Lead","Follow-up"],   email:"sneha.a@gmai...",  institute:"Delhi University", address:"Delhi, India",      phone:"+91 97654 32108", company:"DesignStudio",   city:"Delhi",      country:"India" },
  { id:7,  initials:"VG", color:"#795548", name:"Vijay Gupta",        whatsapp:"+918765432109", status:"COLD",     labels:[],                         email:"vijay.g@out...",   institute:"IIT Bombay",       address:"Hyderabad, India",  phone:"+91 87654 32109", company:"HydroTech",      city:"Hyderabad",  country:"India" },
  { id:8,  initials:"NP", color:"#3F51B5", name:"Neha Patel",         whatsapp:"+917654321098", status:"ACTIVE",   labels:["Enterprise","+2"],        email:"neha.p@ent...",    institute:"NIT Surat",        address:"Surat, India",      phone:"+91 76543 21098", company:"GujaratFinance", city:"Surat",      country:"India" },
  { id:9,  initials:"AK", color:"#FF5722", name:"Arjun Kapoor",       whatsapp:"+916543210987", status:"INACTIVE", labels:["Follow-up"],              email:"arjun.k@gma...",   institute:"XLRI Jamshedpur",  address:"Chennai, India",    phone:"+91 65432 10987", company:"SouthTech",      city:"Chennai",    country:"India" },
  { id:10, initials:"PS", color:"#9C27B0", name:"Pooja Sharma",       whatsapp:"+915432109876", status:"WARM",     labels:["New Lead"],               email:"pooja.s@out...",   institute:"IIT Madras",       address:"Coimbatore, India", phone:"+91 54321 09876", company:"TamilTech",      city:"Coimbatore", country:"India" },
  { id:11, initials:"RV", color:"#00BCD4", name:"Rahul Verma",        whatsapp:"+914321098765", status:"ACTIVE",   labels:[],                         email:"rahul.v@corp...",  institute:"IIM Bangalore",    address:"Bangalore, India",  phone:"+91 43210 98765", company:"BangaloreSoft",  city:"Bangalore",  country:"India" },
  { id:12, initials:"MJ", color:"#8BC34A", name:"Meera Joshi",        whatsapp:"+913210987654", status:"COLD",     labels:["Follow-up"],              email:"meera.j@gma...",   institute:"XLRI Jamshedpur",  address:"Jaipur, India",     phone:"+91 32109 87654", company:"RajasthanCo",    city:"Jaipur",     country:"India" },
  { id:13, initials:"KS", color:"#FFC107", name:"Karan Singh",        whatsapp:"+912109876543", status:"WARM",     labels:["New Lead","Enterprise"],  email:"karan.s@ent...",   institute:"IIT Kanpur",       address:"Lucknow, India",    phone:"+91 21098 76543", company:"UPEnterprises",  city:"Lucknow",    country:"India" },
  { id:14, initials:"DK", color:"#F44336", name:"Divya Khanna",       whatsapp:"+911098765432", status:"INACTIVE", labels:[],                         email:"divya.k@out...",   institute:"MICA Ahmedabad",   address:"Ahmedabad, India",  phone:"+91 10987 65432", company:"MediaGroup",     city:"Ahmedabad",  country:"India" },
  { id:15, initials:"SB", color:"#607D8B", name:"Suresh Babu",        whatsapp:"+910987654321", status:"ACTIVE",   labels:["Enterprise"],             email:"suresh.b@cor...",  institute:"IIT Hyderabad",    address:"Vizag, India",      phone:"+91 09876 54321", company:"AndhraTech",     city:"Vizag",      country:"India" },
];



export const ALL_COLUMNS = [
  { key:"name",      label:"Name",      locked:true  },
  { key:"whatsapp",  label:"WhatsApp",  locked:false },
  { key:"status",    label:"Status",    locked:false },
  { key:"labels",    label:"Labels",    locked:false },
  { key:"email",     label:"Email",     locked:false },
  { key:"institute", label:"Institute", locked:false },
  { key:"address",   label:"Address",   locked:false },
  { key:"phone",     label:"Phone",     locked:false },
  { key:"company",   label:"Company",   locked:false },
  { key:"city",      label:"City",      locked:false },
  { key:"country",   label:"Country",   locked:false },
];

export const DEFAULT_VISIBLE = ["name","whatsapp","status","labels","email"];
export const ROWS_OPTIONS     = [5, 10, 25, 50];
export const ALL_STATUSES     = ["ACTIVE","WARM","INACTIVE","COLD"];
export const ALL_LABELS       = ["Enterprise","New Lead","Follow-up"];
export const ALL_CITIES       = [...new Set(ALL_CONTACTS.map(c => c.city))];

export const STATUS_CLS = {
  ACTIVE:   "bg-green-50  text-green-800  border border-green-200",
  WARM:     "bg-yellow-50 text-yellow-700 border border-yellow-200",
  INACTIVE: "bg-gray-100  text-gray-500   border border-gray-200",
  COLD:     "bg-blue-50   text-blue-800   border border-blue-200",
};

export const STATUS_BTN_SEL = {
  ACTIVE:   "bg-green-50  text-green-800  border-green-300",
  WARM:     "bg-yellow-50 text-yellow-700 border-yellow-300",
  INACTIVE: "bg-gray-100  text-gray-500   border-gray-300",
  COLD:     "bg-blue-50   text-blue-800   border-blue-300",
};

export const LABEL_CLS = {
  "Enterprise": "bg-purple-50 text-purple-700",
  "New Lead":   "bg-pink-50   text-pink-700",
  "Follow-up":  "bg-green-50  text-green-700",
  "+2":         "bg-violet-50 text-violet-700",
};


