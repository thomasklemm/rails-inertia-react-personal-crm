# frozen_string_literal: true

# Seed data for personal CRM demo

# Clear existing CRM data
Activity.delete_all
Deal.delete_all
Contact.delete_all
Company.delete_all

# ── Demo user ─────────────────────────────────────────────────────────────────

demo_user = User.find_or_initialize_by(email: "demo@example.com")
demo_user.assign_attributes(name: "Demo User", password: "password123456", verified: true)
demo_user.save!

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
    starred: true
  },
  {
    name: "Bright Ideas Ltd",
    website: "https://brightideas.example.com",
    phone: "+1 646-555-0201",
    email: "hello@brightideas.example.com",
    address: "225 Park Ave South, New York, NY 10003",
    notes: "Active partner relationship. Co-marketing proposal under review. Revenue share model being finalised.",
    tags: %w[agency consulting],
    starred: true
  },
  {
    name: "Cascade Partners",
    website: "https://cascade.example.com",
    phone: "+1 206-555-0202",
    email: "info@cascade.example.com",
    address: "1201 3rd Ave, Seattle, WA 98101",
    notes: "Mid-market opportunity. Currently in final vendor evaluation. Custom demo completed — proposal sent.",
    tags: %w[consulting],
    starred: false
  },
  {
    name: "Dune Ventures",
    website: "https://duneventures.example.com",
    phone: "+1 310-555-0203",
    email: "deals@duneventures.example.com",
    address: "2450 Colorado Ave, Santa Monica, CA 90404",
    notes: "Series A investor prospect. Term sheet expected within 2 weeks. Intro via Layla Chen.",
    tags: %w[fintech],
    starred: true
  },
  {
    name: "Echo Systems",
    website: "https://echosystems.example.com",
    phone: "+1 512-555-0204",
    email: "support@echosystems.example.com",
    address: "600 Congress Ave, Austin, TX 78701",
    notes: "SaaS customer. Had an API incident last month — resolved. Relationship back on track.",
    tags: %w[saas],
    starred: false
  },
  {
    name: "Frontier Labs",
    website: "https://frontierlabs.example.com",
    phone: "+1 617-555-0205",
    email: "hello@frontierlabs.example.com",
    address: "One Kendall Square, Cambridge, MA 02139",
    notes: "Early-stage lead. Budget not confirmed for Q2. Strong interest — case study sent to help build internal business case.",
    tags: %w[saas healthcare],
    starred: false
  },
  {
    name: "Gravity Works",
    website: nil,
    phone: "+1 312-555-0206",
    email: "ops@gravityworks.example.com",
    address: "222 W Merchandise Mart Plaza, Chicago, IL 60654",
    notes: "Manufacturing vendor. Contract renewed through end of year. Reliable supplier — consistently meets SLA.",
    tags: %w[manufacturing],
    starred: false
  },
  {
    name: "Harbor Capital",
    website: "https://harborcapital.example.com",
    phone: "+1 212-555-0207",
    email: "invest@harborcapital.example.com",
    address: "55 Water St, New York, NY 10041",
    notes: "Seed-stage investor. Felix Park is the scout — partner meeting confirmed for next month.",
    tags: %w[fintech],
    starred: true
  },
  {
    name: "Indigo Solutions",
    website: "https://indigosolutions.example.com",
    phone: "+1 720-555-0208",
    email: "cs@indigosolutions.example.com",
    address: "1670 Broadway, Denver, CO 80202",
    notes: "Enterprise customer with expansion opportunity. QBR completed — 3 additional product lines in scope.",
    tags: %w[consulting saas],
    starred: false
  },
  {
    name: "Jasper Growth",
    website: "https://jaspergrowth.example.com",
    phone: "+1 415-555-0209",
    email: "portfolio@jaspergrowth.example.com",
    address: "101 California St, San Francisco, CA 94111",
    notes: "Growth equity investor. Writes $500k–$2M checks. Reference checks completed — term sheet expected within 10 days.",
    tags: %w[fintech],
    starred: true
  },
  {
    name: "Keystone Ventures",
    website: "https://keystonevc.example.com",
    phone: "+1 617-555-0210",
    email: "contact@keystonevc.example.com",
    address: "200 State St, Boston, MA 02109",
    notes: "Series A/B investor. IC approved — moving to due diligence. Data room shared.",
    tags: %w[fintech],
    starred: true
  },
  {
    name: "Luminary Digital",
    website: "https://luminarydigital.example.com",
    phone: "+1 323-555-0211",
    email: "partnerships@luminarydigital.example.com",
    address: "6255 Sunset Blvd, Los Angeles, CA 90028",
    notes: "Integration partner. Content syndication deal and data export integration both in progress.",
    tags: %w[media ecommerce],
    starred: false
  }
].map { |h| h.merge(user: demo_user) })

acme, bright, cascade, dune, echo, frontier, gravity, harbor,
  indigo, jasper, keystone, luminary = companies

# ── Contacts ─────────────────────────────────────────────────────────────────

