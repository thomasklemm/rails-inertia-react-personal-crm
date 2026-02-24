# Plan 4: Deals / Pipeline

Add a lightweight deal pipeline that turns the app from an address book into a real CRM. Deals move through stages, link to contacts and/or companies, carry a monetary value, and have their own activity log.

---

## Goal

- Create and track deals linked to contacts/companies
- Five stages: Lead → Qualified → Proposal → Closed Won / Closed Lost
- Kanban board view (columns per stage, no drag-and-drop for v1)
- Deal detail page with activity log
- Total pipeline value visible in the kanban header
- Deals surface on the linked contact and company pages

---

## Database

### Migration

```ruby
create_table :deals do |t|
  t.string   :title,        null: false
  t.string   :stage,        null: false, default: "lead"
  t.integer  :value_cents,  default: 0,  null: false   # store money as integer cents
  t.date     :closed_at
  t.text     :notes
  t.integer  :user_id,      null: false
  t.integer  :contact_id
  t.integer  :company_id
  t.timestamps
end

add_index :deals, :user_id
add_index :deals, :contact_id
add_index :deals, :company_id
add_foreign_key :deals, :users
add_foreign_key :deals, :contacts
add_foreign_key :deals, :companies
```

Using `value_cents` (integer) avoids float precision issues for currency. The app renders it divided by 100.

---

## Model (`app/models/deal.rb`)

```ruby
class Deal < ApplicationRecord
  STAGES = %w[lead qualified proposal closed_won closed_lost].freeze
  OPEN_STAGES = %w[lead qualified proposal].freeze

  belongs_to :user
  belongs_to :contact, optional: true
  belongs_to :company, optional: true
  has_many :activities, as: :subject, dependent: :destroy

  enum :stage, lead: "lead", qualified: "qualified", proposal: "proposal",
               closed_won: "closed_won", closed_lost: "closed_lost"

  validates :title, presence: true
  validates :stage, presence: true, inclusion: { in: STAGES }
  validates :value_cents, numericality: { greater_than_or_equal_to: 0 }

  scope :open,   -> { where(stage: OPEN_STAGES) }
  scope :won,    -> { where(stage: "closed_won") }
  scope :lost,   -> { where(stage: "closed_lost") }
  scope :active, -> { where(stage: OPEN_STAGES) }

  def value
    value_cents / 100.0
  end

  def open?
    OPEN_STAGES.include?(stage)
  end

  def next_stage
    idx = STAGES.index(stage)
    STAGES[idx + 1] if idx && idx < STAGES.length - 1
  end

  def as_deal_json
    as_json(except: %w[user_id]).merge(
      "contact" => contact&.as_json(only: %w[id first_name last_name email]),
      "company" => company&.as_json(only: %w[id name]),
      "value"   => value
    )
  end
end
```

### `Activity` model — add Deal support

```ruby
# app/models/activity.rb
validates :subject_type, inclusion: { in: %w[Contact Company Deal] }
```

Update `as_activity_json` to handle `"Deal"`:

```ruby
when "Deal"
  { id: subject_id, type: "Deal", name: subject.title }
```

---

## Routes (`config/routes.rb`)

```ruby
resources :deals do
  member do
    patch :advance   # move to next open stage
    patch :move      # move to an arbitrary stage (for the kanban stage picker)
  end
end
```

---

## Controller (`app/controllers/deals_controller.rb`)

