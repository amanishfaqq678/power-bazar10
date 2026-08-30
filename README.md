# Power Bazar Hub

Build a complete, polished, responsive full-stack web application for POWER BAZAR based on the attached/reference Stitch designs and the supplied Power Bazar brand identity.

IMPORTANT:

This is not a generic ecommerce template.

This is a real-world digital product prototype for a Pakistani electrical products wholesale/retail business.

The application must be designed so it can later be taken into VS Code and extended with AI, n8n automation, WhatsApp integration, and production-level functionality.

==================================================

1. BRAND — SOURCE OF TRUTH

==================================================

Brand:

POWER BAZAR

Tagline:

POWERING YOUR WORLD

Use the supplied Power Bazar logo exactly as provided.

Do not redesign, recreate, distort, replace, or reinterpret the logo.

Brand colors:

Power Green:

#00A63C

Power Black:

#111111

Signal Red:

#E31B23

White:

#FFFFFF

Soft Surface:

#F4F6F5

Typography:

Manrope

Use the Stitch design as the primary visual reference for layout, spacing, hierarchy, visual style and overall art direction.

COLOR BALANCE:

White should remain the dominant digital surface.

Black should provide typography, structure and contrast.

Green should be a strong and memorable brand/action color.

Red should only be a small signal accent.

Do NOT turn the entire website green.

Do NOT create a neon, cyberpunk, gaming, futuristic AI-startup or glassmorphism aesthetic.

The final result should feel like a premium, modern, trustworthy electrical brand.

==================================================

2. REQUIRED TECH STACK

==================================================

Use:

Frontend:

React

TypeScript

Vite

Styling:

Tailwind CSS

UI:

shadcn/ui where appropriate

Backend:

Supabase

Database:

PostgreSQL through Supabase

Authentication:

Supabase Auth

File/image storage:

Supabase Storage

Version control:

GitHub-compatible project structure

Deployment target:

Vercel

IMPORTANT:

Use TypeScript, not plain JavaScript.

Keep the code modular, readable and easy to continue developing in VS Code with AI coding assistants.

Do not replace the requested architecture with another framework or database.

Do not introduce unnecessary technologies.

==================================================

3. APPLICATION GOAL

==================================================

The application should provide:

1. Professional Power Bazar website

2. Product catalog

3. Product categories

4. Product detail pages

5. Search and filtering

6. Request Quote / Product Inquiry workflow

7. AI Product Assistant interface

8. Admin authentication

9. Admin dashboard

10. Product management

11. Category management

12. Inventory management

13. Customer inquiry management

14. Responsive mobile experience

15. Backend-ready architecture for future n8n automation

16. Backend-ready architecture for future WhatsApp integration

The website must work as an MVP even if external AI/WhatsApp/n8n credentials are not yet connected.

==================================================

4. IMPORTANT BUSINESS MODEL

==================================================

Power Bazar is currently a wholesale/retail electrical products business.

DO NOT assume that Power Bazar currently has:

- online payment

- ecommerce checkout

- delivery tracking

- payment gateway

- confirmed online ordering

- confirmed product pricing

- confirmed business address

- confirmed phone number

- confirmed social handles

Therefore the primary customer conversion should be:

PRODUCT

→ REQUEST QUOTE / SEND INQUIRY

→ CUSTOMER DETAILS

→ DATABASE

→ BUSINESS FOLLOWS UP

Do NOT make online checkout the central flow.

A shopping cart can be omitted from the MVP unless necessary for a future-ready quotation basket.

If you create a multi-product quote basket, call it:

"Quote Request"

rather than "Shopping Cart".

==================================================

5. GLOBAL DESIGN SYSTEM

==================================================

Follow the Stitch visual design.

Use:

Manrope typography.

Generous whitespace.

Strong hierarchy.

Clean product photography.

8px standard card radius.

12px prominent card radius.

Pill controls where appropriate.

Subtle shadows.

Thin borders.

Smooth hover states.

Minimal icons.

No excessive animation.

No excessive gradients.

No neon glow.

No unnecessary decorative graphics.

Use subtle Power Bazar-inspired geometric/energy elements.

Do not place lightning icons everywhere.

The website must look professionally designed on:

Desktop

Tablet

Mobile

Do not simply shrink desktop layouts for mobile.

==================================================

6. GLOBAL HEADER

==================================================

Create one consistent modern responsive header used throughout the customer-facing website.

Desktop:

LEFT:

Official Power Bazar logo.

CENTER / NAVIGATION:

Home

Products

Categories

About

Support

RIGHT:

Search

AI Product Assistant

