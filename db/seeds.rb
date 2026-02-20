# frozen_string_literal: true

# Seed data for personal CRM demo

# Clear existing CRM data
Activity.delete_all
Contact.delete_all
Company.delete_all

# ── Companies ────────────────────────────────────────────────────────────────

companies = Company.create!([
  { name: "Acme Corp",        website: "https://acme.example.com" },
  { name: "Bright Ideas Ltd", website: "https://brightideas.example.com" },
  { name: "Cascade Partners", website: "https://cascade.example.com" },
  { name: "Dune Ventures",    website: "https://duneventures.example.com" },
  { name: "Echo Systems",     website: "https://echosystems.example.com" },
  { name: "Frontier Labs",    website: "https://frontierlabs.example.com" },
  { name: "Gravity Works",    website: nil },
  { name: "Harbor Capital",   website: "https://harborcapital.example.com" },
])

acme, bright, cascade, dune, echo, frontier, gravity, harbor = companies

# ── Contacts ─────────────────────────────────────────────────────────────────

contacts_data = [
  { first_name: "Zara",    last_name: "Ahmed",      email: "zara@acme.example.com",         phone: "+1 555-0101", company: acme,     tags: %w[customer vip],      starred: true,  archived: false },
  { first_name: "Sofia",   last_name: "Andersson",  email: "sofia@brightideas.example.com", phone: "+1 555-0102", company: bright,   tags: %w[partner],           starred: false, archived: false },
  { first_name: "Owen",    last_name: "Barnes",     email: "owen@cascade.example.com",      phone: "+1 555-0103", company: cascade,  tags: %w[lead prospect],     starred: false, archived: false },
  { first_name: "Layla",   last_name: "Chen",       email: "layla@dune.example.com",        phone: "+1 555-0104", company: dune,     tags: %w[investor],          starred: true,  archived: false },
  { first_name: "Marcus",  last_name: "Delacroix",  email: "marcus@echo.example.com",       phone: "+1 555-0105", company: echo,     tags: %w[customer],          starred: false, archived: false },
  { first_name: "Priya",   last_name: "Evans",      email: "priya@frontier.example.com",    phone: "+1 555-0106", company: frontier, tags: %w[friend],            starred: false, archived: false },
  { first_name: "Theo",    last_name: "Fischer",    email: "theo@gravity.example.com",      phone: nil,           company: gravity,  tags: %w[vendor],            starred: false, archived: false },
  { first_name: "Aisha",   last_name: "Garcia",     email: "aisha@harbor.example.com",      phone: "+1 555-0108", company: harbor,   tags: %w[investor vip],      starred: true,  archived: false },
  { first_name: "Ravi",    last_name: "Hernandez",  email: "ravi@acme.example.com",         phone: "+1 555-0109", company: acme,     tags: %w[customer lead],     starred: false, archived: false },
  { first_name: "Nina",    last_name: "Ibrahim",    email: "nina@brightideas.example.com",  phone: "+1 555-0110", company: bright,   tags: %w[partner prospect],  starred: false, archived: false },
  { first_name: "James",   last_name: "Johnson",    email: "james@personal.example.com",    phone: "+1 555-0111", company: nil,      tags: %w[friend],            starred: true,  archived: false },
  { first_name: "Mei",     last_name: "Kim",        email: "mei@cascade.example.com",       phone: "+1 555-0112", company: cascade,  tags: %w[customer],          starred: false, archived: false },
  { first_name: "Luca",    last_name: "Laurent",    email: "luca@dune.example.com",         phone: "+1 555-0113", company: dune,     tags: %w[investor lead],     starred: false, archived: false },
  { first_name: "Sara",    last_name: "Mitchell",   email: "sara@echo.example.com",         phone: "+1 555-0114", company: echo,     tags: %w[vendor],            starred: false, archived: false },
  { first_name: "Ahmed",   last_name: "Nguyen",     email: "ahmed@frontier.example.com",    phone: "+1 555-0115", company: frontier, tags: %w[prospect],          starred: false, archived: false },
  { first_name: "Clara",   last_name: "Okonkwo",    email: "clara@gravity.example.com",     phone: "+1 555-0116", company: gravity,  tags: %w[customer partner],  starred: false, archived: false },
  { first_name: "Felix",   last_name: "Park",       email: "felix@harbor.example.com",      phone: "+1 555-0117", company: harbor,   tags: %w[investor],          starred: true,  archived: false },
  { first_name: "Yuki",    last_name: "Quinn",      email: "yuki@personal.example.com",     phone: nil,           company: nil,      tags: %w[friend],            starred: false, archived: false },
  { first_name: "Diego",   last_name: "Rodriguez",  email: "diego@acme.example.com",        phone: "+1 555-0119", company: acme,     tags: %w[customer vip],      starred: false, archived: false },
  { first_name: "Amara",   last_name: "Santos",     email: "amara@bright.example.com",      phone: "+1 555-0120", company: bright,   tags: %w[lead],              starred: false, archived: false },
  { first_name: "Tom",     last_name: "Thompson",   email: "tom@old.example.com",           phone: nil,           company: nil,      tags: %w[customer],          starred: false, archived: true  },
  { first_name: "Julia",   last_name: "Ueda",       email: "julia@cascade.example.com",     phone: "+1 555-0122", company: cascade,  tags: %w[partner vip],       starred: false, archived: false },
  { first_name: "Kwame",   last_name: "Vance",      email: "kwame@dune.example.com",        phone: "+1 555-0123", company: dune,     tags: %w[investor prospect], starred: true,  archived: false },
  { first_name: "Nadia",   last_name: "Weber",      email: "nadia@echo.example.com",        phone: "+1 555-0124", company: echo,     tags: %w[customer lead],     starred: false, archived: false },
  { first_name: "Sam",     last_name: "Xavier",     email: "sam@old.example.com",           phone: nil,           company: nil,      tags: %w[vendor],            starred: false, archived: true  },
  { first_name: "Leila",   last_name: "Zhang",      email: "leila@frontier.example.com",    phone: "+1 555-0126", company: frontier, tags: %w[customer partner],  starred: false, archived: false },
]

