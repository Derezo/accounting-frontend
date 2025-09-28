import React from 'react'
import { TrendingUp, TrendingDown, FileText } from 'lucide-react'
import { Table } from '@/components/ui/table'
import { IncomeStatement } from '@/types/accounting'
import { cn } from '@/lib/utils'

interface IncomeStatementReportProps {
  data?: IncomeStatement
  isLoading: boolean
  periodStart: string
  periodEnd: string
}

interface IncomeStatementLineProps {
  line: IncomeStatement['operatingRevenue'][0]
  level?: number
}

function IncomeStatementLine({ line, level = 0 }: IncomeStatementLineProps) {
  const indentClass = level > 0 ? `pl-${level * 4}` : ''

  return (
    <>
      <tr className={cn(
        "border-b",
        line.isTotal && "bg-muted/25 font-semibold",
        level === 0 && "bg-muted/10"
      )}>
        <td className={cn("p-3", indentClass)}>
          <div className="flex items-center gap-2">
            {line.account && (
              <span className="text-xs text-muted-foreground font-mono">
                {line.account.code}
              </span>
            )}
            <span className={cn(
              line.isTotal && "font-semibold",
              level === 0 && "font-medium"
            )}>
              {line.label}
            </span>
          </div>
        </td>
        <td className="p-3 text-right">
          <span className={cn(
            line.isTotal && "font-semibold",
            line.amount < 0 && "text-red-600"
          )}>
            ${Math.abs(line.amount).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </span>
        </td>
      </tr>
      {line.children && line.children.map((child, index) => (
        <IncomeStatementLine key={index} line={child} level={level + 1} />
      ))}
    </>
  )
}

export function IncomeStatementReport({ data, isLoading, periodStart, periodEnd }: IncomeStatementReportProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4" />
          <div className="space-y-2">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="h-6 bg-muted/50 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">No income statement data available</h3>
        <p className="text-muted-foreground">
          Unable to generate income statement for the selected period.
        </p>
      </div>
    )
  }

  const grossProfitMargin = data.totalRevenue > 0 ? (data.grossProfit / data.totalRevenue) * 100 : 0
  const operatingMargin = data.totalRevenue > 0 ? (data.operatingIncome / data.totalRevenue) * 100 : 0
  const netMargin = data.totalRevenue > 0 ? (data.netIncome / data.totalRevenue) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">Income Statement</h2>
        <p className="text-muted-foreground">
          For the period from {new Date(periodStart).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })} to {new Date(periodEnd).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Generated on {new Date(data.generatedAt).toLocaleString()}
        </p>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className={cn(
          "bg-card border rounded-lg p-4",
          data.grossProfit >= 0 ? "border-green-200" : "border-red-200"
        )}>
          <div className="flex items-center gap-2 mb-2">
            {data.grossProfit >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className="text-sm font-medium">Gross Profit</span>
          </div>
          <div className={cn(
            "text-2xl font-bold",
            data.grossProfit >= 0 ? "text-green-600" : "text-red-600"
          )}>
            ${data.grossProfit.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>
          <div className="text-xs text-muted-foreground">
            Margin: {grossProfitMargin.toFixed(1)}%
          </div>
        </div>

        <div className={cn(
          "bg-card border rounded-lg p-4",
          data.operatingIncome >= 0 ? "border-blue-200" : "border-red-200"
        )}>
          <div className="flex items-center gap-2 mb-2">
            {data.operatingIncome >= 0 ? (
              <TrendingUp className="h-4 w-4 text-blue-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className="text-sm font-medium">Operating Income</span>
          </div>
          <div className={cn(
            "text-2xl font-bold",
            data.operatingIncome >= 0 ? "text-blue-600" : "text-red-600"
          )}>
            ${data.operatingIncome.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>
          <div className="text-xs text-muted-foreground">
            Margin: {operatingMargin.toFixed(1)}%
          </div>
        </div>

        <div className={cn(
          "bg-card border rounded-lg p-4",
          data.netIncome >= 0 ? "border-purple-200" : "border-red-200"
        )}>
          <div className="flex items-center gap-2 mb-2">
            {data.netIncome >= 0 ? (
              <TrendingUp className="h-4 w-4 text-purple-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className="text-sm font-medium">Net Income</span>
          </div>
          <div className={cn(
            "text-2xl font-bold",
            data.netIncome >= 0 ? "text-purple-600" : "text-red-600"
          )}>
            ${data.netIncome.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>
          <div className="text-xs text-muted-foreground">
            Margin: {netMargin.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Income Statement Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <tbody>
            {/* REVENUE */}
            <tr className="bg-primary text-primary-foreground">
              <td className="p-4 font-bold text-lg" colSpan={2}>REVENUE</td>
            </tr>

            {/* Operating Revenue */}
            <tr className="bg-muted/50">
              <td className="p-3 font-semibold">Operating Revenue</td>
              <td className="p-3"></td>
            </tr>
            {data.operatingRevenue.map((line, index) => (
              <IncomeStatementLine key={index} line={line} level={1} />
            ))}

            {/* Other Revenue */}
            {data.otherRevenue.length > 0 && (
              <>
                <tr className="bg-muted/50">
                  <td className="p-3 font-semibold">Other Revenue</td>
                  <td className="p-3"></td>
                </tr>
                {data.otherRevenue.map((line, index) => (
                  <IncomeStatementLine key={index} line={line} level={1} />
                ))}
              </>
            )}

            {/* Total Revenue */}
            <tr className="bg-green-50 border-t-2 border-green-200">
              <td className="p-4 font-bold">TOTAL REVENUE</td>
              <td className="p-4 text-right font-bold text-green-600">
                ${data.totalRevenue.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </td>
            </tr>

            {/* Spacer */}
            <tr className="h-4">
              <td colSpan={2}></td>
            </tr>

            {/* COST OF GOODS SOLD */}
            {data.costOfGoodsSold.length > 0 && (
              <>
                <tr className="bg-primary text-primary-foreground">
                  <td className="p-4 font-bold text-lg" colSpan={2}>COST OF GOODS SOLD</td>
                </tr>
                {data.costOfGoodsSold.map((line, index) => (
                  <IncomeStatementLine key={index} line={line} level={0} />
                ))}

                {/* Gross Profit */}
                <tr className="bg-blue-50 border-t-2 border-blue-200">
                  <td className="p-4 font-bold">GROSS PROFIT</td>
                  <td className={cn(
                    "p-4 text-right font-bold",
                    data.grossProfit >= 0 ? "text-blue-600" : "text-red-600"
                  )}>
                    ${data.grossProfit.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </td>
                </tr>

                {/* Spacer */}
                <tr className="h-4">
                  <td colSpan={2}></td>
                </tr>
              </>
            )}

            {/* OPERATING EXPENSES */}
            <tr className="bg-primary text-primary-foreground">
              <td className="p-4 font-bold text-lg" colSpan={2}>OPERATING EXPENSES</td>
            </tr>
            {data.operatingExpenses.map((line, index) => (
              <IncomeStatementLine key={index} line={line} level={0} />
            ))}

            {/* Total Operating Expenses */}
            <tr className="bg-red-50 border-t">
              <td className="p-3 font-semibold">TOTAL OPERATING EXPENSES</td>
              <td className="p-3 text-right font-semibold text-red-600">
                ${data.totalExpenses.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </td>
            </tr>

            {/* Operating Income */}
            <tr className="bg-blue-50 border-t-2 border-blue-200">
              <td className="p-4 font-bold">OPERATING INCOME</td>
              <td className={cn(
                "p-4 text-right font-bold",
                data.operatingIncome >= 0 ? "text-blue-600" : "text-red-600"
              )}>
                ${data.operatingIncome.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </td>
            </tr>

            {/* Other Expenses */}
            {data.otherExpenses.length > 0 && (
              <>
                {/* Spacer */}
                <tr className="h-4">
                  <td colSpan={2}></td>
                </tr>

                <tr className="bg-muted/50">
                  <td className="p-3 font-semibold">Other Expenses</td>
                  <td className="p-3"></td>
                </tr>
                {data.otherExpenses.map((line, index) => (
                  <IncomeStatementLine key={index} line={line} level={1} />
                ))}
              </>
            )}

            {/* Net Income */}
            <tr className="bg-purple-50 border-t-2 border-purple-200">
              <td className="p-4 font-bold text-lg">NET INCOME</td>
              <td className={cn(
                "p-4 text-right font-bold text-lg",
                data.netIncome >= 0 ? "text-purple-600" : "text-red-600"
              )}>
                ${data.netIncome.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </td>
            </tr>
          </tbody>
        </Table>
      </div>

      {/* Financial Ratios */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Gross Margin</div>
          <div className={cn(
            "text-2xl font-bold",
            grossProfitMargin >= 0 ? "text-green-600" : "text-red-600"
          )}>
            {grossProfitMargin.toFixed(1)}%
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Operating Margin</div>
          <div className={cn(
            "text-2xl font-bold",
            operatingMargin >= 0 ? "text-blue-600" : "text-red-600"
          )}>
            {operatingMargin.toFixed(1)}%
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Net Margin</div>
          <div className={cn(
            "text-2xl font-bold",
            netMargin >= 0 ? "text-purple-600" : "text-red-600"
          )}>
            {netMargin.toFixed(1)}%
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Expense Ratio</div>
          <div className="text-2xl font-bold">
            {data.totalRevenue > 0
              ? ((data.totalExpenses / data.totalRevenue) * 100).toFixed(1) + '%'
              : 'N/A'
            }
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="text-xs text-muted-foreground p-4 bg-muted/25 rounded-lg">
        <p className="font-medium mb-2">Notes:</p>
        <ul className="space-y-1">
          <li>• All amounts are shown in the organization's base currency</li>
          <li>• Revenue is recognized when earned, expenses when incurred (accrual basis)</li>
          <li>• Gross profit = Total Revenue - Cost of Goods Sold</li>
          <li>• Operating income = Gross Profit - Operating Expenses</li>
          <li>• Net income = Operating Income - Other Expenses</li>
        </ul>
      </div>
    </div>
  )
}