# frozen_string_literal: true

FactoryBot.define do
  factory :company do
    user
    sequence(:name) { |n| "Company #{n}" }
    website { "https://example#{rand(1000)}.com" }
  end
end
