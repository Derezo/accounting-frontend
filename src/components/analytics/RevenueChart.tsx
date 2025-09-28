interface RevenueChartProps {
  data?: Array<{ date: string; amount: number }>
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
      <div className="text-center text-gray-500">
        <div className="text-lg font-medium">Revenue Chart</div>
        <div className="text-sm">Chart visualization coming soon</div>
        <div className="text-xs mt-2">Data points: {data?.length || 0}</div>
      </div>
    </div>
  )
}