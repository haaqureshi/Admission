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
import { 
  MoreHorizontal, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ThumbsUp, 
  Brain, 
  Star, 
  BanknoteIcon,
  Calendar,
  Phone,
  MessageSquare,
  Mail,
  MessageCircle,
  Users,
  Pencil
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

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
  follow_up_date?: string;
  communication?: string;
  pulse?: string;
};

function PulseDialog({ 
  isOpen, 
  onOpenChange, 
  initialValue, 
  onSave 
}: { 
  isOpen: boolean; 
  onOpenChange: (open: boolean) => void; 
  initialValue?: string;
  onSave: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue || '');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Lead Pulse</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Enter the latest update about this lead..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button onClick={() => {
              onSave(value);
              onOpenChange(false);
            }}>
              Save Update
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
    accessorKey: "follow_up_date",
    header: "Follow-up Date",
    cell: ({ row, table }) => {
      const lead = row.original;
      const meta = table.options.meta as {
        updateFollowUpDate?: (id: string, date: string) => Promise<void>;
      };

      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {lead.follow_up_date ? (
                format(new Date(lead.follow_up_date), "MMM dd, yyyy")
              ) : (
                "Set follow-up"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={lead.follow_up_date ? new Date(lead.follow_up_date) : undefined}
              onSelect={(date) => {
                if (date) {
                  meta.updateFollowUpDate?.(lead.id, date.toISOString());
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      );
    },
  },
  {
    accessorKey: "communication",
    header: "Channel",
    cell: ({ row, table }) => {
      const lead = row.original;
      const meta = table.options.meta as { 
        updateCommunication: (id: string, communication: string) => Promise<void> 
      };

      const communicationConfig = {
        "Phone": { icon: Phone, color: "text-blue-500" },
        "WhatsApp": { icon: MessageSquare, color: "text-green-500" },
        "Email": { icon: Mail, color: "text-orange-500" },
        "SMS": { icon: MessageCircle, color: "text-purple-500" },
        "Meeting": { icon: Users, color: "text-indigo-500" },
      } as const;

      const currentConfig = lead.communication ? communicationConfig[lead.communication as keyof typeof communicationConfig] : null;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              {currentConfig ? (
                <>
                  <currentConfig.icon className={`h-4 w-4 ${currentConfig.color}`} />
                  {lead.communication}
                </>
              ) : (
                "Set channel"
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Channel Type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.entries(communicationConfig).map(([type, config]) => (
              <DropdownMenuItem
                key={type}
                className="flex items-center gap-2"
                onClick={() => meta.updateCommunication(lead.id, type)}
              >
                <config.icon className={`h-4 w-4 ${config.color}`} />
                {type}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  {
    accessorKey: "Assign To",
    header: "Assigned To",
    cell: ({ row }) => {
      const lead = row.original;
      return (
        <Badge variant="outline">
          {lead["Assign To"] || "Unassigned"}
        </Badge>
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
    accessorKey: "pulse",
    header: "Pulse",
    cell: ({ row, table }) => {
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const lead = row.original;
      const meta = table.options.meta as {
        updatePulse: (id: string, pulse: string) => Promise<void>;
      };

      return (
        <>
          <Button
            variant="ghost"
            className="flex items-center gap-2 max-w-[200px] truncate"
            onClick={() => setIsDialogOpen(true)}
          >
            <Pencil className="h-4 w-4" />
            {lead.pulse || "Add update"}
          </Button>
          <PulseDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            initialValue={lead.pulse}
            onSave={(value) => meta.updatePulse(lead.id, value)}
          />
        </>
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