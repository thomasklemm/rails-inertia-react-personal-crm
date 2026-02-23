# frozen_string_literal: true

class Company < ApplicationRecord
  TAGS = %w[saas fintech healthcare agency consulting ecommerce media manufacturing logistics education nonprofit].freeze

  belongs_to :user
  has_many :contacts, dependent: :nullify
  has_many :activities, as: :subject, dependent: :destroy

  validates :name, presence: true
  validate  :tags_must_be_valid

  scope :starred, -> { where(starred: true) }
  scope :active,  -> { where(starred: [true, false]) }

  def self.search(q)
    pattern = "%#{q}%"
    where("companies.name LIKE ? OR companies.email LIKE ? OR companies.phone LIKE ? OR companies.address LIKE ?", pattern, pattern, pattern, pattern)
  end

  def to_s
    name
  end

  private

  def tags_must_be_valid
    return if tags.blank?
    invalid = Array(tags) - TAGS
    errors.add(:tags, "contains invalid values: #{invalid.join(", ")}") if invalid.any?
  end
end