```ruby
class DealsController < InertiaController
  before_action :set_deal, only: [:show, :edit, :update, :destroy, :advance, :move]

  def index
    deals_by_stage = Deal::STAGES.index_with do |stage|
      Current.user.deals.where(stage: stage).includes(:contact, :company).order(:created_at).map(&:as_deal_json)
    end

    render inertia: "deals/index", props: {
      deals_by_stage: deals_by_stage,
      pipeline_value: Current.user.deals.open.sum(:value_cents) / 100.0,
      stages: Deal::STAGES
    }
  end

  def show
    render inertia: "deals/show", props: {
      deal: @deal.as_deal_json,
      activities: @deal.activities.includes(:subject).map(&:as_activity_json)
    }
  end

  def new
    render inertia_modal: "deals/new", props: {
      stages:     Deal::STAGES,
      contact_id: params[:contact_id]&.to_i,
      company_id: params[:company_id]&.to_i,
      contacts:   Current.user.contacts.active.order(:last_name, :first_name).as_json(only: %w[id first_name last_name]),
      companies:  Current.user.companies.order(:name).as_json(only: %w[id name])
    }, base_url: deals_path
  end

  def create
    @deal = Current.user.deals.new(deal_params)
    if @deal.save
      redirect_to deal_path(@deal), notice: "Deal created."
    else
      redirect_to new_deal_path, inertia: { errors: @deal.errors.as_json }
    end
  end

  def edit
    render inertia_modal: "deals/edit", props: {
      deal:      @deal.as_deal_json,
      stages:    Deal::STAGES,
      contacts:  Current.user.contacts.active.order(:last_name, :first_name).as_json(only: %w[id first_name last_name]),
      companies: Current.user.companies.order(:name).as_json(only: %w[id name])
    }, base_url: deal_path(@deal)
  end

  def update
    if @deal.update(deal_params)
      redirect_to deal_path(@deal), notice: "Deal updated."
    else
      redirect_to edit_deal_path(@deal), inertia: { errors: @deal.errors.as_json }
    end
  end

  def destroy
    @deal.destroy
    redirect_to deals_path, notice: "Deal deleted."
  end

  def advance
    next_stage = @deal.next_stage
    if next_stage
      @deal.update!(stage: next_stage)
      redirect_back_or_to deal_path(@deal), notice: "Moved to #{next_stage.humanize}."
    else
      redirect_back_or_to deal_path(@deal), alert: "Deal is already in a final stage."
    end
  end

  def move
    if @deal.update(stage: params[:stage])
      redirect_back_or_to deals_path, notice: "Stage updated."
    else
      redirect_back_or_to deals_path, alert: "Invalid stage."
    end
  end

  private

  def set_deal
    @deal = Current.user.deals.find(params[:id])
  end

  def deal_params
    params.permit(:title, :stage, :value_cents, :closed_at, :notes, :contact_id, :company_id)
  end
end
```

**Note on `value_cents`**: the frontend form will send `value` (a decimal dollar amount). Convert in the controller:

```ruby
def deal_params
  p = params.permit(:title, :stage, :value, :closed_at, :notes, :contact_id, :company_id)
  p[:value_cents] = (p.delete(:value).to_f * 100).round if p.key?(:value)
  p
end
```

---

## Frontend pages

### `app/frontend/pages/deals/index.tsx` — Kanban Board

Full-width layout (no CrmLayout sidebar). Uses `AppLayout` with a simple breadcrumb.

```
┌─────────────────────────────────────────────────────────────┐
│ Deals                              Pipeline: $142,500   + Add│
├──────────┬────────────┬──────────┬────────────┬─────────────┤
│  Lead    │ Qualified  │ Proposal │ Closed Won │ Closed Lost │
│  (3)     │  (2)       │  (4)     │  (7)       │  (2)        │
├──────────┼────────────┼──────────┼────────────┼─────────────┤
│ [card]   │ [card]     │ [card]   │ [card]     │ [card]      │
│ [card]   │            │ [card]   │            │             │
│ [card]   │            │          │            │             │
└──────────┴────────────┴──────────┴────────────┴─────────────┘
```

Each **kanban card** shows:
- Deal title (links to `dealPath(deal.id)`)
- Contact or company name (with link)
- Value formatted as currency (`$12,500`)
- A "Move stage" dropdown (shadcn `DropdownMenu` with stage options, triggers `PATCH /deals/:id/move`)

No drag-and-drop for v1 — stage changes are explicit via the dropdown.

Column header shows count of deals and total value for that stage.

### `app/frontend/pages/deals/show.tsx` — Deal Detail

Mirrors `contacts/show.tsx` layout:

