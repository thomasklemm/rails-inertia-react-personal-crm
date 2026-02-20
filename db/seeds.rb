# frozen_string_literal: true

# Seed data for personal CRM demo

# Clear existing CRM data
Activity.delete_all
Contact.delete_all
Company.delete_all

# ── Demo user ─────────────────────────────────────────────────────────────────

demo_user = User.find_or_create_by!(email: "demo@example.com") do |u|
  u.name     = "Demo User"
  u.password = "password123456"
  u.verified = true
end

# ── Companies ────────────────────────────────────────────────────────────────

companies = Company.create!([
  {
    name: "Acme Corp",
    website: "https://acme.example.com",
    phone: "+1 415-555-0200",
    email: "partnerships@acme.example.com",
    address: "340 Market St, San Francisco, CA 94102",
    notes: "Strategic enterprise customer. Renewal due end of Q1. Key decision-maker is Zara Ahmed (VP of Operations). Expansion deal in negotiation.",
    tags: %w[saas consulting],
    starred: true,
  },
  {
    name: "Bright Ideas Ltd",
    website: "https://brightideas.example.com",
    phone: "+1 646-555-0201",
    email: "hello@brightideas.example.com",
    address: "225 Park Ave South, New York, NY 10003",
    notes: "Active partner relationship. Co-marketing proposal under review. Revenue share model being finalised.",
    tags: %w[agency consulting],
    starred: true,
  },
  {
    name: "Cascade Partners",
    website: "https://cascade.example.com",
    phone: "+1 206-555-0202",
    email: "info@cascade.example.com",
    address: "1201 3rd Ave, Seattle, WA 98101",
    notes: "Mid-market opportunity. Currently in final vendor evaluation. Custom demo completed — proposal sent.",
    tags: %w[consulting],
    starred: false,
  },
  {
    name: "Dune Ventures",
    website: "https://duneventures.example.com",
    phone: "+1 310-555-0203",
    email: "deals@duneventures.example.com",
    address: "2450 Colorado Ave, Santa Monica, CA 90404",
    notes: "Series A investor prospect. Term sheet expected within 2 weeks. Intro via Layla Chen.",
    tags: %w[fintech],
    starred: true,
  },
  {
    name: "Echo Systems",
    website: "https://echosystems.example.com",
    phone: "+1 512-555-0204",
    email: "support@echosystems.example.com",
    address: "600 Congress Ave, Austin, TX 78701",
    notes: "SaaS customer. Had an API incident last month — resolved. Relationship back on track.",
    tags: %w[saas],
    starred: false,
  },
  {
    name: "Frontier Labs",
    website: "https://frontierlabs.example.com",
    phone: "+1 617-555-0205",
    email: "hello@frontierlabs.example.com",
    address: "One Kendall Square, Cambridge, MA 02139",
    notes: "Early-stage lead. Budget not confirmed for Q2. Strong interest — case study sent to help build internal business case.",
    tags: %w[saas healthcare],
    starred: false,
  },
  {
    name: "Gravity Works",
    website: nil,
    phone: "+1 312-555-0206",
    email: "ops@gravityworks.example.com",
    address: "222 W Merchandise Mart Plaza, Chicago, IL 60654",
    notes: "Manufacturing vendor. Contract renewed through end of year. Reliable supplier — consistently meets SLA.",
    tags: %w[manufacturing],
    starred: false,
  },
  {
    name: "Harbor Capital",
    website: "https://harborcapital.example.com",
    phone: "+1 212-555-0207",
    email: "invest@harborcapital.example.com",
    address: "55 Water St, New York, NY 10041",
    notes: "Seed-stage investor. Felix Park is the scout — partner meeting confirmed for next month.",
    tags: %w[fintech],
    starred: true,
  },
  {
    name: "Indigo Solutions",
    website: "https://indigosolutions.example.com",
    phone: "+1 720-555-0208",
    email: "cs@indigosolutions.example.com",
    address: "1670 Broadway, Denver, CO 80202",
    notes: "Enterprise customer with expansion opportunity. QBR completed — 3 additional product lines in scope.",
    tags: %w[consulting saas],
    starred: false,
  },
  {
    name: "Jasper Growth",
    website: "https://jaspergrowth.example.com",
    phone: "+1 415-555-0209",
    email: "portfolio@jaspergrowth.example.com",
    address: "101 California St, San Francisco, CA 94111",
    notes: "Growth equity investor. Writes $500k–$2M checks. Reference checks completed — term sheet expected within 10 days.",
    tags: %w[fintech],
    starred: true,
  },
  {
    name: "Keystone Ventures",
    website: "https://keystonevc.example.com",
    phone: "+1 617-555-0210",
    email: "contact@keystonevc.example.com",
    address: "200 State St, Boston, MA 02109",
    notes: "Series A/B investor. IC approved — moving to due diligence. Data room shared.",
    tags: %w[fintech],
    starred: true,
  },
  {
    name: "Luminary Digital",
    website: "https://luminarydigital.example.com",
    phone: "+1 323-555-0211",
    email: "partnerships@luminarydigital.example.com",
    address: "6255 Sunset Blvd, Los Angeles, CA 90028",
    notes: "Integration partner. Content syndication deal and data export integration both in progress.",
    tags: %w[media ecommerce],
    starred: false,
  },
].map { |h| h.merge(user: demo_user) })

