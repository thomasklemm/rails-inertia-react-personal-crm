class Contact < ApplicationRecord
  TAGS = %w[customer friend investor lead partner prospect vip vendor].freeze

  belongs_to :company, optional: true
  has_many :activities, dependent: :destroy

  validates :first_name, presence: true
  validates :last_name,  presence: true
  validate  :tags_must_be_valid

  scope :starred,  -> { where(starred: true) }
  scope :archived, -> { where(archived: true) }
  scope :active,   -> { where(archived: false) }

  def self.search(q)
    pattern = "%#{q}%"
    where("first_name LIKE ? OR last_name LIKE ? OR email LIKE ?", pattern, pattern, pattern)
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
