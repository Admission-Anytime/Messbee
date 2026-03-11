import { Link } from "react-router-dom";

// ─── SVG Icon Components ────────────────────────────────────
const ChatIcon = ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
);

const UsersIcon = () => (
    <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
);

const MegaphoneIcon = () => (
    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.167H3.38a1.588 1.588 0 01-1.58-1.78l.601-5.118a1.588 1.588 0 011.58-1.372h1.613l2.147-6.167A1.76 1.76 0 0111 5.882z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
);

const BoltIcon = () => (
    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
);

const ChartIcon = () => (
    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
);

const ShieldIcon = () => (
    <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
);

const TwitterIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
    </svg>
);

const LinkedInIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
);

const MetaPartnerIcon = () => (
    <svg className="w-6 h-6 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 15h-2v-6h2v6zm-1-7a1 1 0 110-2 1 1 0 010 2zm5 7h-2v-3.5c0-1.5-2-1.4-2 0V17H9v-6h2v1c.8-1.2 4-1.3 4 1.1V17z" />
    </svg>
);

const BoltIconSmall = () => (
    <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
);

// ─── Dashboard Mockup Images (from HTML) ────────────────────
const IMAGES = {
    dashboard: "https://lh3.googleusercontent.com/aida-public/AB6AXuBkblPMdQeAndpMSXz7KQZRlMYlRq7hFYjn1R1zpqr5ENwktjBUWcN_haRJse_PtwSsKyA1he8FnEm_7BkITo3V0pNR-UwJbFbrNy8_nx1Xtkr6MKqh1pXHxtPGBrRWuUcTMyyoHQ2fjNfaXpdBkjKpYRhM5-Iwzb0DB1NeWtbaqOVRWi33zJpSSPFaRdfUHsmxL-Hfd0OxJDIRb5tiXule7mCkuTJILX7is7KYWhazq0ti8duAQg37NnG6Mz3YgMrlmejnuTWipdSP",
    partners: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA0XHPSRgwsOyjf2JeDwiIIRQo7t1c-KHyP3hyqWDZZX8eKDCMue_NH4kZNxDMQCJNxN45xcAbdPVfOtF6I3ne4xxhaVCdwVvwlv044QCERdH7UX_xfvgCzxfkDmLbSDEBwOd1zXEHNoVY0fHQbQPvKytYz80nrw-Ut2_5m15TkJF1Bv2OJJgNnInafy0ZA6VdLPOZm3pp6o-jwt8ao37VEDEHLoxFEVHkMP7Zvrk6xCflpU7aeMeZBTj_8Ve6PXnSuap_F7JUzzn3t",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuADzwW0Cv-ZFQHAyNcSAm5EEeW2xRd-Hkwd9H8deNnaSJlQA3dzyoW4sXHjrQnneku0amP0-nfsYfmtQsewarll4YxmfDnK_rK55PHyAvPoogih6hG1BKuqnCK-LuWPnWMnAB4r3Q5K-_oe-73PfN6y6ZrLXqy0TrOofLRXg4hlZLKzRCI54KAMUV1sT92Lkry0wc5TUUr1xFjYaRR3S0niSdPPwwGQe3I3EmohvwLOuxE_QQHH4jvNcCjzcOW8jpWBH7eQ9vQWWJLh",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCQqgFyaI6t7vdKFhxSgwK7afI_g2O9Ks72BAPFj9fWR4TiVPVZnbwyF600Io8s9JaZhbe5Z9p6RNZCxXcVvDQPDKdMBRDp1a0QJ5i_x7__kBDScDZuJWiB-lBTbohiD_qq4Uh4mcr3ki2M2WPCr9BUKD6vRgakMBcEcuej2ywRnuhc74BufLBdOnk38NFtykVGRk-QwLYjswPreprwsW-74h4dlF26YfTBcNYWdmpQbbhoWJjhmkhfDPDjpujTooKaZkjdlF0bX9u-",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD_Rb_wFwevdM7b2v7_p433QTx-it_YVCUxVPgqYhORInc00eG7Qa7nT64ERL-f0wHA2eopyAghgTTPaKA2A5e4np7TfVhs_P44KgVhYyKAREOBci-OhPk3G6kszfFK1GHiF3KW-Ph6bA0IIDALUpD_z2Ba7Or1Vn3bCWrZhYbuWYbWdwTYgkHdvOexHQbMVfIFzadNxxbpCYU4qrWVZyHltwGVyX5YYdw-lZxcd7jzVtTXb36DM077i-t_hzdTOsddvBlZjABYMo2Q",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBgd78i9LD0ddCNwMl6PRHrlXQcL55HesrDYMwt3YnxUHhIDE---IexF685RzkrQ1eu-IDL2nOm5opA7Ub7rgMK2sJlpE9q4GvDYASU4EoI3jgHD4b3kUA1hf4lSAwMBfnj9HiUScy810OUwtzM8ay_X3x4zpKPqUOoqf-NN0nz03RIXZ7l97yRQ1PUxe-_LtKEH22h0xW0sDaf8dBF534NBplkU4JgtzXem_eQRxweswDYMEeOjWdKz7HzA528Souwv8xhcvRolthG",
    ],
    crm: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3Axy_3vbIRCe-K8mv3iB9v2erk0xOgvqAcTqVJT6EetKbecup3e-cSIIMxBsFVlaVDruIK8uFP_flirUwUs0LaTafjQnuLWBbVrXvxpn2cltDr7Npl2ikb2E8OlAnYHPZy1Osc9nc9Ihh9i87Ip2L3WxdS3uvScV-kHygNxPqNaEHnAmUMDSlqo3p1pgwBp15cfXqsoSS2AmU2d4VdoBilE0k1BdsGJzpLA5PHQ9iAHnCNLx8p45eKMPESj4vFal2zAzsZlEH5knI",
    campaign: "https://lh3.googleusercontent.com/aida-public/AB6AXuCD3UIjeUhpeHzrZvKE71MI9JVt0plp7nSdh5zuJ7a0ir7bicl7K-IeteFlPx2EZnI6cGZ-AIrvEebOvZ5vH7RGTZY__LJl8Td-SUATUMA2s_wIIOiNb7iCe5Mj3zque5dTAJUx4sdf6LEvsojd9Y5rVOZmI8zwxG8xNk0sK021u4JckLZ-GxWtatquKYo6HtANeE-G55441J9xhLPte114qJNeGrBfl5dbI0vzhJwKPO6ItLgphGvYvyd1LZdfZkseDPs2EkhJjWeC",
    analytics: "https://lh3.googleusercontent.com/aida-public/AB6AXuCrVWmgLpFZU6pMSMn1eihqavaOPRt1hO_NX9psrmoZymu-A1e8_hcsiOlEQOTHggjivUxQ9tshmZ6cVghCbi1rXU9Qqj2mV-GL31aU2buCAkQkx2K7Ex2XobBNIgTiJnsvBoL0c8pm4CSPk34k081-j4HCFV3KtQBDjq1ubUepRQ3KsJ3kiuDmUV0hMmvkJCI7umlErz8JhP1NleqFIrSWf37eHRgPWVSOIHurcRCC7cHZFLGU5wIchXDlrOuZ1IWJv0xgYmuIgM7I",
    testimonials: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCyn6wk8R_UEZTrWLgNQDAe1cgaSQ1qRIlpnLWcgn1ofAdbHTQCwwx8bW2VCcL4EU-yoiyT-wDkTL136mju7MSTLidjQVcU68ri9BHLC-TTnfBOI-TticTFwp9pYCYFisz4YnXGMNJVKApWHL3BWp4u6uGsJnLOZKs_WNdjfIIryChvl5U1QIi8ENMphlfiIUCFt7saMU_etfqoT41knyDLKyleOv4OWSxS01VTjgvj7W_FaJOschKO0Sl-4D6ti0R52dYFYUKOrpst",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBHjTw7KGwxcsfJNbeiaP0T52L440zPmA4mLrhLCMKbgh3V-O8h9C6j_2vB6lPucd8mu4EJ3mE-O7d2W4AyuVyGQtOzwUjCuG4Xd_jy-HUzve87y2Bo1Ji7jXXqgX4gYTBdiWQfsdREPM_ZidpASbdzFDj3bz4-8tXBDxDVk338J3Jl7l7ryVI5DFFJmN5T6z1SFRcR8AXonP9OwUxvPitvTHwJ_fYZDw0jja5vAoPoFDHl8czIkvgFmnp-qW0mxsCN8K3jdHCl3NBh",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuArfhZHnH4Ug2ZiFAEXOd1QnLq91isoKc0cRMmi7jWHs4YpzjETpXweNu2c2fXG7rKT4UIi44Z9igkv1pJhtM2V8mtoksGJGphQzpRBY_8m6P7NZY15YHL2nYASit27byumWGG4lVr04geaiomYNjKuthxy9mtc97iVqiWNmCqMSHK9KjIK0h_3bqpA_RsPjwzu2N-Z50HSycLY1xjohcMhtEz6-7zI_YKOrb-Z3o_GkzF3B8C-njcAsDcdaDvh4yINcEPuZJfEGb-4",
    ],
};