acme, bright, cascade, dune, echo, frontier, gravity, harbor,
  indigo, jasper, keystone, luminary = companies

# ── Contacts ─────────────────────────────────────────────────────────────────

contacts_data = [
  { first_name: "Zara",    last_name: "Ahmed",      email: "zara@acme.example.com",           phone: "+1 555-0101", company: acme,      tags: %w[customer vip],       starred: true,  archived: false },
  { first_name: "Sofia",   last_name: "Andersson",  email: "sofia@brightideas.example.com",   phone: "+1 555-0102", company: bright,    tags: %w[partner],            starred: false, archived: false },
  { first_name: "Owen",    last_name: "Barnes",     email: "owen@cascade.example.com",        phone: "+1 555-0103", company: cascade,   tags: %w[lead prospect],      starred: false, archived: false },
  { first_name: "Layla",   last_name: "Chen",       email: "layla@dune.example.com",          phone: "+1 555-0104", company: dune,      tags: %w[investor],           starred: true,  archived: false },
  { first_name: "Marcus",  last_name: "Delacroix",  email: "marcus@echo.example.com",         phone: "+1 555-0105", company: echo,      tags: %w[customer],           starred: false, archived: false },
  { first_name: "Priya",   last_name: "Evans",      email: "priya@frontier.example.com",      phone: "+1 555-0106", company: frontier,  tags: %w[friend],             starred: false, archived: false },
  { first_name: "Theo",    last_name: "Fischer",    email: "theo@gravity.example.com",        phone: nil,           company: gravity,   tags: %w[vendor],             starred: false, archived: false },
  { first_name: "Aisha",   last_name: "Garcia",     email: "aisha@harbor.example.com",        phone: "+1 555-0108", company: harbor,    tags: %w[investor vip],       starred: true,  archived: false },
  { first_name: "Ravi",    last_name: "Hernandez",  email: "ravi@acme.example.com",           phone: "+1 555-0109", company: acme,      tags: %w[customer lead],      starred: false, archived: false },
  { first_name: "Nina",    last_name: "Ibrahim",    email: "nina@brightideas.example.com",    phone: "+1 555-0110", company: bright,    tags: %w[partner prospect],   starred: false, archived: false },
  { first_name: "James",   last_name: "Johnson",    email: "james@personal.example.com",      phone: "+1 555-0111", company: nil,       tags: %w[friend],             starred: true,  archived: false },
  { first_name: "Mei",     last_name: "Kim",        email: "mei@cascade.example.com",         phone: "+1 555-0112", company: cascade,   tags: %w[customer],           starred: false, archived: false },
  { first_name: "Luca",    last_name: "Laurent",    email: "luca@dune.example.com",           phone: "+1 555-0113", company: dune,      tags: %w[investor lead],      starred: false, archived: false },
  { first_name: "Sara",    last_name: "Mitchell",   email: "sara@echo.example.com",           phone: "+1 555-0114", company: echo,      tags: %w[vendor],             starred: false, archived: false },
  { first_name: "Ahmed",   last_name: "Nguyen",     email: "ahmed@frontier.example.com",      phone: "+1 555-0115", company: frontier,  tags: %w[prospect],           starred: false, archived: false },
  { first_name: "Clara",   last_name: "Okonkwo",    email: "clara@gravity.example.com",       phone: "+1 555-0116", company: gravity,   tags: %w[customer partner],   starred: false, archived: false },
  { first_name: "Felix",   last_name: "Park",       email: "felix@harbor.example.com",        phone: "+1 555-0117", company: harbor,    tags: %w[investor],           starred: true,  archived: false },
  { first_name: "Yuki",    last_name: "Quinn",      email: "yuki@personal.example.com",       phone: nil,           company: nil,       tags: %w[friend],             starred: false, archived: false },
  { first_name: "Diego",   last_name: "Rodriguez",  email: "diego@acme.example.com",          phone: "+1 555-0119", company: acme,      tags: %w[customer vip],       starred: false, archived: false },
  { first_name: "Amara",   last_name: "Santos",     email: "amara@bright.example.com",        phone: "+1 555-0120", company: bright,    tags: %w[lead],               starred: false, archived: false },
  { first_name: "Tom",     last_name: "Thompson",   email: "tom@old.example.com",             phone: nil,           company: nil,       tags: %w[customer],           starred: false, archived: true  },
  { first_name: "Julia",   last_name: "Ueda",       email: "julia@cascade.example.com",       phone: "+1 555-0122", company: cascade,   tags: %w[partner vip],        starred: false, archived: false },
  { first_name: "Kwame",   last_name: "Vance",      email: "kwame@dune.example.com",          phone: "+1 555-0123", company: dune,      tags: %w[investor prospect],  starred: true,  archived: false },
  { first_name: "Nadia",   last_name: "Weber",      email: "nadia@echo.example.com",          phone: "+1 555-0124", company: echo,      tags: %w[customer lead],      starred: false, archived: false },
  { first_name: "Sam",     last_name: "Xavier",     email: "sam@old.example.com",             phone: nil,           company: nil,       tags: %w[vendor],             starred: false, archived: true  },
  { first_name: "Leila",   last_name: "Zhang",      email: "leila@frontier.example.com",      phone: "+1 555-0126", company: frontier,  tags: %w[customer partner],   starred: false, archived: false },
  # New contacts
  { first_name: "Isabelle", last_name: "Adeyemi",   email: "isabelle@indigo.example.com",     phone: "+1 555-0127", company: indigo,    tags: %w[customer vip],       starred: true,  archived: false },
  { first_name: "Marco",    last_name: "Bellini",   email: "marco@jasper.example.com",        phone: "+1 555-0128", company: jasper,    tags: %w[investor],           starred: false, archived: false },
  { first_name: "Suki",     last_name: "Chandra",   email: "suki@keystone.example.com",       phone: "+1 555-0129", company: keystone,  tags: %w[investor vip],       starred: true,  archived: false },
  { first_name: "Eli",      last_name: "Darnell",   email: "eli@luminary.example.com",        phone: "+1 555-0130", company: luminary,  tags: %w[partner lead],       starred: false, archived: false },
  { first_name: "Fatima",   last_name: "El-Amin",   email: "fatima@indigo.example.com",       phone: "+1 555-0131", company: indigo,    tags: %w[customer],           starred: false, archived: false },
  { first_name: "Gus",      last_name: "Fontaine",  email: "gus@personal.example.com",        phone: nil,           company: nil,       tags: %w[friend],             starred: false, archived: false },
  { first_name: "Hana",     last_name: "Goto",      email: "hana@jasper.example.com",         phone: "+1 555-0133", company: jasper,    tags: %w[prospect lead],      starred: false, archived: false },
  { first_name: "Ivan",     last_name: "Horvath",   email: "ivan@keystone.example.com",       phone: "+1 555-0134", company: keystone,  tags: %w[investor],           starred: false, archived: false },
  { first_name: "Jess",     last_name: "Iweala",    email: "jess@luminary.example.com",       phone: "+1 555-0135", company: luminary,  tags: %w[customer partner],   starred: false, archived: false },
  { first_name: "Kofi",     last_name: "Jensen",    email: "kofi@personal.example.com",       phone: "+1 555-0136", company: nil,       tags: %w[friend vendor],      starred: false, archived: false },
]