Request a Quote

Make the header sticky.

Use a subtle transition/shadow after scrolling.

The Request a Quote action should be visually prominent but not oversized.

Mobile:

Logo on left.

Search icon.

Menu button.

Inside mobile navigation:

Home

Products

Categories

AI Product Assistant

About

Support

Request a Quote

The header must feel premium and modern.

Do not create different random headers for different pages.

==================================================

7. GLOBAL FOOTER

==================================================

Create a consistent footer.

Include:

Power Bazar logo

POWERING YOUR WORLD

Product Categories:

LED Lighting

Switches & Sockets

Power & Extension

Electrical Protection

Wiring & Accessories

Home Electrical

Electrical Accessories

Company:

About

Support

Contact

Customer:

Request a Quote

AI Product Assistant

Social media should use placeholders only until actual links are provided.

Do not invent social handles.

==================================================

8. ROUTES / PAGES

==================================================

Create a proper multi-page application.

Required routes:

/

Home

/products

Products catalog

/products/:id

Product detail

/categories

All categories

/categories/:slug

Category listing

/ai-assistant

AI Product Assistant

/request-quote

Request Quote

/about

About Power Bazar

/support

Support

/contact

Contact

/admin/login

Admin login

/admin

Admin dashboard

/admin/products

Product management

/admin/products/new

Add product

/admin/products/:id/edit

Edit product

/admin/categories

Category management

/admin/inventory

Inventory management

/admin/inquiries

Customer inquiries

Use route-based navigation and proper loading/error states.

==================================================

9. HOME PAGE

==================================================

Build the homepage according to the Stitch design.

HERO:

Headline:

"POWERING YOUR WORLD."

Supporting text:

"Reliable electrical products for homes, shops and businesses — made easier to find, understand and choose."

Primary CTA:

Explore Products

Secondary CTA:

Request a Quote

Use a premium realistic electrical product composition.

Keep the hero mostly white with black typography and strong green accents.

Do not make the entire hero green.

Below the hero create a trust/value strip:

Reliable Products

Wholesale Supply

Wide Selection

Helpful Support

Then:

CATEGORY SECTION

Heading:

"Find what you need."

Categories:

LED Lighting

Switches & Sockets

Power & Extension

Electrical Protection

Wiring & Accessories

Home Electrical

Electrical Accessories

Use strong category cards with product imagery.

Then:

FEATURED PRODUCTS

Display products from the database.

Do not hard-code the final product catalog.

Use realistic generic placeholder seed data initially.

Then:

AI PRODUCT ASSISTANT SECTION

Heading:

"Not sure what you need?"

Supporting text:

"Tell us what you're looking for and we'll help you find the right product."

Show example:

"I need switches and sockets for a new bedroom."

CTA:

Find Products

Then:

WHY POWER BAZAR

Reliable

Practical

Accessible

Helpful Service

Then a strong Power Green brand section:

"Power made practical."

Then a Power Black section:

"Built for everyday power."

Then:

CUSTOMER INQUIRY CTA

"Need help choosing?"

Buttons:

Ask about a product

Request a quote

Contact Power Bazar

Then:

STORE / CONTACT section.

Do NOT invent an address.

Use a clean placeholder state saying verified store information will be added when provided.

==================================================

10. PRODUCTS PAGE

==================================================

Create a professional scalable product catalog.

Features:

Search

Category filter

Availability filter

Sort

Responsive product grid

Product cards must contain:

Image

Product name

Category

Short description/specification

Availability

Price if available

Request Quote

View Product

Because actual prices are not currently available, support:

"Request Price"

instead of displaying invented prices.

Use database-driven products.

Do not hard-code product cards into the UI.

==================================================

11. CATEGORY PAGE

==================================================

Create reusable category listing pages.

Example:

/categories/led-lighting

Show:

Category title

Category description

Category hero/product image

Subcategories if available

Filters

Product grid

Products must come from the database.

==================================================

12. PRODUCT DETAIL PAGE

==================================================

Create a premium product detail page.

Include:

Breadcrumb

Product image gallery

Product name

Category

Short description

Availability

SKU if available

Specifications

Quantity selector

Request Quote button

Ask AI About This Product

Related Products

The related products section must use category/product relationships rather than random hard-coded products.

If price is unavailable, display:

"Request Price"

rather than inventing a number.

==================================================

13. REQUEST QUOTE SYSTEM

==================================================

This is one of the most important functional parts.

Customer can request a quote for a product.

Form:

Customer name

Phone / WhatsApp

Email optional

Product

Quantity

Message

Submit.

Store the inquiry in Supabase.

