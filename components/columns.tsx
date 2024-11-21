"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
    id: "basicInfo",
    header: "Basic Information",
    cell: ({ row, table }) => {
      const lead = row.original;
      const meta = table.options.meta as any;

      const [isEditingName, setIsEditingName] = useState(false);
      const [name, setName] = useState(lead.name);

      const handleSaveName = async () => {
        if (meta?.updateName) {
          await meta.updateName(lead.id, name);
          setIsEditingName(false);
        }
      };

      return (
        <Card className="w-full">
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            {/* Name Field */}
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Name:</div>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-8"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') {
                        setIsEditingName(false);
                        setName(lead.name);
                      }
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleSaveName}
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setIsEditingName(false);
                      setName(lead.name);
                    }}
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 p-0 h-8"
                  onClick={() => setIsEditingName(true)}
                >
                  <User className="h-4 w-4" />
                  {name}
                </Button>
              )}
            </div>

            {/* Education Field */}
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Education:</div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 px-2 hover:bg-accent">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "cursor-pointer flex gap-1 items-center",
                        {
                          "bg-blue-100 text-blue-800": lead.education === "Bachelors",
                          "bg-purple-100 text-purple-800": lead.education === "Masters",
                          "bg-green-100 text-green-800": lead.education === "PhD"
                        }
                      )}
                    >
                      <GraduationCap className="h-3 w-3" />
                      {lead.education || "Set Education"}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Education Level</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => meta?.updateEducation?.(lead.id, "Bachelors")}>
                    <GraduationCap className="h-4 w-4 mr-2 text-blue-600" />
                    Bachelors
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => meta?.updateEducation?.(lead.id, "Masters")}>
                    <GraduationCap className="h-4 w-4 mr-2 text-purple-600" />
                    Masters
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => meta?.updateEducation?.(lead.id, "PhD")}>
                    <GraduationCap className="h-4 w-4 mr-2 text-green-600" />
                    PhD
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Date of Birth Field */}
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Date of Birth:</div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 h-8 p-0">
                    <CalendarDays className="h-4 w-4" />
                    {lead.dob ? (
                      format(new Date(lead.dob), "MMM dd, yyyy")
                    ) : (
                      "Set date of birth"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent
                    mode="single"
                    selected={lead.dob ? new Date(lead.dob) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        meta?.updateDob?.(lead.id, date.toISOString());
                      }
                    }}
                    initialFocus
                    fromYear={1940}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Program Field */}
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Program:</div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 px-2 hover:bg-accent">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "cursor-pointer flex gap-1 items-center",
                        {
                          "bg-blue-100 text-blue-800": lead.program === "LLB (Hons)",
                          "bg-emerald-100 text-emerald-800": lead.program === "LLM Corporate",
                          "bg-purple-100 text-purple-800": lead.program === "LLM Human Rights",
                          "bg-amber-100 text-amber-800": lead.program === "Bar Transfer Course"
                        }
                      )}
                    >
                      <BookOpen className="h-3 w-3" />
                      {lead.program || "Set Program"}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Program</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => meta?.updateProgram?.(lead.id, "LLB (Hons)")}>
                    <BookOpen className="h-4 w-4 mr-2 text-blue-600" />
                    LLB (Hons)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => meta?.updateProgram?.(lead.id, "LLM Corporate")}>
                    <BookOpen className="h-4 w-4 mr-2 text-emerald-600" />
                    LLM Corporate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => meta?.updateProgram?.(lead.id, "LLM Human Rights")}>
                    <BookOpen className="h-4 w-4 mr-2 text-purple-600" />
                    LLM Human Rights
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => meta?.updateProgram?.(lead.id, "Bar Transfer Course")}>
                    <BookOpen className="h-4 w-4 mr-2 text-amber-600" />
                    Bar Transfer Course
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      );
    },
  },
  {
    id: "contactDetails",
    header: "Contact Details",
    cell: ({ row, table }) => {
      const lead = row.original;
      const meta = table.options.meta as any;

      const [isEditingEmail, setIsEditingEmail] = useState(false);
      const [isEditingPhone, setIsEditingPhone] = useState(false);
      const [email, setEmail] = useState(lead.email);
      const [phone, setPhone] = useState(lead.phone);

      const handleSaveEmail = async () => {
        if (meta?.updateEmail) {
          await meta.updateEmail(lead.id, email);
          setIsEditingEmail(false);
        }
      };

      const handleSavePhone = async () => {
        if (meta?.updatePhone) {
          await meta.updatePhone(lead.id, phone);
          setIsEditingPhone(false);
        }
      };

      return (
        <Card className="w-full">
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium">Contact Details</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            {/* Email Field */}
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Email:</div>
              {isEditingEmail ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-8"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEmail();
                      if (e.key === 'Escape') {
                        setIsEditingEmail(false);
                        setEmail(lead.email);
                      }
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleSaveEmail}
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setIsEditingEmail(false);
                      setEmail(lead.email);
                    }}
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 p-0 h-8"
                  onClick={() => setIsEditingEmail(true)}
                >
                  <Mail className="h-4 w-4" />
                  {email}
                </Button>
              )}
            </div>

            {/* Phone Field */}
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Phone:</div>
              {isEditingPhone ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-8"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSavePhone();
                      if (e.key === 'Escape') {
                        setIsEditingPhone(false);
                        setPhone(lead.phone);
                      }
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleSavePhone}
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setIsEditingPhone(false);
                      setPhone(lead.phone);
                    }}
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 p-0 h-8"
                  onClick={() => setIsEditingPhone(true)}
                >
                  <Phone className="h-4 w-4" />
                  {phone}
                </Button>
              )}
            </div>

            {/* Source Field */}
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Source:</div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 px-2 hover:bg-accent">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "cursor-pointer flex gap-1 items-center",
                        {
                          "bg-blue-100 text-blue-800": lead.source === "Facebook",
                          "bg-pink-100 text-pink-800": lead.source === "Instagram",
                          "bg-indigo-100 text-indigo-800": lead.source === "Website",
                          "bg-green-100 text-green-800": lead.source === "Referral",
                          "bg-amber-100 text-amber-800": lead.source === "Walk-in"
                        }
                      )}
                    >
                      <Share2 className="h-3 w-3" />
                      {lead.source || "Set Source"}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Lead Source</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => meta?.updateSource?.(lead.id, "Facebook")}>
                    <Share2 className="h-4 w-4 mr-2 text-blue-600" />
                    Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => meta?.updateSource?.(lead.id, "Instagram")}>
                    <Share2 className="h-4 w-4 mr-2 text-pink-600" />
                    Instagram
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => meta?.updateSource?.(lead.id, "Website")}>
                    <Share2 className="h-4 w-4 mr-2 text-indigo-600" />
                    Website
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => meta?.updateSource?.(lead.id, "Referral")}>
                    <Share2 className="h-4 w-4 mr-2 text-green-600" />
                    Referral
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => meta?.updateSource?.(lead.id, "Walk-in")}>
                    <Share2 className="h-4 w-4 mr-2 text-amber-600" />
                    Walk-in
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Communication Channel Field */}
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Channel:</div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 h-8">
                    {lead.communication ? (
                      <>
                        {lead.communication === "Phone" && <Phone className="h-4 w-4 text-blue-500" />}
                        {lead.communication === "WhatsApp" && <MessageSquare className="h-4 w-4 text-green-500" />}
                        {lead.communication === "Email" && <Mail className="h-4 w-4 text-orange-500" />}
                        {lead.communication === "SMS" && <MessageCircle className="h-4 w-4 text-purple-500" />}
                        {lead.communication === "Meeting" && <Users className="h-4 w-4 text-indigo-500" />}
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
                  <DropdownMenuItem onClick={() => meta?.updateCommunication?.(lead.id, "Phone")}>
                    <Phone className="h-4 w-4 mr-2 text-blue-500" />
                    Phone
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => meta?.updateCommunication?.(lead.id, "WhatsApp")}>
                    <MessageSquare className="h-4 w-4 mr-2 text-green-500" />
                    WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => meta?.updateCommunication?.(lead.id, "Email")}>
                    <Mail className="h-4 w-4 mr-2 text-orange-500" />
                    Email
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => meta?.updateCommunication?.(lead.id, "SMS")}>
                    <MessageCircle className="h-4 w-4 mr-2 text-purple-500" />
                    SMS
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => meta?.updateCommunication?.(lead.id, "Meeting")}>
                    <Users className="h-4 w-4 mr-2 text-indigo-500" />
                    Meeting
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      );
    },
  },
  {
    id: "statusAndFollowup",
    header: "Status & Follow-up",
    cell: ({ row, table }) => {
      const lead = row.original;
      const meta = table.options.meta as any;
      const [isDialogOpen, setIsDialogOpen] = useState(false);

      return (
        <Card className="w-full">
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium">Status & Follow-up</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            {/* Assigned To Field with Creation Date */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-muted-foreground">Assigned To:</div>
                <Badge variant="outline" className="h-8">
                  {lead["Assign To"] || "Unassigned"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-muted-foreground">Created On:</div>
                <Badge variant="outline" className="h-8">
                  {format(new Date(lead.created_at), "MMM dd, yyyy")}
                </Badge>
              </div>
            </div>

            {/* Status Field */}
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Status:</div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 px-2 hover:bg-accent">
                    <Badge 
                      variant={lead.status === "Not Interested" ? "destructive" : "secondary"}
                      className="cursor-pointer flex gap-1 items-center"
                    >
                      {lead.status === "No Contact" && <Clock className="h-3 w-3" />}
                      {lead.status === "Thinking" && <Brain className="h-3 w-3" />}
                      {lead.status === "Interested" && <ThumbsUp className="h-3 w-3" />}
                      {lead.status === "Next Session" && <Star className="h-3 w-3" />}
                      {lead.status === "Won" && <CheckCircle2 className="h-3 w-3" />}
                      {lead.status === "Not Interested" && <XCircle className="h-3 w-3" />}
                      {lead.status === "Not Affordable" && <BanknoteIcon className="h-3 w-3" />}
                      {lead.status}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => meta?.updateStatus?.(lead.id, "No Contact")}>
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    No Contact
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => meta?.updateStatus?.(lead.id, "Thinking")}>
                    <Brain className="h-4 w-4 mr-2 text-yellow-500" />
                    Thinking
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => meta?.updateStatus?.(lead.id, "Interested")}>
                    <ThumbsUp className="h-4 w-4 mr-2 text-green-500" />
                    Interested
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => meta?.updateStatus?.(lead.id, "Next Session")}>
                    <Star className="h-4 w-4 mr-2 text-blue-500" />
                    Next Session
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => meta?.updateStatus?.(lead.id, "Won")}>
                    <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />
                    Won
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => meta?.updateStatus?.(lead.id, "Not Interested")}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Not Interested
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-muted-foreground"
                    onClick={() => meta?.updateStatus?.(lead.id, "Not Affordable")}
                  >
                    <BanknoteIcon className="h-4 w-4 mr-2" />
                    Not Affordable
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Follow-up Date Field */}
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Follow-up:</div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 h-8">
                    <Calendar className="h-4 w-4" />
                    {lead.follow_up_date ? (
                      format(new Date(lead.follow_up_date), "MMM dd, yyyy")
                    ) : (
                      "Set follow-up"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent
                    mode="single"
                    selected={lead.follow_up_date ? new Date(lead.follow_up_date) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        meta?.updateFollowUpDate?.(lead.id, date.toISOString());
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Pulse Field */}
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Pulse:</div>
              <Button
                variant="ghost"
                className="flex items-center gap-2 h-8 p-0"
                onClick={() => setIsDialogOpen(true)}
              >
                <Pencil className="h-4 w-4" />
                {lead.pulse || "Add update"}
              </Button>
              <PulseDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                initialValue={lead.pulse}
                onSave={(value) => meta?.updatePulse?.(lead.id, value)}
              />
            </div>
          </CardContent>
        </Card>
      );
    },
  },
];