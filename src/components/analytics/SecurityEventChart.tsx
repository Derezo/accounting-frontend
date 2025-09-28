interface SecurityEventChartProps {
  data?: Array<{
    time: string
    events: number
    severity: string
  }>
}

export function SecurityEventChart({ data }: SecurityEventChartProps) {
  return (
    <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
      <div className="text-center text-gray-500">
        <div className="text-lg font-medium">Security Event Timeline</div>
        <div className="text-sm">Event visualization coming soon</div>
        <div className="text-xs mt-2">
          Events available: {data && data.length > 0 ? `${data.length} data points` : 'No data'}
        </div>
      </div>
    </div>
  )
}