contacts_data = [
  {first_name: "Zara",    last_name: "Ahmed",      email: "zara@acme.example.com",           phone: "+1 555-0101", company: acme,      tags: %w[customer vip],       starred: true,  archived: false, follow_up_at: Date.current - 2,  notes: "Key decision-maker for the Acme enterprise renewal. Very happy with the service and expecting a 20% seat expansion. Contract is currently with their legal team."},
  {first_name: "Sofia",   last_name: "Andersson",  email: "sofia@brightideas.example.com",   phone: "+1 555-0102", company: bright,    tags: %w[partner],            starred: false, archived: false, follow_up_at: Date.current + 3,  notes: "Manages the Bright Ideas partner program. Keen on a revenue-share co-sell arrangement. Minor redlines on the partner agreement — close to countersigning."},
  {first_name: "Owen",    last_name: "Barnes",     email: "owen@cascade.example.com",        phone: "+1 555-0103", company: cascade,   tags: %w[lead prospect],      starred: false, archived: false, follow_up_at: Date.current - 1,  notes: "Evaluating three vendors — we're on the shortlist. Impressed by the analytics demo. Proposal with a 30-day free pilot sent."},
  {first_name: "Layla",   last_name: "Chen",       email: "layla@dune.example.com",          phone: "+1 555-0104", company: dune,      tags: %w[investor],           starred: true,  archived: false, follow_up_at: Date.current - 4,  notes: "Series A investor at Dune Ventures. Very warm on the deal — term sheet expected in 2 weeks. Intro'd us to the GP; meeting scheduled."},
  {first_name: "Marcus",  last_name: "Delacroix",  email: "marcus@echo.example.com",         phone: "+1 555-0105", company: echo,      tags: %w[customer],           starred: false, archived: false,                                 notes: "Had an API escalation last month — resolved quickly by engineering. Relationship is restored and he appreciated the fast response."},
  {first_name: "Priya",   last_name: "Evans",      email: "priya@frontier.example.com",      phone: "+1 555-0106", company: frontier,  tags: %w[friend],             starred: false, archived: false, follow_up_at: Date.current + 7,  notes: "Product designer at Frontier Labs. Exploring an advisory role — sent the standard advisory agreement. Needs to review it with her lawyer before committing."},
  {first_name: "Theo",    last_name: "Fischer",    email: "theo@gravity.example.com",        phone: nil,           company: gravity,   tags: %w[vendor],             starred: false, archived: false,                                 notes: "Handles vendor supply at Gravity Works. Contract renewed through end of year. Consistent, reliable — always meets SLA."},
  {first_name: "Aisha",   last_name: "Garcia",     email: "aisha@harbor.example.com",        phone: "+1 555-0108", company: harbor,    tags: %w[investor vip],       starred: true,  archived: false,                                 notes: "Seed-stage investor at Harbor Capital. Prefers async updates via email. Warm connection via Felix Park — keep her on the monthly investor update list."},
  {first_name: "Ravi",    last_name: "Hernandez",  email: "ravi@acme.example.com",           phone: "+1 555-0109", company: acme,      tags: %w[customer lead],      starred: false, archived: false, follow_up_at: Date.current + 4,  notes: "Onboarding onto the enterprise plan. Was blocked on IT approval for SSO — resolved, going live Monday. High expansion potential."},
  {first_name: "Nina",    last_name: "Ibrahim",    email: "nina@brightideas.example.com",    phone: "+1 555-0110", company: bright,    tags: %w[partner prospect],   starred: false, archived: false,                                 notes: "Exploring a joint webinar with Bright Ideas. Co-marketing proposal deck sent — awaiting feedback."},
  {first_name: "James",   last_name: "Johnson",    email: "james@personal.example.com",      phone: "+1 555-0111", company: nil,       tags: %w[friend],             starred: true,  archived: false,                                 notes: "Former Google engineer, now consulting independently. Referred two strong engineering candidates — send a thank-you. Good hiring resource."},
  {first_name: "Mei",     last_name: "Kim",        email: "mei@cascade.example.com",         phone: "+1 555-0112", company: cascade,   tags: %w[customer],           starred: false, archived: false,                                 notes: "Very satisfied customer — NPS 9. Wants to try the new reporting features in the next release. Shared beta release notes."},
  {first_name: "Luca",    last_name: "Laurent",    email: "luca@dune.example.com",           phone: "+1 555-0113", company: dune,      tags: %w[investor lead],      starred: false, archived: false,                                 notes: "LP at Dune Ventures — not a direct investor, but made a warm intro to a Dune GP. Partner meeting booked for next month."},
  {first_name: "Sara",    last_name: "Mitchell",   email: "sara@echo.example.com",           phone: "+1 555-0114", company: echo,      tags: %w[vendor],             starred: false, archived: false,                                 notes: "Handles infrastructure supply at Echo Systems. On-time deliveries, within spec. Q2 PO being raised after agreeing on revised pricing."},
  {first_name: "Ahmed",   last_name: "Nguyen",     email: "ahmed@frontier.example.com",      phone: "+1 555-0115", company: frontier,  tags: %w[prospect],           starred: false, archived: false,                                 notes: "Evaluating tools at Frontier Labs but budget is unconfirmed. Will circle back after their Q2 planning session. Sent a relevant case study."},
  {first_name: "Clara",   last_name: "Okonkwo",    email: "clara@gravity.example.com",       phone: "+1 555-0116", company: gravity,   tags: %w[customer partner],   starred: false, archived: false,                                 notes: "Handles vendor relations at Gravity Works. Integration is live and billing is running smoothly."},
  {first_name: "Felix",   last_name: "Park",       email: "felix@harbor.example.com",        phone: "+1 555-0117", company: harbor,    tags: %w[investor],           starred: true,  archived: false, follow_up_at: Date.current - 1,  notes: "Scout at Harbor Capital. Partner meeting confirmed for next month. Warm relationship — referred via a mutual YC connection. Sent the deal memo and traction metrics."},
  {first_name: "Yuki",    last_name: "Quinn",      email: "yuki@personal.example.com",       phone: nil,           company: nil,       tags: %w[friend],             starred: false, archived: false,                                 notes: "UX consultant, recently moved back to town. Open to a short freelance project — loop in the design team to discuss scope."},
  {first_name: "Diego",   last_name: "Rodriguez",  email: "diego@acme.example.com",          phone: "+1 555-0119", company: acme,      tags: %w[customer vip],       starred: false, archived: false,                                 notes: "Executive sponsor at Acme for the enterprise renewal. Wants custom SLAs in the contract — addendum sent to their legal team for review."},
  {first_name: "Amara",   last_name: "Santos",     email: "amara@bright.example.com",        phone: "+1 555-0120", company: bright,    tags: %w[lead],               starred: false, archived: false, follow_up_at: Date.current - 3,  notes: "Inbound lead who loved the reporting features demo. Proposal for €12k/year sent. Strong fit — follow up on decision."},
  {first_name: "Tom",     last_name: "Thompson",   email: "tom@old.example.com",             phone: nil,           company: nil,       tags: %w[customer],           starred: false, archived: true,                                  notes: "Account closed due to repeated ToS violations and persistent billing disputes. Archived — do not re-engage."},
  {first_name: "Julia",   last_name: "Ueda",       email: "julia@cascade.example.com",       phone: "+1 555-0122", company: cascade,   tags: %w[partner vip],        starred: false, archived: false,                                 notes: "Head of Partnerships at Cascade, introduced by the CEO. Wants to expand the integration and add a co-sell motion. Framework doc currently in legal review."},
  {first_name: "Kwame",   last_name: "Vance",      email: "kwame@dune.example.com",          phone: "+1 555-0123", company: dune,      tags: %w[investor prospect],  starred: true,  archived: false,                                 notes: "Investor at Dune Ventures, focused on fintech. Not a perfect fit right now — reconnect when we have stronger fintech use cases."},
  {first_name: "Nadia",   last_name: "Weber",      email: "nadia@echo.example.com",          phone: "+1 555-0124", company: echo,      tags: %w[customer lead],      starred: false, archived: false,                                 notes: "Manages a team of 15 at Echo Systems. High upgrade potential — sent the team vs. individual plan comparison. Good candidate for expansion."},
  {first_name: "Sam",     last_name: "Xavier",     email: "sam@old.example.com",             phone: nil,           company: nil,       tags: %w[vendor],             starred: false, archived: true,                                  notes: "Vendor contract terminated after multiple missed deliveries and no communication. Archived — do not renew."},
  {first_name: "Leila",   last_name: "Zhang",      email: "leila@frontier.example.com",      phone: "+1 555-0126", company: frontier,  tags: %w[customer partner],   starred: false, archived: false,                                 notes: "Happy customer at Frontier Labs. Wants better mobile app — shared the roadmap and she's satisfied to wait for the upcoming release."},
  # New contacts
  {first_name: "Isabelle", last_name: "Adeyemi",   email: "isabelle@indigo.example.com",     phone: "+1 555-0127", company: indigo,    tags: %w[customer vip],       starred: true,  archived: false, follow_up_at: Date.current + 5,  notes: "Head of Customer Success at Indigo, championing our product internally. Executive QBR was exceptional — verbally agreed to expand to 3 additional product lines. Waiting on legal for the addendum."},
  {first_name: "Marco",    last_name: "Bellini",   email: "marco@jasper.example.com",        phone: "+1 555-0128", company: jasper,    tags: %w[investor],           starred: false, archived: false, follow_up_at: Date.current + 10, notes: "Leads early-stage enterprise SaaS at Jasper Growth ($500k–$2M checks). References from Zara and Isabelle came back very positive. Term sheet expected within 10 days."},
  {first_name: "Suki",     last_name: "Chandra",   email: "suki@keystone.example.com",       phone: "+1 555-0129", company: keystone,  tags: %w[investor vip],       starred: true,  archived: false, follow_up_at: Date.current + 14, notes: "Managing Director at Keystone Ventures (Series A/B). IC approved our deal unanimously — now in due diligence. Data room shared, term sheet being drafted."},
  {first_name: "Eli",      last_name: "Darnell",   email: "eli@luminary.example.com",        phone: "+1 555-0130", company: luminary,  tags: %w[partner lead],       starred: false, archived: false,                                 notes: "Runs partnerships at Luminary Digital. Co-authorship and content syndication deal in negotiation. Updated proposal includes newsletter and podcast distribution channels."},
  {first_name: "Fatima",   last_name: "El-Amin",   email: "fatima@indigo.example.com",       phone: "+1 555-0131", company: indigo,    tags: %w[customer],           starred: false, archived: false,                                 notes: "Running a pilot for her ops team at Indigo via the employee referral program. 80% feature adoption in week one — strong upgrade candidate."},
  {first_name: "Gus",      last_name: "Fontaine",  email: "gus@personal.example.com",        phone: nil,           company: nil,       tags: %w[friend],             starred: false, archived: false,                                 notes: "Old university friend, now in data science at a hedge fund. Committed a $25k angel check — SAFE signed, countersigned, and cap table updated."},
  {first_name: "Hana",     last_name: "Goto",      email: "hana@jasper.example.com",         phone: "+1 555-0133", company: jasper,    tags: %w[prospect lead],      starred: false, archived: false, follow_up_at: Date.current - 2,  notes: "Evaluating tools for a 30-person marketing team at Jasper Growth. Sent a detailed feature comparison and ROI calculator. Leaning our way — needs a final pricing discussion."},
  {first_name: "Ivan",     last_name: "Horvath",   email: "ivan@keystone.example.com",       phone: "+1 555-0134", company: keystone,  tags: %w[investor],           starred: false, archived: false,                                 notes: "Later-stage focus at Keystone Ventures. Suggested re-engaging at $3M ARR. Sent a progress update showing $2.7M ARR and 15% MoM growth."},
  {first_name: "Jess",     last_name: "Iweala",    email: "jess@luminary.example.com",       phone: "+1 555-0135", company: luminary,  tags: %w[customer partner],   starred: false, archived: false,                                 notes: "Manages technology alliances at Luminary Digital. Joint data export integration in development — engineering kick-off done, beta launch targeted in 6 weeks."},
  {first_name: "Kofi",     last_name: "Jensen",    email: "kofi@personal.example.com",       phone: "+1 555-0136", company: nil,       tags: %w[friend vendor],      starred: false, archived: false,                                 notes: "Freelance video producer. Delivered an excellent 2-minute product explainer — approved with minor feedback, invoice paid. Great vendor to keep on file for future content."}
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
  {subject: zara, kind: "note",  body: "Discussed Q1 renewal — she's very happy with the service. Expecting to expand seats by 20%.", created_at: 3.days.ago},
  {subject: zara, kind: "call",  body: "Intro call went well. She's interested in our enterprise plan.", created_at: 2.weeks.ago},
  {subject: zara, kind: "email", body: "Sent over the enterprise pricing deck and case studies.", created_at: 10.days.ago},
  {subject: zara, kind: "note",  body: "Follow up on contract signing by end of month.", created_at: 1.day.ago},
  {subject: zara, kind: "call",  body: "Quick check-in — no blockers, contract going through legal.", created_at: 5.days.ago}
]

