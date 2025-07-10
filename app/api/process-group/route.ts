import { type NextRequest, NextResponse } from "next/server"

interface Contact {
  name: string
  phone: string
  group: string
  about: string
}

// Simulate realistic contact data
const generateRealisticContacts = (groupName: string, count: number): Contact[] => {
  const firstNames = [
    "John",
    "Jane",
    "Mike",
    "Sarah",
    "David",
    "Lisa",
    "Chris",
    "Emma",
    "Alex",
    "Maria",
    "James",
    "Anna",
    "Robert",
    "Emily",
    "Michael",
    "Jessica",
  ]
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
    "Hernandez",
    "Lopez",
    "Gonzalez",
    "Wilson",
    "Anderson",
    "Thomas",
  ]
  const aboutTexts = [
    "Software Developer",
    "Designer",
    "Marketing Manager",
    "Student",
    "Entrepreneur",
    "Teacher",
    "Engineer",
    "Consultant",
    "Freelancer",
    "Business Owner",
    "Available",
    "Busy",
    "At work",
    "Sleeping",
    "In a meeting",
  ]

  const contacts: Contact[] = []

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const countryCode = Math.random() > 0.7 ? "+91" : "+1" // Mix of US and India numbers
    const phoneNumber = `${countryCode}${Math.floor(1000000000 + Math.random() * 9000000000)}`
    const about = aboutTexts[Math.floor(Math.random() * aboutTexts.length)]

    contacts.push({
      name: `${firstName} ${lastName}`,
      phone: phoneNumber,
      group: groupName,
      about: about,
    })
  }

  return contacts
}

export async function POST(request: NextRequest) {
  try {
    const { groupLink, scrapeNames, scrapeNumbers, scrapeAbout } = await request.json()

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Extract group ID from link for realistic group name
    const groupId = groupLink.split("/").pop()?.substring(0, 6) || "Unknown"
    const groupName = `Group ${groupId}`

    // Generate realistic number of contacts (5-25)
    const contactCount = Math.floor(Math.random() * 20) + 5
    let contacts = generateRealisticContacts(groupName, contactCount)

    // Apply scraping filters based on user preferences
    contacts = contacts.map((contact) => ({
      name: scrapeNames ? contact.name : "N/A",
      phone: scrapeNumbers ? contact.phone : "N/A",
      group: contact.group,
      about: scrapeAbout ? contact.about : "N/A",
    }))

    return NextResponse.json({
      success: true,
      newContacts: contacts.length,
      contacts: contacts,
      groupName: groupName,
      message: `Successfully processed ${contacts.length} contacts from ${groupName}`,
    })
  } catch (error) {
    console.error("Group processing error:", error)
    return NextResponse.json(
      {
        error: `Failed to process group: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
