import {
  Code2,
  Terminal,
  Database,
  Server,
  Layout,
  Cpu,
  BrainCircuit,
  BookOpen,
  GraduationCap,
  Trophy,
  Rocket,
  Globe,
  Building,
  Boxes,
  MapIcon,
  Hourglass,
  SkipBack,
  SquaresExclude,
  Coffee,
  Laptop,
  MoonStar,
  HeartHandshake,
  Brain,
  SearchCheck,
  Newspaper,
  Lightbulb,
  Gem,
  LineChart,
  Gamepad2,
  MousePointer2,
  Heart,
  User,
  BotIcon,
  Youtube,
  Github,
  Linkedin,
  Instagram,
  ExternalLink,
  Mail,
  MapPin,
  GitBranch,
  Cloud,
  CodeIcon,
  BrainCircuitIcon,
  Handshake,
} from "lucide-react";
import TikTokIcon from "../components/icons/TikTokIcon";
import React from "react";

// Centralized icon mapping object
export const iconMap = {
  // Development & Tech
  Code: Code2,
  Terminal: Terminal,
  Database: Database,
  Server: Server,
  Layout: Layout,
  Cpu: Cpu,

  // Education & Growth
  Brain: BrainCircuit,
  Book: BookOpen,
  School: GraduationCap,
  Trophy: Trophy,

  // Project & Work
  Rocket: Rocket,
  Navigation: Globe,
  Building: Building,
  Boxes: Boxes,
  MapIcon: MapIcon,
  Hourglass: Hourglass,
  SkipBack: SkipBack,
  SquaresExclude: SquaresExclude,

  // Personal & Social
  Coffee: Coffee,
  Laptop2: Laptop,
  Moon: MoonStar,
  HeartHandshake: HeartHandshake,
  Puzzle: Brain,
  CoffeeIcon: Coffee,
  SearchCheck: SearchCheck,
  Newspaper: Newspaper,

  // Professional Growth
  Lightbulb: Lightbulb,
  Gem: Gem,
  LineChart: LineChart,
  Gamepad: Gamepad2,
  MousePointer2: MousePointer2,
  Heart: Heart,
  User: User,
  BotIcon: BotIcon,

  // Social Media
  Youtube: Youtube,
  Github: Github,
  Linkedin: Linkedin,
  Instagram: Instagram,
  TikTok: TikTokIcon,

  // UI Elements
  ExternalLink: ExternalLink,
  Mail: Mail,
  MapPin: MapPin,
  GitBranch: GitBranch,
  Database: Database,
  Cloud: Cloud,
  Layout: Layout,
  Server: Server,
  CodeIcon: CodeIcon,
  BrainCircuitIcon: BrainCircuitIcon,
  Handshake: Handshake,
};

// Common icon sizes for consistency
export const ICON_SIZES = {
  small: 16,
  medium: 24,
  large: 32,
  xlarge: 40,
};

// Helper function to get icon by name with optional size override
export const getIcon = (name, size = 24) => {
  const IconComponent = iconMap[name];
  if (!IconComponent) return null;
  return React.createElement(IconComponent, { size });
};

export default iconMap;