activities += [
  {subject: sofia, kind: "email", body: "Reached out about co-selling opportunities — she manages the Bright Ideas partner program.", created_at: 5.weeks.ago},
  {subject: sofia, kind: "call",  body: "Intro call — enthusiastic about a referral arrangement. Wants a revenue share model.", created_at: 4.weeks.ago},
  {subject: sofia, kind: "note",  body: "Draft a partner agreement template and share with legal before sending.", created_at: 3.weeks.ago},
  {subject: sofia, kind: "email", body: "Sent the draft partner agreement for her review.", created_at: 2.weeks.ago},
  {subject: sofia, kind: "call",  body: "She has minor redlines on the agreement — nothing blocking. Expecting countersign next week.", created_at: 4.days.ago}
]

activities += [
  {subject: owen, kind: "email", body: "Inbound inquiry via the website — interested in our mid-market plan.", created_at: 3.weeks.ago},
  {subject: owen, kind: "call",  body: "Discovery call — Cascade is evaluating three vendors. We're on the shortlist.", created_at: 2.weeks.ago},
  {subject: owen, kind: "note",  body: "He wants a custom demo focused on the analytics dashboard.", created_at: 10.days.ago},
  {subject: owen, kind: "call",  body: "Live demo went well — he's impressed. Sending a proposal next.", created_at: 5.days.ago},
  {subject: owen, kind: "email", body: "Sent the tailored proposal including a 30-day free pilot.", created_at: 2.days.ago}
]

activities += [
  {subject: layla, kind: "call",  body: "Series A pitch call — very positive! She wants to see the cap table.", created_at: 1.week.ago},
  {subject: layla, kind: "email", body: "Sent the investor deck and financial projections.", created_at: 6.days.ago},
  {subject: layla, kind: "note",  body: "Intro'd to their GP. Meeting scheduled for next Thursday.", created_at: 4.days.ago},
  {subject: layla, kind: "call",  body: "Follow-up call — she's in principle interested, term sheet in 2 weeks.", created_at: 2.days.ago}
]

activities += [
  {subject: marcus, kind: "call",  body: "Support escalation — API latency issue. Resolved by engineering.", created_at: 2.weeks.ago},
  {subject: marcus, kind: "email", body: "Post-incident report sent.", created_at: 10.days.ago},
  {subject: marcus, kind: "note",  body: "Satisfaction restored — he appreciated the quick turnaround.", created_at: 1.week.ago}
]

activities += [
  {subject: priya, kind: "note", body: "Met at a startup event — she's a product designer at Frontier.", created_at: 1.month.ago},
  {subject: priya, kind: "call", body: "Catchup call — she might be open to joining as a design advisor.", created_at: 2.weeks.ago},
  {subject: priya, kind: "note", body: "She asked for an advisory agreement template to review with her lawyer.", created_at: 1.week.ago},
  {subject: priya, kind: "email", body: "Sent the standard advisory agreement along with the equity grant details.", created_at: 4.days.ago}
]

activities += [
  {subject: theo, kind: "email", body: "Vendor onboarding email sent.", created_at: 2.months.ago},
  {subject: theo, kind: "note",  body: "First invoice approved and paid.", created_at: 6.weeks.ago},
  {subject: theo, kind: "call",  body: "Contract renewal discussion — same terms.", created_at: 3.weeks.ago},
  {subject: theo, kind: "email", body: "Renewal contract sent for signature.", created_at: 2.weeks.ago},
  {subject: theo, kind: "note",  body: "Signed and filed. Renewal runs through end of year.", created_at: 10.days.ago}
]

activities += [
  {subject: aisha, kind: "email", body: "Reached out via warm intro from Felix Park.", created_at: 3.weeks.ago},
  {subject: aisha, kind: "call",  body: "First call — great energy. She's looking at seed-stage deals.", created_at: 2.weeks.ago},
  {subject: aisha, kind: "note",  body: "She mentioned she prefers async updates via email.", created_at: 10.days.ago},
  {subject: aisha, kind: "email", body: "Monthly investor update sent.", created_at: 5.days.ago}
]

activities += [
  {subject: ravi, kind: "email", body: "Sent trial activation instructions.", created_at: 3.weeks.ago},
  {subject: ravi, kind: "call",  body: "Onboarding call — walked through the dashboard.", created_at: 2.weeks.ago},
  {subject: ravi, kind: "note",  body: "He's blocked on IT approval for SSO integration.", created_at: 1.week.ago},
  {subject: ravi, kind: "email", body: "Sent the SSO setup guide and IT checklist.", created_at: 5.days.ago},
  {subject: ravi, kind: "call",  body: "IT approved — going live next Monday.", created_at: 1.day.ago}
]

activities += [
  {subject: nina, kind: "email", body: "Introduction email — exploring a co-marketing opportunity.", created_at: 1.month.ago},
  {subject: nina, kind: "call",  body: "Discovery call — she's interested in a joint webinar.", created_at: 3.weeks.ago},
  {subject: nina, kind: "note",  body: "Draft the webinar proposal and send by Friday.", created_at: 2.weeks.ago},
  {subject: nina, kind: "email", body: "Sent the co-marketing proposal deck.", created_at: 1.week.ago}
]

