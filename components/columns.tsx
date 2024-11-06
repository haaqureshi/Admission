"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, CheckCircle2, XCircle, Clock, ThumbsUp, Brain, Star, BanknoteIcon } from "lucide-react";
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
  "Assign To": string;
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
    accessorKey: "Assign To",
    header: "Assigned To",
    cell: ({ row, table }) => {
      const lead = row.original;
      const meta = table.options.meta as { 
        updateStatus: (id: string, status: string) => Promise<void>;
        updateAssignee?: (id: string, assignTo: string) => Promise<void>;
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 px-2">
              <Badge variant="outline" className="cursor-pointer">
                {lead["Assign To"] || "Unassigned"}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem 
              onClick={() => meta.updateAssignee?.(lead.id, "Abubakr Mahmood")}
            >
              Abubakr Mahmood
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => meta.updateAssignee?.(lead.id, "Alvina Sami")}
            >
              Alvina Sami
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => meta.updateAssignee?.(lead.id, "Shahzaib Shams")}
            >
              Shahzaib Shams
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => meta.updateAssignee?.(lead.id, "Faiza Ullah")}
            >
              Faiza Ullah
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => meta.updateAssignee?.(lead.id, "Aneeza Komal")}
            >
              Aneeza Komal
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    filterFn: (row, id, value) => {
      return value === "all" || row.getValue(id) === value;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row, table }) => {
      const lead = row.original;
      const meta = table.options.meta as { updateStatus: (id: string, status: string) => Promise<void> };
      const status = row.getValue("status") as string;

      const statusConfig = {
        "No Contact": { color: "secondary", icon: Clock },
        "Thinking": { color: "outline", icon: Brain },
        "Interested": { color: "secondary", icon: ThumbsUp },
        "Next Session": { color: "default", icon: Star },
        "Won": { color: "secondary", icon: CheckCircle2 },
        "Not Interested": { color: "destructive", icon: XCircle },
        "Not Affordable": { color: "default", icon: BanknoteIcon },
      } as const;

      const currentConfig = statusConfig[status as keyof typeof statusConfig];

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 px-2 hover:bg-accent">
              <Badge variant={currentConfig.color} className="cursor-pointer flex gap-1 items-center">
                <currentConfig.icon className="h-3 w-3" />
                {status}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="flex items-center gap-2"
              onClick={() => meta.updateStatus(lead.id, "No Contact")}
            >
              <Clock className="h-4 w-4 text-gray-500" />
              No Contact
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2"
              onClick={() => meta.updateStatus(lead.id, "Thinking")}
            >
              <Brain className="h-4 w-4 text-yellow-500" />
              Thinking
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2"
              onClick={() => meta.updateStatus(lead.id, "Interested")}
            >
              <ThumbsUp className="h-4 w-4 text-green-500" />
              Interested
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2"
              onClick={() => meta.updateStatus(lead.id, "Next Session")}
            >
              <Star className="h-4 w-4 text-blue-500" />
              Next Session
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="flex items-center gap-2"
              onClick={() => meta.updateStatus(lead.id, "Won")}
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Won
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="flex items-center gap-2 text-destructive"
              onClick={() => meta.updateStatus(lead.id, "Not Interested")}
            >
              <XCircle className="h-4 w-4" />
              Not Interested
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2 text-muted-foreground"
              onClick={() => meta.updateStatus(lead.id, "Not Affordable")}
            >
              <BanknoteIcon className="h-4 w-4" />
              Not Affordable
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Edit Lead</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Delete Lead</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];