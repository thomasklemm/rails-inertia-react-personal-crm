# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Search", type: :request do
  let(:user) { create(:user) }

  describe "authentication" do
    it "redirects unauthenticated requests to sign in" do
      get search_path
      expect(response).to redirect_to(sign_in_path)
    end
  end

  describe "GET /search" do
    before { sign_in_as(user) }

    context "with a short query (< 2 chars)" do
      it "returns empty results for a single character" do
        get search_path, params: {q: "a"}
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)).to eq({"results" => []})
      end

      it "returns empty results for a blank query" do
        get search_path, params: {q: ""}
        expect(JSON.parse(response.body)).to eq({"results" => []})
      end

      it "returns empty results with no query param" do
        get search_path
        expect(JSON.parse(response.body)).to eq({"results" => []})
      end
    end

    context "contacts" do
      let!(:alice) { create(:contact, user:, first_name: "Alice", last_name: "Smith") }
      let!(:archived) { create(:contact, :archived, user:, first_name: "Alice", last_name: "Archived") }
      let!(:other_user_contact) { create(:contact, first_name: "Alice", last_name: "Other") }

      it "returns matching active contacts" do
        get search_path, params: {q: "Alice"}
        group = contacts_group
        titles = group["items"].map { |i| i["title"] }
        expect(titles).to include("Alice Smith")
      end

      it "excludes archived contacts" do
        get search_path, params: {q: "Alice"}
        group = contacts_group
        titles = group["items"].map { |i| i["title"] }
        expect(titles).not_to include("Alice Archived")
      end

      it "excludes other users' contacts" do
        get search_path, params: {q: "Alice"}
        group = contacts_group
        titles = group["items"].map { |i| i["title"] }
        expect(titles).not_to include("Alice Other")
      end

      it "caps results at 5" do
        create_list(:contact, 6, user:, first_name: "Alice")
        get search_path, params: {q: "Alice"}
        expect(contacts_group["items"].size).to be <= 5
      end

      it "includes required fields on each item" do
        get search_path, params: {q: "Alice"}
        item = contacts_group["items"].first
        expect(item).to include("id", "type", "title", "url")
        expect(item["type"]).to eq("contact")
        expect(item["url"]).to include("/contacts/")
      end

      it "includes company name as subtitle when present" do
        company = create(:company, user:, name: "Acme Corp")
        alice.update!(company:)
        get search_path, params: {q: "Alice"}
        item = contacts_group["items"].find { |i| i["id"] == alice.id }
        expect(item["subtitle"]).to eq("Acme Corp")
      end

      it "includes starred field" do
        alice.update!(starred: true)
        get search_path, params: {q: "Alice"}
        item = contacts_group["items"].find { |i| i["id"] == alice.id }
        expect(item["starred"]).to be true
      end

      it "includes tags field" do
        alice.update!(tags: ["customer", "vip"])
        get search_path, params: {q: "Alice"}
        item = contacts_group["items"].find { |i| i["id"] == alice.id }
        expect(item["tags"]).to eq(["customer", "vip"])
      end
    end

    context "companies" do
      let!(:acme) { create(:company, user:, name: "Acme Corp", email: "hello@acme.com") }
      let!(:other_user_company) { create(:company, name: "Acme Other") }

      it "returns matching companies" do
        get search_path, params: {q: "Acme"}
        group = companies_group
        expect(group["items"].map { |i| i["title"] }).to include("Acme Corp")
      end

      it "excludes other users' companies" do
        get search_path, params: {q: "Acme"}
        group = companies_group
        expect(group["items"].map { |i| i["title"] }).not_to include("Acme Other")
      end

      it "caps results at 5" do
        create_list(:company, 6, user:, name: "Acme #{_1}")
        get search_path, params: {q: "Acme"}
        expect(companies_group["items"].size).to be <= 5
      end

      it "includes required fields" do
        get search_path, params: {q: "Acme"}
        item = companies_group["items"].first
        expect(item).to include("id", "type", "title", "url")
        expect(item["type"]).to eq("company")
        expect(item["url"]).to include("/companies/")
      end

      it "uses email as subtitle when present" do
        get search_path, params: {q: "Acme"}
        item = companies_group["items"].find { |i| i["id"] == acme.id }
        expect(item["subtitle"]).to eq("hello@acme.com")
      end

      it "falls back to website as subtitle when no email" do
        no_email = create(:company, user:, name: "Acme NoEmail", email: nil, website: "acme.com")
        get search_path, params: {q: "Acme"}
        item = companies_group["items"].find { |i| i["id"] == no_email.id }
        expect(item["subtitle"]).to eq("acme.com")
      end

      it "includes starred field" do
        acme.update!(starred: true)
        get search_path, params: {q: "Acme"}
        item = companies_group["items"].find { |i| i["id"] == acme.id }
        expect(item["starred"]).to be true
      end

      it "includes tags field" do
        acme.update!(tags: ["saas", "fintech"])
        get search_path, params: {q: "Acme"}
        item = companies_group["items"].find { |i| i["id"] == acme.id }
        expect(item["tags"]).to eq(["saas", "fintech"])
      end
    end

    context "deals" do
      let!(:deal) { create(:deal, user:, title: "Enterprise Software Deal") }
      let!(:other_user_deal) { create(:deal, title: "Enterprise Other Deal") }

      it "returns matching deals" do
        get search_path, params: {q: "Enterprise"}
        group = deals_group
        expect(group["items"].map { |i| i["title"] }).to include("Enterprise Software Deal")
      end

      it "excludes other users' deals" do
        get search_path, params: {q: "Enterprise"}
        group = deals_group
        expect(group["items"].map { |i| i["title"] }).not_to include("Enterprise Other Deal")
      end

      it "caps results at 5" do
        create_list(:deal, 6, user:, title: "Enterprise #{_1}")
        get search_path, params: {q: "Enterprise"}
        expect(deals_group["items"].size).to be <= 5
      end

      it "includes required fields" do
        get search_path, params: {q: "Enterprise"}
        item = deals_group["items"].first
        expect(item).to include("id", "type", "title", "url")
        expect(item["type"]).to eq("deal")
        expect(item["url"]).to include("/deals/")
      end

      it "includes contact name as subtitle when deal has a contact" do
        contact = create(:contact, user:, first_name: "Jane", last_name: "Doe")
        deal.update!(contact:)
        get search_path, params: {q: "Enterprise"}
        item = deals_group["items"].find { |i| i["id"] == deal.id }
        expect(item["subtitle"]).to eq("Jane Doe")
      end

      it "falls back to company name as subtitle when no contact" do
        company = create(:company, user:, name: "Globex")
        deal.update!(company:)
        get search_path, params: {q: "Enterprise"}
        item = deals_group["items"].find { |i| i["id"] == deal.id }
        expect(item["subtitle"]).to eq("Globex")
      end
    end

    context "with no matches" do
      it "returns empty results array" do
        get search_path, params: {q: "xyzabc123notexist"}
        expect(JSON.parse(response.body)).to eq({"results" => []})
      end
    end

    context "response shape" do
      let!(:contact) { create(:contact, user:, first_name: "Testy", last_name: "McTest") }

      it "returns JSON content type" do
        get search_path, params: {q: "Testy"}
        expect(response.content_type).to include("application/json")
      end

      it "returns grouped results with group and items keys" do
        get search_path, params: {q: "Testy"}
        json = JSON.parse(response.body)
        group = json["results"].first
        expect(group).to include("group", "items")
        expect(group["items"]).to be_an(Array)
      end
    end
  end

  private

  def parsed
    JSON.parse(response.body)
  end

  def contacts_group
    parsed["results"].find { |g| g["group"] == "Contacts" } || {"items" => []}
  end

  def companies_group
    parsed["results"].find { |g| g["group"] == "Companies" } || {"items" => []}
  end

  def deals_group
    parsed["results"].find { |g| g["group"] == "Deals" } || {"items" => []}
  end
end