activities += [
  {subject: james, kind: "note", body: "Caught up over coffee — he's consulting now after leaving Google.", created_at: 2.weeks.ago},
  {subject: james, kind: "call", body: "He might be able to help with hiring — referred two engineers.", created_at: 1.week.ago},
  {subject: james, kind: "note", body: "Send him a thank-you for the intros.", created_at: 3.days.ago}
]

activities += [
  {subject: mei, kind: "call",  body: "Quarterly business review — NPS 9, very satisfied.", created_at: 1.week.ago},
  {subject: mei, kind: "note",  body: "Wants to try the new reporting features in the next release.", created_at: 4.days.ago},
  {subject: mei, kind: "email", body: "Shared the beta release notes for the reporting module.", created_at: 2.days.ago}
]

activities += [
  {subject: luca, kind: "email", body: "Sent introductory email via AngelList.", created_at: 2.months.ago},
  {subject: luca, kind: "call",  body: "First call — he's primarily an LP, not a direct investor.", created_at: 6.weeks.ago},
  {subject: luca, kind: "note",  body: "May be able to intro to Dune GPs.", created_at: 1.month.ago},
  {subject: luca, kind: "email", body: "Sent warm intro request to the Dune GP he mentioned.", created_at: 3.weeks.ago},
  {subject: luca, kind: "note",  body: "Intro made — meeting booked for next month.", created_at: 2.weeks.ago}
]

activities += [
  {subject: sara, kind: "email", body: "Vendor kicked off — sent the initial scope and timelines.", created_at: 2.months.ago},
  {subject: sara, kind: "call",  body: "Kickoff call — she's handling infrastructure supply. First delivery in 6 weeks.", created_at: 7.weeks.ago},
  {subject: sara, kind: "note",  body: "First delivery arrived on time and within spec.", created_at: 1.month.ago},
  {subject: sara, kind: "email", body: "Requested a revised quote for Q2 volumes.", created_at: 3.weeks.ago},
  {subject: sara, kind: "call",  body: "Reviewed revised quote — agreed on pricing. PO being raised.", created_at: 1.week.ago}
]

activities += [
  {subject: ahmed, kind: "email", body: "Sent a cold outreach highlighting our startup discount program.", created_at: 1.month.ago},
  {subject: ahmed, kind: "call",  body: "Discovery call — Frontier Labs is in early evaluation. Budget not yet confirmed.", created_at: 3.weeks.ago},
  {subject: ahmed, kind: "note",  body: "He'll circle back after their Q2 planning session in two weeks.", created_at: 2.weeks.ago},
  {subject: ahmed, kind: "email", body: "Sent a case study relevant to their industry ahead of their planning session.", created_at: 10.days.ago}
]

activities += [
  {subject: clara, kind: "call",  body: "Partnership intro call — she handles vendor relations.", created_at: 1.month.ago},
  {subject: clara, kind: "email", body: "Sent integration documentation.", created_at: 3.weeks.ago},
  {subject: clara, kind: "note",  body: "Integration live — first invoice sent.", created_at: 1.week.ago}
]

activities += [
  {subject: felix, kind: "email", body: "Warm intro received from a mutual connection at YC.", created_at: 1.month.ago},
  {subject: felix, kind: "call",  body: "Initial call — he's a scout for Harbor Capital.", created_at: 3.weeks.ago},
  {subject: felix, kind: "note",  body: "Interested in B2B SaaS. Sending deal memo next week.", created_at: 2.weeks.ago},
  {subject: felix, kind: "email", body: "Sent the deal memo and traction metrics.", created_at: 10.days.ago},
  {subject: felix, kind: "call",  body: "Partner meeting confirmed for next month.", created_at: 3.days.ago}
]

activities += [
  {subject: yuki, kind: "note",  body: "Reconnected at a mutual friend's dinner party — she recently moved back to town.", created_at: 5.weeks.ago},
  {subject: yuki, kind: "email", body: "Sent a welcome-back note and suggested catching up over lunch.", created_at: 4.weeks.ago},
  {subject: yuki, kind: "call",  body: "Quick catch-up — she's freelancing in UX consulting now. Could be a resource.", created_at: 3.weeks.ago},
  {subject: yuki, kind: "note",  body: "Mentioned she's open to a short freelance project. Loop in the design team.", created_at: 2.weeks.ago}
]

activities += [
  {subject: diego, kind: "note",  body: "Executive sponsor for Acme's enterprise renewal.", created_at: 2.weeks.ago},
  {subject: diego, kind: "call",  body: "Strategy call — wants custom SLAs in the renewal contract.", created_at: 1.week.ago},
  {subject: diego, kind: "email", body: "Sent custom SLA addendum for legal review.", created_at: 3.days.ago}
]

activities += [
  {subject: amara, kind: "email", body: "Inbound lead — filled out the demo request form.", created_at: 2.weeks.ago},
  {subject: amara, kind: "call",  body: "Demo call — she loved the reporting features.", created_at: 10.days.ago},
  {subject: amara, kind: "note",  body: "Send proposal by end of week.", created_at: 5.days.ago},
  {subject: amara, kind: "email", body: "Proposal sent — €12k/year.", created_at: 3.days.ago}
]

activities += [
  {subject: tom, kind: "call",  body: "Support call — persistent complaints about billing. Offered a credit.", created_at: 6.months.ago},
  {subject: tom, kind: "email", body: "Sent formal notice that his account would be closed after repeated ToS violations.", created_at: 5.months.ago},
  {subject: tom, kind: "note",  body: "Account closed. Marked as archived — do not re-engage.", created_at: 5.months.ago}
]

activities += [
  {subject: julia, kind: "email", body: "Introduced by the Cascade CEO as the new Head of Partnerships.", created_at: 2.months.ago},
  {subject: julia, kind: "call",  body: "Intro call — she's keen to deepen the integration and explore bundled pricing.", created_at: 6.weeks.ago},
  {subject: julia, kind: "note",  body: "She wants a co-sell motion included in the partnership expansion.", created_at: 1.month.ago},
  {subject: julia, kind: "email", body: "Sent the updated partnership framework doc for her review.", created_at: 2.weeks.ago},
  {subject: julia, kind: "call",  body: "Review call — she's happy with the framework, routing to legal.", created_at: 4.days.ago}
]

activities += [
  {subject: kwame, kind: "email", body: "Cold outreach — referenced their portfolio company synergy.", created_at: 6.weeks.ago},
  {subject: kwame, kind: "call",  body: "Intro call — he focuses on fintech. May not be the right fit.", created_at: 5.weeks.ago},
  {subject: kwame, kind: "note",  body: "Reconnect when we have more fintech use cases.", created_at: 4.weeks.ago}
]

activities += [
  {subject: nadia, kind: "email", body: "Welcome email sent after trial signup.", created_at: 2.weeks.ago},
  {subject: nadia, kind: "call",  body: "Discovery call — she manages a team of 15.", created_at: 10.days.ago},
  {subject: nadia, kind: "note",  body: "Upgrade potential is high — send team plan comparison.", created_at: 1.week.ago},
  {subject: nadia, kind: "email", body: "Sent the team vs. individual plan comparison sheet.", created_at: 4.days.ago}
]

activities += [
  {subject: sam, kind: "email", body: "Onboarding email sent for the hardware supply contract.", created_at: 8.months.ago},
  {subject: sam, kind: "call",  body: "Contract kick-off call. Agreed on delivery windows.", created_at: 7.months.ago},
  {subject: sam, kind: "note",  body: "Multiple missed deliveries and no communication. Escalated internally.", created_at: 6.months.ago},
  {subject: sam, kind: "email", body: "Sent formal termination notice for the vendor agreement.", created_at: 5.months.ago},
  {subject: sam, kind: "note",  body: "Vendor offboarded. Contact archived — do not renew.", created_at: 5.months.ago}
]

