// Se já tiver outras importações, mantenha
Cypress.Commands.add('addProductToCart', (productNameRegex) => {
  // Procura o cartão do produto usando regex para tolerar variações de texto
  cy.contains('[data-component-type="s-search-result"]', productNameRegex, { timeout: 20000 })
    .scrollIntoView()
    .within(() => {
      // Procura botão ou link que adiciona ao carrinho
      cy.contains('button, a', /adicionar|carrinho/i).first().click();
    });
});