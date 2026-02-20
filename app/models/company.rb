class Company < ApplicationRecord
  has_many :contacts, dependent: :nullify

  validates :name, presence: true

  scope :search, ->(q) { where("name LIKE ?", "%#{q}%") }

  def to_s
    name
  end
end
