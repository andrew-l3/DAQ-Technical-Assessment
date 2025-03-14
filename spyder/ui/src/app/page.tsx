"use client"

import { useState, useEffect } from "react"
import useWebSocket, { ReadyState } from "react-use-websocket"
import { useTheme } from "next-themes"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Thermometer } from "lucide-react"
import Numeric from "../components/custom/numeric"
import RedbackLogoDarkMode from "../../public/logo-darkmode.svg"
import RedbackLogoLightMode from "../../public/logo-lightmode.svg"
import { read } from "node:fs"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChartData } from "@/components/custom/ChartData"
import { toast } from "sonner"

const WS_URL = "ws://localhost:8080"

interface VehicleData {
  battery_temperature: number,
  timestamp: number,
  status: number,
  delta: number,
}

/**
 * Page component that displays DAQ technical assessment. Contains the LiveValue component as well as page header and labels.
 * Could this be split into more components?...
 *
 * @returns {JSX.Element} The rendered page component.
 */
export default function Page(): JSX.Element {
  const { theme, setTheme } = useTheme()
  const [temperature, setTemperature] = useState<any>(0)
  const [connectionStatus, setConnectionStatus] = useState<string>("Disconnected")
  const { lastJsonMessage, readyState }: { lastJsonMessage: VehicleData | null; readyState: ReadyState } = useWebSocket(
    WS_URL,
    {
      share: false,
      shouldReconnect: () => true,
    },
  )

  /**
   * Effect hook to handle WebSocket connection state changes.
   */
  useEffect(() => {
    switch (readyState) {
      case ReadyState.OPEN:
        console.log("Connected to streaming service")
        setConnectionStatus("Connected")
        break
      case ReadyState.CLOSED:
        console.log("Disconnected from streaming service")
        setConnectionStatus("Disconnected")
        break
      case ReadyState.CONNECTING:
        setConnectionStatus("Connecting")
        break
      default:
        setConnectionStatus("Disconnected")
        break
    }
  }, [readyState])

  /**
   * Effect hook to handle incoming WebSocket messages.
   */
  useEffect(() => {
    console.log("Received: ", lastJsonMessage)
    if (lastJsonMessage === null) {
      return
    }
    setTemperature(lastJsonMessage.battery_temperature)

    // Handles toast
    if (lastJsonMessage.status === 1) {
      toast.warning(
        "Temperature range conditions breached.", {
        description: String(new Date(lastJsonMessage.timestamp)),
        duration: 2000,
      })
    }
  }, [lastJsonMessage])

  /**
   * Effect hook to set the theme to dark mode.
   */
  const handleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-5 h-20 flex items-center gap-5 border-b">
        <Image suppressHydrationWarning
          src={theme === "light" ? RedbackLogoLightMode : RedbackLogoDarkMode}
          className="h-12 w-auto"
          alt="Redback Racing Logo"
        />
        <h1 className="text-foreground text-xl font-semibold">DAQ Technical Assessment</h1>
        <Badge variant={connectionStatus === "Connected" ? "success" : "destructive"} className="ml-auto">
          {connectionStatus}
        </Badge>
        <Button variant="outline" size="icon" onClick={handleTheme}>
          {
            (theme === "light") ?
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          :
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"/>
          }
          <span className="sr-only">Toggle theme</span>
        </Button>
      </header>
      <main className="flex-grow flex items-center justify-center p-8">
        <div className="flex flex-col gap-2">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl font-light flex items-center gap-2">
                <Thermometer className="h-6 w-6" />
                Live Battery Temperature
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <Numeric temp={temperature.toFixed(3)} />
            </CardContent>
          </Card>
          <ChartData {...lastJsonMessage}/>
        </div>
      </main>
    </div>
  )
}