contacts = Contact.create!(contacts_data.map { |h| h.merge(user: demo_user) })

by_name = contacts.index_by(&:last_name)
zara      = by_name["Ahmed"]
sofia     = by_name["Andersson"]
owen      = by_name["Barnes"]
layla     = by_name["Chen"]
marcus    = by_name["Delacroix"]
priya     = by_name["Evans"]
theo      = by_name["Fischer"]
aisha     = by_name["Garcia"]
ravi      = by_name["Hernandez"]
nina      = by_name["Ibrahim"]
james     = by_name["Johnson"]
mei       = by_name["Kim"]
luca      = by_name["Laurent"]
sara      = by_name["Mitchell"]
ahmed     = by_name["Nguyen"]
clara     = by_name["Okonkwo"]
felix     = by_name["Park"]
yuki      = by_name["Quinn"]
diego     = by_name["Rodriguez"]
amara     = by_name["Santos"]
tom       = by_name["Thompson"]
julia     = by_name["Ueda"]
kwame     = by_name["Vance"]
nadia     = by_name["Weber"]
sam       = by_name["Xavier"]
leila     = by_name["Zhang"]
isabelle  = by_name["Adeyemi"]
marco     = by_name["Bellini"]
suki      = by_name["Chandra"]
eli       = by_name["Darnell"]
fatima    = by_name["El-Amin"]
gus       = by_name["Fontaine"]
hana      = by_name["Goto"]
ivan      = by_name["Horvath"]
jess      = by_name["Iweala"]
kofi      = by_name["Jensen"]

# ── Activities ────────────────────────────────────────────────────────────────

activities = []

activities += [
  { contact: zara, kind: "note",  body: "Discussed Q1 renewal — she's very happy with the service. Expecting to expand seats by 20%.", created_at: 3.days.ago },
  { contact: zara, kind: "call",  body: "Intro call went well. She's interested in our enterprise plan.", created_at: 2.weeks.ago },
  { contact: zara, kind: "email", body: "Sent over the enterprise pricing deck and case studies.", created_at: 10.days.ago },
  { contact: zara, kind: "note",  body: "Follow up on contract signing by end of month.", created_at: 1.day.ago },
  { contact: zara, kind: "call",  body: "Quick check-in — no blockers, contract going through legal.", created_at: 5.days.ago },
]

activities += [
  { contact: sofia, kind: "email", body: "Reached out about co-selling opportunities — she manages the Bright Ideas partner program.", created_at: 5.weeks.ago },
  { contact: sofia, kind: "call",  body: "Intro call — enthusiastic about a referral arrangement. Wants a revenue share model.", created_at: 4.weeks.ago },
  { contact: sofia, kind: "note",  body: "Draft a partner agreement template and share with legal before sending.", created_at: 3.weeks.ago },
  { contact: sofia, kind: "email", body: "Sent the draft partner agreement for her review.", created_at: 2.weeks.ago },
  { contact: sofia, kind: "call",  body: "She has minor redlines on the agreement — nothing blocking. Expecting countersign next week.", created_at: 4.days.ago },
]