activities += [
  {subject: leila, kind: "email", body: "Introduced to the new support tier.", created_at: 3.weeks.ago},
  {subject: leila, kind: "call",  body: "QBR call — she's happy but wants better mobile app.", created_at: 2.weeks.ago},
  {subject: leila, kind: "note",  body: "Shared mobile roadmap — she's satisfied to wait.", created_at: 1.week.ago}
]

# ── New contacts' activities ──────────────────────────────────────────────────

activities += [
  {subject: isabelle, kind: "email", body: "Intro email from the Indigo CEO — she's their Head of Customer Success.", created_at: 5.weeks.ago},
  {subject: isabelle, kind: "call",  body: "First call — she's championing our product internally and wants an executive alignment meeting.", created_at: 4.weeks.ago},
  {subject: isabelle, kind: "note",  body: "Arrange a QBR with their C-suite and our VP of CS.", created_at: 3.weeks.ago},
  {subject: isabelle, kind: "call",  body: "Executive QBR completed — exceptional feedback. Expansion opportunity confirmed.", created_at: 2.weeks.ago},
  {subject: isabelle, kind: "email", body: "Sent expansion proposal covering 3 additional product lines.", created_at: 1.week.ago},
  {subject: isabelle, kind: "note",  body: "She verbally agreed to expand. Waiting on legal to circulate the addendum.", created_at: 2.days.ago}
]

activities += [
  {subject: marco, kind: "email", body: "Reached out via warm intro from a Jasper Growth portfolio founder.", created_at: 7.weeks.ago},
  {subject: marco, kind: "call",  body: "Intro call — he leads early-stage investments in enterprise SaaS.", created_at: 6.weeks.ago},
  {subject: marco, kind: "note",  body: "Jasper Growth typically writes $500k–$2M checks. Good fit for our bridge round.", created_at: 5.weeks.ago},
  {subject: marco, kind: "email", body: "Sent the investor deck and latest financials.", created_at: 4.weeks.ago},
  {subject: marco, kind: "call",  body: "Second call — he wants to run reference checks with two customers.", created_at: 3.weeks.ago},
  {subject: marco, kind: "note",  body: "Intro'd Zara Ahmed and Isabelle Adeyemi as references.", created_at: 2.weeks.ago},
  {subject: marco, kind: "email", body: "References came back positive. Term sheet expected within 10 days.", created_at: 5.days.ago}
]

activities += [
  {subject: suki, kind: "email", body: "Introduction from a GP at Keystone Ventures following a conference talk.", created_at: 2.months.ago},
  {subject: suki, kind: "call",  body: "First call — she's a managing director focused on Series A/B. Very interested.", created_at: 6.weeks.ago},
  {subject: suki, kind: "note",  body: "She wants to run the deal through her investment committee next month.", created_at: 5.weeks.ago},
  {subject: suki, kind: "email", body: "Sent the updated pitch deck and a customer cohort analysis.", created_at: 4.weeks.ago},
  {subject: suki, kind: "call",  body: "IC prep call — walked her through unit economics and go-to-market.", created_at: 3.weeks.ago},
  {subject: suki, kind: "note",  body: "IC meeting happened — positive outcome. Moving to due diligence.", created_at: 2.weeks.ago},
  {subject: suki, kind: "email", body: "Kicked off due diligence — shared data room access.", created_at: 1.week.ago},
  {subject: suki, kind: "call",  body: "DD check-in — no blockers flagged. Term sheet being drafted.", created_at: 2.days.ago}
]

activities += [
  {subject: eli, kind: "email", body: "Reached out after seeing Luminary Digital's blog post on AI-assisted marketing.", created_at: 6.weeks.ago},
  {subject: eli, kind: "call",  body: "Discovery call — he runs partnerships at Luminary and wants to explore a content syndication deal.", created_at: 5.weeks.ago},
  {subject: eli, kind: "note",  body: "Draft a co-authorship proposal for the quarterly trend report.", created_at: 4.weeks.ago},
  {subject: eli, kind: "email", body: "Sent the co-authorship proposal with revenue share terms.", created_at: 3.weeks.ago},
  {subject: eli, kind: "call",  body: "He reviewed the proposal — wants to broaden the distribution channels.", created_at: 2.weeks.ago},
  {subject: eli, kind: "email", body: "Updated proposal sent including newsletter and podcast distribution.", created_at: 1.week.ago}
]

activities += [
  {subject: fatima, kind: "email", body: "Welcome email sent after she signed up via the Indigo employee referral program.", created_at: 3.weeks.ago},
  {subject: fatima, kind: "call",  body: "Onboarding call — she's running a pilot for her ops team.", created_at: 2.weeks.ago},
  {subject: fatima, kind: "note",  body: "Pilot is going well — 80% feature adoption in week one.", created_at: 10.days.ago},
  {subject: fatima, kind: "email", body: "Sent a mid-pilot health check and suggested upgrading to the full plan.", created_at: 5.days.ago}
]

activities += [
  {subject: gus, kind: "note",  body: "Old friend from university — works in data science at a hedge fund now.", created_at: 3.months.ago},
  {subject: gus, kind: "call",  body: "Catch-up call — he's interested in angel investing and asked about our round.", created_at: 6.weeks.ago},
  {subject: gus, kind: "email", body: "Sent our SAFE template and a short investment memo.", created_at: 5.weeks.ago},
  {subject: gus, kind: "note",  body: "He committed to a $25k angel check. Docs signed and countersigned.", created_at: 4.weeks.ago},
  {subject: gus, kind: "email", body: "Sent the cap table update confirming his equity stake.", created_at: 3.weeks.ago}
]

activities += [
  {subject: hana, kind: "email", body: "Inbound lead from the Jasper Growth portfolio newsletter.", created_at: 4.weeks.ago},
  {subject: hana, kind: "call",  body: "Discovery call — she's evaluating tools for a 30-person marketing team.", created_at: 3.weeks.ago},
  {subject: hana, kind: "note",  body: "She wants a side-by-side comparison with their current vendor.", created_at: 2.weeks.ago},
  {subject: hana, kind: "email", body: "Sent a detailed feature comparison matrix and ROI calculator.", created_at: 10.days.ago},
  {subject: hana, kind: "call",  body: "Follow-up call — she's leaning in our favor. Wants a final pricing discussion.", created_at: 3.days.ago}
]

activities += [
  {subject: ivan, kind: "email", body: "Cold outreach — identified Keystone Ventures as a strategic fit for our growth round.", created_at: 2.months.ago},
  {subject: ivan, kind: "call",  body: "Intro call — he primarily leads later-stage deals, but flagged interest in our space.", created_at: 7.weeks.ago},
  {subject: ivan, kind: "note",  body: "He suggested re-engaging when ARR reaches $3M — noted for follow-up.", created_at: 6.weeks.ago},
  {subject: ivan, kind: "email", body: "Sent a progress update: ARR now at $2.7M and growing 15% MoM.", created_at: 2.weeks.ago}
]

activities += [
  {subject: jess, kind: "email", body: "Intro email — Luminary Digital was referred as a potential integration partner.", created_at: 7.weeks.ago},
  {subject: jess, kind: "call",  body: "Partnership discovery call — she manages Luminary's technology alliances.", created_at: 6.weeks.ago},
  {subject: jess, kind: "note",  body: "She wants a joint integration that lets Luminary's clients export data into our platform.", created_at: 5.weeks.ago},
  {subject: jess, kind: "email", body: "Sent the API documentation and a draft integration spec.", created_at: 4.weeks.ago},
  {subject: jess, kind: "call",  body: "Technical review call with engineering reps from both sides — scope confirmed.", created_at: 3.weeks.ago},
  {subject: jess, kind: "note",  body: "Engineering kick-off scheduled. Target beta launch in 6 weeks.", created_at: 2.weeks.ago},
  {subject: jess, kind: "email", body: "Mid-sprint update sent — integration is on track for beta.", created_at: 3.days.ago}
]

