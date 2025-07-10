import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Return a simulated QR code SVG
    const qrCodeSvg = `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white"/>
        <text x="50%" y="30%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="12" fill="#666">
          WhatsApp QR Code
        </text>
        <text x="50%" y="40%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="10" fill="#999">
          Scan with your phone
        </text>
        <!-- Simulated QR code pattern -->
        <rect x="20" y="60" width="15" height="15" fill="black"/>
        <rect x="50" y="60" width="15" height="15" fill="black"/>
        <rect x="80" y="60" width="15" height="15" fill="black"/>
        <rect x="110" y="60" width="15" height="15" fill="black"/>
        <rect x="140" y="60" width="15" height="15" fill="black"/>
        <rect x="170" y="60" width="15" height="15" fill="black"/>
        
        <rect x="20" y="80" width="15" height="15" fill="black"/>
        <rect x="80" y="80" width="15" height="15" fill="black"/>
        <rect x="140" y="80" width="15" height="15" fill="black"/>
        <rect x="170" y="80" width="15" height="15" fill="black"/>
        
        <rect x="20" y="100" width="15" height="15" fill="black"/>
        <rect x="50" y="100" width="15" height="15" fill="black"/>
        <rect x="110" y="100" width="15" height="15" fill="black"/>
        <rect x="170" y="100" width="15" height="15" fill="black"/>
        
        <rect x="35" y="120" width="15" height="15" fill="black"/>
        <rect x="65" y="120" width="15" height="15" fill="black"/>
        <rect x="95" y="120" width="15" height="15" fill="black"/>
        <rect x="125" y="120" width="15" height="15" fill="black"/>
        <rect x="155" y="120" width="15" height="15" fill="black"/>
        
        <rect x="20" y="140" width="15" height="15" fill="black"/>
        <rect x="80" y="140" width="15" height="15" fill="black"/>
        <rect x="110" y="140" width="15" height="15" fill="black"/>
        <rect x="170" y="140" width="15" height="15" fill="black"/>
        
        <rect x="35" y="160" width="15" height="15" fill="black"/>
        <rect x="65" y="160" width="15" height="15" fill="black"/>
        <rect x="125" y="160" width="15" height="15" fill="black"/>
        <rect x="155" y="160" width="15" height="15" fill="black"/>
      </svg>
    `

    const base64QR = Buffer.from(qrCodeSvg).toString("base64")

    return NextResponse.json({
      success: true,
      qrCodeUrl: `data:image/svg+xml;base64,${base64QR}`,
      message: "QR code generated successfully",
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: `Failed to get QR code: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