activities += [
  { contact: owen, kind: "email", body: "Inbound inquiry via the website — interested in our mid-market plan.", created_at: 3.weeks.ago },
  { contact: owen, kind: "call",  body: "Discovery call — Cascade is evaluating three vendors. We're on the shortlist.", created_at: 2.weeks.ago },
  { contact: owen, kind: "note",  body: "He wants a custom demo focused on the analytics dashboard.", created_at: 10.days.ago },
  { contact: owen, kind: "call",  body: "Live demo went well — he's impressed. Sending a proposal next.", created_at: 5.days.ago },
  { contact: owen, kind: "email", body: "Sent the tailored proposal including a 30-day free pilot.", created_at: 2.days.ago },
]

activities += [
  { contact: layla, kind: "call",  body: "Series A pitch call — very positive! She wants to see the cap table.", created_at: 1.week.ago },
  { contact: layla, kind: "email", body: "Sent the investor deck and financial projections.", created_at: 6.days.ago },
  { contact: layla, kind: "note",  body: "Intro'd to their GP. Meeting scheduled for next Thursday.", created_at: 4.days.ago },
  { contact: layla, kind: "call",  body: "Follow-up call — she's in principle interested, term sheet in 2 weeks.", created_at: 2.days.ago },
]

activities += [
  { contact: marcus, kind: "call",  body: "Support escalation — API latency issue. Resolved by engineering.", created_at: 2.weeks.ago },
  { contact: marcus, kind: "email", body: "Post-incident report sent.", created_at: 10.days.ago },
  { contact: marcus, kind: "note",  body: "Satisfaction restored — he appreciated the quick turnaround.", created_at: 1.week.ago },
]

activities += [
  { contact: priya, kind: "note", body: "Met at a startup event — she's a product designer at Frontier.", created_at: 1.month.ago },
  { contact: priya, kind: "call", body: "Catchup call — she might be open to joining as a design advisor.", created_at: 2.weeks.ago },
  { contact: priya, kind: "note", body: "She asked for an advisory agreement template to review with her lawyer.", created_at: 1.week.ago },
  { contact: priya, kind: "email", body: "Sent the standard advisory agreement along with the equity grant details.", created_at: 4.days.ago },
]

activities += [
  { contact: theo, kind: "email", body: "Vendor onboarding email sent.", created_at: 2.months.ago },
  { contact: theo, kind: "note",  body: "First invoice approved and paid.", created_at: 6.weeks.ago },
  { contact: theo, kind: "call",  body: "Contract renewal discussion — same terms.", created_at: 3.weeks.ago },
  { contact: theo, kind: "email", body: "Renewal contract sent for signature.", created_at: 2.weeks.ago },
  { contact: theo, kind: "note",  body: "Signed and filed. Renewal runs through end of year.", created_at: 10.days.ago },
]

activities += [
  { contact: aisha, kind: "email", body: "Reached out via warm intro from Felix Park.", created_at: 3.weeks.ago },
  { contact: aisha, kind: "call",  body: "First call — great energy. She's looking at seed-stage deals.", created_at: 2.weeks.ago },
  { contact: aisha, kind: "note",  body: "She mentioned she prefers async updates via email.", created_at: 10.days.ago },
  { contact: aisha, kind: "email", body: "Monthly investor update sent.", created_at: 5.days.ago },
]

activities += [
  { contact: ravi, kind: "email", body: "Sent trial activation instructions.", created_at: 3.weeks.ago },
  { contact: ravi, kind: "call",  body: "Onboarding call — walked through the dashboard.", created_at: 2.weeks.ago },
  { contact: ravi, kind: "note",  body: "He's blocked on IT approval for SSO integration.", created_at: 1.week.ago },
  { contact: ravi, kind: "email", body: "Sent the SSO setup guide and IT checklist.", created_at: 5.days.ago },
  { contact: ravi, kind: "call",  body: "IT approved — going live next Monday.", created_at: 1.day.ago },
]

activities += [
  { contact: nina, kind: "email", body: "Introduction email — exploring a co-marketing opportunity.", created_at: 1.month.ago },
  { contact: nina, kind: "call",  body: "Discovery call — she's interested in a joint webinar.", created_at: 3.weeks.ago },
  { contact: nina, kind: "note",  body: "Draft the webinar proposal and send by Friday.", created_at: 2.weeks.ago },
  { contact: nina, kind: "email", body: "Sent the co-marketing proposal deck.", created_at: 1.week.ago },
]

activities += [
  { contact: james, kind: "note", body: "Caught up over coffee — he's consulting now after leaving Google.", created_at: 2.weeks.ago },
  { contact: james, kind: "call", body: "He might be able to help with hiring — referred two engineers.", created_at: 1.week.ago },
  { contact: james, kind: "note", body: "Send him a thank-you for the intros.", created_at: 3.days.ago },
]

