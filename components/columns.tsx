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
  Pencil,
  GraduationCap,
  Share2,
  BookOpen,
  CalendarDays,
  Check,
  X,
  User,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Input } from "@/components/ui/input";

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
    cell: ({ row, table }) => {
      const [isEditing, setIsEditing] = useState(false);
      const [name, setName] = useState(row.original.name);
      const meta = table.options.meta as {
        updateName?: (id: string, name: string) => Promise<void>;
      };

      const handleSave = async () => {
        if (meta.updateName) {
          await meta.updateName(row.original.id, name);
          setIsEditing(false);
        }
      };

      if (isEditing) {
        return (
          <div className="flex items-center gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-8 w-[200px]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                } else if (e.key === 'Escape') {
                  setIsEditing(false);
                  setName(row.original.name);
                }
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleSave}
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setIsEditing(false);
                setName(row.original.name);
              }}
            >
              <X className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        );
      }

      return (
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => setIsEditing(true)}
        >
          <User className="h-4 w-4" />
          {name}
        </Button>
      );
    },
  },
  {
    accessorKey: "dob",
    header: "Date of Birth",
    cell: ({ row, table }) => {
      const [open, setOpen] = useState(false);
      const lead = row.original;
      const meta = table.options.meta as {
        updateDob?: (id: string, dob: string) => Promise<void>;
      };

      return (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {lead.dob ? (
                format(new Date(lead.dob), "MMM dd, yyyy")
              ) : (
                "Set date of birth"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={lead.dob ? new Date(lead.dob) : undefined}
              onSelect={(date) => {
                if (date) {
                  meta.updateDob?.(lead.id, date.toISOString());
                  setOpen(false);
                }
              }}
              initialFocus
              fromYear={1940}
              toYear={new Date().getFullYear()}
            />
          </PopoverContent>
        </Popover>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row, table }) => {
      const [isEditing, setIsEditing] = useState(false);
      const [phoneNumber, setPhoneNumber] = useState(row.original.phone);
      const meta = table.options.meta as {
        updatePhone?: (id: string, phone: string) => Promise<void>;
      };

      const handleSave = async () => {
        if (meta.updatePhone) {
          await meta.updatePhone(row.original.id, phoneNumber);
          setIsEditing(false);
        }
      };

      if (isEditing) {
        return (
          <div className="flex items-center gap-2">
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="h-8 w-[150px]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                } else if (e.key === 'Escape') {
                  setIsEditing(false);
                  setPhoneNumber(row.original.phone);
                }
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleSave}
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setIsEditing(false);
                setPhoneNumber(row.original.phone);
              }}
            >
              <X className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        );
      }

      return (
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => setIsEditing(true)}
        >
          <Phone className="h-4 w-4" />
          {phoneNumber}
        </Button>
      );
    },
  },
  {
    accessorKey: "education",
    header: "Education",
    cell: ({ row, table }) => {
      const lead = row.original;
      const meta = table.options.meta as {
        updateEducation?: (id: string, education: string) => Promise<void>;
      };

      const educationConfig = {
        "Bachelors": "bg-blue-100 text-blue-800",
        "Masters": "bg-purple-100 text-purple-800",
        "PhD": "bg-green-100 text-green-800"
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 px-2 hover:bg-accent">
              <Badge 
                variant="outline" 
                className={`cursor-pointer flex gap-1 items-center ${educationConfig[lead.education as keyof typeof educationConfig] || ''}`}
              >
                <GraduationCap className="h-3 w-3" />
                {lead.education || "Set Education"}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Education Level</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => meta.updateEducation?.(lead.id, "Bachelors")}>
              <GraduationCap className="h-4 w-4 mr-2 text-blue-600" />
              Bachelors
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta.updateEducation?.(lead.id, "Masters")}>
              <GraduationCap className="h-4 w-4 mr-2 text-purple-600" />
              Masters
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta.updateEducation?.(lead.id, "PhD")}>
              <GraduationCap className="h-4 w-4 mr-2 text-green-600" />
              PhD
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row, table }) => {
      const [isEditing, setIsEditing] = useState(false);
      const [email, setEmail] = useState(row.original.email);
      const meta = table.options.meta as {
        updateEmail?: (id: string, email: string) => Promise<void>;
      };

      const handleSave = async () => {
        if (meta.updateEmail) {
          await meta.updateEmail(row.original.id, email);
          setIsEditing(false);
        }
      };

      if (isEditing) {
        return (
          <div className="flex items-center gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-8 w-[200px]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                } else if (e.key === 'Escape') {
                  setIsEditing(false);
                  setEmail(row.original.email);
                }
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleSave}
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setIsEditing(false);
                setEmail(row.original.email);
              }}
            >
              <X className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        );
      }

      return (
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => setIsEditing(true)}
        >
          <Mail className="h-4 w-4" />
          {email}
        </Button>
      );
    },
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row, table }) => {
      const lead = row.original;
      const meta = table.options.meta as {
        updateSource?: (id: string, source: string) => Promise<void>;
      };

      const sourceConfig = {
        "Facebook": "bg-blue-100 text-blue-800",
        "Instagram": "bg-pink-100 text-pink-800",
        "Website": "bg-indigo-100 text-indigo-800",
        "Referral": "bg-green-100 text-green-800",
        "Walk-in": "bg-amber-100 text-amber-800"
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 px-2 hover:bg-accent">
              <Badge 
                variant="outline" 
                className={`cursor-pointer flex gap-1 items-center ${sourceConfig[lead.source as keyof typeof sourceConfig] || ''}`}
              >
                <Share2 className="h-3 w-3" />
                {lead.source || "Set Source"}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Lead Source</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => meta.updateSource?.(lead.id, "Facebook")}>
              <Share2 className="h-4 w-4 mr-2 text-blue-600" />
              Facebook
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta.updateSource?.(lead.id, "Instagram")}>
              <Share2 className="h-4 w-4 mr-2 text-pink-600" />
              Instagram
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta.updateSource?.(lead.id, "Website")}>
              <Share2 className="h-4 w-4 mr-2 text-indigo-600" />
              Website
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta.updateSource?.(lead.id, "Referral")}>
              <Share2 className="h-4 w-4 mr-2 text-green-600" />
              Referral
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta.updateSource?.(lead.id, "Walk-in")}>
              <Share2 className="h-4 w-4 mr-2 text-amber-600" />
              Walk-in
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  {
    accessorKey: "program",
    header: "Program",
    cell: ({ row, table }) => {
      const lead = row.original;
      const meta = table.options.meta as {
        updateProgram?: (id: string, program: string) => Promise<void>;
      };

      const programConfig = {
        "LLB (Hons)": "bg-blue-100 text-blue-800",
        "LLM Corporate": "bg-emerald-100 text-emerald-800",
        "LLM Human Rights": "bg-purple-100 text-purple-800",
        "Bar Transfer Course": "bg-amber-100 text-amber-800"
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 px-2 hover:bg-accent">
              <Badge 
                variant="outline" 
                className={`cursor-pointer flex gap-1 items-center ${programConfig[lead.program as keyof typeof programConfig] || ''}`}
              >
                <BookOpen className="h-3 w-3" />
                {lead.program || "Set Program"}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Program</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => meta.updateProgram?.(lead.id, "LLB (Hons)")}>
              <BookOpen className="h-4 w-4 mr-2 text-blue-600" />
              LLB (Hons)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta.updateProgram?.(lead.id, "LLM Corporate")}>
              <BookOpen className="h-4 w-4 mr-2 text-emerald-600" />
              LLM Corporate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta.updateProgram?.(lead.id, "LLM Human Rights")}>
              <BookOpen className="h-4 w-4 mr-2 text-purple-600" />
              LLM Human Rights
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta.updateProgram?.(lead.id, "Bar Transfer Course")}>
              <BookOpen className="h-4 w-4 mr-2 text-amber-600" />
              Bar Transfer Course
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  {
    accessorKey: "follow_up_date",
    header: "Follow-up Date",
    cell: ({ row, table }) => {
      const [open, setOpen] = useState(false);
      const lead = row.original;
      const meta = table.options.meta as {
        updateFollowUpDate?: (id: string, date: string) => Promise<void>;
      };

      return (
        <Popover open={open} onOpenChange={setOpen}>
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
                  setOpen(false);
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
];