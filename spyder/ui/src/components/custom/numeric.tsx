interface TemperatureProps {
  temp: any;
}

import { cn } from "../../lib/utils"

/**
 * Numeric component that displays the temperature value.
 * 
 * @param {number} props.temp - The temperature value to be displayed.
 * @returns {JSX.Element} The rendered Numeric component.
 */
function Numeric({ temp }: TemperatureProps) {
  // TODO: Change the color of the text based on the temperature
  // HINT:
  //  - Consider using cn() from the utils folder for conditional tailwind styling
  //  - (or) Use the div's style prop to change the colour
  //  - (or) other solution
  const risky: boolean = ((temp >= 20 && temp <= 25) || (temp >= 75 && temp <= 80));
  const safe: boolean = (temp > 25 && temp < 75);
  const unsafe: boolean = (temp < 20 || temp > 80);

  // Justify your choice of implementation in brainstorming.md
  const indicator = cn( 'text-primary', 
    risky && 'text-risky', 
    safe && 'text-safe', 
    unsafe && 'text-unsafe'
  );

  return (
    <div className={`text-4xl font-bold text-re ${indicator}`}>
      {`${temp}°C`}
    </div>
  );
}

export default Numeric;
