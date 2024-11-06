"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export type Lead = {
  id: string;
  created_at: string;
  name: string;
  dob: string;
  phone: string;
  education: string;
  email: string;
  source: string;
  program: string;
  status: string;
};

export const columns: ColumnDef<Lead>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "dob",
    header: "Date of Birth",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "education",
    header: "Education",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => (
      <Badge variant="secondary">{row.getValue("source")}</Badge>
    ),
  },
  {
    accessorKey: "program",
    header: "Program",
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("program")}</Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const getStatusColor = (status: string): "secondary" | "destructive" | "default" | "outline" => {
        const colors: Record<string, "secondary" | "destructive" | "default" | "outline"> = {
          "No Contact": "secondary",
          "Thinking": "outline",
          "Interested": "secondary",
          "Next Session": "default",
          "Won": "secondary",
          "Not Interested": "destructive",
          "Not Affordable": "default",
        };
        return colors[status] || "default";
      };

      return <Badge variant={getStatusColor(status)}>{status}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const lead = row.original;
      const meta = table.options.meta as { updateStatus: (id: string, status: string) => void };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => meta.updateStatus(lead.id, "No Contact")}>
              Set as No Contact
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta.updateStatus(lead.id, "Thinking")}>
              Set as Thinking
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta.updateStatus(lead.id, "Interested")}>
              Set as Interested
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta.updateStatus(lead.id, "Next Session")}>
              Set as Next Session
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta.updateStatus(lead.id, "Won")}>
              Set as Won
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta.updateStatus(lead.i<boltAction type="file" filePath="components/columns.tsx">d, "Not Interested")}>
              Set as Not Interested
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta.updateStatus(lead.id, "Not Affordable")}>
              Set as Not Affordable
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];