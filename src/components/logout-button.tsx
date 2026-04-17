import { Button } from "./ui/button";
import { LogOut } from "lucide-react";


export function LogoutButton() {
  return (
    <Button
      variant="destructive"
      size="icon"
      className="cursor-pointer"
      aria-label="Logout"
    >
      <LogOut size={20} />
    </Button>
  );
}