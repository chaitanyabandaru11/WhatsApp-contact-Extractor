import { ScrollArea } from "@/components/ui/scroll-area"
import { Info, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react"

interface StatusMessage {
  id: string
  message: string
  type: "info" | "success" | "error" | "warning"
  timestamp: Date
}

interface StatusMessagesProps {
  messages: StatusMessage[]
}

export function StatusMessages({ messages }: StatusMessagesProps) {
  const getIcon = (type: StatusMessage["type"]) => {
    switch (type) {
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getStyles = (type: StatusMessage["type"]) => {
    switch (type) {
      case "info":
        return "text-blue-700 bg-blue-50 border-blue-200"
      case "success":
        return "text-green-700 bg-green-50 border-green-200"
      case "error":
        return "text-red-700 bg-red-50 border-red-200"
      case "warning":
        return "text-yellow-700 bg-yellow-50 border-yellow-200"
      default:
        return "text-gray-700 bg-gray-50 border-gray-200"
    }
  }

  return (
    <ScrollArea className="h-80 w-full border border-gray-200 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-white shadow-inner">
      <div className="space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <div className="text-center">
              <Info className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No status messages yet...</p>
              <p className="text-xs text-gray-400 mt-1">Messages will appear here during scraping</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${getStyles(message.type)}`}
            >
              <div className="flex-shrink-0 mt-0.5">{getIcon(message.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium break-words">{message.message}</p>
              </div>
              <div className="flex-shrink-0">
                <span className="text-xs opacity-75 font-mono">{message.timestamp.toLocaleTimeString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  )
}
