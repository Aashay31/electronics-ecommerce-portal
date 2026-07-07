import { Link } from "react-router-dom";
import {
  Cpu,
  Radio,
  Monitor,
  Zap,
  Wifi,
  Bot,
  Cable,
  CircuitBoard,
  LayoutDashboard,
  Settings2,
  Camera,
  Wrench,
  ArrowUpRight,
} from "lucide-react";

const CATEGORIES = [
  {
    name: "Microcontrollers",
    icon: Cpu,
    description: "Arduino, ESP32, STM32 and more",
    tag: "MCU",
  },
  {
    name: "Sensors",
    icon: Radio,
    description: "Temperature, motion, distance",
    tag: "Sensing",
  },
  {
    name: "Displays",
    icon: Monitor,
    description: "OLED, LCD, TFT modules",
    tag: "Display",
  },
  {
    name: "Power Supply",
    icon: Zap,
    description: "Regulators, batteries, adapters",
    tag: "Power",
  },
  {
    name: "Wireless Modules",
    icon: Wifi,
    description: "WiFi, Bluetooth, LoRa, Zigbee",
    tag: "Wireless",
  },
  {
    name: "Robotics",
    icon: Bot,
    description: "Motors, drivers, chassis kits",
    tag: "Robotics",
  },
  {
    name: "Cables & Connectors",
    icon: Cable,
    description: "Jumper wires, headers, JST",
    tag: "Cables",
  },
  {
    name: "Resistors & Caps",
    icon: CircuitBoard,
    description: "Passive components, ICs",
    tag: "Passives",
  },
  {
    name: "Development Boards",
    icon: LayoutDashboard,
    description: "Prototyping and dev kits",
    tag: "Dev Boards",
  },
  {
    name: "Motors & Drivers",
    icon: Settings2,
    description: "Servo, stepper, DC drivers",
    tag: "Motors",
  },
  {
    name: "Cameras & Vision",
    icon: Camera,
    description: "OV7670, ESP32-CAM modules",
    tag: "Vision",
  },
  {
    name: "Tools & Equipment",
    icon: Wrench,
    description: "Soldering, meters, testers",
    tag: "Tools",
  },
];

function HomeCategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Shop by Category
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            Find the right component, fast.
          </h2>
        </div>
        <Link
          to="/shop"
          className="hidden text-sm text-slate-500 no-underline transition-colors duration-200 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white sm:block"
        >
          View all products &rarr;
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          return (
            <Link
              key={category.name}
              to={`/shop?category=${encodeURIComponent(category.name)}`}
              className="group flex h-36 cursor-pointer flex-col rounded-2xl border border-slate-200 bg-white p-5 no-underline transition-all duration-200 ease-in-out hover:border-slate-300 hover:shadow-md dark:border-white/10 dark:bg-slate-900 dark:hover:border-white/20 dark:hover:bg-slate-800/80"
            >
              <div className="mb-3 inline-flex rounded-lg bg-slate-100 p-2 dark:bg-white/5">
                <Icon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              </div>

              <p className="mb-1 text-sm font-semibold text-slate-900 dark:text-white">
                {category.name}
              </p>

              <p className="line-clamp-2 flex-1 text-xs text-slate-500 dark:text-slate-400">
                {category.description}
              </p>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-600">
                  {category.tag}
                </span>
                <ArrowUpRight className="h-4 w-4 text-slate-300 transition-colors duration-200 group-hover:text-slate-600 dark:text-slate-600 dark:group-hover:text-slate-300" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default HomeCategoryGrid;
