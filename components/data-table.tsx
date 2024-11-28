"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo, useEffect } from "react";
import { format, isToday, isTomorrow, isThisWeek, isAfter, isBefore, startOfToday } from "date-fns";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  meta?: {
    updateStatus: (id: string, status: string) => Promise<void>;
    updateAssignee?: (id: string, assignTo: string) => Promise<void>;
    updateFollowUpDate?: (id: string, date: string) => Promise<void>;
    updateCommunication?: (id: string, communication: string) => Promise<void>;
    updatePulse?: (id: string, pulse: string) => Promise<void>;
    updateEducation?: (id: string, education: string) => Promise<void>;
    updateSource?: (id: string, source: string) => Promise<void>;
    updateProgram?: (id: string, program: string) => Promise<void>;
    updateDob?: (id: string, dob: string) => Promise<void>;
    updatePhone?: (id: string, phone: string) => Promise<void>;
    updateName?: (id: string, name: string) => Promise<void>;
    updateEmail?: (id: string, email: string) => Promise<void>;
  };
}

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  program?: string;
  status?: string;
  "Assign To"?: string;
  follow_up_date?: string;
};

export function DataTable<TData extends Lead, TValue>({
  columns,
  data,
  meta,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [followUpFilter, setFollowUpFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [programFilter, setProgramFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [pageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    setColumnFilters([]);
    setSorting([]);
  }, [data]);

  const filterFollowUps = (row: TData) => {
    const followUpDate = row.follow_up_date ? new Date(row.follow_up_date) : null;
    const today = startOfToday();

    switch (followUpFilter) {
      case "today":
        return followUpDate && isToday(followUpDate);
      case "tomorrow":
        return followUpDate && isTomorrow(followUpDate);
      case "this-week":
        return followUpDate && isThisWeek(followUpDate, { weekStartsOn: 1 });
      case "overdue":
        return followUpDate && isBefore(followUpDate, today);
      case "upcoming":
        return followUpDate && isAfter(followUpDate, today);
      case "not-set":
        return !followUpDate;
      default:
        return true;
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(row => {
      const searchMatches = searchQuery.trim() === "" || 
        Object.entries(row).some(([key, value]) => {
          if (["name", "email", "phone"].includes(key)) {
            return String(value).toLowerCase().includes(searchQuery.toLowerCase());
          }
          return false;
        });

      const programMatches = programFilter === "all" || row.program === programFilter;
      const assigneeMatches = assigneeFilter === "all" || row["Assign To"] === assigneeFilter;
      const followUpMatches = filterFollowUps(row);

      return searchMatches && programMatches && assigneeMatches && followUpMatches;
    });
  }, [data, searchQuery, programFilter, assigneeFilter, followUpFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      pagination: {
        pageSize,
        pageIndex,
      },
    },
    meta,
  });

  useEffect(() => {
    setPageIndex(0);
  }, [searchQuery, programFilter, assigneeFilter, followUpFilter]);

  // Calculate the range of items being displayed
  const startItem = pageIndex * pageSize + 1;
  const endItem = Math.min(startItem + pageSize - 1, filteredData.length);

  return (
    <div>
      <div className="flex items-center gap-4 py-4 flex-wrap">
        <Input
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={programFilter}
          onValueChange={setProgramFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Programs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Programs</SelectItem>
            <SelectItem value="LLB (Hons)">LLB (Hons)</SelectItem>
            <SelectItem value="LLM Corporate">LLM Corporate</SelectItem>
            <SelectItem value="LLM Human Rights">LLM Human Rights</SelectItem>
            <SelectItem value="Bar Transfer Course">Bar Transfer Course</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={assigneeFilter}
          onValueChange={setAssigneeFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Assignees" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            <SelectItem value="Alvina Sami">Alvina Sami</SelectItem>
            <SelectItem value="Shahzaib Shams">Shahzaib Shams</SelectItem>
            <SelectItem value="Faizan Ullah">Faizan Ullah</SelectItem>
            <SelectItem value="Aneeza Komal">Aneeza Komal</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={followUpFilter}
          onValueChange={setFollowUpFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Follow-up Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Follow-ups</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="tomorrow">Tomorrow</SelectItem>
            <SelectItem value="this-week">This Week</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="not-set">Not Set</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="align-top">
                      <div className="grid grid-cols-1 gap-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {startItem}-{endItem} of {filteredData.length} results
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              table.previousPage();
              setPageIndex((prev) => Math.max(prev - 1, 0));
            }}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              table.nextPage();
              setPageIndex((prev) => prev + 1);
            }}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}