activities += [
  { contact: mei, kind: "call",  body: "Quarterly business review — NPS 9, very satisfied.", created_at: 1.week.ago },
  { contact: mei, kind: "note",  body: "Wants to try the new reporting features in the next release.", created_at: 4.days.ago },
  { contact: mei, kind: "email", body: "Shared the beta release notes for the reporting module.", created_at: 2.days.ago },
]

activities += [
  { contact: luca, kind: "email", body: "Sent introductory email via AngelList.", created_at: 2.months.ago },
  { contact: luca, kind: "call",  body: "First call — he's primarily an LP, not a direct investor.", created_at: 6.weeks.ago },
  { contact: luca, kind: "note",  body: "May be able to intro to Dune GPs.", created_at: 1.month.ago },
  { contact: luca, kind: "email", body: "Sent warm intro request to the Dune GP he mentioned.", created_at: 3.weeks.ago },
  { contact: luca, kind: "note",  body: "Intro made — meeting booked for next month.", created_at: 2.weeks.ago },
]

activities += [
  { contact: sara, kind: "email", body: "Vendor kicked off — sent the initial scope and timelines.", created_at: 2.months.ago },
  { contact: sara, kind: "call",  body: "Kickoff call — she's handling infrastructure supply. First delivery in 6 weeks.", created_at: 7.weeks.ago },
  { contact: sara, kind: "note",  body: "First delivery arrived on time and within spec.", created_at: 1.month.ago },
  { contact: sara, kind: "email", body: "Requested a revised quote for Q2 volumes.", created_at: 3.weeks.ago },
  { contact: sara, kind: "call",  body: "Reviewed revised quote — agreed on pricing. PO being raised.", created_at: 1.week.ago },
]

activities += [
  { contact: ahmed, kind: "email", body: "Sent a cold outreach highlighting our startup discount program.", created_at: 1.month.ago },
  { contact: ahmed, kind: "call",  body: "Discovery call — Frontier Labs is in early evaluation. Budget not yet confirmed.", created_at: 3.weeks.ago },
  { contact: ahmed, kind: "note",  body: "He'll circle back after their Q2 planning session in two weeks.", created_at: 2.weeks.ago },
  { contact: ahmed, kind: "email", body: "Sent a case study relevant to their industry ahead of their planning session.", created_at: 10.days.ago },
]

activities += [
  { contact: clara, kind: "call",  body: "Partnership intro call — she handles vendor relations.", created_at: 1.month.ago },
  { contact: clara, kind: "email", body: "Sent integration documentation.", created_at: 3.weeks.ago },
  { contact: clara, kind: "note",  body: "Integration live — first invoice sent.", created_at: 1.week.ago },
]

activities += [
  { contact: felix, kind: "email", body: "Warm intro received from a mutual connection at YC.", created_at: 1.month.ago },
  { contact: felix, kind: "call",  body: "Initial call — he's a scout for Harbor Capital.", created_at: 3.weeks.ago },
  { contact: felix, kind: "note",  body: "Interested in B2B SaaS. Sending deal memo next week.", created_at: 2.weeks.ago },
  { contact: felix, kind: "email", body: "Sent the deal memo and traction metrics.", created_at: 10.days.ago },
  { contact: felix, kind: "call",  body: "Partner meeting confirmed for next month.", created_at: 3.days.ago },
]

activities += [
  { contact: yuki, kind: "note",  body: "Reconnected at a mutual friend's dinner party — she recently moved back to town.", created_at: 5.weeks.ago },
  { contact: yuki, kind: "email", body: "Sent a welcome-back note and suggested catching up over lunch.", created_at: 4.weeks.ago },
  { contact: yuki, kind: "call",  body: "Quick catch-up — she's freelancing in UX consulting now. Could be a resource.", created_at: 3.weeks.ago },
  { contact: yuki, kind: "note",  body: "Mentioned she's open to a short freelance project. Loop in the design team.", created_at: 2.weeks.ago },
]

activities += [
  { contact: diego, kind: "note",  body: "Executive sponsor for Acme's enterprise renewal.", created_at: 2.weeks.ago },
  { contact: diego, kind: "call",  body: "Strategy call — wants custom SLAs in the renewal contract.", created_at: 1.week.ago },
  { contact: diego, kind: "email", body: "Sent custom SLA addendum for legal review.", created_at: 3.days.ago },
]

activities += [
  { contact: amara, kind: "email", body: "Inbound lead — filled out the demo request form.", created_at: 2.weeks.ago },
  { contact: amara, kind: "call",  body: "Demo call — she loved the reporting features.", created_at: 10.days.ago },
  { contact: amara, kind: "note",  body: "Send proposal by end of week.", created_at: 5.days.ago },
  { contact: amara, kind: "email", body: "Proposal sent — €12k/year.", created_at: 3.days.ago },
]

activities += [
  { contact: tom, kind: "call",  body: "Support call — persistent complaints about billing. Offered a credit.", created_at: 6.months.ago },
  { contact: tom, kind: "email", body: "Sent formal notice that his account would be closed after repeated ToS violations.", created_at: 5.months.ago },
  { contact: tom, kind: "note",  body: "Account closed. Marked as archived — do not re-engage.", created_at: 5.months.ago },
]

