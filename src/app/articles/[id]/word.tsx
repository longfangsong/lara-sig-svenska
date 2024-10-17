import { Popover } from "flowbite-react";
import { PopoverContent } from "./popoverContent";

export function Word({ children }: { children: string }) {
  return (
    <Popover content={<PopoverContent spell={children} />} trigger="click">
      <a
        href="#"
        className="hover:bg-sky-300 dark:hover:bg-sky-700 cursor-pointer"
      >
        {children}
      </a>
    </Popover>
  );
}
