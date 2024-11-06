"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  dob: z.string(),
  phone: z.string(),
  education: z.string(),
  email: z.string().email("Invalid email address"),
  source: z.string(),
  program: z.string(),
  status: z.string(),
  "Assign To": z.string(),
});

interface AddLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddLeadDialog({ open, onOpenChange, onSuccess }: AddLeadDialogProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      dob: "",
      phone: "",
      education: "",
      email: "",
      source: "",
      program: "",
      status: "No Contact",
      "Assign To": "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { error } = await supabase
        .from('leads')
        .insert([values]);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Lead added successfully",
      });

      onSuccess();
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add lead",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="education"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Education</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select education level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Bachelors">Bachelors</SelectItem>
                      <SelectItem value="Masters">Masters</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="program"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Program</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select program" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="LLB (Hons)">LLB (Hons)</SelectItem>
                      <SelectItem value="LLM Corporate">LLM Corporate</SelectItem>
                      <SelectItem value="LLM Human Rights">LLM Human Rights</SelectItem>
                      <SelectItem value="Bar Transfer Course">Bar Transfer Course</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Assign To"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign To</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Abubakr Mahmood">Abubakr Mahmood</SelectItem>
                      <SelectItem value="Alvina Sami">Alvina Sami</SelectItem>
                      <SelectItem value="Shahzaib Shams">Shahzaib Shams</SelectItem>
                      <SelectItem value="Faiza Ullah">Faiza Ullah</SelectItem>
                      <SelectItem value="Aneeza Komal">Aneeza Komal</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit">Add Lead</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}