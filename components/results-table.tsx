import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { User, Phone, Users, FileText } from "lucide-react"

interface Contact {
  name: string
  phone: string
  group: string
  about: string
}

interface ResultsTableProps {
  contacts: Contact[]
}

export function ResultsTable({ contacts }: ResultsTableProps) {
  if (contacts.length === 0) {
    return (
      <div className="text-center py-16">
        <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-500 mb-2">No contacts found</h3>
        <p className="text-gray-400">Start scraping to see results here</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <TableHead className="font-semibold text-gray-700 py-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Name</span>
              </div>
            </TableHead>
            <TableHead className="font-semibold text-gray-700 py-4">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>Phone</span>
              </div>
            </TableHead>
            <TableHead className="font-semibold text-gray-700 py-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Group</span>
              </div>
            </TableHead>
            <TableHead className="font-semibold text-gray-700 py-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>About</span>
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact, index) => (
            <TableRow
              key={index}
              className="animate-in fade-in-50 duration-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border-b border-gray-100"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <TableCell className="font-medium py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-900">{contact.name}</span>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-mono">
                  {contact.phone}
                </Badge>
              </TableCell>
              <TableCell className="py-4">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {contact.group}
                </Badge>
              </TableCell>
              <TableCell className="py-4 text-gray-600 max-w-xs truncate">{contact.about}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
