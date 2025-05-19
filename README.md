# Automated Test – Amazon BR Cart Validation

## Overview

This project automates the validation of Amazon Brazil’s shopping‑cart workflow.  
It checks that the unit price captured on the Product Detail Page (PDP) matches every subtotal displayed in the cart, both for a single item and after the quantity is updated.

---

## Technology Stack

| Tool                    | Role                      |
| ----------------------- | ------------------------- |
| **Cypress**             | End‑to‑end test framework |
| JavaScript / TypeScript | Scripting language        |

### Why Cypress?

- **Runs in the real browser** – the test sees exactly what the customer sees.
- **Fast feedback** – automatic reload, time‑travel UI, and rich debugging.
- **Zero configuration** – works out‑of‑the‑box with modern front‑end stacks.
- **CI/CD friendly** – simple headless execution and detailed video/screenshots on failure.

---

## Automation Strategy

1. **Search** Locate the product via the search bar using the term stored in `fixtures/product.json`.
2. **Select result** Identify the correct result with a RegExp match on the title.
3. **Capture price** Grab the unit price on the PDP and cache it via a Cypress alias / `Cypress.env`.
4. **Add to cart** Click _Add to Cart_ and navigate to the cart page.
5. **Validate prices** Assert that:

   - line‑item price
   - “one‑time payment” price (apex banner)
   - top‑bar subtotal
   - buy‑box subtotal (if shown)

   all equal the cached unit price.

6. **Change quantity** Select _2_ in the quantity dropdown and re‑validate that the subtotal doubles.
7. **Resilience features** Custom `waitUntil` loops, graceful handling of `about:blank` transitions, and suppression of Amazon’s internal JS errors keep the tests stable even when the site is slow or noisy.

---

## Installation & Execution

### Prerequisites

- **Node.js** ≥ 14
- **npm** (bundled with Node)

### Steps

```bash
# 1. Clone the repository
git clone <REPOSITORY_URL>
cd <PROJECT_FOLDER>

# 2. Install dependencies
npm install

# 3a. Run tests headlessly
npx cypress run

# 3b. …or open the interactive runner
npx cypress open
```
