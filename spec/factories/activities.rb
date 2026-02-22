# frozen_string_literal: true

FactoryBot.define do
  factory :activity do
    user
    kind    { "note" }
    body    { "Some notes here." }
    association :subject, factory: :contact
  end
end
