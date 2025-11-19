import { 
  Home01Icon,
  DiscoverCircleIcon,
  ChampionIcon,
  UserGroup02Icon,
  StoreLocation01Icon,
  UserCircleIcon,
  LabelImportantIcon,
  Settings05Icon,
  LaptopPhoneSyncIcon,
  ConnectIcon,
  Invoice03Icon,
  type IconProps
} from "@rackd/ui/icons";

type Tab = "account" | "interests" | "preferences" | "sessions" | "accounts" | "billing";

interface NavigationItem {
  icon: IconProps["icon"];
  label: string;
  path: string;
}

interface SettingsNavigationItem {
  icon: IconProps["icon"];
  label: string;
  tab: Tab;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    icon: Home01Icon,
    label: "Feed",
    path: "/feed",
  },
  {
    icon: DiscoverCircleIcon,
    label: "Discover",
    path: "/discover",
  },
  {
    icon: ChampionIcon,
    label: "Tournaments",
    path: "/tournaments",
  },
  {
    icon: UserGroup02Icon,
    label: "Top Players",
    path: "/players",
  },
  {
    icon: StoreLocation01Icon,
    label: "Venues",
    path: "/venues",
  },
];

export const SETTINGS_NAVIGATION_ITEMS: SettingsNavigationItem[] = [
  {
    icon: UserCircleIcon,
    label: "Account",
    tab: "account",
  },
  {
    icon: LabelImportantIcon,
    label: "Interests",
    tab: "interests",
  },
  {
    icon: Settings05Icon,
    label: "Preferences",
    tab: "preferences",
  },
  {
    icon: LaptopPhoneSyncIcon,
    label: "Sessions",
    tab: "sessions",
  },
  {
    icon: ConnectIcon,
    label: "Connected Accounts",
    tab: "accounts",
  },
  {
    icon: Invoice03Icon,
    label: "Usage & Billing",
    tab: "billing",
  },
];