activities += [
  {subject: kofi, kind: "note",  body: "Met at a community meetup — he does freelance video production.", created_at: 2.months.ago},
  {subject: kofi, kind: "call",  body: "Exploratory call about potential video content for our marketing.", created_at: 6.weeks.ago},
  {subject: kofi, kind: "email", body: "Sent a creative brief for a 2-minute product explainer video.", created_at: 5.weeks.ago},
  {subject: kofi, kind: "note",  body: "He delivered a draft — quality is excellent, approved with minor feedback.", created_at: 3.weeks.ago},
  {subject: kofi, kind: "email", body: "Sent final approval and invoice payment confirmation.", created_at: 2.weeks.ago}
]

Activity.create!(activities.map { |h| h.merge(user: demo_user) })

# ── Direct company activities ─────────────────────────────────────────────────

company_activities = []

company_activities += [
  {subject: acme,     kind: "note",  body: "Enterprise account review: ARR $240k. Expansion of 20% seats confirmed for next quarter.", created_at: 1.week.ago},
  {subject: acme,     kind: "email", body: "Sent annual business review deck and proposed renewal terms to the procurement team.", created_at: 2.weeks.ago},
  {subject: acme,     kind: "call",  body: "Quarterly check-in with the Acme leadership team — roadmap alignment and SLA review.", created_at: 1.month.ago}
]

company_activities += [
  {subject: bright,   kind: "note",  body: "Partner program onboarding completed. Revenue share agreement signed.", created_at: 2.weeks.ago},
  {subject: bright,   kind: "email", body: "Sent co-marketing launch plan and brand assets for the joint campaign.", created_at: 3.weeks.ago}
]

company_activities += [
  {subject: cascade,  kind: "call",  body: "Final vendor shortlist review call with their procurement lead — positive outcome.", created_at: 1.week.ago},
  {subject: cascade,  kind: "note",  body: "RFP response submitted — covering pricing, security, and support SLAs.", created_at: 2.weeks.ago}
]

company_activities += [
  {subject: dune,     kind: "email", body: "Sent updated cap table and financial model ahead of term sheet negotiations.", created_at: 3.days.ago},
  {subject: dune,     kind: "note",  body: "Series A diligence underway — legal working on reps and warranties.", created_at: 1.week.ago}
]

company_activities += [
  {subject: echo,     kind: "note",  body: "Post-incident review completed. Engineering shipped a hotfix; SLA credit issued.", created_at: 2.weeks.ago},
  {subject: echo,     kind: "email", body: "Sent updated MSA with improved uptime guarantees for renewal.", created_at: 3.weeks.ago}
]

company_activities += [
  {subject: frontier, kind: "email", body: "Sent tailored case study for the healthcare workflow automation use case.", created_at: 1.week.ago},
  {subject: frontier, kind: "note",  body: "Budget review scheduled for mid-Q2. Decision expected 4–6 weeks.", created_at: 2.weeks.ago}
]

company_activities += [
  {subject: gravity,  kind: "call",  body: "Annual vendor review — performance rated satisfactory. Contract auto-renewed.", created_at: 1.month.ago},
  {subject: gravity,  kind: "note",  body: "Updated billing contact and confirmed new PO number for FY.", created_at: 3.weeks.ago}
]

company_activities += [
  {subject: harbor,   kind: "email", body: "Sent investor update: Q1 metrics, growth trajectory, and use of funds.", created_at: 1.week.ago},
  {subject: harbor,   kind: "note",  body: "Partner presentation scheduled for next month — preparing executive summary.", created_at: 10.days.ago}
]

company_activities += [
  {subject: indigo,   kind: "call",  body: "Expansion scoping call with Indigo leadership — 3 additional product lines approved in principle.", created_at: 1.week.ago},
  {subject: indigo,   kind: "email", body: "Sent formal expansion proposal with updated pricing and onboarding timeline.", created_at: 2.weeks.ago}
]

company_activities += [
  {subject: jasper,   kind: "note",  body: "Reference checks completed. Zara Ahmed and Isabelle Adeyemi gave strong endorsements.", created_at: 1.week.ago},
  {subject: jasper,   kind: "email", body: "Sent updated investor deck reflecting March ARR milestone.", created_at: 2.weeks.ago}
]

company_activities += [
  {subject: keystone, kind: "note",  body: "Data room access granted. Legal and financial diligence in progress.", created_at: 5.days.ago},
  {subject: keystone, kind: "call",  body: "IC outcome call — unanimous approval to proceed. Term sheet being drafted.", created_at: 1.week.ago}
]

company_activities += [
  {subject: luminary, kind: "email", body: "Sent the final integration spec and API changelog for the data export connector.", created_at: 1.week.ago},
  {subject: luminary, kind: "note",  body: "Content syndication agreement signed. First joint article goes live next month.", created_at: 2.weeks.ago}
]

Activity.create!(company_activities.map { |h| h.merge(user: demo_user) })

# ── Deals ─────────────────────────────────────────────────────────────────────