activities += [
  { contact: julia, kind: "email", body: "Introduced by the Cascade CEO as the new Head of Partnerships.", created_at: 2.months.ago },
  { contact: julia, kind: "call",  body: "Intro call — she's keen to deepen the integration and explore bundled pricing.", created_at: 6.weeks.ago },
  { contact: julia, kind: "note",  body: "She wants a co-sell motion included in the partnership expansion.", created_at: 1.month.ago },
  { contact: julia, kind: "email", body: "Sent the updated partnership framework doc for her review.", created_at: 2.weeks.ago },
  { contact: julia, kind: "call",  body: "Review call — she's happy with the framework, routing to legal.", created_at: 4.days.ago },
]

activities += [
  { contact: kwame, kind: "email", body: "Cold outreach — referenced their portfolio company synergy.", created_at: 6.weeks.ago },
  { contact: kwame, kind: "call",  body: "Intro call — he focuses on fintech. May not be the right fit.", created_at: 5.weeks.ago },
  { contact: kwame, kind: "note",  body: "Reconnect when we have more fintech use cases.", created_at: 4.weeks.ago },
]

activities += [
  { contact: nadia, kind: "email", body: "Welcome email sent after trial signup.", created_at: 2.weeks.ago },
  { contact: nadia, kind: "call",  body: "Discovery call — she manages a team of 15.", created_at: 10.days.ago },
  { contact: nadia, kind: "note",  body: "Upgrade potential is high — send team plan comparison.", created_at: 1.week.ago },
  { contact: nadia, kind: "email", body: "Sent the team vs. individual plan comparison sheet.", created_at: 4.days.ago },
]

activities += [
  { contact: sam, kind: "email", body: "Onboarding email sent for the hardware supply contract.", created_at: 8.months.ago },
  { contact: sam, kind: "call",  body: "Contract kick-off call. Agreed on delivery windows.", created_at: 7.months.ago },
  { contact: sam, kind: "note",  body: "Multiple missed deliveries and no communication. Escalated internally.", created_at: 6.months.ago },
  { contact: sam, kind: "email", body: "Sent formal termination notice for the vendor agreement.", created_at: 5.months.ago },
  { contact: sam, kind: "note",  body: "Vendor offboarded. Contact archived — do not renew.", created_at: 5.months.ago },
]

activities += [
  { contact: leila, kind: "email", body: "Introduced to the new support tier.", created_at: 3.weeks.ago },
  { contact: leila, kind: "call",  body: "QBR call — she's happy but wants better mobile app.", created_at: 2.weeks.ago },
  { contact: leila, kind: "note",  body: "Shared mobile roadmap — she's satisfied to wait.", created_at: 1.week.ago },
]

# ── New contacts' activities ──────────────────────────────────────────────────

activities += [
  { contact: isabelle, kind: "email", body: "Intro email from the Indigo CEO — she's their Head of Customer Success.", created_at: 5.weeks.ago },
  { contact: isabelle, kind: "call",  body: "First call — she's championing our product internally and wants an executive alignment meeting.", created_at: 4.weeks.ago },
  { contact: isabelle, kind: "note",  body: "Arrange a QBR with their C-suite and our VP of CS.", created_at: 3.weeks.ago },
  { contact: isabelle, kind: "call",  body: "Executive QBR completed — exceptional feedback. Expansion opportunity confirmed.", created_at: 2.weeks.ago },
  { contact: isabelle, kind: "email", body: "Sent expansion proposal covering 3 additional product lines.", created_at: 1.week.ago },
  { contact: isabelle, kind: "note",  body: "She verbally agreed to expand. Waiting on legal to circulate the addendum.", created_at: 2.days.ago },
]

activities += [
  { contact: marco, kind: "email", body: "Reached out via warm intro from a Jasper Growth portfolio founder.", created_at: 7.weeks.ago },
  { contact: marco, kind: "call",  body: "Intro call — he leads early-stage investments in enterprise SaaS.", created_at: 6.weeks.ago },
  { contact: marco, kind: "note",  body: "Jasper Growth typically writes $500k–$2M checks. Good fit for our bridge round.", created_at: 5.weeks.ago },
  { contact: marco, kind: "email", body: "Sent the investor deck and latest financials.", created_at: 4.weeks.ago },
  { contact: marco, kind: "call",  body: "Second call — he wants to run reference checks with two customers.", created_at: 3.weeks.ago },
  { contact: marco, kind: "note",  body: "Intro'd Zara Ahmed and Isabelle Adeyemi as references.", created_at: 2.weeks.ago },
  { contact: marco, kind: "email", body: "References came back positive. Term sheet expected within 10 days.", created_at: 5.days.ago },
]

