# frozen_string_literal: true

class Contact < ApplicationRecord
  TAGS = %w[customer friend investor lead partner prospect vip vendor].freeze

  belongs_to :user
  belongs_to :company, optional: true
  has_many :activities, as: :subject, dependent: :destroy

  validates :first_name, presence: true
  validates :last_name,  presence: true
  validate  :tags_must_be_valid

  scope :starred,          -> { where(starred: true) }
  scope :archived,         -> { where(archived: true) }
  scope :active,           -> { where(archived: false) }
  scope :due_follow_up,    -> { where("follow_up_at IS NOT NULL AND follow_up_at <= ?", Date.current) }
  scope :upcoming_follow_up, -> { where("follow_up_at IS NOT NULL AND follow_up_at > ?", Date.current) }

  def self.search(q)
    pattern = "%#{q}%"
    where("contacts.first_name LIKE ? OR contacts.last_name LIKE ? OR contacts.email LIKE ?", pattern, pattern, pattern)
  end

  def full_name
    "#{first_name} #{last_name}"
  end

  private

  def tags_must_be_valid
    return if tags.blank?
    invalid = Array(tags) - TAGS
    errors.add(:tags, "contains invalid values: #{invalid.join(", ")}") if invalid.any?
  end
end