Deal.create!([
  # Lead stage — early prospects
  {
    title: "Frontier Labs — SaaS Platform Pilot",
    stage: "lead",
    value_cents: 18_000_00,
    contact: ahmed,
    company: frontier,
    notes: "Inbound interest from Frontier Labs. Budget not confirmed yet — following up after their Q2 planning session."
  },
  {
    title: "Gravity Works — Manufacturing Analytics",
    stage: "lead",
    value_cents: 9_500_00,
    contact: clara,
    company: gravity,
    notes: "Identified expansion opportunity for analytics module. Clara manages vendor relations — good internal champion."
  },
  {
    title: "Echo Systems — Team Plan Upgrade",
    stage: "lead",
    value_cents: 6_000_00,
    contact: nadia,
    company: echo,
    notes: "Nadia manages a team of 15. Sent the team vs. individual plan comparison. Strong upgrade candidate."
  },
  # Qualified stage — initial contact made, budget confirmed
  {
    title: "Cascade Partners — Mid-Market Platform",
    stage: "qualified",
    value_cents: 36_000_00,
    contact: owen,
    company: cascade,
    notes: "Owen is evaluating three vendors — we're on the shortlist. Impressed by the analytics demo."
  },
  {
    title: "Bright Ideas — Co-Sell Partnership",
    stage: "qualified",
    value_cents: 24_000_00,
    contact: sofia,
    company: bright,
    notes: "Revenue-share co-sell arrangement. Minor redlines on the partner agreement — close to countersigning."
  },
  {
    title: "Luminary Digital — Content Syndication Deal",
    stage: "qualified",
    value_cents: 15_000_00,
    contact: eli,
    company: luminary,
    notes: "Content syndication and data export integration both in progress. Updated proposal includes newsletter and podcast distribution."
  },
  {
    title: "Jasper Growth — Marketing Team Seat Expansion",
    stage: "qualified",
    value_cents: 21_600_00,
    contact: hana,
    company: jasper,
    notes: "Evaluating tools for a 30-person marketing team. Sent feature comparison and ROI calculator. Leaning our way."
  },
  # Proposal stage — proposal sent, awaiting decision
  {
    title: "Acme Corp — Enterprise Renewal + Expansion",
    stage: "proposal",
    value_cents: 288_000_00,
    contact: zara,
    company: acme,
    notes: "Enterprise renewal with 20% seat expansion. Custom SLA addendum sent to Acme legal. Diego Rodriguez is executive sponsor."
  },
  {
    title: "Indigo Solutions — 3-Product Line Expansion",
    stage: "proposal",
    value_cents: 96_000_00,
    contact: isabelle,
    company: indigo,
    notes: "Executive QBR exceptional. Isabelle verbally agreed to expand. Formal addendum with legal."
  },
  {
    title: "Amara Santos — Reporting Features Deal",
    stage: "proposal",
    value_cents: 14_400_00,
    contact: amara,
    company: bright,
    notes: "Inbound lead who loved the reporting features demo. Proposal for €12k/year sent. Strong fit."
  },
  # Closed Won
  {
    title: "Harbor Capital — Seed Investor Partnership",
    stage: "closed_won",
    value_cents: 50_000_00,
    closed_at: Date.current - 30,
    contact: aisha,
    company: harbor,
    notes: "Seed-stage partnership confirmed. Aisha and Felix Park on the monthly investor update."
  },
  {
    title: "Luminary Digital — Integration Partnership",
    stage: "closed_won",
    value_cents: 30_000_00,
    closed_at: Date.current - 14,
    contact: jess,
    company: luminary,
    notes: "Joint data export integration live. Content syndication agreement signed. First joint article goes live next month."
  },
  {
    title: "Gus Fontaine — Angel Investment",
    stage: "closed_won",
    value_cents: 25_000_00,
    closed_at: Date.current - 21,
    contact: gus,
    company: nil,
    notes: "Angel SAFE signed and countersigned. Cap table updated."
  },
  {
    title: "Gravity Works — Annual Vendor Contract Renewal",
    stage: "closed_won",
    value_cents: 42_000_00,
    closed_at: Date.current - 60,
    contact: theo,
    company: gravity,
    notes: "Contract renewed through end of year. Reliable supplier — consistently meets SLA."
  },
  # Closed Lost
  {
    title: "Kwame Vance — Dune Ventures Investment",
    stage: "closed_lost",
    value_cents: 500_000_00,
    closed_at: Date.current - 45,
    contact: kwame,
    company: dune,
    notes: "Not a perfect fit for Dune's fintech portfolio right now. Reconnect when we have stronger fintech use cases."
  },
  {
    title: "Tom Thompson — Customer Account",
    stage: "closed_lost",
    value_cents: 8_400_00,
    closed_at: Date.current - 90,
    contact: tom,
    company: nil,
    notes: "Account closed due to repeated ToS violations and billing disputes. Do not re-engage."
  }
].map { |h| h.merge(user: demo_user) })

# ── Deal Activities ────────────────────────────────────────────────────────────

deals_by_title = Deal.all.index_by(&:title)

deal_activities = []

# Lead: Frontier Labs — SaaS Platform Pilot
deal_activities += [
  {subject: deals_by_title["Frontier Labs — SaaS Platform Pilot"], kind: "call",  body: "Intro call with Ahmed Nguyen — confirmed Frontier Labs is evaluating tools post-Q2 planning. Budget conversation tabled for now.", created_at: 4.weeks.ago},
  {subject: deals_by_title["Frontier Labs — SaaS Platform Pilot"], kind: "email", body: "Sent a relevant case study on similar SaaS platform pilots to build credibility while budget is unconfirmed.", created_at: 3.weeks.ago},
  {subject: deals_by_title["Frontier Labs — SaaS Platform Pilot"], kind: "note",  body: "Ahmed mentioned Q2 planning session wraps mid-month. Circle back then to re-qualify budget and timeline.", created_at: 2.weeks.ago}
]

# Lead: Gravity Works — Manufacturing Analytics
deal_activities += [
  {subject: deals_by_title["Gravity Works — Manufacturing Analytics"], kind: "call",  body: "Exploratory call with Clara Okonkwo — she confirmed interest in the analytics module for operations reporting.", created_at: 5.weeks.ago},
  {subject: deals_by_title["Gravity Works — Manufacturing Analytics"], kind: "email", body: "Sent manufacturing analytics one-pager and a pricing estimate for the add-on module.", created_at: 4.weeks.ago},
  {subject: deals_by_title["Gravity Works — Manufacturing Analytics"], kind: "note",  body: "Clara is a strong internal champion but needs sign-off from the operations director. Following up next week.", created_at: 3.weeks.ago}
]

# Lead: Echo Systems — Team Plan Upgrade
deal_activities += [
  {subject: deals_by_title["Echo Systems — Team Plan Upgrade"], kind: "email", body: "Sent Nadia Weber the team vs. individual plan comparison highlighting per-seat savings at 15+ seats.", created_at: 3.weeks.ago},
  {subject: deals_by_title["Echo Systems — Team Plan Upgrade"], kind: "call",  body: "Spoke with Nadia — she's keen but wants to confirm headcount before committing. Team is currently 15, may grow to 20.", created_at: 2.weeks.ago},
  {subject: deals_by_title["Echo Systems — Team Plan Upgrade"], kind: "note",  body: "Good upgrade candidate. Nadia said she'd bring it to her manager this week. Check back Thursday.", created_at: 1.week.ago}
]

# Qualified: Cascade Partners — Mid-Market Platform
deal_activities += [
  {subject: deals_by_title["Cascade Partners — Mid-Market Platform"], kind: "call",  body: "Discovery call with Owen Barnes — confirmed budget approved and timeline for decision by end of quarter.", created_at: 6.weeks.ago},
  {subject: deals_by_title["Cascade Partners — Mid-Market Platform"], kind: "email", body: "Sent full proposal including 30-day free pilot offer and tailored onboarding plan.", created_at: 5.weeks.ago},
  {subject: deals_by_title["Cascade Partners — Mid-Market Platform"], kind: "call",  body: "Follow-up call — Owen says we're on the shortlist of 3. Analytics demo particularly well received.", created_at: 3.weeks.ago},
  {subject: deals_by_title["Cascade Partners — Mid-Market Platform"], kind: "note",  body: "Owen's final evaluation expected this week. Julia Ueda (Head of Partnerships) is also reviewing the integration terms.", created_at: 1.week.ago}
]

# Qualified: Bright Ideas — Co-Sell Partnership
deal_activities += [
  {subject: deals_by_title["Bright Ideas — Co-Sell Partnership"], kind: "email", body: "Sent revenue-share partner agreement draft to Sofia Andersson for initial review.", created_at: 5.weeks.ago},
  {subject: deals_by_title["Bright Ideas — Co-Sell Partnership"], kind: "call",  body: "Call with Sofia to walk through the redlines — two minor clauses on exclusivity and reporting cadence to resolve.", created_at: 3.weeks.ago},
  {subject: deals_by_title["Bright Ideas — Co-Sell Partnership"], kind: "note",  body: "Revised agreement sent with redlines addressed. Sofia said legal should countersign within the week.", created_at: 1.week.ago}
]

# Qualified: Luminary Digital — Content Syndication Deal
deal_activities += [
  {subject: deals_by_title["Luminary Digital — Content Syndication Deal"], kind: "call",  body: "Discovery call with Eli Darnell — confirmed interest in both content syndication and newsletter distribution.", created_at: 4.weeks.ago},
  {subject: deals_by_title["Luminary Digital — Content Syndication Deal"], kind: "email", body: "Updated proposal sent including podcast distribution channel — Eli was excited about the reach potential.", created_at: 3.weeks.ago},
  {subject: deals_by_title["Luminary Digital — Content Syndication Deal"], kind: "note",  body: "Eli circulated the updated proposal to his director. Decision expected after their monthly editorial planning meeting.", created_at: 2.weeks.ago}
]

