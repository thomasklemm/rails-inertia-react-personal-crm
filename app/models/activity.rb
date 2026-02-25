# frozen_string_literal: true

class Activity < ApplicationRecord
  KINDS = %w[note call email].freeze

  belongs_to :user
  belongs_to :subject, polymorphic: true

  enum :kind, note: "note", call: "call", email: "email"

  before_validation :set_occurred_at

  validates :kind, presence: true, inclusion: {in: KINDS}
  validates :subject_type, inclusion: {in: %w[Contact Company Deal]}
  validates :body, presence: true

  default_scope { order(occurred_at: :desc) }

  def as_activity_json
    as_json(except: %w[subject_type subject_id user_id]).merge("subject" => subject_json)
  end

  private

  def set_occurred_at
    self.occurred_at ||= Time.current
  end

  def subject_json
    case subject_type
    when "Contact"
      {id: subject_id, type: "Contact", name: subject.full_name}
    when "Company"
      {id: subject_id, type: "Company", name: subject.name}
    when "Deal"
      {id: subject_id, type: "Deal", name: subject.title}
    else
      raise ArgumentError, "Unsupported subject_type: #{subject_type.inspect} for Activity##{id}"
    end
  end
end