Show success state:

"Your inquiry has been received. Power Bazar will contact you shortly."

Add a status field:

new

contacted

quoted

closed

The database should record:

customer_name

phone

email

product_id

quantity

message

status

created_at

Prepare the structure so n8n can later consume new inquiries.

==================================================

14. OPTIONAL QUOTE BASKET

==================================================

If implementing a quote basket, do NOT call it Shopping Cart.

Call it:

"Quote Request"

Customer can add multiple products.

Example:

Switch Board × 20

LED Bulb × 50

Socket × 30

Then submit one quote request.

Keep this separate from online checkout.

Do not implement payment.

==================================================

15. AI PRODUCT ASSISTANT

==================================================

Create a polished AI Product Assistant interface.

Route:

/ai-assistant

The AI assistant should eventually answer questions using Power Bazar's product catalog.

Example questions:

"I need switches for a bedroom."

"I need LED lights for a shop."

"Show me affordable switch boards."

"I need 20 sockets for a project."

"What is the difference between these two products?"

The assistant UI should be capable of displaying product recommendation cards.

Each recommendation should contain:

Product image

Product name

Short reason

Availability

View Product

Request Quote

IMPORTANT:

Do not connect a fake AI API.

For the initial MVP, create a clean assistant interface with a clearly separated service/function layer where the real AI API can later be connected.

Create a structure such as:

/services/aiAssistant

or equivalent modular architecture.

The AI should eventually receive relevant product information from the Power Bazar database.

Do not build a generic ChatGPT clone.

==================================================

16. DATABASE

==================================================

Create the Supabase/PostgreSQL database structure.

Required tables:

categories

products

product_images

inquiries

profiles

inventory

Optionally:

quote_items

Create proper relationships.

Suggested product structure:

id

name

slug

description

category_id

sku

price

price_available

availability

stock_quantity

specifications

created_at

updated_at

Category:

id

name

slug

description

image_url

created_at

updated_at

Product images:

id

product_id

image_url

alt_text

sort_order

Inventory:

id

product_id

quantity

low_stock_threshold

updated_at

Inquiry:

id

customer_name

phone

email

product_id

quantity

message

status

created_at

updated_at

Profiles:

id

user_id

name

role

created_at

Use appropriate foreign keys.

Do not duplicate product data unnecessarily.

==================================================

17. AUTHENTICATION

==================================================

Use Supabase Auth for admin authentication.

Admin route protection:

/admin

/admin/products

/admin/categories

/admin/inventory

/admin/inquiries

Unauthenticated users must be redirected to:

/admin/login

Do not expose admin functions to normal customers.

Create role-aware structure so future staff/admin roles can be added.

Do not create fake authentication.

Use Supabase Auth.

==================================================

18. ADMIN DASHBOARD

==================================================

Create a clean professional admin dashboard.

This is NOT the customer website.

Dashboard overview cards:

Total Products

Categories

Low Stock

New Inquiries

Recent inquiries.

Low-stock products.

Quick actions:

Add Product

Manage Products

Manage Inventory

View Inquiries

Keep the dashboard functional and simple.

==================================================

19. ADMIN PRODUCT MANAGEMENT

==================================================

Admin can:

View products

Search products

Filter products

Add product

Edit product

Delete product

Upload product images

Update descriptions

Update specifications

Update SKU

Update price

Set price visibility

Set availability

Use Supabase Storage for product images.

When a product changes, customer-facing product pages should use the updated database data.

Do not duplicate product information into separate static frontend files.

==================================================

20. CATEGORY MANAGEMENT

==================================================

Admin can:

View categories

Create category

Edit category

Delete category

Prevent invalid deletion when products depend on a category, or provide appropriate handling.

==================================================

21. INVENTORY

==================================================

Admin inventory page:

Product

SKU

Current stock

Low stock threshold

Availability

Last updated

Visual states:

In Stock

Low Stock

Out of Stock

Stock should be connected to the database.

==================================================

22. INQUIRIES

==================================================

Admin inquiry management.

Display:

Customer

Phone

Product

Quantity

Message

Date

Status

Admin can update status:

New

Contacted

Quoted

Closed

Provide filters.

==================================================

23. FUTURE n8n AUTOMATION ARCHITECTURE

==================================================

Do not require n8n credentials now.

However, structure the application so these future automations are possible:

NEW INQUIRY

Website

→ Supabase

→ n8n webhook/event

→ Owner notification

→ WhatsApp

→ Email

LOW STOCK

Supabase inventory

→ n8n

→ Owner notification

CUSTOMER FOLLOW-UP

