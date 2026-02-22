class Activity < ApplicationRecord
  KINDS = %w[note call email].freeze

  belongs_to :user
  belongs_to :subject, polymorphic: true

  enum :kind, note: "note", call: "call", email: "email"

  validates :kind, presence: true, inclusion: { in: KINDS }
  validates :subject_type, inclusion: { in: %w[Contact Company] }
  validates :body, presence: true

  default_scope { order(created_at: :desc) }

  def as_activity_json
    as_json(except: %w[subject_type subject_id user_id]).merge("subject" => subject_json)
  end

  private

  def subject_json
    case subject_type
    when "Contact"
      { id: subject_id, type: "Contact", name: subject.full_name }
    when "Company"
      { id: subject_id, type: "Company", name: subject.name }
    end
  end
end
