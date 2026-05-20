const { test, expect } = require('@playwright/test');

test.describe('🛒 TileMatch E-Commerce Customer E2E Flow', () => {
  const uniqueEmail = `cust_e2e_${Date.now()}@example.com`;
  const securePassword = 'securepassword123';

  test('should successfully complete the entire customer checkout journey', async ({ page }) => {
    // 1. Visit the landing page
    await page.goto('/');
    await expect(page).toHaveTitle(/TileMatch/i);

    // 2. Navigate to Account page for registration
    await page.goto('/account');
    
    // Switch to Register tab
    await page.click('button:has-text("Register")');
    
    // Fill in registration credentials
    await page.fill('input[name="firstName"]', 'E2E');
    await page.fill('input[name="lastName"]', 'Customer');
    await page.fill('input[name="registerEmail"]', uniqueEmail);
    await page.fill('input[name="registerPassword"]', securePassword);
    await page.fill('input[name="phone"]', '09171234567');
    await page.fill('input[name="municipality"]', 'Pasig');
    await page.fill('input[name="city"]', 'Metro Manila');
    await page.fill('input[name="barangay"]', 'San Antonio');
    await page.fill('input[name="street"]', '101 Emerald Plaza');
    await page.fill('input[name="postalCode"]', '1600');
    
    // Click submit registration
    await page.click('.auth-card form button[type="submit"]');

    // Assert successful login welcome screen
    await page.waitForSelector('h1:has-text("My Account")');
    await expect(page.locator('.account-header p')).toContainText('Welcome, E2E Customer');

    // 3. Visit the Shop and interact with filters
    await page.goto('/shop');
    await page.waitForSelector('.shop-products');

    // Type a query in search box
    await page.fill('input[placeholder="Search tiles..."]', 'Ceramic');
    await page.press('input[placeholder="Search tiles..."]', 'Enter');
    
    // Wait for filtered products grid to render
    await page.waitForTimeout(1000); 

    // Find and add the first available product to the cart
    const addToCartBtn = page.locator('button[aria-label="Add to Cart"]').first();
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();

    // 4. Proceed to Cart
    await page.goto('/cart');
    await page.waitForSelector('.cart-page');

    // Confirm that the item is present
    await expect(page.locator('.cart-item')).toBeVisible();

    // Increase quantity (using the numeric input or by navigating to checkout)
    const qtyInput = page.locator('.cart-item-qty input').first();
    await qtyInput.fill('3');
    await qtyInput.press('Enter');
    
    await page.waitForTimeout(500); // Wait for recalculations

    // Click checkout transition button
    await page.click('button:has-text("Proceed to Checkout")');

    // 5. Checkout Process (Step 1: Shipping)
    await page.waitForSelector('.checkout-page');
    await expect(page.locator('.step.active:has-text("Shipping")')).toBeVisible();

    // The fields should be pre-filled from registration. Confirm and continue to payment
    await page.click('button:has-text("Continue to Payment")');

    // Checkout Process (Step 2: GCash Payment)
    await expect(page.locator('.step.active:has-text("Payment")')).toBeVisible();
    
    // Enter GCash 13-digit reference number mockup
    await page.fill('input[placeholder="Enter the 13-digit reference number"]', '1234567890123');

    // Confirm order
    await page.click('button:has-text("Confirm Order")');

    // 6. Confirmation screen
    await page.waitForSelector('.confirmation-page, .success-card');
    await expect(page.locator('h1, h2')).toContainText(/placed/i);
    
    const orderNumber = await page.locator('.order-number').textContent();
    expect(orderNumber).toContain('ORD-');
  });
});
