import React from 'react'
import { AlertTriangle, CheckCircle, FileText } from 'lucide-react'
import { Table } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { BalanceSheet } from '@/types/accounting'
import { cn } from '@/lib/utils'

interface BalanceSheetReportProps {
  data?: BalanceSheet
  isLoading: boolean
  asOfDate: string
}

interface BalanceSheetLineProps {
  line: BalanceSheet['currentAssets'][0]
  level?: number
}

function BalanceSheetLine({ line, level = 0 }: BalanceSheetLineProps) {
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
        <BalanceSheetLine key={index} line={child} level={level + 1} />
      ))}
    </>
  )
}

export function BalanceSheetReport({ data, isLoading, asOfDate }: BalanceSheetReportProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4" />
          <div className="space-y-2">
            {[...Array(15)].map((_, i) => (
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
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">No balance sheet data available</h3>
        <p className="text-muted-foreground">
          Unable to generate balance sheet for the selected date.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">Balance Sheet</h2>
        <p className="text-muted-foreground">
          As of {new Date(asOfDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Generated on {new Date(data.generatedAt).toLocaleString()}
        </p>
      </div>

      {/* Balance Verification */}
      <div className={cn(
        "p-4 rounded-lg border flex items-center gap-3",
        data.isBalanced
          ? "bg-green-50 border-green-200 text-green-800"
          : "bg-red-50 border-red-200 text-red-800"
      )}>
        {data.isBalanced ? (
          <CheckCircle className="h-5 w-5" />
        ) : (
          <AlertTriangle className="h-5 w-5" />
        )}
        <div>
          <div className="font-medium">
            {data.isBalanced ? 'Balance Sheet is Balanced' : 'Balance Sheet is NOT Balanced'}
          </div>
          <div className="text-sm">
            Total Assets: ${data.totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })} |
            Total Liabilities + Equity: ${data.totalLiabilitiesAndEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            {!data.isBalanced && (
              <span className="ml-2">
                (Difference: ${Math.abs(data.totalAssets - data.totalLiabilitiesAndEquity).toLocaleString('en-US', { minimumFractionDigits: 2 })})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Balance Sheet Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <tbody>
            {/* ASSETS */}
            <tr className="bg-primary text-primary-foreground">
              <td className="p-4 font-bold text-lg" colSpan={2}>ASSETS</td>
            </tr>

            {/* Current Assets */}
            <tr className="bg-muted/50">
              <td className="p-3 font-semibold">Current Assets</td>
              <td className="p-3"></td>
            </tr>
            {data.currentAssets.map((line, index) => (
              <BalanceSheetLine key={index} line={line} level={1} />
            ))}

            {/* Fixed Assets */}
            <tr className="bg-muted/50">
              <td className="p-3 font-semibold">Fixed Assets</td>
              <td className="p-3"></td>
            </tr>
            {data.fixedAssets.map((line, index) => (
              <BalanceSheetLine key={index} line={line} level={1} />
            ))}

            {/* Other Assets */}
            {data.otherAssets.length > 0 && (
              <>
                <tr className="bg-muted/50">
                  <td className="p-3 font-semibold">Other Assets</td>
                  <td className="p-3"></td>
                </tr>
                {data.otherAssets.map((line, index) => (
                  <BalanceSheetLine key={index} line={line} level={1} />
                ))}
              </>
            )}

            {/* Total Assets */}
            <tr className="bg-primary/10 border-t-2 border-primary">
              <td className="p-4 font-bold">TOTAL ASSETS</td>
              <td className="p-4 text-right font-bold">
                ${data.totalAssets.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </td>
            </tr>

            {/* Spacer */}
            <tr className="h-4">
              <td colSpan={2}></td>
            </tr>

            {/* LIABILITIES AND EQUITY */}
            <tr className="bg-primary text-primary-foreground">
              <td className="p-4 font-bold text-lg" colSpan={2}>LIABILITIES AND EQUITY</td>
            </tr>

            {/* Current Liabilities */}
            <tr className="bg-muted/50">
              <td className="p-3 font-semibold">Current Liabilities</td>
              <td className="p-3"></td>
            </tr>
            {data.currentLiabilities.map((line, index) => (
              <BalanceSheetLine key={index} line={line} level={1} />
            ))}

            {/* Long-term Liabilities */}
            {data.longTermLiabilities.length > 0 && (
              <>
                <tr className="bg-muted/50">
                  <td className="p-3 font-semibold">Long-term Liabilities</td>
                  <td className="p-3"></td>
                </tr>
                {data.longTermLiabilities.map((line, index) => (
                  <BalanceSheetLine key={index} line={line} level={1} />
                ))}
              </>
            )}

            {/* Total Liabilities */}
            <tr className="bg-red-50 border-t">
              <td className="p-3 font-semibold">TOTAL LIABILITIES</td>
              <td className="p-3 text-right font-semibold">
                ${data.totalLiabilities.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </td>
            </tr>

            {/* Equity */}
            <tr className="bg-muted/50">
              <td className="p-3 font-semibold">Equity</td>
              <td className="p-3"></td>
            </tr>
            {data.equity.map((line, index) => (
              <BalanceSheetLine key={index} line={line} level={1} />
            ))}

            {/* Total Equity */}
            <tr className="bg-blue-50 border-t">
              <td className="p-3 font-semibold">TOTAL EQUITY</td>
              <td className="p-3 text-right font-semibold">
                ${data.totalEquity.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </td>
            </tr>

            {/* Total Liabilities and Equity */}
            <tr className="bg-primary/10 border-t-2 border-primary">
              <td className="p-4 font-bold">TOTAL LIABILITIES AND EQUITY</td>
              <td className="p-4 text-right font-bold">
                ${data.totalLiabilitiesAndEquity.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </td>
            </tr>
          </tbody>
        </Table>
      </div>

      {/* Key Ratios */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Debt-to-Equity Ratio</div>
          <div className="text-2xl font-bold">
            {data.totalEquity > 0
              ? (data.totalLiabilities / data.totalEquity).toFixed(2)
              : 'N/A'
            }
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Current Ratio</div>
          <div className="text-2xl font-bold">
            {data.currentLiabilities.reduce((sum, line) => sum + line.amount, 0) > 0
              ? (data.currentAssets.reduce((sum, line) => sum + line.amount, 0) /
                 data.currentLiabilities.reduce((sum, line) => sum + line.amount, 0)).toFixed(2)
              : 'N/A'
            }
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Equity Percentage</div>
          <div className="text-2xl font-bold">
            {data.totalAssets > 0
              ? ((data.totalEquity / data.totalAssets) * 100).toFixed(1) + '%'
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
          <li>• Negative amounts indicate credits for asset accounts and debits for liability/equity accounts</li>
          <li>• This statement follows generally accepted accounting principles (GAAP)</li>
          <li>• Generated from the general ledger as of the specified date</li>
        </ul>
      </div>
    </div>
  )
}