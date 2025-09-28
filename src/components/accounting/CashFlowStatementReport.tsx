import React from 'react'
import { TrendingUp, TrendingDown, FileText } from 'lucide-react'
import { Table } from '@/components/ui/table'
import { CashFlowStatement } from '@/types/accounting'
import { cn } from '@/lib/utils'

interface CashFlowStatementReportProps {
  data?: CashFlowStatement
  isLoading: boolean
  periodStart: string
  periodEnd: string
}

interface CashFlowLineProps {
  line: CashFlowStatement['operatingActivities'][0]
  level?: number
}

function CashFlowLine({ line, level = 0 }: CashFlowLineProps) {
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
        <CashFlowLine key={index} line={child} level={level + 1} />
      ))}
    </>
  )
}

export function CashFlowStatementReport({ data, isLoading, periodStart, periodEnd }: CashFlowStatementReportProps) {
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
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">No cash flow data available</h3>
        <p className="text-muted-foreground">
          Unable to generate cash flow statement for the selected period.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">Cash Flow Statement</h2>
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

      {/* Cash Flow Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className={cn(
          "bg-card border rounded-lg p-4",
          data.netCashFromOperating >= 0 ? "border-blue-200" : "border-red-200"
        )}>
          <div className="flex items-center gap-2 mb-2">
            {data.netCashFromOperating >= 0 ? (
              <TrendingUp className="h-4 w-4 text-blue-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className="text-sm font-medium">Operating Activities</span>
          </div>
          <div className={cn(
            "text-2xl font-bold",
            data.netCashFromOperating >= 0 ? "text-blue-600" : "text-red-600"
          )}>
            ${data.netCashFromOperating.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>
        </div>

        <div className={cn(
          "bg-card border rounded-lg p-4",
          data.netCashFromInvesting >= 0 ? "border-green-200" : "border-red-200"
        )}>
          <div className="flex items-center gap-2 mb-2">
            {data.netCashFromInvesting >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className="text-sm font-medium">Investing Activities</span>
          </div>
          <div className={cn(
            "text-2xl font-bold",
            data.netCashFromInvesting >= 0 ? "text-green-600" : "text-red-600"
          )}>
            ${data.netCashFromInvesting.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>
        </div>

        <div className={cn(
          "bg-card border rounded-lg p-4",
          data.netCashFromFinancing >= 0 ? "border-purple-200" : "border-red-200"
        )}>
          <div className="flex items-center gap-2 mb-2">
            {data.netCashFromFinancing >= 0 ? (
              <TrendingUp className="h-4 w-4 text-purple-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className="text-sm font-medium">Financing Activities</span>
          </div>
          <div className={cn(
            "text-2xl font-bold",
            data.netCashFromFinancing >= 0 ? "text-purple-600" : "text-red-600"
          )}>
            ${data.netCashFromFinancing.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>
        </div>
      </div>

      {/* Cash Flow Statement Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <tbody>
            {/* OPERATING ACTIVITIES */}
            <tr className="bg-primary text-primary-foreground">
              <td className="p-4 font-bold text-lg" colSpan={2}>CASH FLOWS FROM OPERATING ACTIVITIES</td>
            </tr>
            {data.operatingActivities.map((line, index) => (
              <CashFlowLine key={index} line={line} level={0} />
            ))}

            {/* Net Cash from Operating Activities */}
            <tr className="bg-blue-50 border-t-2 border-blue-200">
              <td className="p-4 font-bold">NET CASH FROM OPERATING ACTIVITIES</td>
              <td className={cn(
                "p-4 text-right font-bold",
                data.netCashFromOperating >= 0 ? "text-blue-600" : "text-red-600"
              )}>
                ${data.netCashFromOperating.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </td>
            </tr>

            {/* Spacer */}
            <tr className="h-4">
              <td colSpan={2}></td>
            </tr>

            {/* INVESTING ACTIVITIES */}
            <tr className="bg-primary text-primary-foreground">
              <td className="p-4 font-bold text-lg" colSpan={2}>CASH FLOWS FROM INVESTING ACTIVITIES</td>
            </tr>
            {data.investingActivities.map((line, index) => (
              <CashFlowLine key={index} line={line} level={0} />
            ))}

            {/* Net Cash from Investing Activities */}
            <tr className="bg-green-50 border-t-2 border-green-200">
              <td className="p-4 font-bold">NET CASH FROM INVESTING ACTIVITIES</td>
              <td className={cn(
                "p-4 text-right font-bold",
                data.netCashFromInvesting >= 0 ? "text-green-600" : "text-red-600"
              )}>
                ${data.netCashFromInvesting.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </td>
            </tr>

            {/* Spacer */}
            <tr className="h-4">
              <td colSpan={2}></td>
            </tr>

            {/* FINANCING ACTIVITIES */}
            <tr className="bg-primary text-primary-foreground">
              <td className="p-4 font-bold text-lg" colSpan={2}>CASH FLOWS FROM FINANCING ACTIVITIES</td>
            </tr>
            {data.financingActivities.map((line, index) => (
              <CashFlowLine key={index} line={line} level={0} />
            ))}

            {/* Net Cash from Financing Activities */}
            <tr className="bg-purple-50 border-t-2 border-purple-200">
              <td className="p-4 font-bold">NET CASH FROM FINANCING ACTIVITIES</td>
              <td className={cn(
                "p-4 text-right font-bold",
                data.netCashFromFinancing >= 0 ? "text-purple-600" : "text-red-600"
              )}>
                ${data.netCashFromFinancing.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </td>
            </tr>

            {/* Spacer */}
            <tr className="h-4">
              <td colSpan={2}></td>
            </tr>

            {/* NET CHANGE IN CASH */}
            <tr className="bg-yellow-50 border-t-2 border-yellow-200">
              <td className="p-4 font-bold text-lg">NET CHANGE IN CASH AND CASH EQUIVALENTS</td>
              <td className={cn(
                "p-4 text-right font-bold text-lg",
                data.netChangeInCash >= 0 ? "text-green-600" : "text-red-600"
              )}>
                ${data.netChangeInCash.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </td>
            </tr>

            {/* Beginning Cash */}
            <tr className="border-b">
              <td className="p-3 font-medium">Cash and Cash Equivalents - Beginning of Period</td>
              <td className="p-3 text-right font-medium">
                ${data.beginningCash.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </td>
            </tr>

            {/* Ending Cash */}
            <tr className="bg-gray-50 border-t-2 border-gray-300">
              <td className="p-4 font-bold text-lg">CASH AND CASH EQUIVALENTS - END OF PERIOD</td>
              <td className="p-4 text-right font-bold text-lg">
                ${data.endingCash.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </td>
            </tr>
          </tbody>
        </Table>
      </div>

      {/* Cash Flow Ratios */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Operating Cash Ratio</div>
          <div className="text-2xl font-bold">
            {data.beginningCash > 0
              ? (data.netCashFromOperating / data.beginningCash * 100).toFixed(1) + '%'
              : 'N/A'
            }
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Free Cash Flow</div>
          <div className={cn(
            "text-2xl font-bold",
            (data.netCashFromOperating + data.netCashFromInvesting) >= 0 ? "text-green-600" : "text-red-600"
          )}>
            ${(data.netCashFromOperating + data.netCashFromInvesting).toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            })}
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Cash Coverage Ratio</div>
          <div className="text-2xl font-bold">
            {data.beginningCash > 0
              ? (data.endingCash / data.beginningCash).toFixed(2)
              : 'N/A'
            }
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Cash Burn Rate</div>
          <div className={cn(
            "text-2xl font-bold",
            data.netChangeInCash >= 0 ? "text-green-600" : "text-red-600"
          )}>
            ${Math.abs(data.netChangeInCash / 30).toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            })}/day
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="text-xs text-muted-foreground p-4 bg-muted/25 rounded-lg">
        <p className="font-medium mb-2">Notes:</p>
        <ul className="space-y-1">
          <li>• Cash flows from operating activities show cash generated or used by core business operations</li>
          <li>• Cash flows from investing activities reflect cash used for capital expenditures and investments</li>
          <li>• Cash flows from financing activities show cash from borrowing, equity, and debt payments</li>
          <li>• Free cash flow = Operating cash flow + Investing cash flow</li>
          <li>• All amounts are shown in the organization's base currency</li>
        </ul>
      </div>
    </div>
  )
}