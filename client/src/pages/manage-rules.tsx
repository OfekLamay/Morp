import { useState } from "react";
import { PlusCircle, Search } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CreateRuleModal from "@/components/modals/create-rule-modal";
import RulesTable from "@/components/tables/rules-table";
import { useRules } from "@/hooks/use-rules";
import RuleDetailsModal from "@/components/ui/RuleDetailsModal";
import EditRuleModal from "@/components/ui/EditRuleModal";

export default function ManageRules() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [enforcementFilter, setEnforcementFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editRule, setEditRule] = useState<Rule | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { rules, totalCount, isLoading, deleteRule } = useRules({
    search: searchTerm,
    enforcement: enforcementFilter,
    severity: severityFilter,
    date: dateFilter,
    page: page.toString(),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  function handleDeleteRule(rule: Rule) {
    if (window.confirm(`Are you sure you want to delete rule "${rule.description}"?`)) {
      deleteRule.mutate(rule.id);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold ">Manage Rules</h1>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => setShowCreateModal(true)}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Rule
        </Button>
      </div>

      <div className="grid-card mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </form>
          
          <Select
            value={enforcementFilter}
            onValueChange={(value) => {
              setEnforcementFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All rules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All rules</SelectItem>
              <SelectItem value="ACTIVE">Active rules</SelectItem>
              <SelectItem value="SILENT">Silent rules</SelectItem>
              <SelectItem value="disabled">Disabled rules</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={severityFilter}
            onValueChange={(value) => {
              setSeverityFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All severities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All severities</SelectItem>
              <SelectItem value="high">High (8-10)</SelectItem>
              <SelectItem value="medium">Medium (5-7)</SelectItem>
              <SelectItem value="low">Low (1-4)</SelectItem>
            </SelectContent>
          </Select>
          
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <RulesTable
          rules={rules}
          totalCount={totalCount}
          page={page}
          onPageChange={setPage}
          onViewDetails={(rule) => {
            setSelectedRule(rule);
            setIsDetailsOpen(true);
          }}
          onEditRule={(rule) => {
            setEditRule(rule);
            setIsEditOpen(true);
          }}
        />
      )}
      
      <CreateRuleModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />

      {selectedRule && (
        <RuleDetailsModal
          rule={selectedRule}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
        />
      )}

      <EditRuleModal
        rule={editRule}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </div>
  );
}