contacts = Contact.create!(contacts_data)

by_name = contacts.index_by(&:last_name)
zara   = by_name["Ahmed"]
layla  = by_name["Chen"]
aisha  = by_name["Garcia"]
james  = by_name["Johnson"]
ravi   = by_name["Hernandez"]
mei    = by_name["Kim"]
nina   = by_name["Ibrahim"]
marcus = by_name["Delacroix"]
felix  = by_name["Park"]
kwame  = by_name["Vance"]
nadia  = by_name["Weber"]
clara  = by_name["Okonkwo"]
diego  = by_name["Rodriguez"]
leila  = by_name["Zhang"]
amara  = by_name["Santos"]
priya  = by_name["Evans"]
theo   = by_name["Fischer"]
luca   = by_name["Laurent"]

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
  { contact: layla, kind: "call",  body: "Series A pitch call — very positive! She wants to see the cap table.", created_at: 1.week.ago },
  { contact: layla, kind: "email", body: "Sent the investor deck and financial projections.", created_at: 6.days.ago },
  { contact: layla, kind: "note",  body: "Intro'd to their GP. Meeting scheduled for next Thursday.", created_at: 4.days.ago },
  { contact: layla, kind: "call",  body: "Follow-up call — she's in principle interested, term sheet in 2 weeks.", created_at: 2.days.ago },
]

activities += [
  { contact: aisha, kind: "email", body: "Reached out via warm intro from Felix Park.", created_at: 3.weeks.ago },
  { contact: aisha, kind: "call",  body: "First call — great energy. She's looking at seed-stage deals.", created_at: 2.weeks.ago },
  { contact: aisha, kind: "note",  body: "She mentioned she prefers async updates via email.", created_at: 10.days.ago },
  { contact: aisha, kind: "email", body: "Monthly investor update sent.", created_at: 5.days.ago },
]

activities += [
  { contact: james, kind: "note", body: "Caught up over coffee — he's consulting now after leaving Google.", created_at: 2.weeks.ago },
  { contact: james, kind: "call", body: "He might be able to help with hiring — referred two engineers.", created_at: 1.week.ago },
  { contact: james, kind: "note", body: "Send him a thank-you for the intros.", created_at: 3.days.ago },
]

activities += [
  { contact: ravi, kind: "email", body: "Sent trial activation instructions.", created_at: 3.weeks.ago },
  { contact: ravi, kind: "call",  body: "Onboarding call — walked through the dashboard.", created_at: 2.weeks.ago },
  { contact: ravi, kind: "note",  body: "He's blocked on IT approval for SSO integration.", created_at: 1.week.ago },
  { contact: ravi, kind: "email", body: "Sent the SSO setup guide and IT checklist.", created_at: 5.days.ago },
  { contact: ravi, kind: "call",  body: "IT approved — going live next Monday.", created_at: 1.day.ago },
]

