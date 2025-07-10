import { NextResponse } from "next/server"

// Simulate QR code status checking
let loginStatus = "waiting_for_scan"
let loginTime = Date.now()

export async function GET() {
  try {
    // Simulate login after 30 seconds for demo purposes
    if (Date.now() - loginTime > 30000) {
      loginStatus = "logged_in"
    }

    return NextResponse.json({
      status: loginStatus,
      message:
        loginStatus === "logged_in"
          ? "Successfully logged into WhatsApp Web"
          : "Please scan the QR code with your phone",
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: `QR status check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  // Reset login status for new session
  loginStatus = "waiting_for_scan"
  loginTime = Date.now()

  return NextResponse.json({
    success: true,
    message: "Login status reset",
  })
}
