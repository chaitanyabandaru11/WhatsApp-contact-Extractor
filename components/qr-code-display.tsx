"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QrCode, RefreshCw, CheckCircle } from "lucide-react"

interface QRCodeDisplayProps {
  isVisible: boolean
  onLoginSuccess: () => void
}

export function QRCodeDisplay({ isVisible, onLoginSuccess }: QRCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [loginStatus, setLoginStatus] = useState<"waiting" | "logged_in" | "error">("waiting")
  const [isLoading, setIsLoading] = useState(false)

  const fetchQRCode = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/get-qr-code")
      const data = await response.json()

      if (data.success) {
        setQrCodeUrl(data.qrCodeUrl)
      }
    } catch (error) {
      console.error("Failed to fetch QR code:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkLoginStatus = async () => {
    try {
      const response = await fetch("/api/check-qr-status")
      const data = await response.json()

      if (data.status === "logged_in") {
        setLoginStatus("logged_in")
        onLoginSuccess()
      }
    } catch (error) {
      console.error("Failed to check login status:", error)
      setLoginStatus("error")
    }
  }

  const resetLogin = async () => {
    try {
      await fetch("/api/check-qr-status", { method: "POST" })
      setLoginStatus("waiting")
      fetchQRCode()
    } catch (error) {
      console.error("Failed to reset login:", error)
    }
  }

  useEffect(() => {
    if (isVisible) {
      fetchQRCode()

      // Poll for login status every 5 seconds
      const interval = setInterval(checkLoginStatus, 5000)

      return () => clearInterval(interval)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <Card className="mb-8 bg-white/90 backdrop-blur-sm border-white/20 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg border-b border-gray-200">
        <CardTitle className="flex items-center text-xl">
          <QrCode className="mr-3 h-6 w-6 text-green-600" />
          WhatsApp Web Login
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        {loginStatus === "waiting" && (
          <div className="text-center">
            <div className="mb-6">
              {qrCodeUrl ? (
                <div className="inline-block p-4 bg-white rounded-lg shadow-lg border-2 border-gray-200">
                  <img src={qrCodeUrl || "/placeholder.svg"} alt="WhatsApp QR Code" className="w-48 h-48 mx-auto" />
                </div>
              ) : (
                <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                  {isLoading ? (
                    <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                  ) : (
                    <QrCode className="h-8 w-8 text-gray-400" />
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Scan QR Code</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>1. Open WhatsApp on your phone</p>
                <p>2. Tap Menu or Settings and select Linked Devices</p>
                <p>3. Tap on Link a Device</p>
                <p>4. Point your phone at this screen to capture the code</p>
              </div>

              <Button
                onClick={fetchQRCode}
                variant="outline"
                size="sm"
                className="mt-4 bg-transparent"
                disabled={isLoading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Refresh QR Code
              </Button>
            </div>
          </div>
        )}

        {loginStatus === "logged_in" && (
          <div className="text-center">
            <div className="mb-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-700">Successfully Connected!</h3>
              <p className="text-gray-600 mt-2">WhatsApp Web is now ready for scraping</p>
            </div>

            <Button onClick={resetLogin} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset Connection
            </Button>
          </div>
        )}

        {loginStatus === "error" && (
          <div className="text-center">
            <div className="mb-4">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-red-700">Connection Error</h3>
              <p className="text-gray-600 mt-2">Failed to connect to WhatsApp Web</p>
            </div>

            <Button onClick={resetLogin} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