activities += [
  { contact: suki, kind: "email", body: "Introduction from a GP at Keystone Ventures following a conference talk.", created_at: 2.months.ago },
  { contact: suki, kind: "call",  body: "First call — she's a managing director focused on Series A/B. Very interested.", created_at: 6.weeks.ago },
  { contact: suki, kind: "note",  body: "She wants to run the deal through her investment committee next month.", created_at: 5.weeks.ago },
  { contact: suki, kind: "email", body: "Sent the updated pitch deck and a customer cohort analysis.", created_at: 4.weeks.ago },
  { contact: suki, kind: "call",  body: "IC prep call — walked her through unit economics and go-to-market.", created_at: 3.weeks.ago },
  { contact: suki, kind: "note",  body: "IC meeting happened — positive outcome. Moving to due diligence.", created_at: 2.weeks.ago },
  { contact: suki, kind: "email", body: "Kicked off due diligence — shared data room access.", created_at: 1.week.ago },
  { contact: suki, kind: "call",  body: "DD check-in — no blockers flagged. Term sheet being drafted.", created_at: 2.days.ago },
]

activities += [
  { contact: eli, kind: "email", body: "Reached out after seeing Luminary Digital's blog post on AI-assisted marketing.", created_at: 6.weeks.ago },
  { contact: eli, kind: "call",  body: "Discovery call — he runs partnerships at Luminary and wants to explore a content syndication deal.", created_at: 5.weeks.ago },
  { contact: eli, kind: "note",  body: "Draft a co-authorship proposal for the quarterly trend report.", created_at: 4.weeks.ago },
  { contact: eli, kind: "email", body: "Sent the co-authorship proposal with revenue share terms.", created_at: 3.weeks.ago },
  { contact: eli, kind: "call",  body: "He reviewed the proposal — wants to broaden the distribution channels.", created_at: 2.weeks.ago },
  { contact: eli, kind: "email", body: "Updated proposal sent including newsletter and podcast distribution.", created_at: 1.week.ago },
]

activities += [
  { contact: fatima, kind: "email", body: "Welcome email sent after she signed up via the Indigo employee referral program.", created_at: 3.weeks.ago },
  { contact: fatima, kind: "call",  body: "Onboarding call — she's running a pilot for her ops team.", created_at: 2.weeks.ago },
  { contact: fatima, kind: "note",  body: "Pilot is going well — 80% feature adoption in week one.", created_at: 10.days.ago },
  { contact: fatima, kind: "email", body: "Sent a mid-pilot health check and suggested upgrading to the full plan.", created_at: 5.days.ago },
]

activities += [
  { contact: gus, kind: "note",  body: "Old friend from university — works in data science at a hedge fund now.", created_at: 3.months.ago },
  { contact: gus, kind: "call",  body: "Catch-up call — he's interested in angel investing and asked about our round.", created_at: 6.weeks.ago },
  { contact: gus, kind: "email", body: "Sent our SAFE template and a short investment memo.", created_at: 5.weeks.ago },
  { contact: gus, kind: "note",  body: "He committed to a $25k angel check. Docs signed and countersigned.", created_at: 4.weeks.ago },
  { contact: gus, kind: "email", body: "Sent the cap table update confirming his equity stake.", created_at: 3.weeks.ago },
]

activities += [
  { contact: hana, kind: "email", body: "Inbound lead from the Jasper Growth portfolio newsletter.", created_at: 4.weeks.ago },
  { contact: hana, kind: "call",  body: "Discovery call — she's evaluating tools for a 30-person marketing team.", created_at: 3.weeks.ago },
  { contact: hana, kind: "note",  body: "She wants a side-by-side comparison with their current vendor.", created_at: 2.weeks.ago },
  { contact: hana, kind: "email", body: "Sent a detailed feature comparison matrix and ROI calculator.", created_at: 10.days.ago },
  { contact: hana, kind: "call",  body: "Follow-up call — she's leaning in our favor. Wants a final pricing discussion.", created_at: 3.days.ago },
]

activities += [
  { contact: ivan, kind: "email", body: "Cold outreach — identified Keystone Ventures as a strategic fit for our growth round.", created_at: 2.months.ago },
  { contact: ivan, kind: "call",  body: "Intro call — he primarily leads later-stage deals, but flagged interest in our space.", created_at: 7.weeks.ago },
  { contact: ivan, kind: "note",  body: "He suggested re-engaging when ARR reaches $3M — noted for follow-up.", created_at: 6.weeks.ago },
  { contact: ivan, kind: "email", body: "Sent a progress update: ARR now at $2.7M and growing 15% MoM.", created_at: 2.weeks.ago },
]

activities += [
  { contact: jess, kind: "email", body: "Intro email — Luminary Digital was referred as a potential integration partner.", created_at: 7.weeks.ago },
  { contact: jess, kind: "call",  body: "Partnership discovery call — she manages Luminary's technology alliances.", created_at: 6.weeks.ago },
  { contact: jess, kind: "note",  body: "She wants a joint integration that lets Luminary's clients export data into our platform.", created_at: 5.weeks.ago },
  { contact: jess, kind: "email", body: "Sent the API documentation and a draft integration spec.", created_at: 4.weeks.ago },
  { contact: jess, kind: "call",  body: "Technical review call with engineering reps from both sides — scope confirmed.", created_at: 3.weeks.ago },
  { contact: jess, kind: "note",  body: "Engineering kick-off scheduled. Target beta launch in 6 weeks.", created_at: 2.weeks.ago },
  { contact: jess, kind: "email", body: "Mid-sprint update sent — integration is on track for beta.", created_at: 3.days.ago },
]

