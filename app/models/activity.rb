class Activity < ApplicationRecord
  KINDS = %w[note call email].freeze

  belongs_to :user
  belongs_to :contact, optional: true
  belongs_to :company, optional: true

  enum :kind, note: "note", call: "call", email: "email"

  validates :kind, presence: true, inclusion: { in: KINDS }
  validates :body, presence: true
  validate  :contact_or_company_present

  default_scope { order(created_at: :desc) }

  private

  def contact_or_company_present
    if contact.nil? && company.nil?
      errors.add(:base, "must belong to a contact or a company")
    end
  end
end
