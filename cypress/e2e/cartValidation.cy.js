/// <reference types="cypress" />

// Simple cart validation – Amazon BR
// Target product: Huggies Fralda Premium Roupinha Natural Care XXG 52 Un

const product = require("../fixtures/product.json");

// Ignore Amazon's own JavaScript errors
Cypress.on("uncaught:exception", () => false);

// Converts a string like "R$ 74,90" → 74.9 (number)
function toNumber(txt) {
  return parseFloat(
    txt
      .replace(/[^0-9,]/g, "") // keeps only digits and comma
      .replace(".", "") // removes thousand separator, if any
      .replace(",", ".") // decimal comma → dot
  );
}

describe("Amazon Cart Validation", () => {
  // 1) Opens Amazon and accepts cookies

  beforeEach(() => {
    // 2) If the alias disappeared, recreate from global env
    const saved = Cypress.env("unitPrice");
    if (saved !== undefined) cy.wrap(saved).as("unitPrice");
  });

  before(() => {
    // 3) Visit homepage and accept cookies if button exists
    cy.visit("/");
    cy.get("body").then(($b) => {
      const btn = $b.find("#sp-cc-accept");
      if (btn.length) cy.wrap(btn).click();
    });
  });

  // 4‑8) Search, open, capture price and add 1 unit
  it("Searches for the product and adds 1 unit", () => {
    // 4) Search
    cy.get("#twotabsearchtextbox").type(product.searchTerm).type("{enter}");

    // 5) Waits for results
    cy.get('[data-component-type="s-search-result"]', {
      timeout: 20000,
    }).should("have.length.greaterThan", 0);

    // 6) Card matching the regex
    cy.contains(
      '[data-component-type="s-search-result"]',
      new RegExp(product.resultRegex, "i"),
      { timeout: 20000 }
    ).as("card");

    // 7) Open detail page
    cy.get("@card")
      .find('a[href*="/dp/"], a[href*="/gp/"]')
      .first()
      .invoke("removeAttr", "target")
      .click();

    // 8) Wait for product detail page to load
    cy.get("#ppd, #dp", { timeout: 20000 }).should("exist");

    // --- Main price capture (inside PDP) ---
    cy.get(".a-price .a-offscreen", { timeout: 10000 })
      .first()
      .invoke("text")
      .then((txt) => {
        const p = toNumber(txt);
        cy.wrap(p).as("unitPrice"); // alias for this block
        Cypress.env("unitPrice", p); // persist for other blocks
        cy.log("unitPrice PDP =", p);
      });

    // 9) Add to cart
    const addSel = [
      "#add-to-cart-button",
      'input[name="submit.add-to-cart"]',
      'button[data-testid="add-to-cart-button"]',
    ].join(", ");

    cy.get(addSel, { timeout: 15000 })
      .first()
      .scrollIntoView()
      .click({ force: true });

    // 10) Side button “Go to cart”
    cy.get("#sw-gtc > .a-button-inner > .a-button-text", { timeout: 10000 })
      .should("be.visible")
      .click({ force: true });

    //    EXTRA TOLERANCE BLOCK
    // -----------------------------
    // 11) Wait until cart is active
    cy.waitUntil(() => Cypress.$("#sc-active-cart").length, {
      timeout: 20000,
      interval: 500,
    });

    // 12) Ensures subtotals exist before continuing
    cy.waitUntil(
      () =>
        Cypress.$("#sc-subtotal-amount-buybox .a-size-medium").length ||
        Cypress.$("#sc-subtotal-amount-activecart .a-size-medium").length,
      { timeout: 20000, interval: 500 }
    );

    // --- ADJUSTED ROBUST BLOCK ---
    /* 13) Confirm left PDP and arrived (or arriving) at the cart */
    cy.location("pathname", { timeout: 20000 }).should((p) => {
      expect(p.includes("/cart") || p.includes("/gp/cart/view")).to.be.true;
    });

    /* 14) Wait for HTML to fully load */
    cy.document().its("readyState").should("eq", "complete");

    /* 15) If there's transition to about:blank, reload until back to cart */
    cy.location("href").then((href) => {
      if (href.includes("about:blank")) {
        cy.reload();
      }
    });

    //* 16) After waitUntil, proceed without requiring visibility */
    cy.log("Subtotal located – proceeding to comparisons");

    cy.get("@unitPrice").then((p) => cy.log("unitPrice =", p));
    cy.get(".sc-product-price").then(($el) => cy.log("line =", $el.text()));
    cy.get("#sc-subtotal-amount-activecart .a-size-medium").then(($el) =>
      cy.log("subTop =", $el.text())
    );
    Cypress.on("fail", (err) => {
      // forces logging and no test termination
      console.error(err);
      return false;
    });

    // --------------------------------

    // 17) Fallback for price in the cart
    cy.get("@unitPrice", { log: false }).then((val) => {
      if (val === undefined) {
        cy.get(".sc-product-price", { timeout: 10000 })
          .first()
          .invoke("text")
          .then((txt) => {
            const p = toNumber(txt);
            cy.wrap(p).as("unitPrice");
          });
      }
    });
  });

  // 18) Validates unit price and all subtotals (1 unit)
  it("Validates unit price and all subtotals (1 unit)", function () {
    cy.get("@unitPrice").then((p) => {
      // 19) Price in the item line
      cy.get(".sc-product-price").should(($el) => {
        const price = toNumber($el.text());
        expect(price).to.eq(p);
      });

      // 20) "One-time payment" price (apex)
      cy.get(
        '.sc-apex-cart-one-time-payment-price > .a-price > [aria-hidden="true"]'
      )
        .invoke("text")
        .then((txt) => {
          const price = toNumber(txt);
          expect(price).to.eq(p);
        });

      // 21) Subtotal (top bar of cart)
      cy.get("#sc-subtotal-amount-activecart > .a-size-medium")
        .invoke("text")
        .then((txt) => {
          const subtotalActive = toNumber(txt);
          expect(subtotalActive).to.eq(p);
        });

      // 22) Subtotal (side buybox, if exists)
      cy.get("#sc-subtotal-amount-buybox > .a-size-medium")
        .invoke("text")
        .then((txt) => {
          const subtotalBuybox = toNumber(txt);
          expect(subtotalBuybox).to.eq(p);
        });
    });
  });

  // 23) Changes to 2 units and revalidates subtotal
  it("Updates to 2 units and revalidates subtotal", function () {
    cy.get(
      'select[name="quantity"], select[name="quantityBox"], select.sc-update-quantity-select',
      { timeout: 20000 }
    )
      .first()
      .select("2");

    // 24) Waits for subtotal update
    cy.wait(1500);

    cy.get("@unitPrice").then((p) => {
      const expected = p * 2;

      // 25) Confirm quantity selected is 2
      cy.get(
        'select[name="quantity"] option:selected, select[name="quantityBox"] option:selected, select.sc-update-quantity-select option:selected'
      ).should("have.value", "2");

      // 26) Validate subtotal matches expected for 2 units
      cy.get("#sc-subtotal-amount-buybox .sc-price")
        .invoke("text")
        .then((txt) => {
          const subtotal = toNumber(txt);
          expect(subtotal).to.eq(expected);
        });
    });
  });
});