activities += [
  { contact: kofi, kind: "note",  body: "Met at a community meetup — he does freelance video production.", created_at: 2.months.ago },
  { contact: kofi, kind: "call",  body: "Exploratory call about potential video content for our marketing.", created_at: 6.weeks.ago },
  { contact: kofi, kind: "email", body: "Sent a creative brief for a 2-minute product explainer video.", created_at: 5.weeks.ago },
  { contact: kofi, kind: "note",  body: "He delivered a draft — quality is excellent, approved with minor feedback.", created_at: 3.weeks.ago },
  { contact: kofi, kind: "email", body: "Sent final approval and invoice payment confirmation.", created_at: 2.weeks.ago },
]

Activity.create!(activities.map { |h| h.merge(user: demo_user) })

# ── Direct company activities ─────────────────────────────────────────────────

company_activities = []

company_activities += [
  { company: acme,     kind: "note",  body: "Enterprise account review: ARR $240k. Expansion of 20% seats confirmed for next quarter.", created_at: 1.week.ago },
  { company: acme,     kind: "email", body: "Sent annual business review deck and proposed renewal terms to the procurement team.", created_at: 2.weeks.ago },
  { company: acme,     kind: "call",  body: "Quarterly check-in with the Acme leadership team — roadmap alignment and SLA review.", created_at: 1.month.ago },
]

company_activities += [
  { company: bright,   kind: "note",  body: "Partner program onboarding completed. Revenue share agreement signed.", created_at: 2.weeks.ago },
  { company: bright,   kind: "email", body: "Sent co-marketing launch plan and brand assets for the joint campaign.", created_at: 3.weeks.ago },
]

company_activities += [
  { company: cascade,  kind: "call",  body: "Final vendor shortlist review call with their procurement lead — positive outcome.", created_at: 1.week.ago },
  { company: cascade,  kind: "note",  body: "RFP response submitted — covering pricing, security, and support SLAs.", created_at: 2.weeks.ago },
]

company_activities += [
  { company: dune,     kind: "email", body: "Sent updated cap table and financial model ahead of term sheet negotiations.", created_at: 3.days.ago },
  { company: dune,     kind: "note",  body: "Series A diligence underway — legal working on reps and warranties.", created_at: 1.week.ago },
]

company_activities += [
  { company: echo,     kind: "note",  body: "Post-incident review completed. Engineering shipped a hotfix; SLA credit issued.", created_at: 2.weeks.ago },
  { company: echo,     kind: "email", body: "Sent updated MSA with improved uptime guarantees for renewal.", created_at: 3.weeks.ago },
]

company_activities += [
  { company: frontier, kind: "email", body: "Sent tailored case study for the healthcare workflow automation use case.", created_at: 1.week.ago },
  { company: frontier, kind: "note",  body: "Budget review scheduled for mid-Q2. Decision expected 4–6 weeks.", created_at: 2.weeks.ago },
]

company_activities += [
  { company: gravity,  kind: "call",  body: "Annual vendor review — performance rated satisfactory. Contract auto-renewed.", created_at: 1.month.ago },
  { company: gravity,  kind: "note",  body: "Updated billing contact and confirmed new PO number for FY.", created_at: 3.weeks.ago },
]

company_activities += [
  { company: harbor,   kind: "email", body: "Sent investor update: Q1 metrics, growth trajectory, and use of funds.", created_at: 1.week.ago },
  { company: harbor,   kind: "note",  body: "Partner presentation scheduled for next month — preparing executive summary.", created_at: 10.days.ago },
]

company_activities += [
  { company: indigo,   kind: "call",  body: "Expansion scoping call with Indigo leadership — 3 additional product lines approved in principle.", created_at: 1.week.ago },
  { company: indigo,   kind: "email", body: "Sent formal expansion proposal with updated pricing and onboarding timeline.", created_at: 2.weeks.ago },
]

company_activities += [
  { company: jasper,   kind: "note",  body: "Reference checks completed. Zara Ahmed and Isabelle Adeyemi gave strong endorsements.", created_at: 1.week.ago },
  { company: jasper,   kind: "email", body: "Sent updated investor deck reflecting March ARR milestone.", created_at: 2.weeks.ago },
]

company_activities += [
  { company: keystone, kind: "note",  body: "Data room access granted. Legal and financial diligence in progress.", created_at: 5.days.ago },
  { company: keystone, kind: "call",  body: "IC outcome call — unanimous approval to proceed. Term sheet being drafted.", created_at: 1.week.ago },
]

company_activities += [
  { company: luminary, kind: "email", body: "Sent the final integration spec and API changelog for the data export connector.", created_at: 1.week.ago },
  { company: luminary, kind: "note",  body: "Content syndication agreement signed. First joint article goes live next month.", created_at: 2.weeks.ago },
]

Activity.create!(company_activities.map { |h| h.merge(user: demo_user) })

puts "Seeded: #{Company.count} companies, #{Contact.count} contacts, #{Activity.count} activities"