Inquiry status

→ n8n

→ WhatsApp/email

Do not expose n8n to customers.

Create clean service/API boundaries so the integrations can be added later in VS Code.

==================================================

24. FUTURE WHATSAPP INTEGRATION

==================================================

Prepare the inquiry system for WhatsApp.

Do not fake a WhatsApp API.

Use a configuration/service abstraction that can later connect to the official WhatsApp Business API through n8n.

The UI can provide a WhatsApp contact button using a placeholder configuration.

Do not hard-code a fake phone number.

==================================================

25. SEO

==================================================

Implement basic SEO foundations.

Each major page should have:

Unique title

Meta description

Canonical-friendly URL structure

Semantic HTML

Proper heading hierarchy

Descriptive image alt text

Use clean slugs:

/products

/products/product-name

/categories/led-lighting

Do not keyword-stuff.

==================================================

26. ACCESSIBILITY

==================================================

Use:

Semantic HTML

Accessible buttons

Keyboard-friendly navigation

Visible focus states

Good color contrast

Alt text

Form labels

ARIA only where necessary.

Do not sacrifice accessibility for visual effects.

==================================================

27. PERFORMANCE

==================================================

Optimize:

Image loading

Lazy loading where appropriate

Responsive image sizes

Component reuse

Avoid unnecessary dependencies

Avoid excessive client-side rendering where not required

Keep the application fast on mobile devices.

==================================================

28. ERROR / LOADING STATES

==================================================

Every database-driven screen must handle:

Loading

Empty state

Error

Success

Examples:

No products found

No inquiries yet

No category products

Image loading

Database error

Failed form submission

Do not leave blank screens.

==================================================

29. PLACEHOLDER DATA

==================================================

Create a small realistic seed catalog so the application looks complete during development.

Use generic product names such as:

PB Classic 1-Gang Switch

PB Modular Double Socket

PB LED Panel 12W

PB LED Bulb 9W

PB Extension Board 4-Way

PB Modular Switch Board

These are prototype placeholder products only.

Do not use third-party brand names.

Do not invent fake Power Bazar claims.

Use placeholder images that can later be replaced through the admin panel.

Do not invent real prices.

Use "Request Price" where price is not available.

==================================================

30. COMPONENT ARCHITECTURE

==================================================

Build reusable components.

Examples:

Header

Footer

ProductCard

ProductGrid

CategoryCard

SearchBar

FilterPanel

QuoteButton

InquiryForm

AIProductCard

ProductGallery

AvailabilityBadge

AdminSidebar

AdminTable

StatsCard

Modal

Toast

LoadingState

EmptyState

Avoid duplicating identical UI across pages.

==================================================

31. CODE QUALITY

==================================================

Use TypeScript throughout.

Use clear interfaces/types for:

Product

Category

ProductImage

Inventory

Inquiry

Profile

QuoteItem

Keep database access separate from presentation components.

Keep AI service separate from UI.

Keep future automation integration separate from UI.

Keep environment variables out of source code.

Never expose secret API keys in frontend code.

Use .env.example with placeholders for future integrations.

==================================================

32. IMPORTANT IMPLEMENTATION RULE

==================================================

Build a FUNCTIONAL MVP, not merely screenshots.

The following should actually work:

Navigation

Routing

Product catalog

Search/filter UI

Product details

Database connection

Admin login

Admin product CRUD

Category CRUD

Inventory updates

Inquiry submission

Inquiry storage

Admin inquiry management

AI, n8n and WhatsApp should have clean integration points but do not require production credentials during this first build.

==================================================

33. DO NOT OVERBUILD

==================================================

Do not implement:

Payment gateway

Complex ecommerce checkout

Delivery tracking

ERP

Accounting

Complex CRM

Vector database

Complex recommendation engine

Unnecessary microservices

Unnecessary third-party libraries

Keep the architecture clean and extensible.

==================================================

34. FINAL QUALITY STANDARD

==================================================

The final application should feel like:

A professional Pakistani electrical brand website combined with a useful product management platform.

CUSTOMER SIDE:

Premium

Simple

Trustworthy

Product-focused

Fast

Mobile-friendly

ADMIN SIDE:

Practical

Clear

Easy to manage

TECHNICAL SIDE:

Modular

Type-safe

Database-driven

GitHub-friendly

Easy to continue in VS Code

The Power Bazar brand must remain the focus.

The technology should support the business instead of becoming the visual identity.

Build the complete MVP now using the requested architecture and the attached Stitch design as the visual reference.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/94e64ac3-f710-490e-a354-ce34701b99e6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
