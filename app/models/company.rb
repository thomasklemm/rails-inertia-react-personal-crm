class Company < ApplicationRecord
  has_many :contacts, dependent: :nullify

  validates :name, presence: true

  def to_s
    name
  end
end