activities += [
  { contact: mei, kind: "call",  body: "Quarterly business review — NPS 9, very satisfied.", created_at: 1.week.ago },
  { contact: mei, kind: "note",  body: "Wants to try the new reporting features in the next release.", created_at: 4.days.ago },
  { contact: mei, kind: "email", body: "Shared the beta release notes for the reporting module.", created_at: 2.days.ago },
]

activities += [
  { contact: nina, kind: "email", body: "Introduction email — exploring a co-marketing opportunity.", created_at: 1.month.ago },
  { contact: nina, kind: "call",  body: "Discovery call — she's interested in a joint webinar.", created_at: 3.weeks.ago },
  { contact: nina, kind: "note",  body: "Draft the webinar proposal and send by Friday.", created_at: 2.weeks.ago },
  { contact: nina, kind: "email", body: "Sent the co-marketing proposal deck.", created_at: 1.week.ago },
]

activities += [
  { contact: marcus, kind: "call",  body: "Support escalation — API latency issue. Resolved by engineering.", created_at: 2.weeks.ago },
  { contact: marcus, kind: "email", body: "Post-incident report sent.", created_at: 10.days.ago },
  { contact: marcus, kind: "note",  body: "Satisfaction restored — he appreciated the quick turnaround.", created_at: 1.week.ago },
]

activities += [
  { contact: felix, kind: "email", body: "Warm intro received from a mutual connection at YC.", created_at: 1.month.ago },
  { contact: felix, kind: "call",  body: "Initial call — he's a scout for Harbor Capital.", created_at: 3.weeks.ago },
  { contact: felix, kind: "note",  body: "Interested in B2B SaaS. Sending deal memo next week.", created_at: 2.weeks.ago },
  { contact: felix, kind: "email", body: "Sent the deal memo and traction metrics.", created_at: 10.days.ago },
  { contact: felix, kind: "call",  body: "Partner meeting confirmed for next month.", created_at: 3.days.ago },
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
  { contact: clara, kind: "call",  body: "Partnership intro call — she handles vendor relations.", created_at: 1.month.ago },
  { contact: clara, kind: "email", body: "Sent integration documentation.", created_at: 3.weeks.ago },
  { contact: clara, kind: "note",  body: "Integration live — first invoice sent.", created_at: 1.week.ago },
]

activities += [
  { contact: diego, kind: "note",  body: "Executive sponsor for Acme's enterprise renewal.", created_at: 2.weeks.ago },
  { contact: diego, kind: "call",  body: "Strategy call — wants custom SLAs in the renewal contract.", created_at: 1.week.ago },
  { contact: diego, kind: "email", body: "Sent custom SLA addendum for legal review.", created_at: 3.days.ago },
]

activities += [
  { contact: leila, kind: "email", body: "Introduced to the new support tier.", created_at: 3.weeks.ago },
  { contact: leila, kind: "call",  body: "QBR call — she's happy but wants better mobile app.", created_at: 2.weeks.ago },
  { contact: leila, kind: "note",  body: "Shared mobile roadmap — she's satisfied to wait.", created_at: 1.week.ago },
]

activities += [
  { contact: amara, kind: "email", body: "Inbound lead — filled out the demo request form.", created_at: 2.weeks.ago },
  { contact: amara, kind: "call",  body: "Demo call — she loved the reporting features.", created_at: 10.days.ago },
  { contact: amara, kind: "note",  body: "Send proposal by end of week.", created_at: 5.days.ago },
  { contact: amara, kind: "email", body: "Proposal sent — €12k/year.", created_at: 3.days.ago },
]

activities += [
  { contact: priya, kind: "note", body: "Met at a startup event — she's a product designer at Frontier.", created_at: 1.month.ago },
  { contact: priya, kind: "call", body: "Catchup call — she might be open to joining as a design advisor.", created_at: 2.weeks.ago },
]

activities += [
  { contact: theo, kind: "email", body: "Vendor onboarding email sent.", created_at: 2.months.ago },
  { contact: theo, kind: "note",  body: "First invoice approved and paid.", created_at: 6.weeks.ago },
  { contact: theo, kind: "call",  body: "Contract renewal discussion — same terms.", created_at: 3.weeks.ago },
]

activities += [
  { contact: luca, kind: "email", body: "Sent introductory email via AngelList.", created_at: 2.months.ago },
  { contact: luca, kind: "call",  body: "First call — he's primarily an LP, not a direct investor.", created_at: 6.weeks.ago },
  { contact: luca, kind: "note",  body: "May be able to intro to Dune GPs.", created_at: 1.month.ago },
]

Activity.create!(activities)

puts "Seeded: #{Company.count} companies, #{Contact.count} contacts, #{Activity.count} activities"
