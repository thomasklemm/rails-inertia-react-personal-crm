# frozen_string_literal: true

FactoryBot.define do
  factory :deal do
    user
    sequence(:title) { |n| "Deal #{n}" }
    stage       { "lead" }
    value_cents { 10_000_00 }
    closed_at   { nil }
    notes       { nil }
    contact     { nil }
    company     { nil }

    trait :lead do
      stage { "lead" }
    end

    trait :qualified do
      stage { "qualified" }
    end

    trait :proposal do
      stage { "proposal" }
    end

    trait :closed_won do
      stage     { "closed_won" }
      closed_at { Date.current }
    end

    trait :closed_lost do
      stage     { "closed_lost" }
      closed_at { Date.current }
    end

    trait :with_contact do
      contact { association :contact }
    end

    trait :with_company do
      company { association :company }
    end
  end
end