```
┌──────────────────────────────────┐
│ Deal Title                [Edit] │
│ Stage badge · $12,500            │
│ Contact: Jane Smith              │
│ Company: Acme Corp               │
│ Notes                            │
├──────────────────────────────────┤
│ Activity Log                     │
│ [Log Note] [Log Call] [Log Email]│
│ ...activities...                 │
└──────────────────────────────────┘
```

Includes an "Advance to [Next Stage]" button when the deal is in an open stage, and "Close Won" / "Close Lost" buttons when in Proposal.

### `app/frontend/pages/deals/new.tsx` and `deals/edit.tsx`

Modal forms. Fields:
- Title (text input, required)
- Stage (Select from `Deal::STAGES`)
- Value (number input, dollar amount)
- Contact (Select, optional)
- Company (Select, optional)
- Notes (Textarea)
- Closed Date (date input, shown only when stage is `closed_won` or `closed_lost`)

---

## New components (`app/frontend/components/crm/`)

### `deal-card.tsx`

Kanban card. Receives a `Deal` prop. Shows title, linked contact/company, value, and a stage-move dropdown menu.

### `deal-stage-column.tsx`

Wraps a stage column: header with label + count + total value, scrollable list of `DealCard` components.

### `deal-form.tsx`

Shared form for new/edit. Handles the `value` ↔ `value_cents` conversion on the frontend (display as dollars, send as dollars).

---

## Deals on Contact and Company pages

### `contacts/show.tsx`

Add a "Deals" section above the activity log when the contact has deals:

```ruby
# contacts_controller.rb show action — add:
deals: @contact.deals.includes(:company).order(:stage, :created_at).map(&:as_deal_json)
```

```tsx
{deals.length > 0 && (
  <div className="border-t px-6 py-5">
    <ContactDeals deals={deals} contactId={contact.id} />
  </div>
)}
```

`ContactDeals` shows a compact list with stage badges and value, plus a "+ Add Deal" `ModalLink`.

### `companies/show.tsx`

Same pattern, querying deals linked to the company:

```ruby
deals: @company.deals.includes(:contact).order(:stage, :created_at).map(&:as_deal_json)
```

---

## Sidebar nav (`app/frontend/components/app-sidebar.tsx`)

Add Deals between Companies and Activities:

```tsx
{ title: "Deals", url: dealsPath(), icon: TrendingUp }
```

---

## Types (`app/frontend/types/index.ts`)

```ts
export type DealStage = "lead" | "qualified" | "proposal" | "closed_won" | "closed_lost"

export interface Deal {
  id: number
  title: string
  stage: DealStage
  value: number         // dollars (float, converted from value_cents)
  value_cents: number
  closed_at: string | null
  notes: string | null
  contact: { id: number; first_name: string; last_name: string } | null
  company: { id: number; name: string } | null
  created_at: string
  updated_at: string
}
```

---

## js-routes

After adding routes, regenerate:

```bash
bin/rails js:routes:typescript
```

New helpers used: `dealsPath()`, `dealPath(id)`, `newDealPath()`, `editDealPath(id)`, `advanceDealPath(id)`, `moveDealPath(id)`.

---

## Spec coverage

- `Deal` model: validations, `open?`, `next_stage`, scopes (`open`, `won`, `lost`)
- `Deal#as_deal_json` includes contact and company names
- `deals#index` groups deals by stage, includes `pipeline_value`
- `deals#create` creates a deal and redirects to show
- `deals#advance` increments stage; no-ops on final stages
- `deals#move` changes to an arbitrary stage
- `contacts#show` includes `deals` prop when contact has linked deals
- `Activity` model accepts `subject_type: "Deal"`

---

## Stage display names

| Value | Display |
|-------|---------|
| `lead` | Lead |
| `qualified` | Qualified |
| `proposal` | Proposal |
| `closed_won` | Closed Won |
| `closed_lost` | Closed Lost |

---

## Out of scope (future)

- Drag-and-drop kanban reordering
- Multiple pipelines (e.g., Sales vs. Partnerships)
- Deal probability / weighted pipeline value
- Win/loss reason field on close
- Revenue reporting / charts
- Deal templates (pre-filled stages with tasks)
