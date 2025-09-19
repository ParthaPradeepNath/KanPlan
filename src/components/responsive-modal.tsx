// import { useMedia } from "react-use";

// import { Dialog, DialogContent } from "@/components/ui/dialog";

// import { Drawer, DrawerContent } from "@/components/ui/drawer";

// interface ResponsiveModalProps {
//   children: React.ReactNode;
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
// }

// export const ResponsiveModal = ({
//   children,
//   open,
//   onOpenChange,
// }: ResponsiveModalProps) => {
//   const isDesktop = useMedia("(min-width: 1024px)", true);

//   if (isDesktop) {
//     return (
//       <Dialog open={open} onOpenChange={onOpenChange}>
//         <DialogContent className="w-full sm:max-w-lg p-0 border-none overflow-y-auto hide-scrollbar max-h-[85vh]">
//           {children}
//         </DialogContent>
//       </Dialog>
//     );
//   }

//   return (
//     <Drawer open={open} onOpenChange={onOpenChange}>
//       <DrawerContent>
//         <div className="overflow-y-auto hide-scrollbar max-h-[85vh]">
//           {children}
//         </div>
//       </DrawerContent>
//     </Drawer>
//   );
// };

import { useMedia } from "react-use";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ResponsiveModalProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string; // optional title for accessibility
}

export const ResponsiveModal = ({
  children,
  open,
  onOpenChange,
  title = "Modal", // fallback if no title provided
}: ResponsiveModalProps) => {
  const isDesktop = useMedia("(min-width: 1024px)", true);

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-full sm:max-w-lg p-0 border-none overflow-y-auto hide-scrollbar max-h-[85vh]">
          <DialogHeader>
            {/* Hide the title visually if you don’t want it shown */}
            <VisuallyHidden>
              <DialogTitle>{title}</DialogTitle>
            </VisuallyHidden>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="overflow-y-auto hide-scrollbar max-h-[85vh]">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
