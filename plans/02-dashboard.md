# Plan 2: Global Activity Feed / Dashboard ✅ DONE

Replace the bare root with a real home page: key stats, recent activity across all records, and starred contacts.

---

## Goal

- A `/dashboard` page as the app's home (`root`)
- Stats cards: total contacts, companies, activities this week
- Recent activity feed (last 20 activities across all contacts + companies)
- Starred contacts quick-access list
- If Plan 1 (follow-up reminders) is implemented, a "Due Follow-ups" section

---

## Routes (`config/routes.rb`)

```ruby
get "dashboard", to: "dashboard#show", as: :dashboard
root "dashboard#show"   # replaces root "contacts#index"
```

---

## Controller (`app/controllers/dashboard_controller.rb`)

```ruby
class DashboardController < InertiaController
  def show
    render inertia: "dashboard/show", props: {
      stats: {
        contacts_count:          Current.user.contacts.active.count,
        companies_count:         Current.user.companies.count,
        activities_this_week:    Current.user.activities.where(created_at: 1.week.ago..).count,
      },
      recent_activities: Current.user.activities
                                     .includes(:subject)
                                     .limit(20)
                                     .map(&:as_activity_json),
      starred_contacts: Current.user.contacts
                                    .starred
                                    .active
                                    .includes(:company)
                                    .order(:last_name, :first_name)
                                    .limit(8)
                                    .as_json(include: :company),
    }
  end
end
```

If follow-up reminders are live, add:

```ruby
due_follow_ups: Current.user.contacts
                            .active
                            .due_follow_up
                            .includes(:company)
                            .order(:follow_up_at)
                            .limit(5)
                            .as_json(include: :company),
```

---

## Page (`app/frontend/pages/dashboard/show.tsx`)

Full-page scroll layout (no CrmLayout sidebar). Uses `AppLayout` directly.

```tsx
export default function DashboardShow() {
  const { stats, recent_activities, starred_contacts } = usePage<Props>().props

  return (
    <>
      <Head title="Dashboard" />
      <div className="scrollbar-subtle h-full overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-6 py-8 space-y-8">
          <StatsRow stats={stats} />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RecentActivityFeed activities={recent_activities} />
            </div>
            <div>
              <StarredContactsList contacts={starred_contacts} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
```

---

## Components (all new, in `app/frontend/components/crm/`)

### `dashboard-stats.tsx` — `StatsRow`

Three `Card` components in a row:

| Card | Value | Icon |
|------|-------|------|
| Contacts | `stats.contacts_count` | `Users` |
| Companies | `stats.companies_count` | `Building2` |
| This Week | `stats.activities_this_week` | `Activity` |

Each card links to the relevant index page.

### `dashboard-activity-feed.tsx` — `RecentActivityFeed`

Reuses `ActivityItem` display logic (read-only, no inline edit needed on dashboard). Groups by date using the same `groupByDate` helper from `activity-log.tsx`. Adds a "View all" link to `activitiesPath()`.

### `dashboard-starred-contacts.tsx` — `StarredContactsList`

A compact list of starred contacts. Each row: `ContactAvatar` + name + company name. Clicking navigates to `contactPath(contact.id)`. Shows "No starred contacts" empty state with a link to contacts. Adds a "View all" link filtered to starred contacts.

---

## Sidebar (`app/frontend/components/app-sidebar.tsx`)

Add Dashboard as the first nav item:

```tsx
{ title: "Dashboard", url: dashboardPath(), icon: LayoutDashboard }
```

---

## Types (`app/frontend/types/index.ts`)

Add a `DashboardStats` interface:

```ts
export interface DashboardStats {
  contacts_count: number
  companies_count: number
  activities_this_week: number
}
```

---

## Spec coverage

- `dashboard#show` renders the `"dashboard/show"` Inertia component
- Props include `stats`, `recent_activities`, `starred_contacts`
- `stats.contacts_count` reflects active (non-archived) contacts
- `recent_activities` is limited to 20, ordered newest-first
- Unauthenticated requests redirect to sign-in

---

## Out of scope (future)

- Charts / graphs (e.g., activity over time)
- Customisable widget layout
- "Today's tasks" section (requires task/meeting activity kinds)
