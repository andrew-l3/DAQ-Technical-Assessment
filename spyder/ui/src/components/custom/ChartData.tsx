"use client"

import { Timer } from "lucide-react"
import { LineChart, LabelList, Line, CartesianGrid, XAxis } from "recharts"
import { useEffect, useState } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  battery: {
    label: "Delta (ms)",
    color: "hsl(var(--chart-2))",
    icon: Timer,
  },
} satisfies ChartConfig

interface VehicleData {
  battery_temperature?: number,
  timestamp?: number,
  status?: number,
  delta?: number,
}

/**
 * Shadcn Line Chart (Customised)
 *
 * @returns {JSX.Element} The rendered page component.
 */
export function ChartData(props: VehicleData | null): JSX.Element {

  const [tempData, setTempData] = useState<VehicleData[]>([]);

  /**
   * Handles data passed from mainpage, determines delta
   */
  useEffect(() => {
    const time = Date.now();
    let newData: VehicleData[] = [...tempData];
    if (props !== null) {
      if (!newData.some((item) => item.timestamp === props.timestamp)) newData.push(props);
    }

    newData = newData.map((item) => {
      if (item.timestamp !== undefined) return {...item, delta: Number(time - item.timestamp)};
      return item;
    });

    setTempData([...newData].slice(-5));
  }, [props]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Past Readings</CardTitle>
        <CardDescription>
          Showing the last 6 valid temperature readings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={tempData}
            margin={{
              left: 20,
              right: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="delta"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value) => value}
            />
            <ChartTooltip
              cursor={true}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Line
              dataKey="battery_temperature"
              type="natural"
              stroke="var(--color-battery)"
              strokeWidth={2}
              dot={{
                r: 2,
                fill: "var(--color-battery)",
              }}
              activeDot={{
                r: 4,
                fill: "var(--color-battery)",
              }}
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Line>
            <ChartLegend content={<ChartLegendContent nameKey="battery" />} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
