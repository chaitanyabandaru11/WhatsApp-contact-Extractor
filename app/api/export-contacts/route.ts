import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { format, contacts } = await request.json()

    let content: string
    let contentType: string
    let filename: string

    switch (format) {
      case "csv":
        content = convertToCSV(contacts)
        contentType = "text/csv"
        filename = "contacts.csv"
        break
      case "json":
        content = JSON.stringify(contacts, null, 2)
        contentType = "application/json"
        filename = "contacts.json"
        break
      case "excel":
        // In a real implementation, you'd use a library like xlsx
        content = convertToCSV(contacts)
        contentType = "application/vnd.ms-excel"
        filename = "contacts.xls"
        break
      default:
        throw new Error("Unsupported format")
    }

    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}

function convertToCSV(contacts: any[]) {
  if (contacts.length === 0) return ""

  const headers = Object.keys(contacts[0]).join(",")
  const rows = contacts.map((contact) =>
    Object.values(contact)
      .map((value) => `"${value}"`)
      .join(","),
  )

  return [headers, ...rows].join("\n")
}
