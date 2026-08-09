/// <reference types="cypress" />

describe('CarbonMitra End-to-End User Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Completes full farmer land registration, NDVI estimate, credit minting, listing, and corporate buyer purchase', () => {
    // Step 1: Switch Role to Farmer
    cy.contains('Farmer / Landowner').click();

    // Step 2: Select Farmland Preset or Fill Land Form
    cy.contains('Anand, Gujarat').click();

    // Step 3: Fetch Satellite NDVI Estimate
    cy.contains('Analyze Satellite NDVI').click();
    cy.contains('Satellite Analysis Complete', { timeout: 10000 }).should('be.visible');
    cy.contains('NDVI Score').should('be.visible');

    // Step 4: Mint Carbon Credit on Polygon Amoy
    cy.contains('Mint Verified Credit Token').click();
    cy.contains('Carbon Credit Token Minted Successfully', { timeout: 10000 }).should('be.visible');
    cy.contains('Transaction Hash').should('be.visible');

    // Step 5: List Credit on Marketplace
    cy.contains('List on Marketplace').click();
    cy.contains('Listed for Sale').should('be.visible');

    // Step 6: Switch Role to Corporate Buyer
    cy.contains('Corporate Buyer').click();

    // Step 7: Browse Marketplace & Purchase Credit
    cy.contains('Marketplace').click();
    cy.contains('Buy Carbon Credit').first().click();
    cy.contains('Confirm Purchase').click();

    // Step 8: Verify Completed Transaction Ledger
    cy.contains('Purchase Successful', { timeout: 10000 }).should('be.visible');
    cy.contains('Transaction Ledger').click();
    cy.contains('Global Net-Zero ESG Fund').should('be.visible');
  });
});
