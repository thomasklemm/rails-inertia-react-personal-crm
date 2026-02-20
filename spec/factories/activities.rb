# frozen_string_literal: true

FactoryBot.define do
  factory :activity do
    kind    { "note" }
    body    { "Some notes here." }
    contact { association :contact }
  end
end
