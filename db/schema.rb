# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_02_24_000001) do
  create_table "activities", force: :cascade do |t|
    t.text "body", null: false
    t.datetime "created_at", null: false
    t.string "kind", null: false
    t.integer "subject_id", null: false
    t.string "subject_type", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["subject_type", "subject_id"], name: "index_activities_on_subject_type_and_subject_id"
    t.index ["user_id"], name: "index_activities_on_user_id"
  end

  create_table "companies", force: :cascade do |t|
    t.string "address"
    t.datetime "created_at", null: false
    t.string "email"
    t.string "name", null: false
    t.text "notes"
    t.string "phone"
    t.boolean "starred", default: false, null: false
    t.json "tags", default: [], null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.string "website"
    t.index ["user_id"], name: "index_companies_on_user_id"
  end

  create_table "contacts", force: :cascade do |t|
    t.boolean "archived", default: false, null: false
    t.integer "company_id"
    t.datetime "created_at", null: false
    t.string "email"
    t.string "first_name", null: false
    t.date "follow_up_at"
    t.string "last_name", null: false
    t.text "notes"
    t.string "phone"
    t.boolean "starred", default: false, null: false
    t.json "tags", default: [], null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["company_id"], name: "index_contacts_on_company_id"
    t.index ["user_id"], name: "index_contacts_on_user_id"
  end

  create_table "sessions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "ip_address"
    t.datetime "updated_at", null: false
    t.string "user_agent"
    t.integer "user_id", null: false
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.string "name", null: false
    t.string "password_digest", null: false
    t.datetime "updated_at", null: false
    t.boolean "verified", default: false, null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "activities", "users"
  add_foreign_key "companies", "users"
  add_foreign_key "contacts", "companies"
  add_foreign_key "contacts", "users"
  add_foreign_key "sessions", "users"
end
