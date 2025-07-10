"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Download, FileText, Database, Table } from "lucide-react"

interface Contact {
  name: string
  phone: string
  group: string
  about: string
}

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  contacts: Contact[]
}

export function ExportModal({ isOpen, onClose, contacts }: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState("csv")

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "csv":
        return <Table className="h-4 w-4" />
      case "json":
        return <Database className="h-4 w-4" />
      case "excel":
        return <FileText className="h-4 w-4" />
      default:
        return <Download className="h-4 w-4" />
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch("/api/export-contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: exportFormat,
          contacts,
        }),
      })

      if (!response.ok) {
        throw new Error("Export failed")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `contacts.${exportFormat}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      onClose()
    } catch (error) {
      alert(`Export failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent flex items-center justify-center">
            <Download className="mr-3 h-6 w-6 text-blue-500" />
            Export Data
          </DialogTitle>
          <p className="text-gray-600 mt-2">Choose your preferred export format</p>
        </DialogHeader>

        <div className="py-6">
          <Label htmlFor="exportFormat" className="text-sm font-semibold text-gray-700 mb-3 block">
            Export Format
          </Label>
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger className="mt-2 bg-white/80 border-gray-200 focus:border-blue-400 h-12">
              <div className="flex items-center">
                {getFormatIcon(exportFormat)}
                <SelectValue className="ml-2" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv" className="flex items-center">
                <div className="flex items-center">
                  <Table className="h-4 w-4 mr-2" />
                  CSV (Comma Separated Values)
                </div>
              </SelectItem>
              <SelectItem value="json" className="flex items-center">
                <div className="flex items-center">
                  <Database className="h-4 w-4 mr-2" />
                  JSON (JavaScript Object Notation)
                </div>
              </SelectItem>
              <SelectItem value="excel" className="flex items-center">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Excel (Microsoft Excel)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>{contacts.length}</strong> contacts will be exported in {exportFormat.toUpperCase()} format.
            </p>
          </div>
        </div>

        <DialogFooter className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
