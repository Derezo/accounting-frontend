interface ProjectStatusChartProps {
  data: {
    active: number
    completed: number
    onTrack: number
    delayed: number
  }
}

export function ProjectStatusChart({ data }: ProjectStatusChartProps) {
  return (
    <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
      <div className="text-center text-gray-500">
        <div className="text-lg font-medium">Project Status Chart</div>
        <div className="text-sm">Chart visualization coming soon</div>
        <div className="text-xs mt-2">
          Active: {data.active} | Completed: {data.completed} | On Track: {data.onTrack} | Delayed: {data.delayed}
        </div>
      </div>
    </div>
  )
}