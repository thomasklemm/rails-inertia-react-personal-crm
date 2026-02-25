# frozen_string_literal: true

class Deal < ApplicationRecord
  STAGES = %w[lead qualified proposal closed_won closed_lost].freeze
  OPEN_STAGES = %w[lead qualified proposal].freeze

  belongs_to :user
  belongs_to :contact, optional: true
  belongs_to :company, optional: true
  has_many :activities, as: :subject, dependent: :destroy

  enum :stage, lead: "lead", qualified: "qualified", proposal: "proposal",
               closed_won: "closed_won", closed_lost: "closed_lost"

  validates :title, presence: true
  validates :stage, presence: true, inclusion: { in: STAGES }
  validates :value_cents, numericality: { greater_than_or_equal_to: 0 }

  before_save :manage_closed_at

  scope :open_deals, -> { where(stage: OPEN_STAGES) }
  scope :won,        -> { where(stage: "closed_won") }
  scope :lost,       -> { where(stage: "closed_lost") }
  scope :active,     -> { where(stage: OPEN_STAGES) }

  def value
    value_cents / 100.0
  end

  def open?
    OPEN_STAGES.include?(stage)
  end

  def next_stage
    idx = STAGES.index(stage)
    STAGES[idx + 1] if idx && idx < STAGES.length - 1
  end

  private

  def manage_closed_at
    if open?
      self.closed_at = nil
    elsif closed_at.nil?
      self.closed_at = Time.current
    end
  end

  public

  def as_deal_json
    as_json(except: %w[user_id]).merge(
      "contact" => contact&.as_json(only: %w[id first_name last_name]),
      "company" => company&.as_json(only: %w[id name]),
      "value"   => value
    )
  end
end
