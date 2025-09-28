import { describe, it, expect } from 'vitest'
import { expectFinancialEquals, calculateTotalWithTax } from '@/lib/test-utils'

// Financial calculation precision helper
const roundToFixed = (num: number, digits: number = 2): number => {
  return Math.round((num + Number.EPSILON) * Math.pow(10, digits)) / Math.pow(10, digits)
}

describe('Financial Calculations', () => {
  describe('precision and rounding', () => {
    it('should handle currency precision correctly', () => {
      const testCases = [
        { input: 123.456, expected: 123.46 },
        { input: 123.454, expected: 123.45 },
        { input: 123.455, expected: 123.46 }, // Banker's rounding
        { input: 999.999, expected: 1000.00 },
        { input: 0.001, expected: 0.00 },
        { input: 0.005, expected: 0.01 },
      ]

      testCases.forEach(({ input, expected }) => {
        expectFinancialEquals(roundToFixed(input, 2), expected)
      })
    })

    it('should maintain precision across multiple calculations', () => {
      // Simulate invoice calculation: 3 items with tax
      const item1 = { quantity: 2.5, unitPrice: 125.33 }
      const item2 = { quantity: 1.75, unitPrice: 89.99 }
      const item3 = { quantity: 3, unitPrice: 199.95 }

      const subtotal1 = roundToFixed(item1.quantity * item1.unitPrice, 2)
      const subtotal2 = roundToFixed(item2.quantity * item2.unitPrice, 2)
      const subtotal3 = roundToFixed(item3.quantity * item3.unitPrice, 2)

      expectFinancialEquals(subtotal1, 313.33)
      expectFinancialEquals(subtotal2, 157.48)
      expectFinancialEquals(subtotal3, 599.85)

      const totalSubtotal = roundToFixed(subtotal1 + subtotal2 + subtotal3, 2)
      expectFinancialEquals(totalSubtotal, 1070.66)

      const tax = roundToFixed(totalSubtotal * 0.12, 2)
      expectFinancialEquals(tax, 128.48)

      const grandTotal = roundToFixed(totalSubtotal + tax, 2)
      expectFinancialEquals(grandTotal, 1199.14)
    })

    it('should handle edge cases in financial calculations', () => {
      // Test very small amounts
      expectFinancialEquals(roundToFixed(0.001, 2), 0.00)
      expectFinancialEquals(roundToFixed(0.009, 2), 0.01)

      // Test very large amounts
      expectFinancialEquals(roundToFixed(999999.999, 2), 1000000.00)

      // Test negative amounts (refunds/adjustments)
      expectFinancialEquals(roundToFixed(-123.456, 2), -123.46)
      expectFinancialEquals(roundToFixed(-0.001, 2), -0.00)
    })
  })

  describe('tax calculations', () => {
    it('should calculate tax correctly for various rates', () => {
      const testCases = [
        { subtotal: 1000.00, taxRate: 0.05, expectedTax: 50.00, expectedTotal: 1050.00 },
        { subtotal: 1000.00, taxRate: 0.12, expectedTax: 120.00, expectedTotal: 1120.00 },
        { subtotal: 1000.00, taxRate: 0.15, expectedTax: 150.00, expectedTotal: 1150.00 },
        { subtotal: 123.45, taxRate: 0.0875, expectedTax: 10.80, expectedTotal: 134.25 },
        { subtotal: 0.01, taxRate: 0.12, expectedTax: 0.00, expectedTotal: 0.01 },
      ]

      testCases.forEach(({ subtotal, taxRate, expectedTax, expectedTotal }) => {
        const tax = roundToFixed(subtotal * taxRate, 2)
        const total = calculateTotalWithTax(subtotal, taxRate)

        expectFinancialEquals(tax, expectedTax)
        expectFinancialEquals(total, expectedTotal)
      })
    })

    it('should handle compound tax calculations', () => {
      const subtotal = 1000.00
      const gstRate = 0.05 // 5% GST
      const pstRate = 0.07 // 7% PST

      const gst = roundToFixed(subtotal * gstRate, 2)
      const pst = roundToFixed(subtotal * pstRate, 2)
      const total = roundToFixed(subtotal + gst + pst, 2)

      expectFinancialEquals(gst, 50.00)
      expectFinancialEquals(pst, 70.00)
      expectFinancialEquals(total, 1120.00)
    })

    it('should handle tax-inclusive pricing', () => {
      // Calculate tax from total when price includes tax
      const totalWithTax = 1120.00
      const taxRate = 0.12
      const subtotal = roundToFixed(totalWithTax / (1 + taxRate), 2)
      const tax = roundToFixed(totalWithTax - subtotal, 2)

      expectFinancialEquals(subtotal, 1000.00)
      expectFinancialEquals(tax, 120.00)
    })
  })

  describe('discount calculations', () => {
    it('should calculate percentage discounts correctly', () => {
      const testCases = [
        { original: 1000.00, discount: 0.10, expected: 900.00 },
        { original: 123.45, discount: 0.15, expected: 104.93 },
        { original: 99.99, discount: 0.20, expected: 79.99 },
        { original: 0.99, discount: 0.50, expected: 0.50 },
      ]

      testCases.forEach(({ original, discount, expected }) => {
        const discountedPrice = roundToFixed(original * (1 - discount), 2)
        expectFinancialEquals(discountedPrice, expected)
      })
    })

    it('should calculate fixed amount discounts correctly', () => {
      const testCases = [
        { original: 1000.00, discount: 100.00, expected: 900.00 },
        { original: 50.00, discount: 10.00, expected: 40.00 },
        { original: 10.00, discount: 15.00, expected: 0.00 }, // Cannot go below 0
      ]

      testCases.forEach(({ original, discount, expected }) => {
        const discountedPrice = Math.max(0, roundToFixed(original - discount, 2))
        expectFinancialEquals(discountedPrice, expected)
      })
    })
  })

  describe('payment calculations', () => {
    it('should calculate payment allocations correctly', () => {
      // Multiple invoices with partial payment
      const invoices = [
        { id: 'inv1', amount: 500.00, paid: 0 },
        { id: 'inv2', amount: 300.00, paid: 0 },
        { id: 'inv3', amount: 200.00, paid: 0 },
      ]

      const paymentAmount = 750.00

      // Allocate payment to oldest invoices first
      let remainingPayment = paymentAmount
      const allocations = invoices.map(invoice => {
        const allocation = Math.min(remainingPayment, invoice.amount - invoice.paid)
        remainingPayment -= allocation
        return { invoiceId: invoice.id, amount: roundToFixed(allocation, 2) }
      })

      expect(allocations[0].amount).toBe(500.00) // Full payment to first invoice
      expect(allocations[1].amount).toBe(250.00) // Partial payment to second invoice
      expect(allocations[2].amount).toBe(0.00)   // No payment to third invoice
      expect(remainingPayment).toBe(0.00)
    })

    it('should handle overpayment scenarios', () => {
      const invoiceAmount = 1000.00
      const paymentAmount = 1100.00
      const overpayment = roundToFixed(paymentAmount - invoiceAmount, 2)

      expectFinancialEquals(overpayment, 100.00)
    })

    it('should calculate payment processing fees', () => {
      const testCases = [
        { amount: 1000.00, feeRate: 0.029, fixedFee: 0.30, expectedFee: 29.30 },
        { amount: 50.00, feeRate: 0.029, fixedFee: 0.30, expectedFee: 1.75 },
        { amount: 10.00, feeRate: 0.029, fixedFee: 0.30, expectedFee: 0.59 },
      ]

      testCases.forEach(({ amount, feeRate, fixedFee, expectedFee }) => {
        const fee = roundToFixed((amount * feeRate) + fixedFee, 2)
        expectFinancialEquals(fee, expectedFee)
      })
    })
  })

  describe('currency conversion', () => {
    it('should handle currency conversion with proper rounding', () => {
      const usdAmount = 1000.00
      const exchangeRate = 1.35 // USD to CAD
      const cadAmount = roundToFixed(usdAmount * exchangeRate, 2)

      expectFinancialEquals(cadAmount, 1350.00)
    })

    it('should maintain precision in conversion chains', () => {
      const originalAmount = 1000.00
      const usdToCad = 1.35
      const cadToEur = 0.68

      // Convert USD -> CAD -> EUR
      const cadAmount = roundToFixed(originalAmount * usdToCad, 2)
      const eurAmount = roundToFixed(cadAmount * cadToEur, 2)

      expectFinancialEquals(cadAmount, 1350.00)
      expectFinancialEquals(eurAmount, 918.00)
    })
  })

  describe('interest and penalty calculations', () => {
    it('should calculate late payment penalties', () => {
      const invoiceAmount = 1000.00
      const penaltyRate = 0.015 // 1.5% per month
      const monthsOverdue = 2

      const penalty = roundToFixed(invoiceAmount * penaltyRate * monthsOverdue, 2)
      expectFinancialEquals(penalty, 30.00)
    })

    it('should calculate compound interest', () => {
      const principal = 1000.00
      const rate = 0.12 // 12% annual
      const years = 1
      const compoundingPeriods = 12 // Monthly

      const amount = principal * Math.pow(1 + (rate / compoundingPeriods), compoundingPeriods * years)
      const compoundAmount = roundToFixed(amount, 2)

      expectFinancialEquals(compoundAmount, 1126.83)
    })
  })

  describe('recurring billing calculations', () => {
    it('should calculate prorated amounts for partial periods', () => {
      const monthlyAmount = 1000.00
      const daysInMonth = 30
      const daysUsed = 15

      const proratedAmount = roundToFixed((monthlyAmount / daysInMonth) * daysUsed, 2)
      expectFinancialEquals(proratedAmount, 500.00)
    })

    it('should handle leap year prorating', () => {
      const yearlyAmount = 1200.00
      const daysInLeapYear = 366
      const daysUsed = 60

      const proratedAmount = roundToFixed((yearlyAmount / daysInLeapYear) * daysUsed, 2)
      expectFinancialEquals(proratedAmount, 196.72)
    })
  })

  describe('financial reporting calculations', () => {
    it('should calculate accurate profit margins', () => {
      const revenue = 10000.00
      const costs = 6500.00
      const grossProfit = roundToFixed(revenue - costs, 2)
      const marginPercentage = roundToFixed((grossProfit / revenue) * 100, 2)

      expectFinancialEquals(grossProfit, 3500.00)
      expectFinancialEquals(marginPercentage, 35.00)
    })

    it('should handle zero-division scenarios in ratio calculations', () => {
      const revenue = 0.00
      const costs = 100.00

      // Profit margin calculation when revenue is zero
      const margin = revenue === 0 ? 0 : roundToFixed(((revenue - costs) / revenue) * 100, 2)
      expect(margin).toBe(0)
    })
  })
})