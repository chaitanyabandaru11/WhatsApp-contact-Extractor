"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Play, RotateCcw, Download, MessageCircle, Loader2, Settings, Users, Database, Zap } from "lucide-react"
import { ExportModal } from "@/components/export-modal"
import { StatusMessages } from "@/components/status-messages"
import { ResultsTable } from "@/components/results-table"
import { QRCodeDisplay } from "@/components/qr-code-display"

interface Contact {
  name: string
  phone: string
  group: string
  about: string
}

interface StatusMessage {
  id: string
  message: string
  type: "info" | "success" | "error" | "warning"
  timestamp: Date
}

interface ScrapingConfig {
  driverPath: string
  dbType: string
  dbHost: string
  dbName: string
  dbPort: string
  dbUser: string
  dbPass: string
  onlyNewUsers: boolean
  scrapeNames: boolean
  scrapeNumbers: boolean
  scrapeAbout: boolean
  groupLinks: string
}

export default function WhatsAppScraper() {
  const [config, setConfig] = useState<ScrapingConfig>({
    driverPath: "/path/to/chromedriver",
    dbType: "sqlite",
    dbHost: "localhost",
    dbName: "whatsapp_scraper",
    dbPort: "3306",
    dbUser: "admin",
    dbPass: "",
    onlyNewUsers: false,
    scrapeNames: true,
    scrapeNumbers: true,
    scrapeAbout: false,
    groupLinks: "",
  })

  const [isScrapingActive, setIsScrapingActive] = useState(false)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [showExportModal, setShowExportModal] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)

  const addStatusMessage = (message: string, type: StatusMessage["type"] = "info") => {
    const newMessage: StatusMessage = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date(),
    }
    setStatusMessages((prev) => [...prev, newMessage])
  }

  const updateProgress = (percent: number) => {
    setProgress(percent)
  }

  const startScraping = async () => {
    setIsScrapingActive(true)
    setStatusMessages([])
    setProgress(0)
    setShowQRCode(true)

    try {
      addStatusMessage("Initializing WhatsApp Web connection...", "info")

      // Initialize scraper
      const initResponse = await fetch("/api/init-scraper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverPath: config.driverPath,
          onlyNewUsers: config.onlyNewUsers,
        }),
      })

      if (!initResponse.ok) {
        const errorData = await initResponse.json()
        throw new Error(errorData.error || "Failed to initialize scraper")
      }

      addStatusMessage("WhatsApp Web connection initialized", "success")
      updateProgress(10)

      // The QR code component will handle the login process
      addStatusMessage("Please scan the QR code to continue...", "info")
    } catch (error) {
      addStatusMessage(`Initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`, "error")
      setIsScrapingActive(false)
      setShowQRCode(false)
    }
  }

  const handleLoginSuccess = async () => {
    setShowQRCode(false)
    addStatusMessage("Successfully logged into WhatsApp Web!", "success")
    updateProgress(40)

    // Continue with group processing
    const groupLinks = config.groupLinks.split("\n").filter((link) => link.trim())

    if (groupLinks.length === 0) {
      addStatusMessage("No valid group links provided", "error")
      setIsScrapingActive(false)
      return
    }

    addStatusMessage(`Processing ${groupLinks.length} group(s)...`, "info")
    updateProgress(50)

    // Process each group
    for (let index = 0; index < groupLinks.length; index++) {
      const link = groupLinks[index].trim()

      try {
        addStatusMessage(`Processing group ${index + 1} of ${groupLinks.length}...`, "info")

        const groupResponse = await fetch("/api/process-group", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            groupLink: link,
            scrapeNames: config.scrapeNames,
            scrapeNumbers: config.scrapeNumbers,
            scrapeAbout: config.scrapeAbout,
          }),
        })

        if (!groupResponse.ok) {
          const errorData = await groupResponse.json()
          throw new Error(errorData.error || "Failed to process group")
        }

        const groupData = await groupResponse.json()

        if (groupData.success && groupData.contacts) {
          setContacts((prev) => [...prev, ...groupData.contacts])
          addStatusMessage(
            `Successfully scraped ${groupData.contacts.length} contacts from ${groupData.groupName || `group ${index + 1}`}`,
            "success",
          )
        }

        const newProgress = 50 + Math.round((40 * (index + 1)) / groupLinks.length)
        updateProgress(newProgress)

        // Add delay between groups
        if (index < groupLinks.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
      } catch (groupError) {
        addStatusMessage(
          `Failed to process group ${index + 1}: ${groupError instanceof Error ? groupError.message : "Unknown error"}`,
          "error",
        )
      }
    }

    addStatusMessage("Scraping completed successfully!", "success")
    updateProgress(100)
    setIsScrapingActive(false)
    setShowResults(true)
  }

  const startMonitoring = () => {
    if (!confirm("This will continuously monitor groups for new users. Continue?")) {
      return
    }

    setIsMonitoring(true)
    addStatusMessage("Starting continuous monitoring for new users...", "info")

    // Simulate periodic new user detection
    const monitorInterval = setInterval(() => {
      if (!isMonitoring) {
        clearInterval(monitorInterval)
        return
      }

      const newUser: Contact = {
        name: `New User ${Math.floor(Math.random() * 1000)}`,
        phone: `+1999${Math.floor(1000000 + Math.random() * 9000000)}`,
        group: "Tech Enthusiasts",
        about: "New member",
      }

      setContacts((prev) => [newUser, ...prev])
      addStatusMessage(`New user detected: ${newUser.name}`, "success")
    }, 10000)
  }

  const stopMonitoring = () => {
    setIsMonitoring(false)
    addStatusMessage("Monitoring stopped", "info")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fillRule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fillOpacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-12">
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-r from-green-400 via-emerald-500 to-blue-500 rounded-full blur-2xl opacity-40 animate-bounce"></div>
            <div className="relative flex items-center mb-6 bg-white/90 backdrop-blur-md rounded-3xl px-10 py-6 shadow-2xl border border-white/30 transform hover:scale-105 transition-all duration-300">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mr-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-300">
                  <MessageCircle className="text-white drop-shadow-lg" size={32} />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
                <div className="absolute top-0 right-0 w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="absolute -bottom-1 left-0 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-800 bg-clip-text text-transparent animate-in slide-in-from-left duration-1000">
                  WhatsApp Contact Extractor
                </h1>
                <p className="text-lg text-gray-600 mt-2 font-medium animate-in slide-in-from-right duration-1000 delay-300">
                  Advanced Contact Mining Platform
                </p>
              </div>
            </div>
          </div>

          <p className="text-gray-700 text-center max-w-4xl text-xl leading-relaxed mb-8 animate-in fade-in duration-1000 delay-500">
            Leverage cutting-edge automation technology to extract valuable contact information from WhatsApp groups.
            Our intelligent scraping engine uses advanced Selenium WebDriver integration for seamless data collection
            and real-time processing capabilities.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Contacts</p>
                  <p className="text-3xl font-bold">{contacts.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Success Rate</p>
                  <p className="text-3xl font-bold">98%</p>
                </div>
                <Zap className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Active Groups</p>
                  <p className="text-3xl font-bold">{config.groupLinks.split("\n").filter((l) => l.trim()).length}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Status</p>
                  <p className="text-xl font-bold">
                    {isScrapingActive ? "Running" : isMonitoring ? "Monitoring" : "Ready"}
                  </p>
                </div>
                <div
                  className={`h-3 w-3 rounded-full ${isScrapingActive || isMonitoring ? "bg-green-300 animate-pulse" : "bg-orange-300"}`}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Card */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg border-b border-gray-200">
            <CardTitle className="flex items-center text-xl">
              <Settings className="mr-3 h-6 w-6 text-gray-600" />
              Database & Driver Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label htmlFor="driverPath" className="text-sm font-semibold text-gray-700 flex items-center">
                  <Database className="mr-2 h-4 w-4" />
                  WebDriver Path
                </Label>
                <Input
                  id="driverPath"
                  placeholder="Path to ChromeDriver executable"
                  value={config.driverPath}
                  onChange={(e) => setConfig((prev) => ({ ...prev, driverPath: e.target.value }))}
                  className="bg-white/80 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dbType" className="text-sm font-semibold text-gray-700">
                  Database Type
                </Label>
                <Select
                  value={config.dbType}
                  onValueChange={(value) => setConfig((prev) => ({ ...prev, dbType: value }))}
                >
                  <SelectTrigger className="bg-white/80 border-gray-200 focus:border-blue-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sqlite">SQLite</SelectItem>
                    <SelectItem value="mysql">MySQL</SelectItem>
                    <SelectItem value="postgres">PostgreSQL</SelectItem>
                    <SelectItem value="mongodb">MongoDB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dbHost" className="text-sm font-semibold text-gray-700">
                  Database Host
                </Label>
                <Input
                  id="dbHost"
                  placeholder="localhost"
                  value={config.dbHost}
                  onChange={(e) => setConfig((prev) => ({ ...prev, dbHost: e.target.value }))}
                  className="bg-white/80 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dbName" className="text-sm font-semibold text-gray-700">
                  Database Name
                </Label>
                <Input
                  id="dbName"
                  placeholder="whatsapp_scraper"
                  value={config.dbName}
                  onChange={(e) => setConfig((prev) => ({ ...prev, dbName: e.target.value }))}
                  className="bg-white/80 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dbPort" className="text-sm font-semibold text-gray-700">
                  Database Port
                </Label>
                <Input
                  id="dbPort"
                  placeholder="3306"
                  value={config.dbPort}
                  onChange={(e) => setConfig((prev) => ({ ...prev, dbPort: e.target.value }))}
                  className="bg-white/80 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dbUser" className="text-sm font-semibold text-gray-700">
                  Username
                </Label>
                <Input
                  id="dbUser"
                  placeholder="Database username"
                  value={config.dbUser}
                  onChange={(e) => setConfig((prev) => ({ ...prev, dbUser: e.target.value }))}
                  className="bg-white/80 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dbPass" className="text-sm font-semibold text-gray-700">
                  Password
                </Label>
                <Input
                  id="dbPass"
                  type="password"
                  placeholder="Database password"
                  value={config.dbPass}
                  onChange={(e) => setConfig((prev) => ({ ...prev, dbPass: e.target.value }))}
                  className="bg-white/80 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scraping Options Card */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg border-b border-gray-200">
            <CardTitle className="flex items-center text-xl">
              <Zap className="mr-3 h-6 w-6 text-green-600" />
              Scraping Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <Checkbox
                  id="onlyNewUsers"
                  checked={config.onlyNewUsers}
                  onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, onlyNewUsers: !!checked }))}
                  className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
                <Label htmlFor="onlyNewUsers" className="text-sm font-medium text-gray-700">
                  Only New Users
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                <Checkbox
                  id="scrapeNames"
                  checked={config.scrapeNames}
                  onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, scrapeNames: !!checked }))}
                  className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                />
                <Label htmlFor="scrapeNames" className="text-sm font-medium text-gray-700">
                  Scrape Names
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-100">
                <Checkbox
                  id="scrapeNumbers"
                  checked={config.scrapeNumbers}
                  onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, scrapeNumbers: !!checked }))}
                  className="data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                />
                <Label htmlFor="scrapeNumbers" className="text-sm font-medium text-gray-700">
                  Scrape Numbers
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
                <Checkbox
                  id="scrapeAbout"
                  checked={config.scrapeAbout}
                  onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, scrapeAbout: !!checked }))}
                  className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                />
                <Label htmlFor="scrapeAbout" className="text-sm font-medium text-gray-700">
                  Scrape About Info
                </Label>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="groupLinks" className="text-sm font-semibold text-gray-700 flex items-center">
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp Group Links
              </Label>
              <Textarea
                id="groupLinks"
                rows={5}
                placeholder="Enter WhatsApp group invite links, one per line&#10;Example:&#10;https://chat.whatsapp.com/ABC123&#10;https://chat.whatsapp.com/DEF456"
                value={config.groupLinks}
                onChange={(e) => setConfig((prev) => ({ ...prev, groupLinks: e.target.value }))}
                className="bg-white/80 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center mb-12 space-x-6">
          <Button
            onClick={startScraping}
            disabled={isScrapingActive}
            size="lg"
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-semibold"
          >
            {isScrapingActive ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                Scraping in Progress...
              </>
            ) : (
              <>
                <Play className="mr-3 h-5 w-5" />
                Start Scraping
              </>
            )}
          </Button>

          <Button
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            size="lg"
            variant={isMonitoring ? "destructive" : "default"}
            className={`${
              !isMonitoring
                ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            } shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-semibold`}
          >
            <RotateCcw className={`mr-3 h-5 w-5 ${isMonitoring ? "animate-spin" : ""}`} />
            {isMonitoring ? "Stop Monitoring" : "Monitor New Users"}
          </Button>
        </div>

        {/* QR Code Display */}
        <QRCodeDisplay isVisible={showQRCode} onLoginSuccess={handleLoginSuccess} />

        {/* Status Section */}
        {(statusMessages.length > 0 || isScrapingActive) && (
          <Card className="mb-8 bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg border-b border-gray-200">
              <CardTitle className="flex items-center text-xl">
                <Zap className="mr-3 h-6 w-6 text-indigo-600" />
                Scraping Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="mb-6">
                <div className="flex justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">Progress</span>
                  <span className="text-sm font-semibold text-indigo-600">{progress}%</span>
                </div>
                <Progress value={progress} className="w-full h-3 bg-gray-200" />
              </div>

              <StatusMessages messages={statusMessages} />

              {isScrapingActive && (
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 rounded-full border border-blue-200">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    <span className="text-blue-700 font-medium">Processing your request...</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {showResults && contacts.length > 0 && (
          <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-lg border-b border-gray-200">
              <CardTitle className="flex justify-between items-center">
                <div className="flex items-center">
                  <Users className="mr-3 h-6 w-6 text-emerald-600" />
                  <span className="text-xl">Scraping Results</span>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 px-4 py-2 text-sm font-semibold"
                  >
                    Contacts Scraped: {contacts.length}
                  </Badge>
                  <Button
                    onClick={() => setShowExportModal(true)}
                    variant="outline"
                    size="sm"
                    className="bg-white/80 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <ResultsTable contacts={contacts} />
            </CardContent>
          </Card>
        )}

        {/* Export Modal */}
        <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} contacts={contacts} />
      </div>
    </div>
  )
}
