# frozen_string_literal: true

FactoryBot.define do
  factory :contact do
    user
    sequence(:first_name) { |n| "First#{n}" }
    sequence(:last_name)  { |n| "Last#{n}" }
    sequence(:email)      { |n| "contact#{n}@example.com" }
    phone    { "+1 555-0100" }
    notes    { nil }
    starred  { false }
    archived { false }
    tags         { [] }
    follow_up_at { nil }
    company      { nil }

    trait :starred do
      starred { true }
    end

    trait :archived do
      archived { true }
    end

    trait :with_company do
      company { association :company }
    end
  end
end