# Qualified: Jasper Growth — Marketing Team Seat Expansion
deal_activities += [
  {subject: deals_by_title["Jasper Growth — Marketing Team Seat Expansion"], kind: "email", body: "Sent Hana Goto a detailed feature comparison and ROI calculator tailored to a 30-seat marketing team.", created_at: 5.weeks.ago},
  {subject: deals_by_title["Jasper Growth — Marketing Team Seat Expansion"], kind: "call",  body: "Spoke with Hana — she's leaning our way but has a final pricing discussion with her VP before committing.", created_at: 3.weeks.ago},
  {subject: deals_by_title["Jasper Growth — Marketing Team Seat Expansion"], kind: "note",  body: "Hana confirmed team is growing from 25 to 30 seats. VP meeting scheduled for Thursday — expect a verbal yes or final objections then.", created_at: 2.weeks.ago}
]

# Proposal: Acme Corp — Enterprise Renewal + Expansion
deal_activities += [
  {subject: deals_by_title["Acme Corp — Enterprise Renewal + Expansion"], kind: "call",  body: "Discovery call with Zara Ahmed — confirmed 20% seat expansion intent and that Diego Rodriguez is the executive sponsor.", created_at: 3.weeks.ago},
  {subject: deals_by_title["Acme Corp — Enterprise Renewal + Expansion"], kind: "email", body: "Sent updated enterprise pricing with volume discount applied for the expanded seat count.", created_at: 2.weeks.ago},
  {subject: deals_by_title["Acme Corp — Enterprise Renewal + Expansion"], kind: "note",  body: "Diego Rodriguez reviewing the custom SLA addendum with Acme legal. Zara expects countersign by month-end.", created_at: 1.week.ago}
]

# Proposal: Indigo Solutions — 3-Product Line Expansion
deal_activities += [
  {subject: deals_by_title["Indigo Solutions — 3-Product Line Expansion"], kind: "call",  body: "Executive QBR with Isabelle Adeyemi — exceptional outcome. Verbally agreed to expand to 3 additional product lines.", created_at: 4.weeks.ago},
  {subject: deals_by_title["Indigo Solutions — 3-Product Line Expansion"], kind: "email", body: "Sent formal expansion addendum to Indigo legal following Isabelle's verbal agreement.", created_at: 3.weeks.ago},
  {subject: deals_by_title["Indigo Solutions — 3-Product Line Expansion"], kind: "note",  body: "Indigo legal requested one clarification on data processing terms — sent response same day. Addendum expected back within the week.", created_at: 1.week.ago}
]

# Proposal: Amara Santos — Reporting Features Deal
deal_activities += [
  {subject: deals_by_title["Amara Santos — Reporting Features Deal"], kind: "call",  body: "Inbound demo request — Amara Santos was particularly impressed by the reporting and dashboard features.", created_at: 4.weeks.ago},
  {subject: deals_by_title["Amara Santos — Reporting Features Deal"], kind: "email", body: "Sent €12k/year proposal tailored to her team's reporting use case with a 14-day trial offer.", created_at: 3.weeks.ago},
  {subject: deals_by_title["Amara Santos — Reporting Features Deal"], kind: "note",  body: "Amara said she's very keen — waiting on budget confirmation from her manager. Strong fit; follow up by end of week.", created_at: 2.weeks.ago}
]

# Closed Won: Harbor Capital — Seed Investor Partnership
deal_activities += [
  {subject: deals_by_title["Harbor Capital — Seed Investor Partnership"], kind: "call",  body: "Partnership intro call with Aisha Garcia — confirmed seed-stage structure and monthly investor update cadence.", created_at: 8.weeks.ago},
  {subject: deals_by_title["Harbor Capital — Seed Investor Partnership"], kind: "email", body: "Sent SAFE agreement and cap table to Aisha and Felix Park for review.", created_at: 7.weeks.ago},
  {subject: deals_by_title["Harbor Capital — Seed Investor Partnership"], kind: "note",  body: "SAFE signed and countersigned. Cap table updated. Aisha added to monthly investor update list.", created_at: 30.days.ago}
]

# Closed Won: Luminary Digital — Integration Partnership
deal_activities += [
  {subject: deals_by_title["Luminary Digital — Integration Partnership"], kind: "call",  body: "Kick-off call with Jess Iweala — scoped the data export integration and aligned on a 6-week beta launch target.", created_at: 10.weeks.ago},
  {subject: deals_by_title["Luminary Digital — Integration Partnership"], kind: "email", body: "Sent signed partnership agreement and engineering spec to Jess to share with her technical team.", created_at: 8.weeks.ago},
  {subject: deals_by_title["Luminary Digital — Integration Partnership"], kind: "note",  body: "Integration live. Content syndication agreement signed. First joint article scheduled for next month.", created_at: 14.days.ago}
]

# Closed Won: Gus Fontaine — Angel Investment
deal_activities += [
  {subject: deals_by_title["Gus Fontaine — Angel Investment"], kind: "call",  body: "Caught up with Gus over lunch — pitched the angel round and he committed $25k on the spot.", created_at: 8.weeks.ago},
  {subject: deals_by_title["Gus Fontaine — Angel Investment"], kind: "email", body: "Sent SAFE document to Gus for review and signature.", created_at: 7.weeks.ago},
  {subject: deals_by_title["Gus Fontaine — Angel Investment"], kind: "note",  body: "SAFE signed and countersigned. Cap table updated. Great to have Gus in the round.", created_at: 21.days.ago}
]

# Closed Won: Gravity Works — Annual Vendor Contract Renewal
deal_activities += [
  {subject: deals_by_title["Gravity Works — Annual Vendor Contract Renewal"], kind: "call",  body: "Annual review call with Theo Fischer — discussed SLA performance and confirmed intent to renew.", created_at: 12.weeks.ago},
  {subject: deals_by_title["Gravity Works — Annual Vendor Contract Renewal"], kind: "email", body: "Sent renewed vendor contract to Theo with updated pricing terms for the full year.", created_at: 11.weeks.ago},
  {subject: deals_by_title["Gravity Works — Annual Vendor Contract Renewal"], kind: "note",  body: "Contract signed. Theo confirmed renewed through year-end. Reliable vendor — consistently meets SLA.", created_at: 60.days.ago}
]

# Closed Lost: Kwame Vance — Dune Ventures Investment
deal_activities += [
  {subject: deals_by_title["Kwame Vance — Dune Ventures Investment"], kind: "call",  body: "Intro call with Kwame Vance at Dune Ventures — interest in the deal but flagged the fintech portfolio fit concern.", created_at: 12.weeks.ago},
  {subject: deals_by_title["Kwame Vance — Dune Ventures Investment"], kind: "email", body: "Sent updated pitch deck with stronger fintech angle — tried to address the portfolio fit concern.", created_at: 10.weeks.ago},
  {subject: deals_by_title["Kwame Vance — Dune Ventures Investment"], kind: "note",  body: "Kwame passed — not a fit for Dune's fintech portfolio at this stage. Mark as lost and reconnect when we have stronger fintech use cases.", created_at: 45.days.ago}
]

# Closed Lost: Tom Thompson — Customer Account
deal_activities += [
  {subject: deals_by_title["Tom Thompson — Customer Account"], kind: "call",  body: "Account review call flagged repeated ToS violations. Warned that continued issues would result in account closure.", created_at: 16.weeks.ago},
  {subject: deals_by_title["Tom Thompson — Customer Account"], kind: "email", body: "Formal notice sent regarding billing disputes and ToS violations — final warning before closure.", created_at: 14.weeks.ago},
  {subject: deals_by_title["Tom Thompson — Customer Account"], kind: "note",  body: "Account closed after no resolution. Marked lost. Do not re-engage.", created_at: 90.days.ago}
]

Activity.create!(deal_activities.map { |h| h.merge(user: demo_user) })

puts "Seeded: #{Company.count} companies, #{Contact.count} contacts, #{Activity.count} activities, #{Deal.count} deals"
