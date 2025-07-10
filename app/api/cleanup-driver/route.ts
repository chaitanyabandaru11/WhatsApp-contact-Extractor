import { NextResponse } from "next/server"
import { driver } from "../init-scraper/route"

export async function POST() {
  try {
    if (driver) {
      await driver.quit()
      return NextResponse.json({
        success: true,
        message: "WebDriver closed successfully",
      })
    }

    return NextResponse.json({
      success: true,
      message: "No active WebDriver to close",
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: `Failed to cleanup WebDriver: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