// ─── Main Landing Page Component ────────────────────────────
const LandingPage = () => {
    return (
        <div className="bg-white font-['Inter',sans-serif] text-[#1E293B]" style={{ scrollBehavior: "smooth" }}>
            {/* ── Navbar ── */}
            <nav className="sticky top-0 z-50 w-full border-b border-[#E2E8F0] bg-white/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                                <ChatIcon className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-[#1E293B] tracking-tight">MessBee</span>
                        </div>
                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center space-x-8">
                            <a className="text-sm font-medium text-[#64748B] hover:text-[#1E293B] transition-colors" href="#features">Features</a>
                            <a className="text-sm font-medium text-[#64748B] hover:text-[#1E293B] transition-colors" href="#solutions">Solutions</a>
                            <a className="text-sm font-medium text-[#64748B] hover:text-[#1E293B] transition-colors" href="#pricing">Pricing</a>
                            <a className="text-sm font-medium text-[#64748B] hover:text-[#1E293B] transition-colors" href="#docs">Documentation</a>
                        </div>
                        {/* Auth Buttons */}
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-sm font-semibold text-[#1E293B] px-4 py-2 hover:opacity-80">Login</Link>
                            <Link to="/signup" className="bg-emerald-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:bg-emerald-600 transition-all">Get Started</Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main>
                {/* ── Hero Section ── */}
                <section className="relative pt-20 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="max-w-4xl mx-auto">
                            <h1 className="text-5xl lg:text-7xl font-extrabold text-[#1E293B] leading-tight mb-6">
                                Scale Your Business Conversations with the Power of{" "}
                                <span className="text-emerald-500">WhatsApp API</span>
                            </h1>
                            <p className="text-xl text-[#64748B] mb-10 leading-relaxed">
                                A unified workstation for CRM, automated campaigns, and real-time analytics. Build trust and drive conversions at scale.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                                <Link to="/signup" className="w-full sm:w-auto px-8 py-4 bg-emerald-500 text-white font-bold rounded-xl text-lg hover:shadow-lg transition-all inline-block text-center">
                                    Get Started for Free
                                </Link>
                                <button className="w-full sm:w-auto px-8 py-4 bg-white text-[#1E293B] font-bold rounded-xl text-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-all">
                                    Book a Demo
                                </button>
                            </div>
                        </div>
                        {/* Dashboard Mockup */}
                        <div className="relative mx-auto max-w-6xl">
                            <div className="rounded-2xl border border-[#E2E8F0] shadow-2xl overflow-hidden bg-white">
                                {/* Browser Chrome */}
                                <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-3 flex items-center gap-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                                    </div>
                                    <div className="mx-auto bg-white border border-[#E2E8F0] rounded-md px-4 py-1 text-xs text-[#64748B] w-1/2">
                                        app.messbee.com/dashboard
                                    </div>
                                </div>
                                {/* Mockup Image */}
                                <img alt="MessBee Dashboard Interface" className="w-full h-auto" src={IMAGES.dashboard} />
                            </div>
                            {/* Decorative Background Gradient */}
                            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-emerald-50 blur-[120px] rounded-full opacity-60"></div>
                        </div>
                    </div>
                </section>

                {/* ── Social Proof ── */}
                <section className="py-12 border-y border-[#E2E8F0] bg-[#F8FAFC]/30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <p className="text-center text-sm font-semibold uppercase tracking-widest text-[#64748B] mb-8">
                            Trusted by over 2,000+ scaling businesses
                        </p>
                        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale">
                            {IMAGES.partners.map((src, i) => (
                                <img key={i} alt="Partner Logo" className="h-8" src={src} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Feature Bento Grid ── */}
                <section className="py-24 bg-white" id="features">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-[#1E293B] sm:text-4xl">Everything you need to grow on WhatsApp</h2>
                            <p className="mt-4 text-[#64748B] text-lg max-w-2xl mx-auto">
                                Powerful tools designed for marketing, sales, and support teams to work in perfect harmony.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                            {/* Smart CRM */}
                            <div className="md:col-span-3 p-8 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC]/50 transition-transform duration-200 hover:-translate-y-1">
                                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                                    <UsersIcon />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-[#1E293B]">Smart CRM</h3>
                                <p className="text-[#64748B] mb-6">Unified contact management with smart labels, custom fields, and detailed customer histories.</p>
                                <img alt="CRM UI" className="rounded-lg border border-[#E2E8F0] shadow-sm" src={IMAGES.crm} />
                            </div>
                            {/* Broadcast Campaigns */}
                            <div className="md:col-span-3 p-8 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC]/50 transition-transform duration-200 hover:-translate-y-1">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                                    <MegaphoneIcon />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-[#1E293B]">Broadcast Campaigns</h3>
                                <p className="text-[#64748B] mb-6">Send thousands of personalized messages with high delivery rates and opt-out management.</p>
                                <img alt="Campaign UI" className="rounded-lg border border-[#E2E8F0] shadow-sm" src={IMAGES.campaign} />
                            </div>
                            {/* Automations */}
                            <div className="md:col-span-2 p-8 rounded-2xl border border-[#E2E8F0] bg-white transition-transform duration-200 hover:-translate-y-1">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                                    <BoltIcon />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-[#1E293B]">Powerful Automations</h3>
                                <p className="text-[#64748B]">Build chatbots that handle 80% of support queries without human intervention.</p>
                            </div>
                            {/* Analytics */}
                            <div className="md:col-span-4 p-8 rounded-2xl border border-[#E2E8F0] bg-white transition-transform duration-200 hover:-translate-y-1">
                                <div className="flex flex-col md:flex-row gap-8 items-center">
                                    <div className="flex-1">
                                        <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-6">
                                            <ChartIcon />
                                        </div>
                                        <h3 className="text-xl font-bold mb-3 text-[#1E293B]">Deep Analytics</h3>
                                        <p className="text-[#64748B]">Real-time conversion funnels, agent performance reports, and ROI tracking.</p>
                                    </div>
                                    <div className="flex-1 w-full">
                                        <img alt="Analytics Chart" className="w-full" src={IMAGES.analytics} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Technical Superiority ── */}
                <section className="py-20 bg-[#1E293B] text-white overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/10 rounded-lg">
                                    <MetaPartnerIcon />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">Official Meta Partner</h4>
                                    <p className="text-slate-400 text-sm">Direct integration with WhatsApp Business API with zero message markups.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/10 rounded-lg">
                                    <ShieldIcon />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">Enterprise Grade Security</h4>
                                    <p className="text-slate-400 text-sm">End-to-end encryption and GDPR compliance for all your sensitive data.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/10 rounded-lg">
                                    <BoltIconSmall />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">99.9% Uptime SLA</h4>
                                    <p className="text-slate-400 text-sm">Highly available infrastructure ensures you never miss a customer message.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Testimonials ── */}
                <section className="py-24 bg-[#F8FAFC]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-[#1E293B]">Loved by high-growth teams</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Testimonial 1 */}
                            <div className="bg-white p-8 rounded-2xl border border-[#E2E8F0]">
                                <div className="flex items-center gap-4 mb-6">
                                    <img alt="Sarah J." className="w-12 h-12 rounded-full" src={IMAGES.testimonials[0]} />
                                    <div>
                                        <h5 className="font-bold text-[#1E293B]">Sarah Jenkins</h5>
                                        <p className="text-xs text-[#64748B]">Head of Ops, FoodieExpress</p>
                                    </div>
                                </div>
                                <p className="text-[#64748B] italic">&ldquo;MessBee transformed our support. We&apos;ve reduced response times by 70% and our CSAT has never been higher.&rdquo;</p>
                            </div>
                            {/* Testimonial 2 */}
                            <div className="bg-white p-8 rounded-2xl border border-[#E2E8F0]">
                                <div className="flex items-center gap-4 mb-6">
                                    <img alt="Mark R." className="w-12 h-12 rounded-full" src={IMAGES.testimonials[1]} />
                                    <div>
                                        <h5 className="font-bold text-[#1E293B]">Mark Robertson</h5>
                                        <p className="text-xs text-[#64748B]">Marketing Director, ShopStyle</p>
                                    </div>
                                </div>
                                <p className="text-[#64748B] italic">&ldquo;The broadcast tool is a game changer. We get 45% open rates compared to 2% on email. It&apos;s paid for itself 10x over.&rdquo;</p>
                            </div>
                            {/* Testimonial 3 */}
                            <div className="bg-white p-8 rounded-2xl border border-[#E2E8F0]">
                                <div className="flex items-center gap-4 mb-6">
                                    <img alt="Elena V." className="w-12 h-12 rounded-full" src={IMAGES.testimonials[2]} />
                                    <div>
                                        <h5 className="font-bold text-[#1E293B]">Elena Valquez</h5>
                                        <p className="text-xs text-[#64748B]">Founder, Bloom &amp; Co.</p>
                                    </div>
                                </div>
                                <p className="text-[#64748B] italic">&ldquo;Simple to set up, yet powerful enough to scale with us. The team at MessBee actually listens to our feedback.&rdquo;</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Pricing Preview ── */}
                <section className="py-24 bg-white" id="pricing">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-[#1E293B]">Simple, transparent pricing</h2>
                            <p className="mt-4 text-[#64748B]">Choose the plan that fits your business stage.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Starter */}
                            <div className="p-8 rounded-2xl border border-[#E2E8F0] flex flex-col">
                                <h3 className="font-bold text-xl mb-2 text-[#1E293B]">Starter</h3>
                                <div className="mb-6">
                                    <span className="text-4xl font-extrabold text-[#1E293B]">$49</span>
                                    <span className="text-[#64748B]">/mo</span>
                                </div>
                                <ul className="space-y-4 mb-8 flex-grow">
                                    <li className="flex items-center gap-3 text-sm text-[#64748B]">
                                        <CheckIcon /> Up to 1,000 Monthly Users
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-[#64748B]">
                                        <CheckIcon /> Basic Automations
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-[#64748B]">
                                        <CheckIcon /> Email Support
                                    </li>
                                </ul>
                                <button className="w-full py-3 border border-[#E2E8F0] rounded-lg font-semibold hover:bg-[#F8FAFC] transition-colors">
                                    Choose Starter
                                </button>
                            </div>
                            {/* Professional */}
                            <div className="p-8 rounded-2xl border-2 border-emerald-500 bg-[#F8FAFC]/40 flex flex-col relative">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                                    Most Popular
                                </div>
                                <h3 className="font-bold text-xl mb-2 text-[#1E293B]">Professional</h3>
                                <div className="mb-6">
                                    <span className="text-4xl font-extrabold text-[#1E293B]">$129</span>
                                    <span className="text-[#64748B]">/mo</span>
                                </div>
                                <ul className="space-y-4 mb-8 flex-grow">
                                    <li className="flex items-center gap-3 text-sm text-[#64748B]">
                                        <CheckIcon /> Up to 5,000 Monthly Users
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-[#64748B]">
                                        <CheckIcon /> Advanced Workflow Builder
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-[#64748B]">
                                        <CheckIcon /> 24/7 Priority Support
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-[#64748B]">
                                        <CheckIcon /> API Access
                                    </li>
                                </ul>
                                <button className="w-full py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-colors">
                                    Choose Professional
                                </button>
                            </div>
                            {/* Enterprise */}
                            <div className="p-8 rounded-2xl border border-[#E2E8F0] flex flex-col">
                                <h3 className="font-bold text-xl mb-2 text-[#1E293B]">Enterprise</h3>
                                <div className="mb-6">
                                    <span className="text-4xl font-extrabold text-[#1E293B]">Custom</span>
                                </div>
                                <ul className="space-y-4 mb-8 flex-grow">
                                    <li className="flex items-center gap-3 text-sm text-[#64748B]">
                                        <CheckIcon /> Unlimited Contacts
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-[#64748B]">
                                        <CheckIcon /> Dedicated Success Manager
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-[#64748B]">
                                        <CheckIcon /> SLA &amp; Custom Contracts
                                    </li>
                                </ul>
                                <button className="w-full py-3 border border-[#E2E8F0] rounded-lg font-semibold hover:bg-[#F8FAFC] transition-colors">
                                    Contact Sales
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Final CTA ── */}
                <section className="py-24">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-[#1E293B] rounded-2xl p-12 text-center text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <h2 className="text-3xl lg:text-4xl font-bold mb-6">Ready to transform your customer engagement?</h2>
                                <p className="text-slate-300 mb-10 text-lg max-w-2xl mx-auto">
                                    Join thousands of businesses already scaling their sales and support with MessBee.
                                </p>
                                <Link to="/signup" className="inline-block bg-emerald-500 px-10 py-5 rounded-xl font-bold text-xl hover:bg-emerald-600 transition-all transform hover:scale-105">
                                    Get Started Now — It&apos;s Free
                                </Link>
                                <p className="mt-6 text-sm text-slate-400">No credit card required. 14-day trial of Pro features.</p>
                            </div>
                            {/* Abstract circles for styling */}
                            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-full"></div>
                            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/5 rounded-full"></div>
                        </div>
                    </div>
                </section>
            </main>

            {/* ── Footer ── */}
            <footer className="bg-white border-t border-[#E2E8F0] pt-20 pb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
                        <div className="col-span-2">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                                    <ChatIcon className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold text-[#1E293B]">MessBee</span>
                            </div>
                            <p className="text-[#64748B] max-w-xs mb-6">
                                Empowering businesses to build meaningful relationships through the world&apos;s most popular messaging platform.
                            </p>
                            <div className="flex gap-4">
                                <a className="text-[#64748B] hover:text-[#1E293B]" href="#">
                                    <TwitterIcon />
                                </a>
                                <a className="text-[#64748B] hover:text-[#1E293B]" href="#">
                                    <LinkedInIcon />
                                </a>
                            </div>
                        </div>
                        <div>
                            <h6 className="font-bold text-[#1E293B] mb-6">Product</h6>
                            <ul className="space-y-4 text-sm text-[#64748B]">
                                <li><a className="hover:text-[#1E293B]" href="#features">Features</a></li>
                                <li><a className="hover:text-[#1E293B]" href="#">Integrations</a></li>
                                <li><a className="hover:text-[#1E293B]" href="#pricing">Pricing</a></li>
                                <li><a className="hover:text-[#1E293B]" href="#">Changelog</a></li>
                            </ul>
                        </div>
                        <div>
                            <h6 className="font-bold text-[#1E293B] mb-6">Company</h6>
                            <ul className="space-y-4 text-sm text-[#64748B]">
                                <li><a className="hover:text-[#1E293B]" href="#">About Us</a></li>
                                <li><a className="hover:text-[#1E293B]" href="#">Careers</a></li>
                                <li><a className="hover:text-[#1E293B]" href="#">Privacy Policy</a></li>
                                <li><a className="hover:text-[#1E293B]" href="#">Terms of Service</a></li>
                            </ul>
                        </div>
                        <div>
                            <h6 className="font-bold text-[#1E293B] mb-6">Resources</h6>
                            <ul className="space-y-4 text-sm text-[#64748B]">
                                <li><a className="hover:text-[#1E293B]" href="#">Documentation</a></li>
                                <li><a className="hover:text-[#1E293B]" href="#">API Reference</a></li>
                                <li><a className="hover:text-[#1E293B]" href="#">Blog</a></li>
                                <li><a className="hover:text-[#1E293B]" href="#">Community</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-[#E2E8F0] text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-[#64748B]">© 2023 MessBee Inc. All rights reserved.</p>
                        <p className="text-xs text-[#64748B]">Built with ❤️ for customer-centric teams.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
