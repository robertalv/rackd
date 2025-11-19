import { Icon, Loading03Icon } from "@rackd/ui/icons";

export default function Loader() {
  return (
    <div className="flex justify-center items-center h-full w-full p-12">
      <Icon icon={Loading03Icon} className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
