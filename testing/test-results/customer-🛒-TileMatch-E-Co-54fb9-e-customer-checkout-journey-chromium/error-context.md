# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: customer.spec.js >> 🛒 TileMatch E-Commerce Customer E2E Flow >> should successfully complete the entire customer checkout journey
- Location: e2e\customer.spec.js:7:3

# Error details

```
Error: expect(page).toHaveTitle(expected) failed

Expected pattern: /TileMatch/i
Received string:  "client"
Timeout: 5000ms

Call log:
  - Expect "toHaveTitle" with timeout 5000ms
    14 × unexpected value "client"

```

```yaml
- banner:
  - strong: "SALE ALERT:"
  - text: Up to 30% off selected Premium Tiles!
  - navigation:
    - link "TILE MATCH":
      - /url: /
    - textbox "Search tiles..."
    - link "Home":
      - /url: /
    - link "Shop":
      - /url: /shop
    - link "Track Order":
      - /url: /tracking
    - link "Login":
      - /url: /account
    - link:
      - /url: /cart
    - text: TILE MATCH
    - button
    - link "Home":
      - /url: /
    - link "Shop":
      - /url: /shop
    - link "Track Order":
      - /url: /tracking
    - link "Login":
      - /url: /account
- text: Premium Collection 2026
- heading "Craft Your Perfect Space with Luxury Tiles" [level=1]
- paragraph: Elevate your home with our curated selection of high-end tiles. Experience premium durability coupled with breathtaking modern design.
- link "Shop Collection":
  - /url: /shop
- link "Explore Porcelain":
  - /url: /shop?category=Porcelain
- contentinfo:
  - heading "TILEMATCH" [level=3]
  - paragraph: Premium tiles for every space. Transform your home with our curated collection of ceramic, porcelain, glass, natural stone, and decorative tiles.
  - heading "Quick Links" [level=4]
  - link "Home":
    - /url: /
  - link "Shop All Tiles":
    - /url: /shop
  - link "Ceramic":
    - /url: /shop?category=Ceramic
  - link "Porcelain":
    - /url: /shop?category=Porcelain
  - link "Glass":
    - /url: /shop?category=Glass
  - heading "Customer Service" [level=4]
  - link "Track Order":
    - /url: /tracking
  - link "My Account":
    - /url: /account
  - link "Shopping Cart":
    - /url: /cart
  - heading "Contact Us" [level=4]
  - paragraph: support@tilematch.com
  - paragraph: 0917-TILE-MATCH
  - paragraph: Naga City, Camarines Sur
  - heading "Payment Methods" [level=4]
  - text: GCash
  - paragraph: Secure Checkout
  - paragraph: © 2026 TileMatch. All rights reserved.
- text: "0"
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | 
  3  | test.describe('🛒 TileMatch E-Commerce Customer E2E Flow', () => {
  4  |   const uniqueEmail = `cust_e2e_${Date.now()}@example.com`;
  5  |   const securePassword = 'securepassword123';
  6  | 
  7  |   test('should successfully complete the entire customer checkout journey', async ({ page }) => {
  8  |     // 1. Visit the landing page
  9  |     await page.goto('/');
> 10 |     await expect(page).toHaveTitle(/TileMatch/i);
     |                        ^ Error: expect(page).toHaveTitle(expected) failed
  11 | 
  12 |     // 2. Navigate to Account page for registration
  13 |     await page.goto('/account');
  14 |     
  15 |     // Switch to Register tab
  16 |     await page.click('button:has-text("Register")');
  17 |     
  18 |     // Fill in registration credentials
  19 |     await page.fill('input[name="firstName"]', 'E2E');
  20 |     await page.fill('input[name="lastName"]', 'Customer');
  21 |     await page.fill('input[name="registerEmail"]', uniqueEmail);
  22 |     await page.fill('input[name="registerPassword"]', securePassword);
  23 |     await page.fill('input[name="phone"]', '09171234567');
  24 |     await page.fill('input[name="municipality"]', 'Pasig');
  25 |     await page.fill('input[name="city"]', 'Metro Manila');
  26 |     await page.fill('input[name="barangay"]', 'San Antonio');
  27 |     await page.fill('input[name="street"]', '101 Emerald Plaza');
  28 |     await page.fill('input[name="postalCode"]', '1600');
  29 |     
  30 |     // Click submit registration
  31 |     await page.click('.auth-card form button[type="submit"]');
  32 | 
  33 |     // Assert successful login welcome screen
  34 |     await page.waitForSelector('h1:has-text("My Account")');
  35 |     await expect(page.locator('.account-header p')).toContainText('Welcome, E2E Customer');
  36 | 
  37 |     // 3. Visit the Shop and interact with filters
  38 |     await page.goto('/shop');
  39 |     await page.waitForSelector('.shop-products');
  40 | 
  41 |     // Type a query in search box
  42 |     await page.fill('input[placeholder="Search tiles..."]', 'Ceramic');
  43 |     await page.press('input[placeholder="Search tiles..."]', 'Enter');
  44 |     
  45 |     // Wait for filtered products grid to render
  46 |     await page.waitForTimeout(1000); 
  47 | 
  48 |     // Find and add the first available product to the cart
  49 |     const addToCartBtn = page.locator('button[aria-label="Add to Cart"]').first();
  50 |     await expect(addToCartBtn).toBeVisible();
  51 |     await addToCartBtn.click();
  52 | 
  53 |     // 4. Proceed to Cart
  54 |     await page.goto('/cart');
  55 |     await page.waitForSelector('.cart-page');
  56 | 
  57 |     // Confirm that the item is present
  58 |     await expect(page.locator('.cart-item')).toBeVisible();
  59 | 
  60 |     // Increase quantity (using the numeric input or by navigating to checkout)
  61 |     const qtyInput = page.locator('.cart-item-qty input').first();
  62 |     await qtyInput.fill('3');
  63 |     await qtyInput.press('Enter');
  64 |     
  65 |     await page.waitForTimeout(500); // Wait for recalculations
  66 | 
  67 |     // Click checkout transition button
  68 |     await page.click('button:has-text("Proceed to Checkout")');
  69 | 
  70 |     // 5. Checkout Process (Step 1: Shipping)
  71 |     await page.waitForSelector('.checkout-page');
  72 |     await expect(page.locator('.step.active:has-text("Shipping")')).toBeVisible();
  73 | 
  74 |     // The fields should be pre-filled from registration. Confirm and continue to payment
  75 |     await page.click('button:has-text("Continue to Payment")');
  76 | 
  77 |     // Checkout Process (Step 2: GCash Payment)
  78 |     await expect(page.locator('.step.active:has-text("Payment")')).toBeVisible();
  79 |     
  80 |     // Enter GCash 13-digit reference number mockup
  81 |     await page.fill('input[placeholder="Enter the 13-digit reference number"]', '1234567890123');
  82 | 
  83 |     // Confirm order
  84 |     await page.click('button:has-text("Confirm Order")');
  85 | 
  86 |     // 6. Confirmation screen
  87 |     await page.waitForSelector('.confirmation-page, .success-card');
  88 |     await expect(page.locator('h1, h2')).toContainText(/placed/i);
  89 |     
  90 |     const orderNumber = await page.locator('.order-number').textContent();
  91 |     expect(orderNumber).toContain('ORD-');
  92 |   });
  93 | });
  94 | 
```